/**
 * Scout outreach drafter.
 *
 * POST /api/scout/outreach { receipt_id, context? }
 *   → { subject, message, drafter, request_id }
 *
 * Drafts a personalized first-contact message to a Receipt-holder,
 * citing their actual evidence (composite, top dimensions, highlight).
 * Claude Sonnet 4.6 drafts when ANTHROPIC_API_KEY is set (same tier as
 * auto-post — short copywriting, no deep reasoning needed); otherwise
 * the deterministic template from src/lib/scout/outreach.ts.
 *
 * `drafter` mirrors the `grader` attribution pattern on /api/scout:
 * "claude-sonnet-4-6" | "template" | "template_fallback".
 */

import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { demoReceipts } from "@/lib/receipts/demo-data";
import { createRateLimiter } from "@/lib/agent/rate-limit";
import { siteUrl } from "@/lib/seo";
import {
  buildOutreachPrompt,
  buildOutreachTemplate,
  candidateFromReceipt,
  type OutreachCandidate,
  type OutreachDraft,
} from "@/lib/scout/outreach";

export const runtime = "nodejs";

// Generous-ish: drafting is cheap and a recruiter iterating on role
// context will re-draft several times per candidate.
const checkLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
});

function getIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function newRequestId(): string {
  return `outreach_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: NextRequest) {
  const reqId = newRequestId();
  const ip = getIp(req);
  const startedAt = Date.now();

  const rl = checkLimit(`outreach:${ip}`);
  if (!rl.allowed) {
    console.warn(`[${reqId}] outreach rate-limited ip=${ip}`);
    return NextResponse.json(
      {
        error: "rate_limited",
        message: `Too many drafts. Try again in ${rl.retryAfterSeconds}s.`,
        request_id: reqId,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.retryAfterSeconds),
          "X-Request-Id": reqId,
        },
      }
    );
  }

  let body: { receipt_id?: string; context?: string };
  try {
    body = (await req.json()) as { receipt_id?: string; context?: string };
  } catch {
    return NextResponse.json(
      {
        error: "invalid_json",
        message: "Request body must be valid JSON.",
        request_id: reqId,
      },
      { status: 400, headers: { "X-Request-Id": reqId } }
    );
  }

  const receiptId = (body.receipt_id ?? "").trim();
  const context = (body.context ?? "").trim().slice(0, 400);
  if (!receiptId) {
    return NextResponse.json(
      {
        error: "invalid_receipt",
        message: "receipt_id is required.",
        request_id: reqId,
      },
      { status: 400, headers: { "X-Request-Id": reqId } }
    );
  }

  // Same pool as /api/scout — public demo Receipts. The DB-backed
  // version reads from the receipts table when real data lands.
  const receipt = demoReceipts.find(
    (r) => r.id === receiptId && r.display_visibility === "public"
  );
  if (!receipt) {
    return NextResponse.json(
      {
        error: "not_found",
        message: "No public Receipt with that id.",
        request_id: reqId,
      },
      { status: 404, headers: { "X-Request-Id": reqId } }
    );
  }

  const candidate = candidateFromReceipt(receipt);
  const receiptUrl = `${siteUrl().replace(/\/$/, "")}/receipts/${receipt.id}`;

  if (!process.env.ANTHROPIC_API_KEY) {
    const draft = buildOutreachTemplate(candidate, receiptUrl, context);
    console.log(
      `[${reqId}] outreach done drafter=template ms=${Date.now() - startedAt}`
    );
    return NextResponse.json(
      { ...draft, drafter: "template", request_id: reqId },
      { headers: { "X-Request-Id": reqId } }
    );
  }

  try {
    const draft = await claudeDraft(candidate, receiptUrl, context);
    console.log(
      `[${reqId}] outreach done drafter=claude-sonnet-4-6 ms=${Date.now() - startedAt}`
    );
    return NextResponse.json(
      { ...draft, drafter: "claude-sonnet-4-6", request_id: reqId },
      { headers: { "X-Request-Id": reqId } }
    );
  } catch (e) {
    console.error(`[${reqId}] outreach claude_failed`, e);
    const draft = buildOutreachTemplate(candidate, receiptUrl, context);
    return NextResponse.json(
      {
        ...draft,
        drafter: "template_fallback",
        request_id: reqId,
        warning: "Agent unavailable — showing template draft.",
      },
      { headers: { "X-Request-Id": reqId } }
    );
  }
}

async function claudeDraft(
  candidate: OutreachCandidate,
  receiptUrl: string,
  context: string
): Promise<OutreachDraft> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            subject: { type: "string", maxLength: 120 },
            message: { type: "string", maxLength: 1200 },
          },
          required: ["subject", "message"],
        },
      },
    },
    system: [
      {
        type: "text",
        text: `You draft first-contact outreach messages for hiring companies on Antry, written to a builder whose signed Receipt matched their search.

Rules:
  - Cite SPECIFIC evidence from the Receipt: composite score, the Brief title, 1–2 named Fingerprint dimensions with their numbers, and the highlight if one exists. The builder should feel the recruiter actually read their work.
  - 90–160 words for the message. Subject under 80 characters.
  - Warm but professional. No hype words ("amazing", "rockstar", "ninja"), no emoji, no "I hope this finds you well."
  - Address the builder by first name. Sign off with "— Sent via Antry Scout".
  - Include the Receipt URL on its own line so the builder can verify what was seen.
  - If role context is provided, connect their evidence to that role concretely. If not, keep the ask to a short intro call.
  - Never invent facts not present in the evidence block.`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: buildOutreachPrompt(candidate, receiptUrl, context),
      },
    ],
  });

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!textBlock) throw new Error("no_text_in_response");
  const parsed = JSON.parse(textBlock.text) as OutreachDraft;
  if (!parsed.subject || !parsed.message) throw new Error("invalid_draft");
  return { subject: parsed.subject, message: parsed.message };
}
