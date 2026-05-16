import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llm.txt", "/llms.txt", "/logo.svg", "/gtafixnclean/"],
        disallow: [
          "/admin",
          "/agent",
          "/agents",
          "/dashboard",
          "/briefs",
          "/builders",
          "/claim",
          "/claim-card",
          "/companies",
          "/discover",
          "/hackathons",
          "/pricing",
          "/projects",
          "/receipts",
          "/settings",
          "/showcase",
          "/submit",
          "/auth",
          "/login",
          "/signup",
          "/api/agent",
          "/api/discovery",
          "/api/gateway",
          "/api/hackathons",
          "/api/mcp",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
