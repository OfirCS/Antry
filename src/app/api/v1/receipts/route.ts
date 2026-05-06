// Receipts list API. API-key-gated.
// GET /api/v1/receipts?company=anthropic&min_score=80&limit=20
//
// Companies use this to programmatically pull surfaced Receipts for their
// own Briefs. The full prompt text is never exposed via this API — only the
// Fingerprint, composite, builder handle, and compute footprint summary.
// To open the full trace, hit the per-Receipt URL while signed in.

import { NextResponse } from "next/server";
import { demoBriefs, demoReceipts } from "@/lib/receipts/demo-data";
import { publicCors, resolveApiKey } from "@/lib/api-keys";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: publicCors() });
}

export async function GET(req: Request) {
  const auth = await resolveApiKey(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "unauthorized", reason: auth.reason },
      { status: 401, headers: publicCors() }
    );
  }
  const scope = auth.resolved.scope;
  if (scope.kind !== "company_read" && scope.kind !== "company_write") {
    return NextResponse.json(
      { error: "forbidden", reason: "company_scope_required" },
      { status: 403, headers: publicCors() }
    );
  }

  const url = new URL(req.url);
  const companySlug = url.searchParams.get("company") || scope.companyId;
  const minScore = Number(url.searchParams.get("min_score") ?? 0);
  const limit = Math.min(200, Number(url.searchParams.get("limit") ?? 50));

  const briefIds = new Set(
    demoBriefs.filter((b) => b.company.slug === companySlug).map((b) => b.id)
  );

  const receipts = demoReceipts
    .filter((r) => briefIds.has(r.brief_id))
    .filter((r) => r.composite_score >= minScore)
    .filter((r) => r.display_visibility === "public")
    .sort((a, b) => b.composite_score - a.composite_score)
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      composite_score: r.composite_score,
      fingerprint: r.fingerprint,
      builder: {
        username: r.builder.username,
        name: r.builder.name,
      },
      brief: {
        id: r.brief_id,
        slug: r.brief_slug,
        title: r.brief_title,
      },
      compute_footprint: r.compute_footprint
        ? {
            total_tokens: r.compute_footprint.total_tokens,
            lines_of_code: r.compute_footprint.lines_of_code,
            energy_kwh: r.compute_footprint.energy_kwh,
            co2_grams: r.compute_footprint.co2_grams,
            wall_clock_seconds: r.compute_footprint.wall_clock_seconds,
            cost_usd_cents: r.compute_footprint.cost_usd_cents,
          }
        : null,
      tokens_spent: r.tokens_spent,
      cost_usd_cents: r.cost_usd_cents,
      attempt_duration_seconds: r.attempt_duration_seconds,
      signed_at: r.signed_at,
      url: `https://antry.com/receipts/${r.id}`,
      verify_url: `https://antry.com/api/v1/receipts/${r.id}/verify`,
    }));

  return NextResponse.json(
    {
      object: "list",
      data: receipts,
      total: receipts.length,
    },
    { headers: { ...publicCors(), "Cache-Control": "private, max-age=30" } }
  );
}
