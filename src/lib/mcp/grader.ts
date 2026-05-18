/**
 * Agent-as-Judge grader.
 *
 * Production mode: ANTHROPIC_API_KEY set
 *   Calls Claude Opus 4.7 with adaptive thinking + structured outputs.
 *   The Brief's prompt + rubric is cached (it's stable across attempts),
 *   only the trace bundle varies per request — this is the canonical
 *   prompt-caching pattern for graders.
 *
 * Dev mode: ANTHROPIC_API_KEY not set
 *   Falls back to event-statistics heuristic. Same return shape.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Attempt } from "./store";
import type { Brief, Fingerprint } from "@/lib/receipts/types";

// ── Retry policy ───────────────────────────────────────
// The grader is best-effort: a transient Anthropic blip (529 overloaded,
// 429 rate-limit, 5xx, network error) should not immediately drop the
// caller to the heuristic fallback. Retry up to 3 times with exponential
// backoff before giving up.
const MAX_GRADER_RETRIES = 3;
const BASE_BACKOFF_MS = 500;

function isRetryableError(err: unknown): boolean {
  if (err instanceof Anthropic.RateLimitError) return true;
  if (err instanceof Anthropic.InternalServerError) return true;
  if (err instanceof Anthropic.APIConnectionError) return true;
  if (err instanceof Anthropic.APIError) {
    // 408 Request Timeout, 409 Conflict, 429, 5xx (incl. 529 overloaded).
    return (
      err.status === 408 ||
      err.status === 409 ||
      err.status === 429 ||
      err.status >= 500
    );
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call an Anthropic operation with exponential backoff on transient errors.
 * Retries up to {@link MAX_GRADER_RETRIES} times (500ms, 1s, 2s + jitter).
 */
async function withRetry<T>(op: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_GRADER_RETRIES; attempt++) {
    try {
      return await op();
    } catch (err) {
      lastErr = err;
      if (attempt === MAX_GRADER_RETRIES || !isRetryableError(err)) {
        throw err;
      }
      const backoff =
        BASE_BACKOFF_MS * 2 ** attempt + Math.floor(Math.random() * 250);
      console.warn(
        `[grader] transient error (attempt ${attempt + 1}/${MAX_GRADER_RETRIES}), retrying in ${backoff}ms`
      );
      await sleep(backoff);
    }
  }
  throw lastErr;
}

export type GradeResult = {
  composite_score: number;
  fingerprint: Fingerprint;
  rationale: string;
  graded_by: "claude-opus-4-7" | "heuristic";
};

export async function gradeAttempt(input: {
  brief: Brief;
  attempt: Attempt;
}): Promise<GradeResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return heuristicGrade(input.attempt);
  }
  try {
    return await claudeGrade(input);
  } catch (e) {
    console.error("[grader] Claude call failed, falling back:", e);
    return heuristicGrade(input.attempt);
  }
}

// ── Real grader: Claude Opus 4.7 with adaptive thinking ──

async function claudeGrade(input: {
  brief: Brief;
  attempt: Attempt;
}): Promise<GradeResult> {
  const client = new Anthropic();

  // Stable prefix — cached across attempts on the same Brief.
  const systemPrompt = `You are Antry's grader. You score how a builder collaborated with AI to complete a Brief, based on a signed event trace.

You output STRUCTURED scores in seven dimensions. Each dimension is 0-100, where 50 is average and 80+ is strong.

The seven dimensions:
- tokenEconomy: Output tokens per verified-correct unit of work. Lower spend with same quality = higher score.
- throughput: Wall-clock time to first verified-correct output. Punishes stalling.
- toolChoiceIQ: Share of work done by deterministic tools (grep, file_search, code_run) vs raw LLM generation. Senior engineers reach for tools before tokens.
- recoveryIndex: How well they pivot when stuck. Dead-end followed by passing solution = high. Linear path = neutral.
- promptDiscipline: Instruction-block density per prompt. Penalizes kitchen-sink prompts.
- verificationRigor: Self-check actions before declaring done — tests run, evals invoked, second opinions.
- spendVsJudgment: Token spend curve. Spend hard early then taper = mature judgment. Uniform spend = poor judgment.

You also output a composite score (0-100) and a one-paragraph rationale.

Be calibrating. Don't grade everyone in the 70-80 range — use the full scale. A clearly junior trace should score 40s; a polished senior trace should score 80s+.

Output strict JSON matching the schema. No prose outside the JSON.`;

  const briefBlock = `BRIEF
=====
Title: ${input.brief.title}
Difficulty: ${input.brief.difficulty}
Token cap: ${input.brief.token_cap}
Time cap: ${input.brief.time_cap_seconds}s
Allowed tools: ${input.brief.allowed_tools.join(", ")}

Prompt:
${input.brief.prompt_md}

Rubric:
${JSON.stringify(input.brief.rubric_json, null, 2)}`;

  const traceBlock = `TRACE BUNDLE
============
Attempt id: ${input.attempt.id}
Started: ${input.attempt.started_at}
Submitted: ${input.attempt.submitted_at ?? new Date().toISOString()}
Total events: ${input.attempt.events.length}
Event-type breakdown: ${summarize(input.attempt.events)}

Events (in order):
${input.attempt.events
  .map(
    (e) =>
      `[${String(e.seq).padStart(3, "0")}] ${e.type} @ ${e.at}\n${truncate(JSON.stringify(e.payload), 600)}`
  )
  .join("\n\n")}`;

  const response = await withRetry(() =>
    client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "high",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              composite_score: { type: "integer", minimum: 0, maximum: 100 },
              fingerprint: {
                type: "object",
                additionalProperties: false,
                properties: {
                  tokenEconomy: { type: "integer", minimum: 0, maximum: 100 },
                  throughput: { type: "integer", minimum: 0, maximum: 100 },
                  toolChoiceIQ: { type: "integer", minimum: 0, maximum: 100 },
                  recoveryIndex: { type: "integer", minimum: 0, maximum: 100 },
                  promptDiscipline: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                  },
                  verificationRigor: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                  },
                  spendVsJudgment: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                  },
                },
                required: [
                  "tokenEconomy",
                  "throughput",
                  "toolChoiceIQ",
                  "recoveryIndex",
                  "promptDiscipline",
                  "verificationRigor",
                  "spendVsJudgment",
                ],
              },
              rationale: { type: "string", maxLength: 2000 },
            },
            required: ["composite_score", "fingerprint", "rationale"],
          },
        },
      },
      system: [
        {
          type: "text",
          text: systemPrompt,
        },
        {
          type: "text",
          text: briefBlock,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: traceBlock }],
    })
  );

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!textBlock) throw new Error("no_text_in_response");
  const parsed = JSON.parse(textBlock.text) as {
    composite_score: number;
    fingerprint: Fingerprint;
    rationale: string;
  };

  return {
    composite_score: parsed.composite_score,
    fingerprint: parsed.fingerprint,
    rationale: parsed.rationale,
    graded_by: "claude-opus-4-7",
  };
}

// ── Heuristic fallback ─────────────────────────────────

function heuristicGrade(attempt: Attempt): GradeResult {
  const counts = countEvents(attempt.events);
  const eventCount = attempt.events.length;
  const base = clamp(50 + Math.floor(eventCount * 1.5));
  const composite = clamp(
    base + (counts.tool_call > counts.prompt * 0.4 ? 5 : -3)
  );
  return {
    composite_score: composite,
    fingerprint: {
      tokenEconomy: clamp(base + (counts.prompt < 8 ? 8 : -4)),
      throughput: clamp(base - 4),
      toolChoiceIQ: clamp(base + Math.min(15, counts.tool_call * 2)),
      recoveryIndex: clamp(base + (counts.pivot > 0 ? 8 : 0)),
      promptDiscipline: clamp(base + (counts.prompt < 12 ? 6 : -6)),
      verificationRigor: clamp(base + (counts.tool_call >= 3 ? 5 : -4)),
      spendVsJudgment: clamp(base + 1),
    },
    rationale: `Heuristic grade: ${eventCount} events (${counts.prompt} prompts, ${counts.tool_call} tool calls, ${counts.pivot} pivots). Set ANTHROPIC_API_KEY for real Agent-as-Judge grading.`,
    graded_by: "heuristic",
  };
}

function countEvents(events: Attempt["events"]) {
  const c = { prompt: 0, tool_call: 0, file_edit: 0, pivot: 0, note: 0 };
  for (const e of events) c[e.type]++;
  return c;
}

function summarize(events: Attempt["events"]): string {
  const c = countEvents(events);
  return Object.entries(c)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${k}=${n}`)
    .join(", ");
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n) + `…(+${s.length - n} chars)`;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
