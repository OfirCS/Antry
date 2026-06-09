import type { NextConfig } from "next";

// When STATIC_EXPORT=1 we produce a fully static build of the public
// showcase surface (landing, Scout, Receipts, Leaderboard, Builders, …)
// for GitHub Pages. The Scout agent runs entirely client-side in this
// mode — no server, no API keys, no secrets. The normal (Vercel) build
// is untouched and keeps every server feature.
const isStaticExport = process.env.STATIC_EXPORT === "1";

// GitHub Pages serves project sites under /<repo>. Override with
// PAGES_BASE_PATH="" for a user/apex domain.
const basePath =
  process.env.PAGES_BASE_PATH ?? (isStaticExport ? "/Antry" : "");

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      trailingSlash: true,
      basePath,
      images: { unoptimized: true },
      // basePath isn't available to client bundles by default; expose it
      // so client code (e.g. the Scout demo) can build correct asset URLs.
      env: { NEXT_PUBLIC_BASE_PATH: basePath },
    }
  : {};

export default nextConfig;
