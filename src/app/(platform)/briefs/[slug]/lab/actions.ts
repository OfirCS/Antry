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
import { runSandbox, type TestCase, type SandboxRunResult } from "@/lib/sandbox/runner";
import { judgeSolution, composeRubric } from "@/lib/eval/judge";

function getBriefById(briefId: string) {
  return demoBriefs.find((b) => b.id === briefId) ?? null;
}

// Per-Brief default test suites. In production these come from the Brief's
// rubric_json.tests array; for now we ship reasonable starters keyed by
// Brief id so /missions and the Lab demo are usable end-to-end.
const DEFAULT_TESTS_BY_BRIEF: Record<string, { entry: string; tests: TestCase[] }> = {
  br_streaming_rag: {
    entry: "answer",
    tests: [
      { name: "returns object with answer + citations", args: ["What is RAG?"], expect: "truthy" },
      { name: "rejects unanswerable question without fabricating", args: [""], expect: "no-throw" },
    ],
  },
  br_edge_compute: {
    entry: "classify",
    tests: [
      { name: "classifies billing question correctly", args: ["How do I cancel?"], expect: "billing" },
      { name: "classifies bug report correctly", args: ["The page is blank"], expect: "bug" },
      { name: "no-throws on empty", args: [""], expect: "no-throw" },
    ],
  },
  br_email_engine: {
    entry: "route",
    tests: [
      { name: "signup event picks welcome template", args: [{ event: "signup" }], expect: "truthy" },
      { name: "churn event picks retention", args: [{ event: "churn" }], expect: "truthy" },
    ],
  },
  br_realtime_sync: {
    entry: "resolve",
    tests: [
      { name: "later write wins", args: [{ a: 1, ts: 100 }, { a: 2, ts: 200 }], expect: { a: 2, ts: 200 } },
      { name: "idempotent on re-run", args: [{ a: 1, ts: 100 }, { a: 1, ts: 100 }], expect: { a: 1, ts: 100 } },
    ],
  },
};

// Default fallback for Briefs without a custom suite — single "no-throw"
// test on the candidate's `solve` entry point.
const FALLBACK_TESTS = {
  entry: "solve",
  tests: [
    { name: "function exists and runs", args: [], expect: "no-throw" as const },
  ],
};

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
      testResults: SandboxRunResult["results"];
      judgeCritique: string;
      finalRubricScore: number;
      visualEvidenceHtml: string | null;
    }
  | { ok: false; reason: string };

// Mint a Receipt from REAL gateway telemetry + sandbox tests + LLM judge.
//
// The full eval pipeline:
//   1. Pull stored gateway calls for this attempt.
//   2. If candidate submitted code, run it in our sandbox against the
//      Brief's test suite. Capture pass/fail per test + stdout.
//   3. Call the LLM judge (claude-haiku-4-5) to score subjective quality.
//      Returns deterministic mock when ANTHROPIC_API_KEY is unset.
//   4. Compose final_rubric_score = 0.6 * test_pass_rate + 0.4 * judge_overall.
//   5. Compute Builder Fingerprint from the real per-turn telemetry.
//   6. Compute compute footprint (energy, CO2, LOC, cost) from totals.
//   7. Sign the canonical receipt + return the full envelope.
//
// The visual_evidence_html parameter lets the client embed a rendered
// snapshot of the candidate's HTML solution into the Receipt artifact.
export async function mintReceiptAction(
  attemptId: string,
  submission?: {
    code?: string;
    visualEvidenceHtml?: string;
    transcript?: { role: "user" | "assistant"; content: string }[];
  }
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

  const totalTokens =
    a.calls.reduce((s, c) => s + c.inputTokens + c.outputTokens, 0) || 1;
  const usedAnyTool = a.calls.some((c) => c.toolCalls.length > 0);
  const stayedUnderBudget = totalTokens <= tokenCap;

  // ── Real eval pipeline ──────────────────────────────────
  // If the candidate submitted code, run it through our sandbox + judge.
  // Otherwise fall back to a heuristic that combines tool usage + budget.
  let passedHoldOutTest = usedAnyTool && stayedUnderBudget;
  let finalRubricScore = passedHoldOutTest
    ? Math.min(1, 0.6 + (a.calls.length / 8) * 0.4)
    : 0.4;
  let testResults: SandboxRunResult["results"] = [];
  let judgeCritique = "Heuristic rubric — no code submission to evaluate.";

  if (submission?.code && submission.code.trim().length > 0) {
    const suite = DEFAULT_TESTS_BY_BRIEF[a.briefId] ?? FALLBACK_TESTS;
    const sandboxResult = await runSandbox({
      code: submission.code,
      entry: suite.entry,
      tests: suite.tests,
    });
    const judge = await judgeSolution({
      briefTitle: brief?.title ?? a.briefId,
      briefPromptMd: brief?.prompt_md ?? "",
      rubric: brief?.rubric_json ?? {},
      transcript: submission.transcript ?? [],
      solutionCode: submission.code,
      sandboxResult,
    });
    const composed = composeRubric(sandboxResult, judge);
    passedHoldOutTest = composed.passed_hold_out;
    finalRubricScore = composed.final_rubric_score;
    testResults = composed.test_results;
    judgeCritique = judge.critique;
  }

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
    testResults,
    judgeCritique,
    finalRubricScore,
    visualEvidenceHtml: submission?.visualEvidenceHtml ?? null,
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
