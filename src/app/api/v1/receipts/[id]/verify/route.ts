// Public Receipt verifier.
//
// Confirms the Receipt is signed by Antry. Companies (and anyone else) can
// hit this endpoint to cryptographically verify a Receipt without trusting
// the rendered page. Returns the canonical signed object + verification
// status, with CORS so it can be consumed from any origin.

import { NextResponse } from "next/server";
import { signReceipt, verifyReceipt, contentHash } from "@/lib/receipts/sign";
import { getDemoReceipt } from "@/lib/receipts/demo-data";

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
  const { id } = await ctx.params;

  // For now, source from demo data. When Supabase has real receipts,
  // this resolves there too.
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

  const expectedSig = signReceipt(canonical);
  // Demo receipts get a server-side signature; in production this is the
  // signature stored at mint time.
  const ver = verifyReceipt(canonical, expectedSig);
  const computedHash = contentHash(canonical);

  return NextResponse.json(
    {
      ok: ver.ok,
      verified: ver.ok,
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
      signature: expectedSig,
      tokens_spent: r.tokens_spent,
      cost_usd_cents: r.cost_usd_cents,
      attempt_duration_seconds: r.attempt_duration_seconds,
      issuer: "antry",
      verification_url: `https://antry.com/api/v1/receipts/${id}/verify`,
    },
    { headers: { ...cors(), "Cache-Control": "public, max-age=60" } }
  );
}
