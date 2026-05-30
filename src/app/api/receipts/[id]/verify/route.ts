// Public Receipt verifier — portable surface.
//
// Sibling to the API-versioned /api/v1/receipts/[id]/verify route, but
// shaped for the "embed and verify off Antry" flow referenced from the
// Settings → Portability page. Recruiters and third-party tooling hit
// this URL by clicking the "Verify" affordance on a Receipt; the JSON
// shape is intentionally small and human-readable.
//
// In production this endpoint would re-canonicalize the Receipt row and
// compare against the stored signature minted at the Gateway. For the
// demo fixture we trust the stored signature minted at module load (see
// getStoredReceiptSignature) and surface it as `verified: true`. The
// verification surface stays stable so UI can wire to it today.

import { NextResponse } from "next/server";
import {
  getDemoReceipt,
  getStoredReceiptSignature,
} from "@/lib/receipts/demo-data";

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
  const r = getDemoReceipt(id);
  if (!r) {
    return NextResponse.json(
      {
        verified: false,
        receipt_id: id,
        reason: "receipt_not_found",
      },
      { status: 404, headers: cors() }
    );
  }

  // Stored signature: r.signature on real prod rows, else the signature
  // minted at module load for demo rows. Never recompute live and self-
  // verify — that defeats the purpose of the signature.
  const signature = r.signature ?? getStoredReceiptSignature(r.id) ?? null;

  return NextResponse.json(
    {
      verified: true,
      receipt_id: r.id,
      content_hash: r.content_hash,
      signature,
      signed_at: r.signed_at,
      issuer: "Antry MCP Gateway",
      verified_at: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        ...cors(),
        "Cache-Control": "public, max-age=60",
      },
    }
  );
}
