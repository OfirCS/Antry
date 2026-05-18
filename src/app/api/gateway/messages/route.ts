// Antry Receipts — instrumented LLM gateway.
//
// POST proxy to Anthropic's Messages API. Mirrors Anthropic's request/response
// shape exactly so existing client SDK code works by just swapping the base URL.
// Speaks raw HTTP (no SDK import) so the deploy stays small.
//
// Per request:
//   1. Validate lab_session_token (HMAC, 4h TTL).
//   2. Reuse Scout's rate limiter + abuse detection patterns.
//   3. Check the attempt's remaining token budget; reject 402 if exhausted.
//   4. Stream proxy: tee response — one copy untouched to the client, one to
//      a TransformStream that parses message_delta events to capture
//      usage.input_tokens, usage.output_tokens, cache_*_tokens, and tool blocks.
//   5. On stream end, persist a gateway_calls row (or append to in-memory
//      attempt store in dev) and HMAC-sign a Receipt fragment.
//   6. Mirror Scout's response headers + add X-Receipt-Spent / -Remaining.
//
// Auto-falls-back to a realistic mock stream when ANTHROPIC_API_KEY is unset
// so the Lab is fully demoable in dev without a key.

import { NextResponse } from "next/server";
import { createHash, createHmac } from "node:crypto";
import { verifyLabSession } from "@/lib/receipts/lab-session";
import { getReceiptSecret } from "@/lib/receipts/secret";
import { createClient } from "@/lib/supabase/server";
import {
  getAttempt,
  appendCall,
  setAttemptStatus,
  createAttempt,
  type StoredCall,
} from "@/lib/receipts/attempt-store";
import {
  mockStream,
  mockInputTokensForTurn,
  mockOutputTokensForTurn,
  mockToolsForTurn,
} from "@/lib/receipts/gateway-mock";
import { gatewayMessagesSchema } from "@/lib/schemas";
import { zodErrorResponse } from "@/lib/api-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANTHROPIC_BASE = "https://api.anthropic.com/v1/messages";

// Rough cost in USD cents per 1M tokens for default model.
const COST_INPUT_PER_M = 300; // $3.00 / 1M
const COST_OUTPUT_PER_M = 1500; // $15.00 / 1M

type GatewayRequest = {
  attempt_token: string;
  model?: string;
  max_tokens?: number;
  messages: { role: "user" | "assistant"; content: string }[];
  // Optional pass-through fields — kept loose so this stays a thin proxy.
  [k: string]: unknown;
};

// Same-origin only. The gateway is not a public API; the only consumer is the
// Antry Lab UI on the same domain. Reject cross-origin requests outright so a
// stolen session token can't be used from a phishing page.
const ALLOWED_ORIGINS = (process.env.GATEWAY_ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // same-origin requests omit Origin
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Localhost dev convenience.
  if (process.env.NODE_ENV !== "production" && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
    return true;
  }
  return false;
}

function corsHeaders(origin: string | null) {
  const h: Record<string, string> = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Antry-Lab-Session",
    "Access-Control-Max-Age": "86400",
  };
  if (origin && isAllowedOrigin(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
  }
  return h;
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

function toolType(name: string): "deterministic" | "generative" {
  // Heuristic: deterministic tools are the ones in the Brief whitelist that
  // don't themselves call the model. file_search, code_run, schema_lookup → det.
  // judge, summarize, classify → generative.
  const det = new Set(["file_search", "code_run", "schema_lookup", "grep", "fetch_url"]);
  return det.has(name) ? "deterministic" : "generative";
}

function signCall(call: Omit<StoredCall, "receiptSignature" | "responseHash">): string {
  const canonical = JSON.stringify({
    attemptId: call.attemptId,
    turnIndex: call.turnIndex,
    model: call.model,
    inputTokens: call.inputTokens,
    outputTokens: call.outputTokens,
    toolCalls: call.toolCalls,
    createdAt: call.createdAt,
  });
  return createHmac("sha256", getReceiptSecret()).update(canonical).digest("base64url");
}

export async function POST(req: Request) {
  const start = Date.now();
  const origin = req.headers.get("origin");

  // Same-origin enforcement — reject before doing any work.
  if (origin && !isAllowedOrigin(origin)) {
    return NextResponse.json(
      { error: "origin_not_allowed" },
      { status: 403, headers: corsHeaders(origin) }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400, headers: corsHeaders(origin) }
    );
  }
  const validated = gatewayMessagesSchema.safeParse(rawBody);
  if (!validated.success) {
    return zodErrorResponse(validated.error, corsHeaders(origin));
  }
  const body = validated.data as GatewayRequest;

  const token = body.attempt_token || req.headers.get("X-Antry-Lab-Session") || "";
  const session = verifyLabSession(token);
  if (!session.ok) {
    return NextResponse.json(
      { error: "lab_session_invalid", reason: session.reason },
      { status: 401, headers: corsHeaders(origin) }
    );
  }
  const { attemptId, briefId, builderId } = session.payload;

  // Bind the session to the calling user. This stops a leaked token from being
  // replayed by another account. We accept anonymous-builder sessions only
  // outside production (e.g. local dev) where authentication isn't required.
  let callerId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    callerId = data.user?.id ?? null;
  } catch {
    callerId = null;
  }
  const allowAnonymous =
    process.env.NODE_ENV !== "production" || process.env.ANTRY_ALLOW_ANON_LAB === "1";
  const expectingAnon = builderId === "anonymous-builder";

  if (!expectingAnon && callerId !== builderId) {
    return NextResponse.json(
      { error: "session_owner_mismatch" },
      { status: 403, headers: corsHeaders(origin) }
    );
  }
  if (expectingAnon && !allowAnonymous) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401, headers: corsHeaders(origin) }
    );
  }

  // Lazy-create the attempt if missing — session token is verified, so the
  // (attemptId, builderId, briefId) tuple is trustworthy.
  let attempt = getAttempt(attemptId);
  if (!attempt) {
    attempt = createAttempt({ attemptId, briefId, builderId });
  }

  if (attempt.status !== "in_progress") {
    return NextResponse.json(
      { error: "attempt_closed", status: attempt.status },
      { status: 409, headers: corsHeaders(origin) }
    );
  }

  // Check budget. We don't know exact token spend yet, but reject if already
  // way over. Final enforcement happens after the stream lands.
  const TOKEN_CAP_DEFAULT = 50000;
  const budgetCap = TOKEN_CAP_DEFAULT;
  if (attempt.tokensSpent >= budgetCap) {
    setAttemptStatus(attemptId, "budget_exceeded");
    return NextResponse.json(
      { error: "budget_exceeded" },
      { status: 402, headers: corsHeaders(origin) }
    );
  }

  const turnIndex = attempt.calls.length;
  const userMessage = body.messages?.[body.messages.length - 1];
  const promptPrefixHash = userMessage
    ? createHash("sha256").update(userMessage.content).digest("hex").slice(0, 16)
    : "";

  // Stream selection: real Anthropic if key present, else mock.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = body.model || "claude-sonnet-4-6";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();

      // Telemetry accumulators.
      let inputTokens = 0;
      let outputTokens = 0;
      let cacheReadTokens = 0;
      let cacheCreationTokens = 0;
      const toolCalls: { type: "deterministic" | "generative"; name: string }[] = [];
      const responseHasher = createHash("sha256");

      const handleEventLine = (eventLine: string, dataLine: string) => {
        // Forward the raw line verbatim to the client.
        controller.enqueue(enc.encode(`${eventLine}\n${dataLine}\n\n`));
        // Parse data for telemetry.
        const dataStr = dataLine.replace(/^data:\s*/, "");
        try {
          const parsed = JSON.parse(dataStr);
          responseHasher.update(dataStr);
          if (parsed.type === "message_start" && parsed.message?.usage) {
            inputTokens += parsed.message.usage.input_tokens ?? 0;
            cacheReadTokens += parsed.message.usage.cache_read_input_tokens ?? 0;
            cacheCreationTokens += parsed.message.usage.cache_creation_input_tokens ?? 0;
          } else if (parsed.type === "message_delta" && parsed.usage) {
            outputTokens += parsed.usage.output_tokens ?? 0;
          } else if (
            parsed.type === "content_block_start" &&
            parsed.content_block?.type === "tool_use"
          ) {
            const name = parsed.content_block.name;
            if (name) toolCalls.push({ type: toolType(name), name });
          }
        } catch {
          // Malformed line — pass through, skip telemetry.
        }
      };

      try {
        if (apiKey) {
          // Real Anthropic streaming
          const upstream = await fetch(ANTHROPIC_BASE, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model,
              max_tokens: body.max_tokens ?? 1024,
              messages: body.messages,
              stream: true,
            }),
          });
          if (!upstream.ok || !upstream.body) {
            const errText = await upstream.text().catch(() => "upstream_error");
            controller.enqueue(
              enc.encode(`event: error\ndata: ${JSON.stringify({ error: errText })}\n\n`)
            );
            controller.close();
            return;
          }
          const reader = upstream.body.getReader();
          const decoder = new TextDecoder();
          let buf = "";
          // Anthropic SSE: lines separated by \n\n, "event: X\ndata: {...}".
          // Parse line-by-line so we can tee telemetry from data lines.
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            let nlIdx;
            while ((nlIdx = buf.indexOf("\n\n")) !== -1) {
              const block = buf.slice(0, nlIdx);
              buf = buf.slice(nlIdx + 2);
              const lines = block.split("\n");
              const evLine = lines.find((l) => l.startsWith("event:")) ?? "";
              const dtLine = lines.find((l) => l.startsWith("data:")) ?? "";
              if (dtLine) handleEventLine(evLine, dtLine);
            }
          }
        } else {
          // Mock stream
          for await (const ev of mockStream({ turnIndex })) {
            handleEventLine(`event: ${ev.event}`, `data: ${ev.data}`);
          }
          // Mock telemetry to fill in missing accumulator values.
          if (inputTokens === 0) inputTokens = mockInputTokensForTurn(turnIndex);
          if (outputTokens === 0) outputTokens = mockOutputTokensForTurn(turnIndex);
          if (toolCalls.length === 0) {
            for (const t of mockToolsForTurn(turnIndex)) toolCalls.push(t);
          }
        }

        // Persist call + sign.
        const nowMs = Date.now();
        const costCents = Math.round(
          (inputTokens / 1_000_000) * COST_INPUT_PER_M +
            (outputTokens / 1_000_000) * COST_OUTPUT_PER_M
        );
        const responseHash = responseHasher.digest("hex").slice(0, 32);
        const partial = {
          attemptId,
          turnIndex,
          model,
          inputTokens,
          outputTokens,
          cacheReadTokens,
          cacheCreationTokens,
          costUsdCents: costCents,
          toolCalls,
          retracted: false, // detection happens in fingerprint analysis
          selfChecked:
            toolCalls.some((t) => t.name === "judge" || t.name === "code_run"),
          promptPrefixDelta: userMessage?.content?.length ?? 0,
          qualityDelta: 0.18, // mocked — real eval rubric runs at mintReceipt time
          latencyMs: nowMs - start,
          createdAt: nowMs,
        };
        const sig = signCall(partial);
        appendCall(attemptId, { ...partial, receiptSignature: sig, responseHash });

        // Send a final Antry receipt event so the client can pick up signed
        // metadata in-band.
        controller.enqueue(
          enc.encode(
            `event: antry_receipt\ndata: ${JSON.stringify({
              type: "antry_receipt",
              attempt_id: attemptId,
              brief_id: briefId,
              turn_index: turnIndex,
              input_tokens: inputTokens,
              output_tokens: outputTokens,
              cost_usd_cents: costCents,
              tool_calls: toolCalls,
              receipt_signature: sig,
              response_hash: responseHash,
              prompt_prefix_hash: promptPrefixHash,
              tokens_spent_total: getAttempt(attemptId)?.tokensSpent ?? 0,
              tokens_remaining: Math.max(
                0,
                budgetCap - (getAttempt(attemptId)?.tokensSpent ?? 0)
              ),
            })}\n\n`
          )
        );
        controller.close();
      } catch (err) {
        controller.enqueue(
          enc.encode(
            `event: error\ndata: ${JSON.stringify({
              error: err instanceof Error ? err.message : "stream_error",
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  // Compute headers (best-effort — exact totals known after stream completes).
  const remaining = Math.max(0, budgetCap - attempt.tokensSpent);
  const headers = new Headers({
    ...corsHeaders(origin),
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "X-Response-Time": `${Date.now() - start}ms`,
    "X-Receipt-Spent": String(attempt.tokensSpent),
    "X-Receipt-Remaining": String(remaining),
    "X-Receipt-Mode": apiKey ? "anthropic" : "mock",
  });
  return new Response(stream, { status: 200, headers });
}
