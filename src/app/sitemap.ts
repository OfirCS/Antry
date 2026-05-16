import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/llm.txt", changeFrequency: "monthly", priority: 0.5 },
  { path: "/llms.txt", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();

  return STATIC_ROUTES.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
