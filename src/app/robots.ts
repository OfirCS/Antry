import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// Generated at build time — required for `output: export`.
export const dynamic = "force-static";

// Robots policy. Block admin / dashboard / settings / auth + the per-user
// onboarding and compose flows + the *internal* API routes that serve user
// data. Keep `/api/og` allowed so Twitter/LinkedIn crawlers can fetch
// dynamic OG images, and keep `/api/v1/receipts/*/verify` allowed because
// it's a public verifier (CORS-enabled).
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og", "/api/v1/"],
        disallow: [
          "/admin",
          "/dashboard",
          "/settings",
          "/onboarding",
          "/compose",
          "/briefs/new",
          "/scout/compare",
          "/claim/",
          "/auth",
          "/api/agent",
          "/api/discovery",
          "/api/gateway",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
