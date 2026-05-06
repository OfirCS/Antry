// Candidates search API. Natural-language query over the Receipts corpus.
// POST /api/v1/candidates/search
//   body: { q: "find AI engineers strong on token economy and tool taste" }
//
// API-key-gated. Returns ranked candidates (each with one or more Receipts).
// Currently uses a deterministic rule-based scorer over fingerprint axes;
// a full Scout-NLU integration lands when we wire it through src/lib/agent.

import { NextResponse } from "next/server";
import { demoReceipts } from "@/lib/receipts/demo-data";
import {
  ALL_DIMENSIONS,
} from "@/lib/receipts/fingerprint";
import {
  DIMENSION_LABELS,
  type FingerprintDimension,
} from "@/lib/receipts/types";
import { publicCors, resolveApiKey } from "@/lib/api-keys";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: publicCors() });
}

const KEYWORD_MAP: Record<string, FingerprintDimension> = {
  token: "tokenEconomy",
  tokens: "tokenEconomy",
  efficient: "tokenEconomy",
  cost: "tokenEconomy",
  fast: "throughput",
  speed: "throughput",
  quick: "throughput",
  tool: "toolChoiceIQ",
  taste: "toolChoiceIQ",
  recovery: "recoveryIndex",
  recover: "recoveryIndex",
  pivot: "recoveryIndex",
  prompt: "promptDiscipline",
  discipline: "promptDiscipline",
  verify: "verificationRigor",
  verification: "verificationRigor",
  rigor: "verificationRigor",
  test: "verificationRigor",
  judgment: "spendVsJudgment",
  spend: "spendVsJudgment",
};

function inferDimensions(q: string): FingerprintDimension[] {
  const tokens = q.toLowerCase().split(/\s+/);
  const hits = new Set<FingerprintDimension>();
  for (const t of tokens) {
    const dim = KEYWORD_MAP[t];
    if (dim) hits.add(dim);
  }
  return hits.size > 0 ? [...hits] : ALL_DIMENSIONS;
}

export async function POST(req: Request) {
  const auth = await resolveApiKey(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "unauthorized", reason: auth.reason },
      { status: 401, headers: publicCors() }
    );
  }

  let body: { q?: string; limit?: number };
  try {
    body = (await req.json()) as { q?: string; limit?: number };
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400, headers: publicCors() }
    );
  }
  const q = (body.q ?? "").trim();
  if (!q) {
    return NextResponse.json(
      { error: "query_required" },
      { status: 400, headers: publicCors() }
    );
  }
  const limit = Math.min(50, Math.max(1, Number(body.limit ?? 10)));

  const dimensions = inferDimensions(q);

  // Score each public Receipt by averaging the matched dimensions.
  const candidates = demoReceipts
    .filter((r) => r.display_visibility === "public")
    .map((r) => {
      const matched = dimensions.map((d) => r.fingerprint[d]);
      const matchedAvg =
        matched.reduce((s, v) => s + v, 0) / Math.max(1, matched.length);
      return {
        receipt: r,
        match_score: Math.round(matchedAvg),
      };
    })
    .sort(
      (a, b) =>
        b.match_score - a.match_score ||
        b.receipt.composite_score - a.receipt.composite_score
    )
    .slice(0, limit);

  return NextResponse.json(
    {
      query: q,
      inferred_dimensions: dimensions.map((d) => DIMENSION_LABELS[d]),
      results: candidates.map(({ receipt: r, match_score }) => ({
        match_score,
        builder: { username: r.builder.username, name: r.builder.name },
        composite_score: r.composite_score,
        fingerprint: r.fingerprint,
        receipt_id: r.id,
        receipt_url: `https://antry.com/receipts/${r.id}`,
        brief_title: r.brief_title,
      })),
    },
    { headers: { ...publicCors(), "Cache-Control": "private, max-age=10" } }
  );
}
