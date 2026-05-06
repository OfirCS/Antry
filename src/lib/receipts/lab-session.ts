// Lab session tokens. Bind a Brief Attempt to a single browser session so
// only the rightful builder can stream through the gateway. HMAC-signed,
// short-lived. Verified at the top of every gateway request.

import { createHmac, timingSafeEqual } from "node:crypto";
import { getReceiptSecret } from "./secret";

export type LabSessionPayload = {
  attemptId: string;
  builderId: string;
  briefId: string;
  expiresAt: number; // ms epoch
};

const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, "base64url");
}

export function signLabSession(
  payload: Omit<LabSessionPayload, "expiresAt">,
  ttlMs: number = SESSION_TTL_MS
): string {
  const full: LabSessionPayload = {
    ...payload,
    expiresAt: Date.now() + ttlMs,
  };
  const json = JSON.stringify(full);
  const body = b64url(Buffer.from(json));
  const sig = createHmac("sha256", getReceiptSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyLabSession(
  token: string
): { ok: true; payload: LabSessionPayload } | { ok: false; reason: string } {
  if (!token || !token.includes(".")) return { ok: false, reason: "malformed" };
  const [body, sig] = token.split(".");
  if (!body || !sig) return { ok: false, reason: "malformed" };

  const expected = createHmac("sha256", getReceiptSecret()).update(body).digest("base64url");
  // Constant-time comparison.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature_mismatch" };
  }

  let payload: LabSessionPayload;
  try {
    payload = JSON.parse(fromB64url(body).toString("utf-8")) as LabSessionPayload;
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
  if (payload.expiresAt < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  return { ok: true, payload };
}
