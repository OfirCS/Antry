// Public Briefs API.
// GET /api/v1/briefs?company=anthropic&difficulty=senior
//
// Read-only. Public. No API key required (Briefs are public marketing
// content). Filters: company slug, difficulty.

import { NextResponse } from "next/server";
import { demoBriefs } from "@/lib/receipts/demo-data";
import { publicCors } from "@/lib/api-keys";
import { paginationSchema, zodErrorResponse } from "@/lib/api-errors";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: publicCors() });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const company = url.searchParams.get("company");
  const difficulty = url.searchParams.get("difficulty");

  // Pagination — limit clamped 1-100 (default 50), offset >= 0 (default 0).
  const page = paginationSchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
    offset: url.searchParams.get("offset") ?? undefined,
  });
  if (!page.success) {
    return zodErrorResponse(page.error, publicCors());
  }
  const { limit, offset } = page.data;

  let briefs = demoBriefs.filter((b) => b.mode === "public" && b.status === "live");
  if (company) briefs = briefs.filter((b) => b.company.slug === company);
  if (difficulty) briefs = briefs.filter((b) => b.difficulty === difficulty);

  const total = briefs.length;
  const data = briefs.slice(offset, offset + limit).map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    tagline: b.tagline,
    difficulty: b.difficulty,
    category: b.category,
    token_cap: b.token_cap,
    time_cap_seconds: b.time_cap_seconds,
    sponsor_label: b.sponsor_label,
    company: {
      slug: b.company.slug,
      name: b.company.name,
    },
    attempts_count: b.attempts_count,
    receipts_count: b.receipts_count,
    median_score: b.median_score,
    allowed_tools: b.allowed_tools,
    created_at: b.created_at,
    url: `https://antry.com/briefs/${b.slug}`,
  }));

  return NextResponse.json(
    {
      object: "list",
      data,
      total,
      limit,
      offset,
      has_more: offset + data.length < total,
    },
    {
      headers: {
        ...publicCors(),
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
