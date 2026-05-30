// Portable Builder badge — the off-Antry credential for a person, not a Receipt.
//
// Same convention as /api/receipts/[id]/badge.svg, but scoped to a
// builder. The score shown is the median composite across the
// builder's public Receipts — recruiters want a stable read of how
// this person works, not their single best moment.
//
// Plain-string SVG so this is cacheable, library-free, and safe to
// embed in third-party surfaces.

import { getDemoReceiptsForBuilder } from "@/lib/receipts/demo-data";

export const runtime = "nodejs";

const LIME = "#C6F135";
const INK = "#0A0A0A";
const HAIRLINE = "#E5E5E5";
const MUTED = "#737373";

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, Math.max(1, max - 1)).trimEnd() + "…";
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Median composite across a builder's Receipts. Median (not mean) is
// the right summary because one blowout Receipt shouldn't drag a
// recruiter's expectation up or down.
function medianScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

function notFoundSvg(username: string): string {
  const safe = esc(truncate(`@${username}`, 22));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="56" viewBox="0 0 300 56" role="img" aria-label="Antry builder not found">
  <title>Antry builder not found</title>
  <rect x="0.5" y="0.5" width="299" height="55" rx="9.5" ry="9.5" fill="#FFFFFF" stroke="${HAIRLINE}" />
  <rect x="0.5" y="0.5" width="3" height="55" rx="1.5" ry="1.5" fill="#DC2626" />
  <g font-family="-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif" fill="${INK}">
    <text x="16" y="22" font-size="9" font-weight="700" letter-spacing="1.4" fill="${MUTED}">ANTRY · BUILDER</text>
    <text x="16" y="40" font-size="12" font-weight="700">Not found: ${safe}</text>
  </g>
</svg>`;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ username: string }> }
) {
  const raw = (await ctx.params).username;
  // Normalize a leading @ if someone embeds /u/@username/badge.svg.
  const username = decodeURIComponent(raw).replace(/^@/, "");
  const receipts = getDemoReceiptsForBuilder(username);

  if (receipts.length === 0) {
    return new Response(notFoundSvg(username), {
      status: 404,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  const median = medianScore(receipts.map((r) => r.composite_score));
  const handle = truncate(`@${username}`, 22);
  const receiptCount = receipts.length;
  const receiptsLabel = `${receiptCount} ${receiptCount === 1 ? "Receipt" : "Receipts"}`;

  // Lime pill for top-quartile, ink-on-cream for everyone else.
  const scoreBg = median >= 85 ? LIME : "#F5F0E8";
  const scoreColor = INK;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="56" viewBox="0 0 300 56" role="img" aria-label="Antry builder ${esc(handle)} — median composite ${median} across ${receiptsLabel}">
  <title>Antry · ${esc(handle)} · ${receiptsLabel} · median ${median}</title>
  <rect x="0.5" y="0.5" width="299" height="55" rx="9.5" ry="9.5" fill="#FFFFFF" stroke="${HAIRLINE}" />
  <rect x="0.5" y="0.5" width="3" height="55" rx="1.5" ry="1.5" fill="${LIME}" />
  <g font-family="-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif">
    <text x="16" y="22" font-size="9" font-weight="700" letter-spacing="1.4" fill="${MUTED}">ANTRY · ${esc(handle.toUpperCase())}</text>
    <text x="16" y="40" font-size="12" font-weight="700" fill="${INK}">${esc(receiptsLabel)} on Antry</text>
  </g>
  <g>
    <rect x="232" y="14" width="54" height="28" rx="6" ry="6" fill="${scoreBg}" />
    <text x="259" y="29" font-family="-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif" font-size="7" font-weight="700" letter-spacing="1.2" fill="${scoreColor}" text-anchor="middle" opacity="0.7">MEDIAN</text>
    <text x="259" y="39" font-family="-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif" font-size="13" font-weight="800" fill="${scoreColor}" text-anchor="middle">${median}</text>
  </g>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
