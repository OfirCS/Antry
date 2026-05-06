import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, Mail, Quote } from "lucide-react";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

const TITLE = "Press kit — Antry";
const DESCRIPTION = "Logos, descriptions, and pull quotes for press, podcasts, and partner posts.";

export const metadata: Metadata = {
  title: "Press kit",
  description: DESCRIPTION,
  alternates: { canonical: "/press" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/press",
    image: ogImageUrl({ title: "Press kit", subtitle: "Logos, copy, and quotes for partners and press.", eyebrow: "Press" }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

const ONELINER = "Antry is a proof-of-work network for AI builders.";
const SHORT_PITCH =
  "Antry replaces resumes with shipped projects. Builders showcase live demos, recruiters search the network in plain English through an AI agent called Scout, and the community runs monthly 48-hour build events called Antathons.";
const LONG_PITCH = `Antry is the proof-of-work network for AI builders.

The premise is simple: in a world where anyone can ship working AI software in a weekend, evaluating people by what they say they can do is broken. Antry inverts that — your profile is the projects you've actually shipped. Live demos, real tech stacks, and timestamped commits that don't lie.

Three layers stack on top of each other: Showcase (builder profiles backed by real projects), Community (Antathons — focused 48-hour build events), and Launch Studio (a venture studio for the strongest builders, opening later in 2026).

Recruiters and teams find builders through Scout, an AI agent that searches the network in plain English: "Find me someone who shipped a working RAG pipeline with streaming." Scout returns ranked matches with proof.

Antry is built and run by a solo founder, Ofir, in public. The full stack is Next.js 16, Supabase, Tailwind, and a custom Scout NLU engine. Codebase is small, opinionated, and open about the journey.`;

const PULL_QUOTES = [
  {
    quote: "Demo-first portfolios. The whole stack is the antidote to resume theater.",
    author: "Early access builder",
    role: "AI Engineer",
  },
  {
    quote: "It finally feels fair. Teams judge me on depth, polish, and momentum instead of buzzwords or company logos.",
    author: "Beta tester",
    role: "Design Engineer",
  },
  {
    quote: "I shipped 3 projects on Antry and got contacted by 2 startups within a week. This is how hiring should work.",
    author: "Mara Chen",
    role: "AI Engineer",
  },
];

const FACTS = [
  ["Founded", "2026"],
  ["HQ", "Vaughan, Ontario, Canada"],
  ["Stage", "Pre-launch"],
  ["Stack", "Next.js 16 · Supabase · Tailwind"],
  ["Distribution", "Build-in-public, Antathons, organic"],
  ["Press contact", "[email protected]"],
];

export default function PressPage() {
  return (
    <>
      <Nav />
      <main>
        <PressHero />

        <section className="bg-white">
          <div className="mx-auto max-w-[1080px] px-6 sm:px-10 -mt-20 sm:-mt-24 pb-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
              <Card eyebrow="One-liner" body={ONELINER} />
              <Card eyebrow="Short pitch · ~50 words" body={SHORT_PITCH} className="lg:col-span-2" />
              <Card eyebrow="Long pitch · ~180 words" body={LONG_PITCH} pre className="lg:col-span-3" />
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <PullQuotesCard />
              <FactsCard />
            </div>

            <BrandAssets />

            <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[20px] border border-gray-200 p-6 bg-[#FAFAF7]">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 text-gray-700 shrink-0" />
                <div>
                  <h3 className="text-[15px] font-bold tracking-[-0.01em] text-black">Press inquiries</h3>
                  <p className="text-[14px] text-gray-600 mt-1">
                    <a className="underline underline-offset-2 font-semibold text-black" href="mailto:[email protected]">[email protected]</a>{" "}
                    — interviews, original quotes, embargoed news, partnerships.
                  </p>
                </div>
              </div>
              <Link
                href="/blog/why-im-building-antry"
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-black hover:underline underline-offset-4"
              >
                Read founder essay <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function PressHero() {
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
        <p
          className="text-[11px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "#C6F135" }}
        >
          Press kit
        </p>
        <h1
          className="mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.035em]"
          style={{ color: "#FFFFFF" }}
        >
          Press, podcasts, & partners.
        </h1>
        <p className="mt-6 max-w-[640px] mx-auto text-[16px] sm:text-[17px] leading-[1.6]" style={{ color: "rgba(255,255,255,0.65)" }}>
          Everything you need to write about Antry. Take what helps; everything below is reusable.
        </p>
      </div>
    </section>
  );
}

function Card({
  eyebrow,
  body,
  pre = false,
  className = "",
}: {
  eyebrow: string;
  body: string;
  pre?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[20px] p-6 sm:p-7 bg-white transition-all duration-300 ${className}`}
      style={{
        border: "1px solid #EBEBEB",
        boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">{eyebrow}</p>
      {pre ? (
        <pre className="mt-3 whitespace-pre-wrap text-[14px] leading-[1.7] text-gray-700 font-sans">
          {body}
        </pre>
      ) : (
        <p className="mt-3 text-[14px] leading-[1.7] text-gray-700">{body}</p>
      )}
    </div>
  );
}

function PullQuotesCard() {
  return (
    <div
      className="rounded-[20px] p-6 sm:p-7 bg-white"
      style={{ border: "1px solid #EBEBEB", boxShadow: "0 1px 0 rgba(0,0,0,0.03)" }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(198,241,53,0.18)" }}
        >
          <Quote className="w-4 h-4" style={{ color: "#0A0A0A" }} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
          Pull quotes
        </p>
      </div>
      <ul className="mt-5 space-y-5 text-[14px] leading-[1.6] text-gray-700">
        {PULL_QUOTES.map((q) => (
          <li key={q.quote} className="border-l-2 pl-4" style={{ borderColor: "#C6F135" }}>
            <p>&ldquo;{q.quote}&rdquo;</p>
            <p className="mt-2 text-[12px] text-gray-500">
              — <span className="font-semibold text-black">{q.author}</span>, {q.role}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FactsCard() {
  return (
    <div
      className="rounded-[20px] p-6 sm:p-7 bg-white"
      style={{ border: "1px solid #EBEBEB", boxShadow: "0 1px 0 rgba(0,0,0,0.03)" }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Quick facts</p>
      <dl className="mt-4 space-y-3 text-[14px]">
        {FACTS.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline gap-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
          >
            <dt className="w-[110px] shrink-0 text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400">
              {label}
            </dt>
            <dd className="text-gray-800 font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function BrandAssets() {
  return (
    <div className="mt-5 rounded-[24px] p-6 sm:p-8 relative overflow-hidden" style={{ background: "#0A0A0A", color: "#fff" }}>
      <div
        className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(198,241,53,0.18) 0%, transparent 70%)" }}
      />
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C6F135" }}>
          Brand assets
        </p>
        <h3 className="mt-2 text-[20px] sm:text-[22px] font-bold tracking-[-0.015em]">
          Logos, colors, & screenshots
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
          Wordmark and icon below. Primary{" "}
          <code className="px-1.5 py-0.5 rounded bg-white/10" style={{ color: "#C6F135" }}>#C6F135</code>.{" "}
          Background{" "}
          <code className="px-1.5 py-0.5 rounded bg-white/10 text-white/80">#0A0A0A</code>. Typography:
          Sora display, DM Sans body.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <DownloadBtn href="/favicon.svg" label="Icon (SVG)" primary />
          <DownloadBtn href="/logo.png" label="Wordmark (PNG)" />
          <DownloadBtn href="/feature-graphic.png" label="Feature graphic" />
        </div>
      </div>
    </div>
  );
}

function DownloadBtn({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-2 rounded-[12px] px-4 h-[42px] text-[13px] font-semibold transition-all hover:-translate-y-0.5"
      style={
        primary
          ? { background: "#C6F135", color: "#0A0A0A", boxShadow: "0 6px 18px rgba(198,241,53,0.30)" }
          : {
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.10)",
            }
      }
    >
      <Download className="w-3.5 h-3.5" />
      {label}
    </a>
  );
}
