/**
 * Talent Scout Agent.
 *
 * POST /api/scout { query: "JD or natural-language description" }
 *   → returns ranked Receipts with rationale per match
 *
 * For v0 with O(50) Receipts, we pass them all in the prompt context.
 * RAG comes later when the dataset is larger.
 *
 * Uses Claude Opus 4.7 with adaptive thinking. Without ANTHROPIC_API_KEY
 * falls back to score-based ranking (no rationale).
 */

import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { demoReceipts } from "@/lib/receipts/demo-data";
import { getPosts } from "@/lib/posts/store";

export const runtime = "nodejs";

type ScoutMatch = {
  receipt_id: string;
  builder_username: string;
  builder_name: string;
  composite_score: number;
  brief_title: string;
  rationale: string;
};

export async function POST(req: NextRequest) {
  let body: { query?: string };
  try {
    body = (await req.json()) as { query?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const query = (body.query ?? "").trim();
  if (query.length < 10 || query.length > 800) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  // Build the candidate pool: public Receipts from demo-data (real DB
  // version reads from the receipts table when available).
  const pool = demoReceipts
    .filter((r) => r.display_visibility === "public")
    .map((r) => ({
      receipt_id: r.id,
      builder_username: r.builder.username,
      builder_name: r.builder.name,
      brief_title: r.brief_title,
      composite_score: r.composite_score,
      fingerprint: r.fingerprint,
      highlights: r.highlights,
      company: r.company.name,
    }));

  if (!process.env.ANTHROPIC_API_KEY) {
    // Heuristic: rank by composite + return top 5 with template rationale.
    return NextResponse.json({
      matches: pool
        .sort((a, b) => b.composite_score - a.composite_score)
        .slice(0, 5)
        .map((p) => ({
          receipt_id: p.receipt_id,
          builder_username: p.builder_username,
          builder_name: p.builder_name,
          composite_score: p.composite_score,
          brief_title: p.brief_title,
          rationale: `${p.composite_score}/100 on ${p.brief_title}. ${p.highlights[0] ?? ""}`,
        })),
      grader: "heuristic",
    });
  }

  try {
    const matches = await claudeRank(query, pool);
    return NextResponse.json({ matches, grader: "claude-opus-4-7" });
  } catch (e) {
    console.error("[scout] Claude failed:", e);
    return NextResponse.json({
      matches: pool
        .sort((a, b) => b.composite_score - a.composite_score)
        .slice(0, 5)
        .map((p) => ({
          receipt_id: p.receipt_id,
          builder_username: p.builder_username,
          builder_name: p.builder_name,
          composite_score: p.composite_score,
          brief_title: p.brief_title,
          rationale: `Fallback rank — Claude unavailable. ${p.highlights[0] ?? ""}`,
        })),
      grader: "heuristic",
    });
  }
}

async function claudeRank(
  query: string,
  pool: Array<{
    receipt_id: string;
    builder_username: string;
    builder_name: string;
    brief_title: string;
    composite_score: number;
    fingerprint: Record<string, number>;
    highlights: string[];
  }>
): Promise<ScoutMatch[]> {
  const client = new Anthropic();

  // Stable prefix — cacheable across queries on the same Receipt pool.
  const poolBlock = pool
    .map(
      (p) =>
        `- ${p.receipt_id} · @${p.builder_username} (${p.builder_name})
  Brief: ${p.brief_title}
  Composite: ${p.composite_score}
  Fingerprint: ${Object.entries(p.fingerprint)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ")}
  Highlight: ${p.highlights[0] ?? ""}`
    )
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 3000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            matches: {
              type: "array",
              maxItems: 5,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  receipt_id: { type: "string" },
                  builder_username: { type: "string" },
                  builder_name: { type: "string" },
                  composite_score: { type: "integer" },
                  brief_title: { type: "string" },
                  rationale: { type: "string", maxLength: 280 },
                },
                required: [
                  "receipt_id",
                  "builder_username",
                  "builder_name",
                  "composite_score",
                  "brief_title",
                  "rationale",
                ],
              },
            },
          },
          required: ["matches"],
        },
      },
    },
    system: [
      {
        type: "text",
        text: `You are Antry's Talent Scout. A hiring company describes what they need; you rank up to 5 Receipt-holders from the pool below who best match.

Rules:
  - Rank by fit to the query, not just composite. A 70 with the right Fingerprint dimension beats an 85 with the wrong one.
  - Write each rationale in 1-2 sentences. Reference SPECIFIC numbers (composite, dimensions, Brief). Don't say "great fit" — say "92 on streaming-rag-pipeline, verification rigor 95 — exactly the rigor you want for prod ML."
  - Only include builders from the provided pool. Don't invent.
  - Use the exact receipt_id strings from the pool.`,
      },
      {
        type: "text",
        text: `RECEIPT POOL\n\n${poolBlock}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: `Query: ${query}\n\nRank now.` }],
  });

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!textBlock) throw new Error("no_text_in_response");
  const parsed = JSON.parse(textBlock.text) as { matches: ScoutMatch[] };
  return parsed.matches;
}
