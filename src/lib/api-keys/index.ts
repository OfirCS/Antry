// Antry API keys.
//
// Keys look like:  ant_<env>_<id>_<secret>
//   ant_   — namespace prefix (Antry)
//   <env>  — "live" / "test"
//   <id>   — short public id stored on the row (8 hex)
//   <secret> — 32 url-safe random chars; never stored in plaintext
//
// At rest we store: id (public), env, hmac of full key (secret-sided),
// owner_company_id, scope, created_at, last_used_at, revoked_at.
//
// On request: we parse the prefix, look up the row by id, verify the
// HMAC matches in constant time. If yes, the request gets the row's
// scope (e.g. "company:{slug}:read", "company:{slug}:briefs:write").

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getReceiptSecret } from "@/lib/receipts/secret";

export type ApiKeyScope =
  | { kind: "company_read"; companyId: string }
  | { kind: "company_write"; companyId: string }
  | { kind: "builder_read"; builderId: string };

export type ApiKeyRow = {
  id: string;
  env: "live" | "test";
  key_hmac: string;
  owner_company_id: string | null;
  owner_builder_id: string | null;
  scope: ApiKeyScope;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

const HEADER_NAME = "x-antry-key";

function hmacKey(fullKey: string): string {
  return createHmac("sha256", getReceiptSecret()).update(fullKey).digest("base64url");
}

export function generateApiKey(opts: {
  env?: "live" | "test";
}): { key: string; id: string; hmac: string; env: "live" | "test" } {
  const env = opts.env ?? "live";
  const id = randomBytes(4).toString("hex"); // 8 hex chars
  const secret = randomBytes(24).toString("base64url"); // 32 url-safe chars
  const fullKey = `ant_${env}_${id}_${secret}`;
  return { key: fullKey, id, hmac: hmacKey(fullKey), env };
}

export type ParsedApiKey = {
  full: string;
  env: "live" | "test";
  id: string;
};

export function parseApiKey(raw: string): ParsedApiKey | null {
  if (!raw || typeof raw !== "string") return null;
  const m = raw.match(/^ant_(live|test)_([0-9a-f]{8})_[A-Za-z0-9_-]{20,}$/);
  if (!m) return null;
  return { full: raw, env: m[1] as "live" | "test", id: m[2] };
}

export function readApiKeyFromRequest(req: Request): ParsedApiKey | null {
  const header =
    req.headers.get(HEADER_NAME) ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    null;
  if (!header) return null;
  return parseApiKey(header);
}

// Constant-time HMAC compare.
export function verifyApiKey(fullKey: string, expectedHmac: string): boolean {
  const recomputed = hmacKey(fullKey);
  const a = Buffer.from(recomputed);
  const b = Buffer.from(expectedHmac);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// ── Demo / dev mode ────────────────────────────────────
//
// Without Supabase, we have a single test key generated at module load that
// resolves to a "demo" company so SDK consumers can hit the API in dev.
// In production this is replaced by a real api_keys table lookup.

const DEV_DEMO_KEY = (() => {
  if (process.env.NODE_ENV === "production") return null;
  const k = generateApiKey({ env: "test" });
  return k;
})();

export function devDemoKey(): { key: string; companySlug: string } | null {
  if (!DEV_DEMO_KEY) return null;
  return { key: DEV_DEMO_KEY.key, companySlug: "anthropic" };
}

export type ResolvedApiKey = {
  parsed: ParsedApiKey;
  scope: ApiKeyScope;
};

export async function resolveApiKey(
  req: Request
): Promise<{ ok: true; resolved: ResolvedApiKey } | { ok: false; reason: string }> {
  const parsed = readApiKeyFromRequest(req);
  if (!parsed) return { ok: false, reason: "missing_api_key" };

  // Dev path: a single demo key in non-production. Real Supabase lookup lands
  // when we wire production; this scaffolds the contract.
  if (DEV_DEMO_KEY && parsed.full === DEV_DEMO_KEY.key) {
    return {
      ok: true,
      resolved: {
        parsed,
        scope: { kind: "company_read", companyId: "anthropic" },
      },
    };
  }

  return { ok: false, reason: "unknown_or_revoked_key" };
}

// CORS for the public API (read endpoints are public; write endpoints
// require a key + same-origin).
export function publicCors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Antry-Key, Authorization",
    "Access-Control-Max-Age": "3600",
  };
}
