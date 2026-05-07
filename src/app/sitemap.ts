import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { demoBriefs, demoReceipts } from "@/lib/receipts/demo-data";

/**
 * Sitemap — focused on the canonical surfaces only.
 *
 * After the focus pass, /projects, /discover, /companies, /blog,
 * /showcase, /missions, /c, /press, /changelog, /faq, the old
 * /hackathons list, and /briefs/[slug]/lab were all removed.
 * The sitemap reflects that.
 */

const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/briefs", changeFrequency: "daily", priority: 0.95 },
  { path: "/builders", changeFrequency: "daily", priority: 0.85 },
  { path: "/agents", changeFrequency: "weekly", priority: 0.9 },
  { path: "/hackathons/new", changeFrequency: "weekly", priority: 0.85 },
  { path: "/receipts/methodology", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.6 },
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

  for (const r of demoReceipts) {
    if (r.display_visibility !== "public") continue;
    entries.push({
      url: `${base}/receipts/${r.id}`,
      lastModified: new Date(r.signed_at),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
