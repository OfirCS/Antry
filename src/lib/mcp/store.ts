/**
 * MCP attempt store — DB-first with in-memory fallback.
 *
 * If `SUPABASE_SERVICE_ROLE_KEY` is set, all reads/writes go through
 * the admin Supabase client (bypasses RLS, since the gateway acts on
 * the builder's behalf using their bearer token). If not set, falls
 * back to a pinned globalThis Map so dev still works without DB.
 *
 * The interface is the same in both modes — callers don't branch.
 */

import type { Fingerprint } from "@/lib/receipts/types";
import { createAdminClient } from "@/lib/supabase/server";

// ── Shared types ──────────────────────────────────────
export type AttemptEvent = {
  seq: number;
  type: "prompt" | "tool_call" | "file_edit" | "pivot" | "note";
  payload: Record<string, unknown>;
  at: string;
};

export type Attempt = {
  id: string;
  brief_id: string;
  brief_slug: string;
  builder_id: string;
  status: "active" | "submitted" | "graded";
  started_at: string;
  events: AttemptEvent[];
  submitted_at?: string;
  graded_at?: string;
  receipt_id?: string;
  composite_score?: number;
  fingerprint?: Fingerprint;
};

// ── In-memory fallback (pinned to globalThis to survive HMR) ──
declare global {
  var __antryMcpAttempts: Map<string, Attempt> | undefined;
}
const memStore: Map<string, Attempt> =
  globalThis.__antryMcpAttempts ??
  (globalThis.__antryMcpAttempts = new Map());

function dbAvailable(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("127.0.0.1")
  );
}

// ── Public API ─────────────────────────────────────────

export async function startAttempt(input: {
  briefSlug: string;
  briefId: string;
  builderId: string;
}): Promise<Attempt> {
  const att: Attempt = {
    id: cryptoRandomId("att"),
    brief_id: input.briefId,
    brief_slug: input.briefSlug,
    builder_id: input.builderId,
    status: "active",
    started_at: new Date().toISOString(),
    events: [],
  };

  if (!dbAvailable()) {
    memStore.set(att.id, att);
    return att;
  }

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("brief_attempts")
    .insert({
      brief_id: input.briefId,
      builder_id: input.builderId,
      status: "in_progress",
      started_at: att.started_at,
    })
    .select("id")
    .single();
  if (error || !data) {
    // DB error — fall through to in-memory so the candidate isn't blocked.
    // Logged to stderr for ops; the attempt is still usable but won't
    // survive a restart.
    console.error("[mcp/store] DB insert failed, falling back:", error);
    memStore.set(att.id, att);
    return att;
  }
  att.id = data.id;
  return att;
}

export async function logEvent(input: {
  attemptId: string;
  builderId: string;
  type: AttemptEvent["type"];
  payload: Record<string, unknown>;
}): Promise<{ seq: number; total: number }> {
  if (!dbAvailable()) {
    const a = memStore.get(input.attemptId);
    if (!a) throw new Error("attempt_not_found");
    if (a.builder_id !== input.builderId) throw new Error("forbidden");
    if (a.status !== "active") throw new Error(`cannot_log_in_${a.status}`);
    const seq = a.events.length + 1;
    a.events.push({
      seq,
      type: input.type,
      payload: input.payload,
      at: new Date().toISOString(),
    });
    return { seq, total: a.events.length };
  }

  const sb = createAdminClient();
  const { data: attempt } = await sb
    .from("brief_attempts")
    .select("id, builder_id, status")
    .eq("id", input.attemptId)
    .single();
  if (!attempt) throw new Error("attempt_not_found");
  if (attempt.builder_id !== input.builderId) throw new Error("forbidden");
  if (attempt.status !== "in_progress")
    throw new Error(`cannot_log_in_${attempt.status}`);

  const { count } = await sb
    .from("mcp_attempt_events")
    .select("seq", { head: true, count: "exact" })
    .eq("attempt_id", input.attemptId);
  const seq = (count ?? 0) + 1;

  await sb.from("mcp_attempt_events").insert({
    attempt_id: input.attemptId,
    seq,
    type: input.type,
    payload: input.payload,
  });
  return { seq, total: seq };
}

export async function getAttempt(input: {
  attemptId: string;
  builderId: string;
}): Promise<Attempt | null> {
  if (!dbAvailable()) {
    const a = memStore.get(input.attemptId);
    if (!a || a.builder_id !== input.builderId) return null;
    return a;
  }

  const sb = createAdminClient();
  const { data: row } = await sb
    .from("brief_attempts")
    .select("id, brief_id, builder_id, status, started_at, ended_at")
    .eq("id", input.attemptId)
    .single();
  if (!row || row.builder_id !== input.builderId) return null;

  const { data: events } = await sb
    .from("mcp_attempt_events")
    .select("seq, type, payload, created_at")
    .eq("attempt_id", input.attemptId)
    .order("seq");

  const { data: brief } = await sb
    .from("briefs")
    .select("slug")
    .eq("id", row.brief_id)
    .single();

  const { data: receipt } = await sb
    .from("receipts")
    .select("id, composite_score, fingerprint, signed_at")
    .eq("attempt_id", input.attemptId)
    .single();

  return {
    id: row.id,
    brief_id: row.brief_id,
    brief_slug: brief?.slug ?? "",
    builder_id: row.builder_id,
    status:
      row.status === "in_progress"
        ? "active"
        : receipt
          ? "graded"
          : "submitted",
    started_at: row.started_at,
    submitted_at: row.ended_at ?? undefined,
    graded_at: receipt?.signed_at ?? undefined,
    receipt_id: receipt?.id,
    composite_score: receipt?.composite_score,
    fingerprint: receipt?.fingerprint,
    events: (events ?? []).map((e) => ({
      seq: e.seq,
      type: e.type as AttemptEvent["type"],
      payload: (e.payload ?? {}) as Record<string, unknown>,
      at: e.created_at,
    })),
  };
}

export async function recordSubmission(input: {
  attemptId: string;
  builderId: string;
  composite_score: number;
  fingerprint: Fingerprint;
  receiptId: string;
  contentHash: string;
  signature: string;
}): Promise<void> {
  if (!dbAvailable()) {
    const a = memStore.get(input.attemptId);
    if (!a) return;
    a.status = "graded";
    a.submitted_at = new Date().toISOString();
    a.graded_at = a.submitted_at;
    a.composite_score = input.composite_score;
    a.fingerprint = input.fingerprint;
    a.receipt_id = input.receiptId;
    return;
  }

  const sb = createAdminClient();
  const now = new Date().toISOString();

  await sb
    .from("brief_attempts")
    .update({ status: "completed", ended_at: now })
    .eq("id", input.attemptId);

  // brief_id needed for the FK — fetch from the attempt row
  const { data: ba } = await sb
    .from("brief_attempts")
    .select("brief_id")
    .eq("id", input.attemptId)
    .single();
  if (!ba) return;

  await sb.from("receipts").insert({
    id: input.receiptId,
    attempt_id: input.attemptId,
    builder_id: input.builderId,
    brief_id: ba.brief_id,
    fingerprint: input.fingerprint,
    composite_score: input.composite_score,
    trace_visibility: "redacted",
    display_visibility: "public",
    content_hash: input.contentHash,
    signature: input.signature,
    signed_at: now,
  });
}

function cryptoRandomId(prefix: string): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}_${hex}`;
}
