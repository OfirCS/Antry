import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { demoBriefs, demoReceipts } from "@/lib/receipts/demo-data";

// Generated at build time — required for `output: export`.
export const dynamic = "force-static";

/**
 * Sitemap — focused on the canonical surfaces only.
 *
 * Static routes only include paths whose page files actually exist.
 * Dynamic routes cover every demo Brief, every public demo Receipt,
 * and the unique set of demo Builders that have at least one Receipt
 * — those are the shareable permalinks crawlers should learn about.
 */

const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/briefs", changeFrequency: "daily", priority: 0.95 },
  { path: "/builders", changeFrequency: "daily", priority: 0.85 },
  { path: "/agents", changeFrequency: "weekly", priority: 0.9 },
  { path: "/scout", changeFrequency: "weekly", priority: 0.7 },
  { path: "/for-companies", changeFrequency: "monthly", priority: 0.9 },
  { path: "/hackathons/new", changeFrequency: "weekly", priority: 0.85 },
  { path: "/receipts/methodology", changeFrequency: "monthly", priority: 0.8 },
  { path: "/claim-card", changeFrequency: "monthly", priority: 0.7 },
  { path: "/login", changeFrequency: "yearly", priority: 0.3 },
  { path: "/signup", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  for (const brief of demoBriefs) {
    entries.push({
      url: `${base}/briefs/${brief.slug}`,
      lastModified: new Date(brief.created_at),
      changeFrequency: "weekly",
      priority: 0.85,
    });
    entries.push({
      url: `${base}/briefs/${brief.slug}/leaderboard`,
      lastModified: new Date(brief.created_at),
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  // Public Receipts — most-shared permalink type on the platform.
  for (const r of demoReceipts) {
    if (r.display_visibility !== "public") continue;
    entries.push({
      url: `${base}/receipts/${r.id}`,
      lastModified: new Date(r.signed_at),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  // Builder profiles — one entry per unique username with at least
  // one Receipt. lastModified tracks the builder's most recent Receipt
  // so search engines re-crawl active profiles more often.
  const builderLastMod = new Map<string, number>();
  for (const r of demoReceipts) {
    const ts = new Date(r.signed_at).getTime();
    const prev = builderLastMod.get(r.builder.username) ?? 0;
    if (ts > prev) builderLastMod.set(r.builder.username, ts);
  }
  for (const [username, ts] of builderLastMod) {
    entries.push({
      url: `${base}/u/${username}`,
      lastModified: new Date(ts),
      changeFrequency: "weekly",
      priority: 0.75,
    });
    // /builders/[username] is the parallel profile route — both are
    // canonical surfaces today, so emit a sitemap entry for each.
    entries.push({
      url: `${base}/builders/${username}`,
      lastModified: new Date(ts),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return entries;
}
