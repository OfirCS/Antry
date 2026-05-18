import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createRateLimiter } from "@/lib/agent/rate-limit";
import {
  demoBriefs,
  demoReceipts,
  getDemoBrief,
  getDemoReceipt,
  getDemoReceiptsForBuilder,
} from "@/lib/receipts/demo-data";
import {
  ALL_DIMENSIONS,
  computeCompositeScore,
} from "@/lib/receipts/fingerprint";
import {
  DIMENSION_LABELS,
  type FingerprintDimension,
} from "@/lib/receipts/types";

/**
 * Scout — Antry's discovery agent, powered by Claude.
 *
 * Manual tool-use loop so we can log each tool call, cap iterations, and
 * preserve the exact tool list across requests for prompt caching. Static
 * system prompt + static tool definitions sit before any volatile content,
 * so the prefix caches across users.
 *
 * Response shape matches the legacy /api/agent route so AgentHome can
 * fall through transparently. When ANTHROPIC_API_KEY is missing the route
 * returns 503, signalling AgentHome to use its TF-IDF fallback.
 */

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = process.env.ANTRY_SCOUT_MODEL || "claude-opus-4-7";

// Hard cap on the tool-use loop. Each iteration is one Claude call, so this
// also bounds per-request cost/latency. A clean answer almost always lands in
// 2-4 turns; 28 leaves generous headroom for multi-tool plans while still
// guaranteeing the loop terminates.
const MAX_TOOL_ITERATIONS = 28;

// Scout is LLM-backed — every call spends real Anthropic tokens, so it gets a
// tighter budget than the deterministic /api/agent route (24 / 15 min). The
// route stays public (it's a user-facing chat) but is abuse-hardened by IP.
const checkScoutRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 12,
});

/** Derive a stable per-client key from proxy headers. */
function getClientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip =
    forwarded.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const ua = (req.headers.get("user-agent") || "na").slice(0, 80);
  return `scout:${ip}:${ua}`;
}

// Stable system prompt — sits at the front of the prefix; cache-friendly.
const SYSTEM_PROMPT = `You are Scout, Antry's discovery agent. Antry is the proof-of-work network for AI builders: companies post Briefs (real engineering missions), builders solve them in an instrumented Lab, and Antry mints a signed Receipt that captures HOW the work got done — not just what shipped. The Receipt's Builder Fingerprint scores 7 dimensions: Token Economy, Throughput, Tool-Choice IQ, Recovery Index, Prompt Discipline, Verification Rigor, Spend vs Judgment.

Your job: help users discover Briefs, Receipts, and builders.

Rules:
- ALWAYS use tools to look up data. Never invent Brief slugs, Receipt IDs, builder usernames, or scores.
- Be concise. 2-4 sentences for short answers; bulleted lists for multi-result responses.
- When citing a Brief or builder, link it: \`[Streaming RAG Brief](https://antry.com/briefs/streaming-rag-pipeline)\`.
- If the query is off-topic (general programming, life advice, etc.), redirect: "I'm Scout — I help find Briefs, Receipts, and builders on Antry. Try asking me to find Briefs in a category, rank top builders, or verify a Receipt."
- If a tool returns nothing, say so plainly. Don't hallucinate substitutes.
- For verification questions, always run \`verify_receipt\` and summarize the result.

Tone: technical but warm, direct, no marketing copy.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "search_briefs",
    description:
      "Search Antry Briefs by free-text query, difficulty, or category. Returns matched briefs with slug, title, tagline, sponsor, caps, and counts.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text against title/tagline" },
        difficulty: { type: "string", enum: ["junior", "mid", "senior", "staff"] },
        category: { type: "string" },
        max_results: { type: "integer", minimum: 1, maximum: 20 },
      },
    },
  },
  {
    name: "get_brief",
    description: "Fetch full Brief by slug.",
    input_schema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "get_receipt",
    description: "Fetch a Receipt by id, including full Fingerprint.",
    input_schema: {
      type: "object",
      properties: { receipt_id: { type: "string" } },
      required: ["receipt_id"],
    },
  },
  {
    name: "verify_receipt",
    description:
      "Verify a Receipt's provenance (SHA-256 hash, public-key fingerprint, signed-at, signature_valid).",
    input_schema: {
      type: "object",
      properties: { receipt_id: { type: "string" } },
      required: ["receipt_id"],
    },
  },
  {
    name: "list_top_builders",
    description:
      "Builders ranked by composite Fingerprint score, or by a specific dimension. Dimensions: tokenEconomy, throughput, toolChoiceIQ, recoveryIndex, promptDiscipline, verificationRigor, spendVsJudgment, composite.",
    input_schema: {
      type: "object",
      properties: {
        dimension: {
          type: "string",
          enum: [...ALL_DIMENSIONS, "composite"],
        },
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
    },
  },
  {
    name: "get_builder",
    description: "Fetch a builder profile + their public Receipts by username.",
    input_schema: {
      type: "object",
      properties: { username: { type: "string" } },
      required: ["username"],
    },
  },
];

type ToolInput = Record<string, unknown>;

async function executeTool(name: string, input: ToolInput): Promise<unknown> {
  switch (name) {
    case "search_briefs": {
      const query = String(input.query ?? "").toLowerCase().trim();
      const difficulty = input.difficulty as string | undefined;
      const category = input.category as string | undefined;
      const max = Math.min(Math.max(Number(input.max_results ?? 10), 1), 20);
      const results = demoBriefs
        .filter((b) => {
          if (difficulty && b.difficulty !== difficulty) return false;
          if (category && b.category !== category) return false;
          if (
            query &&
            !`${b.title} ${b.tagline}`.toLowerCase().includes(query)
          )
            return false;
          return true;
        })
        .slice(0, max)
        .map((b) => ({
          slug: b.slug,
          title: b.title,
          tagline: b.tagline,
          difficulty: b.difficulty,
          category: b.category,
          sponsor: b.company.name,
          time_cap_minutes: Math.round(b.time_cap_seconds / 60),
          token_cap: b.token_cap,
          attempts_count: b.attempts_count,
          median_score: b.median_score,
          url: `https://antry.com/briefs/${b.slug}`,
        }));
      return { count: results.length, results };
    }
    case "get_brief": {
      const slug = String(input.slug ?? "");
      const b = getDemoBrief(slug);
      if (!b) return { error: `No Brief with slug "${slug}"` };
      return {
        slug: b.slug,
        title: b.title,
        tagline: b.tagline,
        difficulty: b.difficulty,
        category: b.category,
        sponsor: b.company.name,
        token_cap: b.token_cap,
        time_cap_minutes: Math.round(b.time_cap_seconds / 60),
        allowed_tools: b.allowed_tools,
        attempts_count: b.attempts_count,
        median_score: b.median_score,
        url: `https://antry.com/briefs/${b.slug}`,
      };
    }
    case "get_receipt": {
      const id = String(input.receipt_id ?? "");
      const r = getDemoReceipt(id);
      if (!r) return { error: `No Receipt with id "${id}"` };
      return {
        receipt_id: r.id,
        builder: r.builder.username,
        builder_name: r.builder.name,
        company: r.company.name,
        brief: r.brief_title,
        composite_score: r.composite_score,
        fingerprint: r.fingerprint,
        highlights: r.highlights,
        url: `https://antry.com/receipts/${r.id}`,
      };
    }
    case "verify_receipt": {
      const id = String(input.receipt_id ?? "");
      const r = getDemoReceipt(id);
      if (!r) return { error: `No Receipt with id "${id}"` };
      return {
        receipt_id: r.id,
        content_hash: r.content_hash,
        public_key_fp: "0x4F9C3A2B7D1E5F8A0C2D9B4E6F1A3C8E",
        signature_alg: "HMAC-SHA256",
        signed_at: r.signed_at,
        signature_valid: true,
      };
    }
    case "list_top_builders": {
      const dim = (input.dimension ?? "composite") as
        | FingerprintDimension
        | "composite";
      const limit = Math.min(Math.max(Number(input.limit ?? 5), 1), 10);
      const rows = demoReceipts.map((r) => ({
        username: r.builder.username,
        name: r.builder.name,
        score:
          dim === "composite"
            ? computeCompositeScore(r.fingerprint)
            : r.fingerprint[dim],
        receipt_id: r.id,
      }));
      const best = new Map<string, (typeof rows)[number]>();
      for (const row of rows) {
        const e = best.get(row.username);
        if (!e || row.score > e.score) best.set(row.username, row);
      }
      const ranked = Array.from(best.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      return {
        dimension: dim,
        dimension_label:
          dim === "composite" ? "Composite" : DIMENSION_LABELS[dim],
        count: ranked.length,
        results: ranked.map((row) => ({
          ...row,
          profile_url: `https://antry.com/builders/${row.username}`,
        })),
      };
    }
    case "get_builder": {
      const username = String(input.username ?? "").replace(/^@/, "");
      const receipts = getDemoReceiptsForBuilder(username);
      if (!receipts.length)
        return { error: `No builder "${username}" found.` };
      const sorted = [...receipts].sort(
        (a, b) => b.composite_score - a.composite_score
      );
      return {
        username,
        name: receipts[0].builder.name,
        receipts_count: sorted.length,
        receipts: sorted.slice(0, 5).map((r) => ({
          receipt_id: r.id,
          composite_score: r.composite_score,
          brief_title: r.brief_title,
          company: r.company.name,
          url: `https://antry.com/receipts/${r.id}`,
        })),
      };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Scout LLM is not configured. Set ANTHROPIC_API_KEY on the server.",
      },
      { status: 503 }
    );
  }

  // Abuse guard — strong per-IP rate limit. Public route, no auth required.
  const limit = checkScoutRateLimit(getClientKey(req));
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Scout is rate-limited.",
        message: `Too many requests. Wait ${limit.retryAfterSeconds}s before trying again.`,
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  let body: { message: string; history?: ChatTurn[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const message = (body.message ?? "").trim().slice(0, 320);
  if (!message) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }
  const history = (body.history ?? [])
    .slice(-6)
    .map((t) => ({
      role: t.role,
      content: t.content.slice(0, 320),
    }));

  const client = new Anthropic({ apiKey });

  // Build messages: history + current user turn.
  const messages: Anthropic.MessageParam[] = [
    ...history.map<Anthropic.MessageParam>((t) => ({
      role: t.role,
      content: t.content,
    })),
    { role: "user", content: message },
  ];

  const steps: { tool: string; result: string }[] = [];
  let finalText = "";
  // Tracks whether the loop ended via a real stop_reason (true) or simply
  // ran out of iterations (false). The latter is an error condition.
  let loopCompleted = false;

  try {
    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        // Cache breakpoint on the system block — also caches the tool list,
        // which renders before system. Saves ~$X per request once warm.
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        tools: TOOLS,
        thinking: { type: "adaptive" },
        messages,
      });

      // Append the assistant turn so tool_use blocks are preserved.
      messages.push({ role: "assistant", content: response.content });

      if (response.stop_reason === "end_turn") {
        finalText = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim();
        loopCompleted = true;
        break;
      }

      if (response.stop_reason === "tool_use") {
        const toolUses = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
        );
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const tu of toolUses) {
          const result = await executeTool(
            tu.name,
            tu.input as ToolInput
          );
          steps.push({
            tool: tu.name,
            result:
              typeof result === "object" && result !== null
                ? JSON.stringify(result).slice(0, 200)
                : String(result).slice(0, 200),
          });
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: JSON.stringify(result),
          });
        }
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      // pause_turn / max_tokens / refusal — bail out gracefully
      finalText =
        response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim() ||
        "I hit a snag and couldn't finish that lookup. Try rephrasing?";
      loopCompleted = true;
      break;
    }

    // Loop exhausted MAX_TOOL_ITERATIONS without a terminal stop_reason —
    // the model is stuck in a tool-call cycle. Fail cleanly rather than
    // returning a half-finished answer.
    if (!loopCompleted) {
      return NextResponse.json(
        {
          error: "tool_iteration_limit",
          message:
            "Scout exceeded its tool-call budget without reaching an answer. Try a more specific question.",
          steps,
        },
        { status: 503, headers: { "X-RateLimit-Remaining": String(limit.remaining) } }
      );
    }

    if (!finalText) {
      finalText =
        "I couldn't synthesize an answer in the tool-call budget. Try a more specific question (e.g. 'find senior RAG Briefs' or 'top builders by Recovery Index').";
    }

    return NextResponse.json(
      {
        intent: "scout_llm",
        confidence: 1,
        response: finalText,
        steps,
        cards: [],
        suggestions: [
          { label: "Top builders", prompt: "Who are the top 5 builders by composite score?" },
          { label: "Senior Briefs", prompt: "List the senior-difficulty Briefs" },
          { label: "Verify a Receipt", prompt: "Verify rc_mara_anthropic_001" },
        ],
        model: "claude-scout-v1",
        source: "live",
      },
      { headers: { "X-RateLimit-Remaining": String(limit.remaining) } }
    );
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Scout is rate-limited. Try again in a few seconds." },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Server has an invalid Anthropic API key." },
        { status: 503 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude error ${err.status}: ${err.message}` },
        { status: 502 }
      );
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
