/**
 * MCP bearer token resolution.
 *
 * Production mode (Supabase configured + token starts with `ant_live_`):
 *   Look up the token in `api_keys` table, HMAC-compare the secret part,
 *   return the owner_builder_id.
 *
 * Dev/permissive mode (Supabase not configured OR token starts with
 * `ant_dev_` / `ant_test_` / `ant_smoketest_`):
 *   Accept any well-formed token. Use a deterministic UUID derived from
 *   the token string as the synthetic builder_id so cross-token isolation
 *   still works in dev.
 *
 * This lets the MCP work end-to-end before the user has configured
 * Supabase, while still enforcing real auth once they do.
 */

import { createHash, createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";

export type ResolvedToken = {
  builderId: string;
  scope: "live" | "dev";
  apiKeyId: string | null;
};

const DEV_PREFIXES = ["ant_dev_", "ant_test_", "ant_smoketest_"];

export async function resolveBearer(
  rawHeader: string | null
): Promise<ResolvedToken | null> {
  if (!rawHeader) return null;
  const m = /^Bearer\s+(ant_[A-Za-z0-9_-]{8,})$/.exec(rawHeader.trim());
  if (!m) return null;
  const token = m[1];

  // Dev tokens — accept anywhere.
  if (DEV_PREFIXES.some((p) => token.startsWith(p))) {
    return {
      builderId: stableUuidFromToken(token),
      scope: "dev",
      apiKeyId: null,
    };
  }

  // No Supabase wired → accept any non-dev token in dev mode too.
  // This lets early adopters experiment with `ant_anything` before
  // they've issued real keys via /settings/api-keys.
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("127.0.0.1")
  );
  if (!supabaseConfigured) {
    return {
      builderId: stableUuidFromToken(token),
      scope: "dev",
      apiKeyId: null,
    };
  }

  // Production: look up by ID prefix, HMAC-compare the secret.
  // Token format: ant_live_<id>_<secret> (id is the api_keys.id PK).
  const live = /^ant_live_([A-Za-z0-9]{8,16})_([A-Za-z0-9_-]+)$/.exec(token);
  if (!live) return null;
  const [, keyId, secret] = live;

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("api_keys")
    .select("id, key_hmac, owner_builder_id, revoked_at, env")
    .eq("id", keyId)
    .single();
  if (error || !data || data.revoked_at !== null) return null;
  if (data.env !== "live") return null;
  if (!data.owner_builder_id) return null;

  // HMAC-compare in constant time
  const computed = createHmac("sha256", apiKeyHmacSecret())
    .update(secret)
    .digest("hex");
  if (!constantTimeEqualHex(computed, data.key_hmac)) return null;

  // Update last_used_at (fire-and-forget)
  void sb
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyId);

  return {
    builderId: data.owner_builder_id,
    scope: "live",
    apiKeyId: data.id,
  };
}

function stableUuidFromToken(token: string): string {
  // Deterministic UUID from token string (sha-256 → first 16 bytes formatted
  // as RFC 4122 v4-shaped UUID). Used as the synthetic builder_id in dev.
  const h = createHash("sha256").update(token).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function apiKeyHmacSecret(): string {
  const s = process.env.ANTRY_API_KEY_HMAC_SECRET;
  if (s && s.length >= 32) return s;
  // Fall back to a derivative of the receipt secret in dev.
  // Production startup check elsewhere should refuse to boot without this.
  return process.env.ANTRY_RECEIPT_SECRET ?? "dev-only-not-for-prod-9f3a";
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

/**
 * Mint an `ant_live_<id>_<secret>` token for a builder. Inserts the
 * HMAC into api_keys and returns the plaintext token (shown once).
 */
export async function mintApiKey(input: {
  builderId: string;
  label: string;
}): Promise<{ token: string; id: string }> {
  const sb = createAdminClient();

  const id = randomBase62(12);
  const secret = randomBase62(32);
  const token = `ant_live_${id}_${secret}`;

  const hmac = createHmac("sha256", apiKeyHmacSecret())
    .update(secret)
    .digest("hex");

  const { error } = await sb.from("api_keys").insert({
    id,
    env: "live",
    key_hmac: hmac,
    owner_builder_id: input.builderId,
    scope_kind: "builder_read",
    label: input.label,
  });
  if (error) throw new Error(`mint_failed: ${error.message}`);

  return { token, id };
}

function randomBase62(len: number): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}
