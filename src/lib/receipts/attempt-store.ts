// Lightweight in-memory store for attempt telemetry.
// Used when Supabase isn't configured — keeps the v0.2 Lab fully functional
// in dev without a database. When Supabase env is set, the gateway also
// persists to gateway_calls + brief_attempts.

import type {
  AttemptStatus,
  Fingerprint,
} from "./types";

export type StoredCall = {
  attemptId: string;
  turnIndex: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  costUsdCents: number;
  toolCalls: { type: "deterministic" | "generative"; name: string }[];
  retracted: boolean;
  selfChecked: boolean;
  promptPrefixDelta: number;
  qualityDelta: number;
  latencyMs: number;
  receiptSignature: string;
  responseHash: string;
  createdAt: number;
};

export type StoredAttempt = {
  id: string;
  briefId: string;
  builderId: string;
  status: AttemptStatus;
  startedAt: number;
  endedAt: number | null;
  tokensSpent: number;
  costUsdCents: number;
  calls: StoredCall[];
  // Cached final fingerprint when Receipt is minted.
  finalFingerprint?: Fingerprint;
};

// Pin the Map to globalThis so it survives Next.js HMR + module-instance
// boundaries in dev. In production with Supabase, this becomes a thin
// pass-through and persistence happens server-side.
declare global {
  // eslint-disable-next-line no-var
  var __antryAttemptStore: Map<string, StoredAttempt> | undefined;
}
const attempts: Map<string, StoredAttempt> =
  globalThis.__antryAttemptStore ?? (globalThis.__antryAttemptStore = new Map());

export function createAttempt(input: {
  attemptId: string;
  briefId: string;
  builderId: string;
}): StoredAttempt {
  const a: StoredAttempt = {
    id: input.attemptId,
    briefId: input.briefId,
    builderId: input.builderId,
    status: "in_progress",
    startedAt: Date.now(),
    endedAt: null,
    tokensSpent: 0,
    costUsdCents: 0,
    calls: [],
  };
  attempts.set(a.id, a);
  return a;
}

export function getAttempt(id: string): StoredAttempt | null {
  return attempts.get(id) ?? null;
}

export function appendCall(attemptId: string, call: StoredCall): void {
  const a = attempts.get(attemptId);
  if (!a) return;
  a.calls.push(call);
  a.tokensSpent += call.inputTokens + call.outputTokens;
  a.costUsdCents += call.costUsdCents;
  attempts.set(attemptId, a);
}

export function setAttemptStatus(attemptId: string, status: AttemptStatus): void {
  const a = attempts.get(attemptId);
  if (!a) return;
  a.status = status;
  if (status !== "in_progress" && a.endedAt === null) {
    a.endedAt = Date.now();
  }
  attempts.set(attemptId, a);
}

export function setFinalFingerprint(attemptId: string, fp: Fingerprint): void {
  const a = attempts.get(attemptId);
  if (!a) return;
  a.finalFingerprint = fp;
  attempts.set(attemptId, a);
}
