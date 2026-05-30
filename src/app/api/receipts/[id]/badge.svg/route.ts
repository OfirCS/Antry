// Portable Receipt badge — the off-Antry credential.
//
// Rendered as an SVG so a builder can drop a single <img> tag into a
// GitHub README, a LinkedIn project block, or a personal site and have
// the credential travel with them. The Settings → Portability surface
// hands out the embed snippet; this route is what the snippet points at.
//
// We render plain string SVG (no library, no JSX) so the response is
// tiny, deterministic, and edge-cacheable. The badge is 300×56 — wide
// enough to read at a glance, short enough to inline next to other
// shields-style badges on a README.

import { getDemoReceipt } from "@/lib/receipts/demo-data";

export const runtime = "nodejs";

// Brand tokens — kept in sync with the rest of the marketing surface.
const LIME = "#C6F135";
const INK = "#0A0A0A";
const HAIRLINE = "#E5E5E5";
const MUTED = "#737373";

// Truncate a title to keep the badge readable at 300px wide.
function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, Math.max(1, max - 1)).trimEnd() + "…";
}

// SVG escaping — Receipts come from user-controlled (eventually) data,
// so we never inline raw strings into XML.
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function notFoundSvg(id: string): string {
  const safe = esc(truncate(id, 20));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="56" viewBox="0 0 300 56" role="img" aria-label="Antry Receipt not found">
  <title>Antry Receipt not found</title>
  <rect x="0.5" y="0.5" width="299" height="55" rx="9.5" ry="9.5" fill="#FFFFFF" stroke="${HAIRLINE}" />
  <rect x="0.5" y="0.5" width="3" height="55" rx="1.5" ry="1.5" fill="#DC2626" />
  <g font-family="-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif" fill="${INK}">
    <text x="16" y="22" font-size="9" font-weight="700" letter-spacing="1.4" fill="${MUTED}">ANTRY · RECEIPT</text>
    <text x="16" y="40" font-size="12" font-weight="700">Not found: ${safe}</text>
  </g>
</svg>`;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const r = getDemoReceipt(id);

  if (!r) {
    return new Response(notFoundSvg(id), {
      status: 404,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  const briefTitle = truncate(r.brief_title, 32);
  const score = r.composite_score;
  // Lime pill for top-quartile, ink-on-cream for everyone else — keeps
  // the badge readable on white, dark, and patterned backgrounds.
  const scoreBg = score >= 85 ? LIME : "#F5F0E8";
  const scoreColor = INK;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="56" viewBox="0 0 300 56" role="img" aria-label="Antry Receipt: ${esc(briefTitle)} — composite score ${score}">
  <title>Antry Receipt · ${esc(briefTitle)} · ${score}</title>
  <rect x="0.5" y="0.5" width="299" height="55" rx="9.5" ry="9.5" fill="#FFFFFF" stroke="${HAIRLINE}" />
  <rect x="0.5" y="0.5" width="3" height="55" rx="1.5" ry="1.5" fill="${LIME}" />
  <g font-family="-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif">
    <text x="16" y="22" font-size="9" font-weight="700" letter-spacing="1.4" fill="${MUTED}">ANTRY · RECEIPT</text>
    <text x="16" y="40" font-size="12" font-weight="700" fill="${INK}">${esc(briefTitle)}</text>
  </g>
  <g>
    <rect x="232" y="14" width="54" height="28" rx="6" ry="6" fill="${scoreBg}" />
    <text x="259" y="29" font-family="-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif" font-size="7" font-weight="700" letter-spacing="1.2" fill="${scoreColor}" text-anchor="middle" opacity="0.7">SCORE</text>
    <text x="259" y="39" font-family="-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif" font-size="13" font-weight="800" fill="${scoreColor}" text-anchor="middle">${score}</text>
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
