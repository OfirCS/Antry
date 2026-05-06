// Centralized HMAC secret resolution for Receipts.
//
// Fail-closed in production: throws at call time if RECEIPT_HMAC_SECRET is
// missing. Allows the documented dev fallback only when NODE_ENV !== "production"
// OR ANTRY_ALLOW_DEV_SECRET=1 is explicitly set (e.g. for previews).
//
// All HMAC sites (sign.ts, lab-session.ts, gateway route) MUST go through
// this function so a single missing env var fails everywhere consistently.

const DEV_FALLBACK = "antry-dev-receipt-secret-do-not-use-in-prod";

export function getReceiptSecret(): string {
  const fromEnv = process.env.RECEIPT_HMAC_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;

  const isProd = process.env.NODE_ENV === "production";
  const allowDev = process.env.ANTRY_ALLOW_DEV_SECRET === "1";

  if (fromEnv && fromEnv.length < 32 && (isProd && !allowDev)) {
    throw new Error(
      "RECEIPT_HMAC_SECRET is set but too short. Use at least 32 characters of entropy."
    );
  }

  if (isProd && !allowDev) {
    throw new Error(
      "RECEIPT_HMAC_SECRET is required in production. Set a 32+ char secret on the server. " +
        "If this is a preview build, set ANTRY_ALLOW_DEV_SECRET=1 explicitly."
    );
  }

  return fromEnv || DEV_FALLBACK;
}
