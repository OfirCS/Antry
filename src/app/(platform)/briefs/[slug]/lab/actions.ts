"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { signLabSession } from "@/lib/receipts/lab-session";
import {
  createAttempt,
  getAttempt,
  setAttemptStatus,
  setFinalFingerprint,
} from "@/lib/receipts/attempt-store";
import {
  computeFingerprint,
  computeCompositeScore,
} from "@/lib/receipts/fingerprint";
import type { AttemptTelemetry } from "@/lib/receipts/fingerprint";
import { computeFootprint } from "@/lib/receipts/compute-footprint";
import { getDemoBrief, demoBriefs } from "@/lib/receipts/demo-data";
import { createClient } from "@/lib/supabase/server";

function getBriefById(briefId: string) {
  return demoBriefs.find((b) => b.id === briefId) ?? null;
}

// Open a new Lab session for a builder on a Brief.
// Requires authentication in production so the gateway can't be used as a
// free Anthropic relay. Set ANTRY_ALLOW_ANON_LAB=1 to permit anonymous Lab
// sessions in non-production environments only.
export async function enterBriefAction(briefSlug: string): Promise<{
  attemptId: string;
  briefId: string;
  sessionToken: string;
}> {
  const brief = getDemoBrief(briefSlug);
  if (!brief) throw new Error("brief_not_found");

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const allowAnonymous =
    process.env.NODE_ENV !== "production" || process.env.ANTRY_ALLOW_ANON_LAB === "1";

  if (!user && !allowAnonymous) {
    throw new Error("authentication_required");
  }

  const attemptId = `att_${randomUUID()}`;
  const builderId = user?.id ?? "anonymous-builder";

  createAttempt({
    attemptId,
    briefId: brief.id,
    builderId,
  });

  const sessionToken = signLabSession({
    attemptId,
    builderId,
    briefId: brief.id,
  });

  return { attemptId, briefId: brief.id, sessionToken };
}

export type MintResult =
  | {
      ok: true;
      receiptId: string;
      compositeScore: number;
      redirectTo: string;
      fingerprint: ReturnType<typeof computeFingerprint>;
      computeFootprint: ReturnType<typeof computeFootprint>;
    }
  | { ok: false; reason: string };

// Mint a Receipt from REAL gateway telemetry.
//
// This is the eval pipeline:
//   1. Pull the actual stored gateway calls for this attempt.
//   2. Compute the Builder Fingerprint deterministically (no mocking).
//   3. Compute the compute footprint (energy, CO2, LOC, cost).
//   4. Run the rubric — currently functional/heuristic, LLM-judge step
//      lands in a follow-up. We grade `passedHoldOutTest` as a function
//      of (a) the conversation didn't error, (b) at least one tool was
//      used, (c) total tokens stayed within the Brief budget.
//   5. Compose composite score with the min-of-quartile rule.
//
// Returns the full Receipt envelope so the client can update its UI in
// place without a follow-up fetch.
export async function mintReceiptAction(
  attemptId: string
): Promise<MintResult> {
  const a = getAttempt(attemptId);
  if (!a) return { ok: false, reason: "attempt_not_found" };
  if (a.status !== "in_progress") {
    return { ok: false, reason: "attempt_already_closed" };
  }
  if (a.calls.length === 0) {
    return { ok: false, reason: "no_calls_recorded" };
  }

  const brief = getBriefById(a.briefId);
  // Brief medians come from the demo data for now. In production these
  // get rolled up from Supabase per-Brief statistics.
  const briefTokenMedian = 8000;
  const briefTimeMedian = 8 * 60 * 1000;
  const briefDeterministicSurfaceWeight = 0.65;
  const tokenCap = brief?.token_cap ?? 50_000;

  // Real heuristic rubric: the attempt "passes" if a tool was used and
  // the spend stayed under the cap. Real Briefs replace this with a
  // function-test runner + an LLM-judge call (cheap Haiku model).
  const totalTokens =
    a.calls.reduce((s, c) => s + c.inputTokens + c.outputTokens, 0) || 1;
  const usedAnyTool = a.calls.some((c) => c.toolCalls.length > 0);
  const stayedUnderBudget = totalTokens <= tokenCap;
  const passedHoldOutTest = usedAnyTool && stayedUnderBudget;
  const finalRubricScore = passedHoldOutTest
    ? Math.min(1, 0.6 + (a.calls.length / 8) * 0.4)
    : 0.4;

  // Quality delta per turn — the rubric runner would label this for real.
  // Heuristic: turns that contained a tool call or self-check land most
  // of the quality. Spread evenly otherwise.
  const totalQualityWeight = a.calls.reduce(
    (s, c) =>
      s +
      (c.toolCalls.length > 0 || c.selfChecked ? 1.5 : 1),
    0
  );

  const telemetry: AttemptTelemetry = {
    startedAt: a.startedAt,
    firstSuccessAt:
      a.calls.find((c) => c.toolCalls.some((t) => t.type === "deterministic"))
        ?.createdAt ?? a.calls[Math.max(0, a.calls.length - 1)]?.createdAt ?? a.startedAt,
    endedAt: Date.now(),
    totalTurns: a.calls.length,
    totalTokens,
    finalRubricScore,
    passedHoldOutTest,
    promptPasteBurst: false,
    calls: a.calls.map((c) => ({
      turnIndex: c.turnIndex,
      inputTokens: c.inputTokens,
      outputTokens: c.outputTokens,
      toolCalls: c.toolCalls,
      promptPrefixDelta: c.promptPrefixDelta,
      retracted: c.retracted,
      selfChecked: c.selfChecked,
      qualityDelta:
        ((c.toolCalls.length > 0 || c.selfChecked ? 1.5 : 1) /
          totalQualityWeight) *
        finalRubricScore,
      latencyMs: c.latencyMs,
    })),
    briefMedians: {
      tokensPerSuccess: briefTokenMedian,
      timeToFirstSuccessMs: briefTimeMedian,
    },
    briefDeterministicSurfaceWeight,
  };

  const fingerprint = computeFingerprint(telemetry);
  const composite = computeCompositeScore(fingerprint);
  const footprint = computeFootprint({
    calls: a.calls,
    startedAt: a.startedAt,
    endedAt: Date.now(),
  });

  setFinalFingerprint(attemptId, fingerprint);
  setAttemptStatus(attemptId, "completed");

  const receiptId = `rc_live_${attemptId.slice(-8)}`;

  return {
    ok: true,
    receiptId,
    compositeScore: composite,
    fingerprint,
    computeFootprint: footprint,
    redirectTo: `/lab/result/${attemptId}`,
  };
}

// Form-action variant for the Lab "Mint" button.
export async function mintReceiptForm(formData: FormData): Promise<void> {
  const attemptId = formData.get("attemptId") as string;
  const result = await mintReceiptAction(attemptId);
  if (result.ok) redirect(result.redirectTo);
  redirect(`/briefs?mint_error=${result.reason}`);
}
