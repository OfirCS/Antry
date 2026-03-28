import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isDomainScopedAgentQuery,
  loadAgentDatasetStrict,
  runAgent,
} from "@/lib/agent/engine";
import { checkAgentRateLimit } from "@/lib/agent/rate-limit";
import type { AgentIntent } from "@/lib/agent/types";

// ── Request validation ───────────────────────────────────────

const requestSchema = z.object({
  message: z.string().min(1).max(320),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(320),
        intent: z.string().optional(),
      })
    )
    .max(12)
    .optional()
    .default([]),
});

// ── CORS headers ─────────────────────────────────────────────

/** Standard CORS headers applied to every response. */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// ── Helpers ──────────────────────────────────────────────────

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip =
    forwarded.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = (request.headers.get("user-agent") || "na").slice(
    0,
    80
  );
  return `${ip}:${userAgent}`;
}

function countWords(input: string): number {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function hasAbusivePayload(message: string): boolean {
  const lower = message.toLowerCase();
  const urlCount = (message.match(/https?:\/\//g) || []).length;

  return (
    countWords(message) > 60 ||
    urlCount > 2 ||
    /([a-z0-9])\1{9,}/i.test(message) ||
    lower.includes("ignore previous instructions") ||
    lower.includes("repeat this")
  );
}

/**
 * Build a JSON response with standard CORS + timing headers.
 */
function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  extraHeaders: Record<string, string> = {}
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { ...CORS_HEADERS, ...extraHeaders },
  });
}

// ── CORS preflight ───────────────────────────────────────────

/**
 * Handle preflight OPTIONS requests for CORS.
 * External SDK consumers need this when calling the endpoint from a browser.
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// ── Main handler ─────────────────────────────────────────────

export async function POST(request: Request) {
  const startTime = performance.now();

  try {
    // ── Rate limiting ───────────────────────────────────
    const limit = checkAgentRateLimit(getClientKey(request));
    if (!limit.allowed) {
      return jsonResponse(
        {
          error: "Rate limit reached.",
          message: `You've exceeded the request limit. Please wait ${limit.retryAfterSeconds} seconds before trying again, or reduce the frequency of your requests.`,
          retryAfterSeconds: limit.retryAfterSeconds,
        },
        429,
        {
          "Retry-After": String(limit.retryAfterSeconds),
          "X-RateLimit-Remaining": "0",
          "X-Response-Time": `${Math.round(performance.now() - startTime)}ms`,
        }
      );
    }

    // ── Parse & validate payload ────────────────────────
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse(
        {
          error: "Invalid JSON body.",
          message:
            "The request body must be valid JSON with a `message` string field. Example: { \"message\": \"Find React builders\" }",
        },
        400,
        {
          "X-Response-Time": `${Math.round(performance.now() - startTime)}ms`,
        }
      );
    }

    const parsed = requestSchema.safeParse(payload);

    if (!parsed.success) {
      const flat = parsed.error.flatten();
      return jsonResponse(
        {
          error: "Invalid request payload.",
          message:
            "Check the `details` field below. The `message` field is required (1-320 chars), and `history` is an optional array of up to 12 chat turns.",
          details: flat,
        },
        400,
        {
          "X-Response-Time": `${Math.round(performance.now() - startTime)}ms`,
        }
      );
    }

    // ── Abuse detection ─────────────────────────────────
    const totalHistoryChars = (parsed.data.history || []).reduce(
      (sum, turn) => sum + turn.content.length,
      0
    );

    if (
      totalHistoryChars > 1400 ||
      hasAbusivePayload(parsed.data.message)
    ) {
      return jsonResponse(
        {
          error: "Payload too large or contains disallowed patterns.",
          message:
            "Scout is limited to short, focused queries. Keep your message under 60 words and history under 1 400 characters total. Avoid URLs and repetitive content.",
        },
        413,
        {
          "X-Response-Time": `${Math.round(performance.now() - startTime)}ms`,
        }
      );
    }

    // ── Domain-scope check ──────────────────────────────
    if (!isDomainScopedAgentQuery(parsed.data.message)) {
      return jsonResponse(
        {
          error: "Off-topic or prompt injection detected.",
          message:
            "Scout only answers questions about the Antry builder network. Try asking about builders, projects, hackathons, or teams.",
        },
        422,
        {
          "X-Response-Time": `${Math.round(performance.now() - startTime)}ms`,
        }
      );
    }

    // ── Load dataset ────────────────────────────────────
    const dataset = await loadAgentDatasetStrict();
    if (!dataset) {
      return jsonResponse(
        {
          error: "Scout data source is unavailable.",
          message:
            "The builder database is temporarily unreachable. Please try again in a few seconds. If this persists, check https://status.antry.io for updates.",
        },
        503,
        {
          "X-Response-Time": `${Math.round(performance.now() - startTime)}ms`,
        }
      );
    }

    // ── Run agent engine ────────────────────────────────
    const history = (parsed.data.history || []).map((h) => ({
      role: h.role,
      content: h.content,
      intent: h.intent as AgentIntent | undefined,
    }));

    const result = runAgent(parsed.data.message, history, dataset);
    const elapsed = Math.round(performance.now() - startTime);

    return jsonResponse(result as unknown as Record<string, unknown>, 200, {
      "X-Response-Time": `${elapsed}ms`,
      "X-RateLimit-Remaining": String(limit.remaining),
    });
  } catch {
    const elapsed = Math.round(performance.now() - startTime);
    return jsonResponse(
      {
        error: "Internal server error.",
        message:
          "Something went wrong processing your request. Please try again. If this keeps happening, reach out to support@antry.io.",
      },
      500,
      {
        "X-Response-Time": `${elapsed}ms`,
      }
    );
  }
}
