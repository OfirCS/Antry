import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { staticPosts } from "@/app/(platform)/blog/posts";
import { getProjects, getBuilders, getHackathons, getBlogPosts } from "@/lib/supabase/queries";

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/discover", changeFrequency: "daily", priority: 0.9 },
  { path: "/builders", changeFrequency: "daily", priority: 0.9 },
  { path: "/hackathons", changeFrequency: "weekly", priority: 0.8 },
  { path: "/companies", changeFrequency: "monthly", priority: 0.6 },
  { path: "/showcase", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/press", changeFrequency: "monthly", priority: 0.4 },
  { path: "/changelog", changeFrequency: "weekly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/login", changeFrequency: "yearly", priority: 0.3 },
  { path: "/signup", changeFrequency: "yearly", priority: 0.3 },
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

  // Static blog posts (always present even if Supabase is empty)
  for (const post of staticPosts) {
    entries.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // Dynamic content from Supabase — fail soft so a DB outage never breaks the sitemap
  try {
    const [projects, builders, hackathons, blogPosts] = await Promise.all([
      getProjects().catch(() => []),
      getBuilders().catch(() => []),
      getHackathons().catch(() => []),
      getBlogPosts().catch(() => []),
    ]);

    for (const project of projects) {
      entries.push({
        url: `${base}/projects/${project.id}`,
        lastModified: project.updated_at ? new Date(project.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const builder of builders) {
      entries.push({
        url: `${base}/builders/${builder.username}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const hackathon of hackathons) {
      entries.push({
        url: `${base}/hackathons/${hackathon.id}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    const seenSlugs = new Set(staticPosts.map((p) => p.slug));
    for (const post of blogPosts) {
      if (seenSlugs.has(post.slug)) continue;
      entries.push({
        url: `${base}/blog/${post.slug}`,
        lastModified: post.published_at ? new Date(post.published_at) : now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // Swallow — static routes still ship.
  }

  return entries;
}
