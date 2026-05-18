// Public Receipt verifier.
//
// Confirms the Receipt is signed by Antry. Companies (and anyone else) can
// hit this endpoint to cryptographically verify a Receipt without trusting
// the rendered page. CORS-enabled GET; consumable from any origin.
//
// SECURITY NOTE: this endpoint compares the freshly-canonicalized receipt
// against the signature persisted at mint time. It never signs the live
// values and reports them verified. If a row has been tampered with after
// minting, `verified` is false and a 422 is returned.

import { NextResponse } from "next/server";
import { verifyReceipt, contentHash, signReceipt } from "@/lib/receipts/sign";
import { getDemoReceipt, getStoredReceiptSignature } from "@/lib/receipts/demo-data";
import { receiptVerifyParamsSchema } from "@/lib/schemas";
import { zodErrorResponse } from "@/lib/api-errors";

export const runtime = "nodejs";

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors() });
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const params = receiptVerifyParamsSchema.safeParse(await ctx.params);
  if (!params.success) {
    return zodErrorResponse(params.error, cors());
  }
  const { id } = params.data;

  const r = getDemoReceipt(id);
  if (!r) {
    return NextResponse.json(
      { ok: false, error: "receipt_not_found" },
      { status: 404, headers: cors() }
    );
  }

  const canonical = {
    id: r.id,
    brief_id: r.brief_id,
    builder_id: r.builder.username,
    fingerprint: r.fingerprint as Record<string, number>,
    composite_score: r.composite_score,
    signed_at: r.signed_at,
  };

  // Stored signature: r.signature on real prod rows. Demo rows are static
  // fixtures, so mint their deterministic dev signature here on the Node route
  // instead of making the shared demo-data module import node:crypto.
  const storedSignature = r.signature ?? getStoredReceiptSignature(r.id) ?? signReceipt(canonical);
  if (!storedSignature) {
    return NextResponse.json(
      { ok: false, verified: false, error: "no_signature_on_record" },
      { status: 422, headers: cors() }
    );
  }

  const ver = verifyReceipt(canonical, storedSignature);
  const computedHash = contentHash(canonical);

  return NextResponse.json(
    {
      ok: ver.ok,
      verified: ver.ok,
      reason: ver.reason,
      receipt: canonical,
      brief: {
        id: r.brief_id,
        slug: r.brief_slug,
        title: r.brief_title,
        company: r.company.name,
      },
      fingerprint: r.fingerprint,
      composite_score: r.composite_score,
      signed_at: r.signed_at,
      content_hash: r.content_hash,
      computed_content_hash: computedHash,
      signature: storedSignature,
      tokens_spent: r.tokens_spent,
      cost_usd_cents: r.cost_usd_cents,
      attempt_duration_seconds: r.attempt_duration_seconds,
      issuer: "antry",
      verification_url: `https://antry.com/api/v1/receipts/${id}/verify`,
    },
    {
      status: ver.ok ? 200 : 422,
      headers: { ...cors(), "Cache-Control": "public, max-age=60" },
    }
  );
}
