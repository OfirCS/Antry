// Receipt signing & verification.
// HMAC-SHA256 over a canonical JSON form so receipts are non-forgeable.
// Public verifier exposed at /api/v1/receipts/[id]/verify.

import { createHmac, createHash } from "node:crypto";

export type CanonicalReceipt = {
  id: string;
  brief_id: string;
  builder_id: string;
  fingerprint: Record<string, number>;
  composite_score: number;
  signed_at: string;
};

function canonicalJSON(o: unknown): string {
  if (o === null || typeof o !== "object" || Array.isArray(o)) {
    return JSON.stringify(o);
  }
  const obj = o as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const parts = keys.map((k) => JSON.stringify(k) + ":" + canonicalJSON(obj[k]));
  return "{" + parts.join(",") + "}";
}

function getSecret(): string {
  return process.env.RECEIPT_HMAC_SECRET || "antry-dev-receipt-secret-do-not-use-in-prod";
}

export function signReceipt(receipt: CanonicalReceipt): string {
  const json = canonicalJSON(receipt);
  return createHmac("sha256", getSecret()).update(json).digest("base64url");
}

export function contentHash(receipt: CanonicalReceipt): string {
  const json = canonicalJSON(receipt);
  return "sha256:" + createHash("sha256").update(json).digest("hex").slice(0, 32);
}

export function verifyReceipt(
  receipt: CanonicalReceipt,
  signature: string
): { ok: boolean; reason?: string } {
  const expected = signReceipt(receipt);
  if (expected !== signature) {
    return { ok: false, reason: "signature_mismatch" };
  }
  return { ok: true };
}
