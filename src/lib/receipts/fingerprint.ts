// Antry Receipts — Builder Fingerprint computation
//
// Each dimension has an antagonist that punishes single-axis gaming. The
// composite score uses a min-of-quartile rule that punishes uneven shapes —
// builders who max out one axis at the expense of others score lower than
// builders with balanced fingerprints.
//
// All formulas are deterministic and unit-testable.

import type { Fingerprint, FingerprintDimension } from "./types";

export type GatewayCall = {
  turnIndex: number;
  inputTokens: number;
  outputTokens: number;
  toolCalls: { type: "deterministic" | "generative"; name: string }[];
  promptPrefixDelta: number; // bytes added vs prior turn
  retracted: boolean; // did this turn delete prior plan/code?
  selfChecked: boolean; // did this turn run tests/evals?
  qualityDelta: number; // 0-1, change in rubric pass rate
  latencyMs: number;
};

export type AttemptTelemetry = {
  startedAt: number;
  firstSuccessAt: number | null;
  endedAt: number;
  totalTurns: number;
  totalTokens: number;
  finalRubricScore: number; // 0-1
  passedHoldOutTest: boolean;
  promptPasteBurst: boolean;
  calls: GatewayCall[];
  briefMedians: {
    tokensPerSuccess: number;
    timeToFirstSuccessMs: number;
  };
  briefDeterministicSurfaceWeight: number; // 0-1, how much of work *should* be deterministic
};

// Clamp a number to [0, 100] and round.
function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// ── Dimension 1: Token Economy ─────────────────────────
// output_tokens per verified-correct unit of work, normalized against Brief median.
// Lower spend with same quality = higher score.
export function computeTokenEconomy(t: AttemptTelemetry): number {
  if (!t.passedHoldOutTest || t.finalRubricScore < 0.5) return 0;
  const successUnits = Math.max(0.1, t.finalRubricScore);
  const tokensPerSuccess = t.totalTokens / successUnits;
  if (tokensPerSuccess <= 0) return 100;
  // log-scale around the brief median: at median = 60, half-of-median = 100, double = 30
  const ratio = tokensPerSuccess / t.briefMedians.tokensPerSuccess;
  const score = 60 - 40 * Math.log2(Math.max(0.25, ratio));
  return clamp(score);
}

// ── Dimension 2: Throughput ────────────────────────────
// Wall-clock time to first verified-correct output.
export function computeThroughput(t: AttemptTelemetry): number {
  if (t.firstSuccessAt === null) return 0;
  const ms = t.firstSuccessAt - t.startedAt;
  if (ms <= 0) return 100;
  const ratio = ms / t.briefMedians.timeToFirstSuccessMs;
  const score = 60 - 40 * Math.log2(Math.max(0.25, ratio));
  return clamp(score);
}

// ── Dimension 3: Tool-Choice IQ ────────────────────────
// Share of work done via deterministic tools vs raw LLM generation, weighted
// by the Brief's "deterministic surface" — how much *should* be deterministic.
export function computeToolChoiceIQ(t: AttemptTelemetry): number {
  let deterministic = 0;
  let generative = 0;
  for (const c of t.calls) {
    for (const tc of c.toolCalls) {
      if (tc.type === "deterministic") deterministic++;
      else generative++;
    }
    // Each pure-LLM turn (no tool calls) counts as 1 generative.
    if (c.toolCalls.length === 0) generative++;
  }
  const total = deterministic + generative;
  if (total === 0) return 50;
  const observedRatio = deterministic / total;
  const expected = t.briefDeterministicSurfaceWeight;
  // Distance from expected: 0 = perfect, 1 = polar opposite
  const distance = Math.abs(observedRatio - expected);
  return clamp(100 - distance * 130);
}

// ── Dimension 4: Recovery Index ────────────────────────
// Dead-end retractions ÷ total turns, weighted by final correctness.
// High retractions + passing solution = mature pivoter.
// High retractions + failing = thrashed.
export function computeRecoveryIndex(t: AttemptTelemetry): number {
  if (t.totalTurns === 0) return 50;
  const retractions = t.calls.filter((c) => c.retracted).length;
  const retractRate = retractions / t.totalTurns;
  // Score peaks at moderate retraction (~0.15) IF final rubric passed.
  // If failed, retractions become a negative signal.
  if (!t.passedHoldOutTest && t.finalRubricScore < 0.5) {
    return clamp(60 - retractRate * 80);
  }
  // Sweet spot: 0.10 to 0.25 retraction rate is "thoughtful pivoting"
  if (retractRate <= 0.05) return 60; // never retracted, may have got lucky
  if (retractRate >= 0.5) return 30; // thrashed
  const distanceFromSweetSpot = Math.abs(retractRate - 0.18);
  return clamp(95 - distanceFromSweetSpot * 200);
}

// ── Dimension 5: Prompt Discipline ─────────────────────
// Average prompt-prefix delta per turn, normalized by output utility.
// Penalizes kitchen-sink prompting; if paste-burst flagged, suppress credit.
export function computePromptDiscipline(t: AttemptTelemetry): number {
  if (t.promptPasteBurst) return 25;
  if (t.calls.length === 0) return 50;
  const avgDelta =
    t.calls.reduce((sum, c) => sum + c.promptPrefixDelta, 0) / t.calls.length;
  // 50-200 bytes/turn = good (focused additions).
  // 800+ bytes/turn = sprawling.
  if (avgDelta < 50) return 70; // very terse — fine but not optimal
  if (avgDelta < 250) return 95; // sweet spot
  if (avgDelta < 600) return 70;
  return clamp(95 - (avgDelta - 250) / 12);
}

// ── Dimension 6: Verification Rigor ────────────────────
// Count of self-check actions weighted positively only if final passes hold-out test.
export function computeVerificationRigor(t: AttemptTelemetry): number {
  const checkCount = t.calls.filter((c) => c.selfChecked).length;
  if (!t.passedHoldOutTest) {
    // No credit if you didn't actually verify in a way that worked.
    return clamp(checkCount * 10);
  }
  // 0 checks + passed = lucky. 3-6 checks + passed = solid. >10 = paranoid.
  if (checkCount === 0) return 40;
  if (checkCount <= 2) return 70;
  if (checkCount <= 6) return 95;
  return clamp(95 - (checkCount - 6) * 6);
}

// ── Dimension 7: Spend-vs-Judgment Curve ───────────────
// Fit `quality_delta` vs `tokens_spent` over the Attempt; score on convexity.
// Spend hard early then taper = high. Uniform until budget runs out = low.
export function computeSpendVsJudgment(t: AttemptTelemetry): number {
  if (t.calls.length < 2 || t.totalTokens === 0) return 50;
  // Compute cumulative quality vs cumulative tokens. Ideal curve is concave
  // (quality jumps early on lots of tokens, then plateaus).
  let cumTokens = 0;
  let cumQuality = 0;
  const points: { tokenFrac: number; qualityFrac: number }[] = [];
  const totalQuality = t.calls.reduce((s, c) => s + Math.max(0, c.qualityDelta), 0) || 1;
  for (const c of t.calls) {
    cumTokens += c.inputTokens + c.outputTokens;
    cumQuality += Math.max(0, c.qualityDelta);
    points.push({
      tokenFrac: cumTokens / t.totalTokens,
      qualityFrac: cumQuality / totalQuality,
    });
  }
  // Concavity score: integrate (qualityFrac - tokenFrac) across the curve.
  // Concave (good) → mostly positive. Linear → 0. Convex (bad) → mostly negative.
  let area = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].tokenFrac - points[i - 1].tokenFrac;
    const avgY = (points[i].qualityFrac - points[i].tokenFrac +
                  points[i - 1].qualityFrac - points[i - 1].tokenFrac) / 2;
    area += avgY * dx;
  }
  // area in [-0.5, 0.5] roughly. Map to 0-100.
  return clamp(50 + area * 200);
}

// ── Compose: full Fingerprint + composite score ────────
export function computeFingerprint(t: AttemptTelemetry): Fingerprint {
  return {
    tokenEconomy: computeTokenEconomy(t),
    throughput: computeThroughput(t),
    toolChoiceIQ: computeToolChoiceIQ(t),
    recoveryIndex: computeRecoveryIndex(t),
    promptDiscipline: computePromptDiscipline(t),
    verificationRigor: computeVerificationRigor(t),
    spendVsJudgment: computeSpendVsJudgment(t),
  };
}

// Composite score: min-of-quartile rule punishes uneven shapes.
// Returns 0-100. The bottom of the radar pulls down the whole score.
export function computeCompositeScore(fp: Fingerprint): number {
  const values = Object.values(fp).sort((a, b) => a - b);
  // Mean of the bottom quartile + mean of the rest, weighted 60/40.
  const bottomQuartile = values.slice(0, Math.max(1, Math.floor(values.length / 4) + 1));
  const rest = values.slice(bottomQuartile.length);
  const bottomMean = bottomQuartile.reduce((s, v) => s + v, 0) / bottomQuartile.length;
  const restMean =
    rest.length > 0 ? rest.reduce((s, v) => s + v, 0) / rest.length : bottomMean;
  return clamp(bottomMean * 0.6 + restMean * 0.4);
}

// Tier label for display.
export function fingerprintTier(score: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (score >= 85) return { label: "Top quartile", color: "#0A0A0A", bg: "#C6F135" };
  if (score >= 70) return { label: "Strong", color: "#0A0A0A", bg: "rgba(198,241,53,0.5)" };
  if (score >= 50) return { label: "Solid", color: "#0A0A0A", bg: "rgba(198,241,53,0.25)" };
  return { label: "Developing", color: "#525252", bg: "#F5F5F5" };
}

export const ALL_DIMENSIONS: FingerprintDimension[] = [
  "tokenEconomy",
  "throughput",
  "toolChoiceIQ",
  "recoveryIndex",
  "promptDiscipline",
  "verificationRigor",
  "spendVsJudgment",
];
