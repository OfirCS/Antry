import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { ArrowRight } from "lucide-react";

const TITLE = "Changelog — what shipped on Antry";
const DESCRIPTION = "We ship every week. Here's what landed and when.";

export const metadata: Metadata = {
  title: "Changelog",
  description: DESCRIPTION,
  alternates: { canonical: "/changelog" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/changelog",
    image: ogImageUrl({ title: "Changelog", subtitle: "What shipped on Antry, every week.", eyebrow: "Changelog" }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

type Release = {
  version: string;
  date: string;
  title: string;
  highlights: string[];
  category: "feature" | "fix" | "infra";
};

const RELEASES: Release[] = [
  {
    version: "0.7.0",
    date: "May 6, 2026",
    title: "Antry Card hero feature + foundation hardening",
    category: "feature",
    highlights: [
      "Public Antry Card preview at /claim-card — paste a GitHub URL, get a scored builder profile in seconds.",
      "One-click claim imports the top 6 scored projects under your Antry profile.",
      "Open Graph + Twitter cards on every project, builder, hackathon, and blog page.",
      "Dynamic OG image generator at /api/og — every shared link unfurls with a branded preview.",
      "Sitemap.xml + robots.txt with Supabase-backed indexing.",
      "Resend-powered welcome email on waitlist signup (env-keyed).",
      "Privacy, Terms, /reset-password, /pricing, /faq, /press, /changelog now live.",
      "Security headers (CSP, HSTS, X-Frame-Options) via vercel.json.",
    ],
  },
  {
    version: "0.6.0",
    date: "Apr 22, 2026",
    title: "Scout NLU + builder discovery engine",
    category: "feature",
    highlights: [
      "Custom Scout natural-language search agent — ask 'find AI builders shipping fast' in plain English.",
      "Rate limiting + abuse detection on the public Scout endpoint.",
      "Discovery library (GitHub scanner, scorer, importer) wired end-to-end into admin tooling.",
      "Builder profile completeness tracker on /dashboard.",
    ],
  },
  {
    version: "0.5.0",
    date: "Apr 8, 2026",
    title: "Hackathons & project submission",
    category: "feature",
    highlights: [
      "Antathons module — themed 48-hour build events with prizes and submissions.",
      "Project submission flow with Zod schemas + draft persistence.",
      "Project likes / signal counts.",
    ],
  },
  {
    version: "0.4.0",
    date: "Mar 25, 2026",
    title: "Auth, dashboard, settings",
    category: "feature",
    highlights: [
      "Supabase auth (email + Google + GitHub OAuth).",
      "Personal /dashboard with profile completeness + activity feed.",
      "/settings page with profile editing.",
    ],
  },
  {
    version: "0.3.0",
    date: "Mar 11, 2026",
    title: "Discover feed + builder directory",
    category: "feature",
    highlights: [
      "Browse projects on /discover with category filters.",
      "Browse builders on /builders, sortable by activity and skills.",
      "Mock-data fallback so the product feels alive even before community seeding.",
    ],
  },
  {
    version: "0.2.0",
    date: "Feb 18, 2026",
    title: "Brand system + landing",
    category: "infra",
    highlights: [
      "Lime + cream brand system, Sora display, DM Sans body.",
      "Landing page with hero, scout demo, hackathon teaser, social proof bar.",
      "Waitlist form with celebration animation.",
    ],
  },
  {
    version: "0.1.0",
    date: "Feb 4, 2026",
    title: "First commit",
    category: "infra",
    highlights: [
      "Next.js 16 + React 19 + Tailwind v4 + Supabase scaffolding.",
      "Vitest test setup + project schemas.",
      "Repo public, building in public.",
    ],
  },
];

const tagStyles: Record<Release["category"], { bg: string; color: string; label: string }> = {
  feature: { bg: "rgba(198,241,53,0.20)", color: "#0A0A0A", label: "Feature" },
  fix: { bg: "rgba(245,158,11,0.18)", color: "#92400E", label: "Fix" },
  infra: { bg: "rgba(99,102,241,0.16)", color: "#3730A3", label: "Infra" },
};

export default function ChangelogPage() {
  return (
    <>
      <Nav />
      <main>
        <ChangelogHero />

        <section className="bg-white">
          <div className="mx-auto max-w-[760px] px-6 sm:px-10 -mt-20 sm:-mt-24 pb-24 relative z-10">
            <ol className="space-y-12 sm:space-y-16 relative">
              {/* Timeline rail */}
              <div
                className="absolute left-[7px] top-1.5 bottom-2 w-px"
                style={{
                  background:
                    "linear-gradient(180deg, #C6F135 0%, #EBEBEB 12%, #EBEBEB 100%)",
                }}
                aria-hidden="true"
              />

              {RELEASES.map((r, i) => {
                const tag = tagStyles[r.category];
                const isLatest = i === 0;
                return (
                  <li key={r.version} className="relative pl-9">
                    {/* Timeline dot */}
                    <span
                      className="absolute left-0 top-1 inline-flex items-center justify-center w-[15px] h-[15px] rounded-full"
                      style={{
                        background: isLatest ? "#C6F135" : "#FFFFFF",
                        border: isLatest ? "none" : "2px solid #D4D4D4",
                        boxShadow: isLatest
                          ? "0 0 0 4px #FFFFFF, 0 0 0 5px #C6F135"
                          : "0 0 0 3px #FFFFFF",
                      }}
                    >
                      {isLatest && (
                        <span
                          className="absolute inset-0 rounded-full animate-ping"
                          style={{ background: "#C6F135", opacity: 0.6 }}
                        />
                      )}
                    </span>

                    <div className="rounded-[20px] p-5 sm:p-6 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.10)]"
                         style={{ border: "1px solid #EBEBEB" }}>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-1 rounded-md"
                          style={{ background: tag.bg, color: tag.color }}
                        >
                          {tag.label}
                        </span>
                        <span
                          className="text-[12px] font-mono font-semibold tabular-nums px-2 py-0.5 rounded-md"
                          style={{ background: "#F5F5F5", color: "#525252" }}
                        >
                          v{r.version}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-[12px] text-gray-500 tabular-nums">{r.date}</span>
                        {isLatest && (
                          <span
                            className="ml-auto text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-1 rounded-md"
                            style={{ background: "#0A0A0A", color: "#C6F135" }}
                          >
                            Latest
                          </span>
                        )}
                      </div>
                      <h3 className="text-[18px] sm:text-[19px] font-bold tracking-[-0.015em] text-black leading-[1.3]">
                        {r.title}
                      </h3>
                      <ul className="mt-4 space-y-2 text-[14px] leading-[1.6] text-gray-700">
                        {r.highlights.map((h) => (
                          <li key={h} className="flex items-start gap-2.5">
                            <span
                              className="mt-[7px] inline-block w-1 h-1 rounded-full shrink-0"
                              style={{ background: "#C6F135" }}
                            />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Subscribe CTA */}
            <div className="mt-16 rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
                 style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}>
              <div>
                <h3 className="text-[16px] sm:text-[17px] font-bold tracking-[-0.01em] text-black">
                  Want the &quot;why&quot; behind each release?
                </h3>
                <p className="mt-1 text-[14px] text-gray-600">
                  Read the build log — short essays on what we shipped and why.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 rounded-[12px] px-4 h-[42px] text-[13px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
                style={{ background: "#0A0A0A", color: "#fff" }}
              >
                Read the blog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function ChangelogHero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(198,241,53,0.14) 0%, transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-[920px] px-6 pt-24 pb-32 sm:px-10 sm:pt-28 sm:pb-36 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "#C6F135" }}>
          Changelog
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.035em]"
            style={{ color: "#FFFFFF" }}>
          What shipped, when.
        </h1>
        <p className="mt-6 max-w-[520px] mx-auto text-[16px] leading-[1.6]" style={{ color: "rgba(255,255,255,0.65)" }}>
          We ship every week. The list grows from here.
        </p>
      </div>
    </section>
  );
}
