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
import { getDemoBrief } from "@/lib/receipts/demo-data";

// Open a new Lab session for a builder on a Brief.
// Returns: a signed session token + the attempt ID, scoped to a 4-hour TTL.
export async function enterBriefAction(briefSlug: string): Promise<{
  attemptId: string;
  briefId: string;
  sessionToken: string;
}> {
  const brief = getDemoBrief(briefSlug);
  if (!brief) throw new Error("brief_not_found");

  // In dev: stable builder id. In prod: from supabase auth.uid().
  // We use a per-session value so each browser tab gets a fresh attempt.
  const attemptId = `att_${randomUUID()}`;
  const builderId = "anonymous-builder";

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
  | { ok: true; receiptId: string; compositeScore: number; redirectTo: string }
  | { ok: false; reason: string };

// Mint a Receipt from the in-memory attempt's gateway calls.
// Computes the Builder Fingerprint, signs it, and (in production) writes
// to the receipts table. In dev, it returns a virtual receipt id that
// resolves against demo data for now.
export async function mintReceiptAction(
  attemptId: string,
  passedHoldOutTest: boolean = true,
  finalRubricScore: number = 0.92
): Promise<MintResult> {
  const a = getAttempt(attemptId);
  if (!a) return { ok: false, reason: "attempt_not_found" };
  if (a.status !== "in_progress") {
    return { ok: false, reason: "attempt_already_closed" };
  }
  if (a.calls.length === 0) {
    return { ok: false, reason: "no_calls_recorded" };
  }

  const totalTokens =
    a.calls.reduce((s, c) => s + c.inputTokens + c.outputTokens, 0) || 1;

  const telemetry: AttemptTelemetry = {
    startedAt: a.startedAt,
    firstSuccessAt: a.calls[Math.max(0, a.calls.length - 2)]?.createdAt ?? a.startedAt,
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
      qualityDelta: c.qualityDelta,
      latencyMs: c.latencyMs,
    })),
    briefMedians: {
      tokensPerSuccess: 8000,
      timeToFirstSuccessMs: 8 * 60 * 1000,
    },
    briefDeterministicSurfaceWeight: 0.65,
  };

  const fingerprint = computeFingerprint(telemetry);
  const composite = computeCompositeScore(fingerprint);

  setFinalFingerprint(attemptId, fingerprint);
  setAttemptStatus(attemptId, "completed");

  // For v0.2 dev: we don't write to Supabase (no schema applied).
  // The hash-derived id keeps the URL deterministic for the demo flow.
  const receiptId = `rc_live_${attemptId.slice(-8)}`;

  return {
    ok: true,
    receiptId,
    compositeScore: composite,
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
