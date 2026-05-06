// /blog/rss.xml — RSS 2.0 feed for the Antry build log.
//
// Sourced from staticPosts. When Supabase has real posts they merge in.
// Cached aggressively at the edge; revalidates on each build.

import { siteUrl } from "@/lib/seo";
import { staticPosts } from "@/app/(platform)/blog/posts";

export const runtime = "nodejs";
export const revalidate = 3600;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = siteUrl().replace(/\/$/, "");
  const buildDate = new Date().toUTCString();

  const items = staticPosts
    .slice()
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .map((p) => {
      const link = `${base}/blog/${p.slug}`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
      <category>${escapeXml(p.category)}</category>
      <author>noreply@antry.com (${escapeXml(p.author)})</author>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Antry · Build log</title>
    <link>${base}/blog</link>
    <description>Notes from building Antry in public. Why we measure how engineers think.</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${base}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
