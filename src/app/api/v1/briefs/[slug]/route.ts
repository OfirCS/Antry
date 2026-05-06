// Public Brief detail API.
// GET /api/v1/briefs/streaming-rag-pipeline

import { NextResponse } from "next/server";
import { getDemoBrief } from "@/lib/receipts/demo-data";
import { publicCors } from "@/lib/api-keys";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: publicCors() });
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const b = getDemoBrief(slug);
  if (!b) {
    return NextResponse.json(
      { error: "brief_not_found" },
      { status: 404, headers: publicCors() }
    );
  }
  return NextResponse.json(
    {
      id: b.id,
      slug: b.slug,
      title: b.title,
      tagline: b.tagline,
      prompt_md: b.prompt_md,
      rubric: b.rubric_json,
      allowed_tools: b.allowed_tools,
      difficulty: b.difficulty,
      category: b.category,
      token_cap: b.token_cap,
      time_cap_seconds: b.time_cap_seconds,
      sponsor_label: b.sponsor_label,
      ideal_fingerprint: b.ideal_fingerprint,
      company: { slug: b.company.slug, name: b.company.name },
      attempts_count: b.attempts_count,
      receipts_count: b.receipts_count,
      median_score: b.median_score,
      created_at: b.created_at,
      url: `https://antry.com/briefs/${b.slug}`,
    },
    {
      headers: {
        ...publicCors(),
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
