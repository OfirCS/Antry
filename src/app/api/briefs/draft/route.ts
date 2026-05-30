/**
 * Brief Author Agent.
 *
 * POST /api/briefs/draft
 *   { problem: "one or two sentences describing what you want to test" }
 *
 * Returns a complete Brief draft (title, tagline, prompt_md, rubric,
 * allowed_tools, time_cap, token_cap, difficulty, ideal_fingerprint).
 * Host reviews + publishes via /api/briefs/publish (separate route).
 *
 * Uses Claude Opus 4.7 with adaptive thinking + structured outputs.
 * The existing 10 demo Briefs are passed as a cached few-shot block
 * (stable across requests; only the problem statement varies).
 *
 * Without ANTHROPIC_API_KEY we return a deterministic stub so the UI
 * is testable in dev without burning API credits.
 *
 * Rate limited to 20 requests / 15 minutes / IP (in-memory bucket;
 * resets on cold start — fine for v0).
 */

import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { demoBriefs } from "@/lib/receipts/demo-data";
import type { Fingerprint } from "@/lib/receipts/types";

export const runtime = "nodejs";

type Draft = {
  title: string;
  tagline: string;
  slug: string;
  category: string;
  difficulty: "intro" | "mid" | "senior" | "staff";
  time_cap_seconds: number;
  token_cap: number;
  allowed_tools: string[];
  prompt_md: string;
  rubric: { criterion: string; weight: number }[];
  ideal_fingerprint: Fingerprint;
};

// ---------- rate limiter ----------------------------------------------------
// 20 requests / 15 min / IP, in-memory. Cold-start safe — buckets are GC'd
// lazily on next hit. Good enough for v0; swap for Upstash when we scale.
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const ipBuckets = new Map<string, number[]>();

function rateLimit(ip: string): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const prev = ipBuckets.get(ip) ?? [];
  const recent = prev.filter((t) => t > cutoff);
  if (recent.length >= RATE_LIMIT_MAX) {
    const retryAfterMs = (recent[0] ?? now) + RATE_LIMIT_WINDOW_MS - now;
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  recent.push(now);
  ipBuckets.set(ip, recent);
  return { ok: true, retryAfterSec: 0 };
}

function getIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function newRequestId(): string {
  return `briefs_draft_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- handler ---------------------------------------------------------

export async function POST(req: NextRequest) {
  const reqId = newRequestId();
  const ip = getIp(req);
  const startedAt = Date.now();

  const rl = rateLimit(ip);
  if (!rl.ok) {
    console.warn(`[${reqId}] briefs/draft rate-limited ip=${ip}`);
    return NextResponse.json(
      {
        error: "rate_limited",
        message: `Too many drafts. Try again in ${rl.retryAfterSec}s.`,
        request_id: reqId,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.retryAfterSec),
          "X-Request-Id": reqId,
        },
      }
    );
  }

  let body: { problem?: string };
  try {
    body = (await req.json()) as { problem?: string };
  } catch {
    console.warn(`[${reqId}] briefs/draft invalid_json ip=${ip}`);
    return NextResponse.json(
      {
        error: "invalid_json",
        message: "Request body must be valid JSON.",
        request_id: reqId,
      },
      { status: 400, headers: { "X-Request-Id": reqId } }
    );
  }
  const problem = (body.problem ?? "").trim();
  if (problem.length < 10 || problem.length > 600) {
    console.warn(
      `[${reqId}] briefs/draft invalid_problem length=${problem.length} ip=${ip}`
    );
    return NextResponse.json(
      {
        error: "invalid_problem",
        message:
          problem.length < 10
            ? "Problem must be at least 10 characters."
            : "Problem must be at most 600 characters.",
        request_id: reqId,
      },
      { status: 400, headers: { "X-Request-Id": reqId } }
    );
  }

  console.log(
    `[${reqId}] briefs/draft start ip=${ip} problem_len=${problem.length}`
  );

  if (!process.env.ANTHROPIC_API_KEY) {
    const draft = stubDraft(problem);
    console.log(
      `[${reqId}] briefs/draft done grader=stub ms=${Date.now() - startedAt}`
    );
    return NextResponse.json(
      { draft, grader: "stub", request_id: reqId },
      { headers: { "X-Request-Id": reqId } }
    );
  }

  try {
    const draft = await claudeDraft(problem);
    console.log(
      `[${reqId}] briefs/draft done grader=claude-opus-4-7 ms=${Date.now() - startedAt}`
    );
    return NextResponse.json(
      { draft, grader: "claude-opus-4-7", request_id: reqId },
      { headers: { "X-Request-Id": reqId } }
    );
  } catch (e) {
    console.error(`[${reqId}] briefs/draft claude_failed`, e);
    const draft = stubDraft(problem);
    return NextResponse.json(
      {
        draft,
        grader: "stub_fallback",
        request_id: reqId,
        warning: "Agent unavailable — showing heuristic draft.",
      },
      { headers: { "X-Request-Id": reqId } }
    );
  }
}

async function claudeDraft(problem: string): Promise<Draft> {
  const client = new Anthropic();

  const system = `You are Antry's Brief Author. You take a one-sentence problem statement from a hiring company and produce a complete, gradeable Brief.

A great Brief:
  - Specifies success in measurable terms (tests pass, p95 under N ms, ≥X correct on hold-out)
  - Picks tight constraints (time cap, token cap, allowed tools) appropriate to the difficulty
  - Has a weighted rubric the Agent-as-Judge can score against
  - Sets an ideal_fingerprint that emphasizes the dimensions this task actually tests
  - Uses 1 short tagline (≤120 chars) and a prompt_md ≤ 400 words

Output strict JSON. No prose outside the JSON.`;

  const examples = demoBriefs
    .slice(0, 3)
    .map(
      (b) => `EXAMPLE
Problem: ${b.tagline}
Brief:
${JSON.stringify(
  {
    title: b.title,
    tagline: b.tagline,
    slug: b.slug,
    category: b.category,
    difficulty: b.difficulty,
    time_cap_seconds: b.time_cap_seconds,
    token_cap: b.token_cap,
    allowed_tools: b.allowed_tools,
    prompt_md: b.prompt_md,
    ideal_fingerprint: b.ideal_fingerprint,
  },
  null,
  2
)}`
    )
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string", maxLength: 120 },
            tagline: { type: "string", maxLength: 160 },
            slug: { type: "string", maxLength: 60 },
            category: { type: "string" },
            difficulty: {
              type: "string",
              enum: ["intro", "mid", "senior", "staff"],
            },
            time_cap_seconds: { type: "integer", minimum: 300, maximum: 14400 },
            token_cap: { type: "integer", minimum: 5000, maximum: 200000 },
            allowed_tools: { type: "array", items: { type: "string" } },
            prompt_md: { type: "string" },
            rubric: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  criterion: { type: "string" },
                  weight: { type: "number", minimum: 0, maximum: 1 },
                },
                required: ["criterion", "weight"],
              },
            },
            ideal_fingerprint: {
              type: "object",
              additionalProperties: false,
              properties: {
                tokenEconomy: { type: "integer", minimum: 0, maximum: 100 },
                throughput: { type: "integer", minimum: 0, maximum: 100 },
                toolChoiceIQ: { type: "integer", minimum: 0, maximum: 100 },
                recoveryIndex: { type: "integer", minimum: 0, maximum: 100 },
                promptDiscipline: { type: "integer", minimum: 0, maximum: 100 },
                verificationRigor: {
                  type: "integer",
                  minimum: 0,
                  maximum: 100,
                },
                spendVsJudgment: { type: "integer", minimum: 0, maximum: 100 },
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
          },
          required: [
            "title",
            "tagline",
            "slug",
            "category",
            "difficulty",
            "time_cap_seconds",
            "token_cap",
            "allowed_tools",
            "prompt_md",
            "rubric",
            "ideal_fingerprint",
          ],
        },
      },
    },
    system: [
      { type: "text", text: system },
      {
        type: "text",
        text: examples,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Problem: ${problem}\n\nProduce the Brief now. JSON only.`,
      },
    ],
  });

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!textBlock) throw new Error("no_text_in_response");
  return JSON.parse(textBlock.text) as Draft;
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "untitled-brief"
  );
}

function stubDraft(problem: string): Draft {
  const title = problem.split(/[.!?]/)[0].slice(0, 80).trim();
  return {
    title: title || "Custom Brief",
    tagline: `${problem.slice(0, 140)}…`,
    slug: slugify(title),
    category: "tools",
    difficulty: "mid",
    time_cap_seconds: 3600,
    token_cap: 20000,
    allowed_tools: ["code_run", "file_search"],
    prompt_md: `# ${title || "Custom Brief"}\n\n${problem}\n\n**Success rubric** (placeholder — set ANTHROPIC_API_KEY for a real generator)\n1. Define success.\n2. Provide tests.\n3. Submit.\n\n**Allowed tools** code_run, file_search.`,
    rubric: [{ criterion: "Tests pass", weight: 1 }],
    ideal_fingerprint: {
      tokenEconomy: 75,
      throughput: 70,
      toolChoiceIQ: 80,
      recoveryIndex: 70,
      promptDiscipline: 75,
      verificationRigor: 85,
      spendVsJudgment: 75,
    },
  };
}
