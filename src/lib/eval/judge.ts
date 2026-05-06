// LLM-as-judge for Antry Receipts.
//
// After the sandbox runs the candidate's code against the Brief's test
// suite, we additionally call a small LLM to score subjective quality:
// readability, idiomatic structure, error handling, comments, etc.
//
// Defaults to claude-haiku-4-5 (cheap) so judging is sub-cent per Receipt.
// When ANTHROPIC_API_KEY is unset, returns a deterministic mock derived
// from the test pass rate so the eval pipeline still produces a Receipt
// in dev.

import type { TestResult, SandboxRunResult } from "@/lib/sandbox/runner";

export type JudgeInput = {
  briefTitle: string;
  briefPromptMd: string;
  rubric: Record<string, unknown>;
  /** The candidate's full conversation transcript (last N turns). */
  transcript: { role: "user" | "assistant"; content: string }[];
  /** The candidate's submitted solution code (post-tsToJs). */
  solutionCode: string;
  /** Test results from runSandbox. */
  sandboxResult: SandboxRunResult;
};

export type JudgeOutput = {
  /** 0..1, weighted summary of all dimensions */
  overall: number;
  dimensions: {
    correctness: number; // does it solve the problem?
    structure: number;   // clean, idiomatic, readable code
    rigor: number;       // edge-case handling, error paths
    economy: number;     // didn't over-engineer
  };
  /** Short freeform critique (1-2 sentences). */
  critique: string;
  /** Which model produced this judgment. */
  model: string;
};

const ANTHROPIC_BASE = "https://api.anthropic.com/v1/messages";
const JUDGE_MODEL = "claude-haiku-4-5"; // cheap by default

const SYSTEM_PROMPT = `You are an expert code reviewer evaluating a candidate's solution to an
AI-engineering Brief. You are not a teacher — you are a hiring manager
making a quick, fair judgment. Score four dimensions on a 0..1 scale and
write a 1-2 sentence critique. Be honest. Reward clarity over cleverness.

Output STRICT JSON of shape:
{
  "correctness": number,
  "structure": number,
  "rigor": number,
  "economy": number,
  "critique": string
}`;

function buildUserPrompt(input: JudgeInput): string {
  const { sandboxResult } = input;
  const passLines = sandboxResult.results
    .map((r) => `  - ${r.passed ? "PASS" : "FAIL"} ${r.name}${r.reason ? " — " + r.reason : ""}`)
    .join("\n");
  const transcriptCondensed = input.transcript
    .slice(-6)
    .map((t) => `[${t.role}] ${t.content.slice(0, 600)}`)
    .join("\n");

  return [
    `Brief: ${input.briefTitle}`,
    "",
    `Brief prompt (excerpt):`,
    input.briefPromptMd.slice(0, 1200),
    "",
    `Test results (${sandboxResult.results.filter((r) => r.passed).length}/${sandboxResult.results.length} passing):`,
    passLines,
    "",
    `Recent conversation:`,
    transcriptCondensed,
    "",
    `Submitted code:`,
    "```",
    input.solutionCode.slice(0, 2000),
    "```",
    "",
    `Score each dimension (0..1) and write a 1-2 sentence critique.`,
  ].join("\n");
}

function deterministicMock(input: JudgeInput): JudgeOutput {
  const passRate = input.sandboxResult.passRate;
  // Mock dimensions correlate with pass rate but aren't identical, to keep
  // the radar from being uninformative when the API key is unset.
  const correctness = clamp(passRate);
  const structure = clamp(passRate * 0.8 + 0.15);
  const rigor = clamp(passRate * 0.7 + 0.10);
  const economy = clamp(0.5 + passRate * 0.4);
  const overall = (correctness * 0.5 + structure * 0.2 + rigor * 0.2 + economy * 0.1);
  return {
    overall,
    dimensions: { correctness, structure, rigor, economy },
    critique:
      passRate >= 0.8
        ? "Tests pass, structure looks reasonable. Mock judgment — set ANTHROPIC_API_KEY for the real review."
        : "Several tests fail. Mock judgment — set ANTHROPIC_API_KEY for the real review.",
    model: "deterministic-mock",
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export async function judgeSolution(input: JudgeInput): Promise<JudgeOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return deterministicMock(input);

  try {
    const res = await fetch(ANTHROPIC_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: JUDGE_MODEL,
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(input) }],
      }),
    });
    if (!res.ok) {
      // Network/auth failure: fall back to mock so the Receipt still mints.
      return deterministicMock(input);
    }
    const data = (await res.json()) as {
      content?: { type: string; text: string }[];
      model?: string;
    };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "";
    // The model's output may include backticks or whitespace around the JSON.
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return deterministicMock(input);
    const parsed = JSON.parse(jsonMatch[0]) as {
      correctness?: number;
      structure?: number;
      rigor?: number;
      economy?: number;
      critique?: string;
    };
    const correctness = clamp(parsed.correctness ?? 0.5);
    const structure = clamp(parsed.structure ?? 0.5);
    const rigor = clamp(parsed.rigor ?? 0.5);
    const economy = clamp(parsed.economy ?? 0.5);
    const overall =
      correctness * 0.5 + structure * 0.2 + rigor * 0.2 + economy * 0.1;
    return {
      overall,
      dimensions: { correctness, structure, rigor, economy },
      critique: parsed.critique ?? "",
      model: data.model ?? JUDGE_MODEL,
    };
  } catch {
    return deterministicMock(input);
  }
}

// ── Composing test results + judge into a final rubric score ───────

export type EvalResult = {
  passed_hold_out: boolean;
  final_rubric_score: number; // 0..1
  test_results: TestResult[];
  judge: JudgeOutput;
};

/**
 * Combine sandbox + judge into the rubric score that mintReceiptAction uses.
 * Default weighting: 60% test pass rate + 40% judge overall. Hold-out passes
 * iff (a) at least 70% of tests pass AND (b) judge correctness >= 0.6.
 */
export function composeRubric(
  sandboxResult: SandboxRunResult,
  judge: JudgeOutput
): EvalResult {
  const testRate = sandboxResult.passRate;
  const final = clamp(testRate * 0.6 + judge.overall * 0.4);
  const passed = testRate >= 0.7 && judge.dimensions.correctness >= 0.6;
  return {
    passed_hold_out: passed,
    final_rubric_score: final,
    test_results: sandboxResult.results,
    judge,
  };
}
