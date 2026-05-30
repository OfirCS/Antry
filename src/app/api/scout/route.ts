/**
 * Talent Scout Agent.
 *
 * POST /api/scout { query: "JD or natural-language description" }
 *   → returns ranked Receipts with rationale per match
 *
 * For v0 with O(50) Receipts, we pass them all in the prompt context.
 * RAG comes later when the dataset is larger.
 *
 * Uses Claude Opus 4.7 with adaptive thinking. Without ANTHROPIC_API_KEY
 * falls back to score-based ranking (no rationale).
 *
 * Rate limited to 20 requests / 15 minutes / IP (in-memory bucket;
 * resets on cold start — fine for v0). Request IDs surface in logs +
 * response headers so we can grep for slow scouts in prod.
 */

import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { demoReceipts } from "@/lib/receipts/demo-data";
import type { Fingerprint } from "@/lib/receipts/types";

export const runtime = "nodejs";

type ScoutMatch = {
  receipt_id: string;
  builder_username: string;
  builder_name: string;
  builder_gradient: string;
  composite_score: number;
  brief_title: string;
  rationale: string;
  fingerprint: Fingerprint;
};

// ---------- rate limiter ----------------------------------------------------
// 20 requests / 15 min / IP. Same shape as /api/briefs/draft — when we
// scale we'll swap both for a single shared Upstash bucket.
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
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
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
  return `scout_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- handler ---------------------------------------------------------

export async function POST(req: NextRequest) {
  const reqId = newRequestId();
  const ip = getIp(req);
  const startedAt = Date.now();

  const rl = rateLimit(ip);
  if (!rl.ok) {
    console.warn(`[${reqId}] scout rate-limited ip=${ip}`);
    return NextResponse.json(
      {
        error: "rate_limited",
        message: `Too many scouts. Try again in ${rl.retryAfterSec}s.`,
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

  let body: { query?: string };
  try {
    body = (await req.json()) as { query?: string };
  } catch {
    console.warn(`[${reqId}] scout invalid_json ip=${ip}`);
    return NextResponse.json(
      {
        error: "invalid_json",
        message: "Request body must be valid JSON.",
        request_id: reqId,
      },
      { status: 400, headers: { "X-Request-Id": reqId } }
    );
  }
  const query = (body.query ?? "").trim();
  if (query.length < 10 || query.length > 800) {
    console.warn(
      `[${reqId}] scout invalid_query length=${query.length} ip=${ip}`
    );
    return NextResponse.json(
      {
        error: "invalid_query",
        message:
          query.length < 10
            ? "Query must be at least 10 characters."
            : "Query must be at most 800 characters.",
        request_id: reqId,
      },
      { status: 400, headers: { "X-Request-Id": reqId } }
    );
  }

  console.log(`[${reqId}] scout start ip=${ip} query_len=${query.length}`);

  // Build the candidate pool: public Receipts from demo-data (real DB
  // version reads from the receipts table when available).
  // Carries builder.gradient and fingerprint through so the client can
  // render avatars + top-dimension chips without an extra round-trip.
  const pool = demoReceipts
    .filter((r) => r.display_visibility === "public")
    .map((r) => ({
      receipt_id: r.id,
      builder_username: r.builder.username,
      builder_name: r.builder.name,
      builder_gradient: r.builder.gradient,
      brief_title: r.brief_title,
      composite_score: r.composite_score,
      fingerprint: r.fingerprint,
      highlights: r.highlights,
      company: r.company.name,
    }));

  // Index for backfilling fields the LLM doesn't need to repeat
  // (gradient, fingerprint) — keeps the model's output schema tight.
  const poolById = new Map(pool.map((p) => [p.receipt_id, p]));

  // Heuristic ranker + fallback. The `prefix` is prepended to the
  // rationale only when we're explicitly down-grading (e.g. agent
  // failed) — empty string for the clean no-key heuristic.
  const fallback = (prefix: string): ScoutMatch[] =>
    pool
      .slice()
      .sort((a, b) => b.composite_score - a.composite_score)
      .slice(0, 5)
      .map((p) => ({
        receipt_id: p.receipt_id,
        builder_username: p.builder_username,
        builder_name: p.builder_name,
        builder_gradient: p.builder_gradient,
        composite_score: p.composite_score,
        brief_title: p.brief_title,
        rationale: `${prefix}${p.composite_score}/100 on ${p.brief_title}. ${p.highlights[0] ?? ""}`.trim(),
        fingerprint: p.fingerprint,
      }));

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      `[${reqId}] scout done grader=heuristic ms=${Date.now() - startedAt}`
    );
    return NextResponse.json(
      {
        matches: fallback(""),
        grader: "heuristic",
        request_id: reqId,
      },
      { headers: { "X-Request-Id": reqId } }
    );
  }

  try {
    const matches = await claudeRank(query, pool);
    // Re-hydrate gradient + fingerprint from the pool — the LLM only
    // needs to commit to receipt_id + rationale; we trust the data.
    const hydrated: ScoutMatch[] = matches
      .map((m) => {
        const p = poolById.get(m.receipt_id);
        if (!p) return null;
        return {
          receipt_id: p.receipt_id,
          builder_username: p.builder_username,
          builder_name: p.builder_name,
          builder_gradient: p.builder_gradient,
          composite_score: p.composite_score,
          brief_title: p.brief_title,
          rationale: m.rationale,
          fingerprint: p.fingerprint,
        };
      })
      .filter((x): x is ScoutMatch => x !== null);
    console.log(
      `[${reqId}] scout done grader=claude-opus-4-7 n=${hydrated.length} ms=${Date.now() - startedAt}`
    );
    return NextResponse.json(
      { matches: hydrated, grader: "claude-opus-4-7", request_id: reqId },
      { headers: { "X-Request-Id": reqId } }
    );
  } catch (e) {
    console.error(`[${reqId}] scout claude_failed`, e);
    return NextResponse.json(
      {
        matches: fallback("Fallback rank — agent unavailable. "),
        grader: "heuristic_fallback",
        request_id: reqId,
        warning: "Agent unavailable — showing heuristic rank.",
      },
      { headers: { "X-Request-Id": reqId } }
    );
  }
}

async function claudeRank(
  query: string,
  pool: Array<{
    receipt_id: string;
    builder_username: string;
    builder_name: string;
    builder_gradient: string;
    brief_title: string;
    composite_score: number;
    fingerprint: Fingerprint;
    highlights: string[];
  }>
): Promise<Array<{ receipt_id: string; rationale: string }>> {
  const client = new Anthropic();

  // Stable prefix — cacheable across queries on the same Receipt pool.
  const poolBlock = pool
    .map(
      (p) =>
        `- ${p.receipt_id} · @${p.builder_username} (${p.builder_name})
  Brief: ${p.brief_title}
  Composite: ${p.composite_score}
  Fingerprint: ${Object.entries(p.fingerprint)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ")}
  Highlight: ${p.highlights[0] ?? ""}`
    )
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 3000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            matches: {
              type: "array",
              maxItems: 5,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  receipt_id: { type: "string" },
                  rationale: { type: "string", maxLength: 280 },
                },
                required: ["receipt_id", "rationale"],
              },
            },
          },
          required: ["matches"],
        },
      },
    },
    system: [
      {
        type: "text",
        text: `You are Antry's Talent Scout. A hiring company describes what they need; you rank up to 5 Receipt-holders from the pool below who best match.

Rules:
  - Rank by fit to the query, not just composite. A 70 with the right Fingerprint dimension beats an 85 with the wrong one.
  - Write each rationale in 1-2 sentences. Reference SPECIFIC numbers (composite, dimensions, Brief). Don't say "great fit" — say "92 on streaming-rag-pipeline, verification rigor 95 — exactly the rigor you want for prod ML."
  - Only include builders from the provided pool. Don't invent.
  - Use the exact receipt_id strings from the pool. You only need to return receipt_id + rationale — the server backfills the rest.`,
      },
      {
        type: "text",
        text: `RECEIPT POOL\n\n${poolBlock}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: `Query: ${query}\n\nRank now.` }],
  });

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!textBlock) throw new Error("no_text_in_response");
  const parsed = JSON.parse(textBlock.text) as {
    matches: Array<{ receipt_id: string; rationale: string }>;
  };
  return parsed.matches;
}
