import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

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
  feature: { bg: "rgba(198,241,53,0.18)", color: "#0A0A0A", label: "Feature" },
  fix: { bg: "rgba(245,158,11,0.18)", color: "#7c2d12", label: "Fix" },
  infra: { bg: "rgba(99,102,241,0.18)", color: "#312e81", label: "Infra" },
};

export default function ChangelogPage() {
  return (
    <>
      <Nav />
      <main className="bg-white">
        <section className="bg-white">
          <div className="mx-auto max-w-[760px] px-6 py-20 sm:px-10 sm:py-28">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400">Changelog</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-bold tracking-[-0.03em] text-black">
              What shipped, when.
            </h1>
            <p className="mt-3 text-[15px] text-gray-500 max-w-[560px]">
              We ship every week. The list grows from here. Subscribe to the{" "}
              <Link href="/blog" className="underline">build log</Link> for the &quot;why&quot; behind each release.
            </p>

            <ol className="mt-14 space-y-12 relative border-l border-gray-100 pl-8">
              {RELEASES.map((r) => {
                const tag = tagStyles[r.category];
                return (
                  <li key={r.version} className="relative">
                    <span
                      className="absolute -left-[37px] top-1 inline-flex items-center justify-center w-4 h-4 rounded-full"
                      style={{ background: "#C6F135", border: "3px solid #fff", boxShadow: "0 0 0 1px #EBEBEB" }}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="text-[11px] font-bold uppercase tracking-[0.16em] px-2 py-1 rounded"
                        style={{ background: tag.bg, color: tag.color }}
                      >
                        {tag.label}
                      </span>
                      <span className="text-[13px] text-gray-500 font-mono">v{r.version}</span>
                      <span className="text-[13px] text-gray-400">·</span>
                      <span className="text-[13px] text-gray-500">{r.date}</span>
                    </div>
                    <h3 className="mt-2 text-[18px] font-bold tracking-tight text-black">{r.title}</h3>
                    <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-gray-700">
                      {r.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2">
                          <span className="mt-2 inline-block w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </main>
    </>
  );
}
