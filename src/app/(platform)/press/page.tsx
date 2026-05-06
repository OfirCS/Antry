import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, Mail } from "lucide-react";
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
  '"Demo-first portfolios. The whole stack is the antidote to resume theater." — early access builder',
  '"It finally feels fair. Teams judge me on depth, polish, and momentum instead of buzzwords or company logos." — beta tester',
  '"I shipped 3 projects on Antry and got contacted by 2 startups within a week. This is how hiring should work." — Mara Chen, AI Engineer',
];

const FACTS = [
  ["Founded", "2026"],
  ["HQ", "Vaughan, Ontario, Canada"],
  ["Stage", "Pre-launch"],
  ["Stack", "Next.js 16 · Supabase · Tailwind · Custom Scout agent"],
  ["Distribution", "Build-in-public, Antathons, organic builder network"],
  ["Press contact", "[email protected]"],
];

export default function PressPage() {
  return (
    <>
      <Nav />
      <main className="bg-white">
        <section className="bg-white">
          <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10 sm:py-28">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400">Press kit</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-bold tracking-[-0.03em] text-black">
              Press, podcasts, & partners.
            </h1>
            <p className="mt-3 text-[15px] text-gray-600 max-w-[640px]">
              Everything you need to write about Antry. Take what helps; everything is reusable. Email{" "}
              <a className="underline" href="mailto:[email protected]">[email protected]</a> for interviews,
              embargoed news, or original quotes.
            </p>

            <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="rounded-[20px] border border-gray-200 p-6 bg-white">
                <h3 className="text-[15px] font-bold tracking-tight text-black">One-liner</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-gray-700">{ONELINER}</p>
              </div>
              <div className="rounded-[20px] border border-gray-200 p-6 bg-white lg:col-span-2">
                <h3 className="text-[15px] font-bold tracking-tight text-black">Short pitch (~50 words)</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-gray-700">{SHORT_PITCH}</p>
              </div>
              <div className="rounded-[20px] border border-gray-200 p-6 bg-white lg:col-span-3">
                <h3 className="text-[15px] font-bold tracking-tight text-black">Long pitch (~180 words)</h3>
                <pre className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-700 font-sans">{LONG_PITCH}</pre>
              </div>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-[20px] border border-gray-200 p-6 bg-white">
                <h3 className="text-[15px] font-bold tracking-tight text-black">Pull quotes</h3>
                <ul className="mt-4 space-y-4 text-[14px] leading-relaxed text-gray-700">
                  {PULL_QUOTES.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[20px] border border-gray-200 p-6 bg-white">
                <h3 className="text-[15px] font-bold tracking-tight text-black">Quick facts</h3>
                <dl className="mt-4 space-y-3 text-[14px]">
                  {FACTS.map(([label, value]) => (
                    <div key={label} className="flex items-baseline gap-3">
                      <dt className="w-[120px] shrink-0 text-gray-400">{label}</dt>
                      <dd className="text-gray-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="mt-14 rounded-[20px] p-6 sm:p-8" style={{ background: "#0A0A0A", color: "#fff" }}>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C6F135" }}>
                Brand assets
              </p>
              <h3 className="mt-2 text-[20px] font-bold tracking-tight">Logos, colors, & screenshots</h3>
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                Wordmark and icon are below. Primary color is{" "}
                <code className="px-1.5 py-0.5 rounded bg-white/10 text-[#C6F135]">#C6F135</code>. Background is{" "}
                <code className="px-1.5 py-0.5 rounded bg-white/10 text-white/80">#0A0A0A</code>. Typography: Sora (display) +
                DM Sans (body).
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/favicon.svg"
                  download
                  className="inline-flex items-center gap-2 rounded-xl px-4 h-[40px] text-[13px] font-semibold"
                  style={{ background: "#C6F135", color: "#111" }}
                >
                  <Download className="w-4 h-4" /> Icon (SVG)
                </a>
                <a
                  href="/logo.png"
                  download
                  className="inline-flex items-center gap-2 rounded-xl px-4 h-[40px] text-[13px] font-semibold"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}
                >
                  <Download className="w-4 h-4" /> Wordmark (PNG)
                </a>
                <a
                  href="/feature-graphic.png"
                  download
                  className="inline-flex items-center gap-2 rounded-xl px-4 h-[40px] text-[13px] font-semibold"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}
                >
                  <Download className="w-4 h-4" /> Feature graphic
                </a>
              </div>
            </div>

            <div className="mt-14 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[20px] border border-gray-200 p-6 bg-[#FAFAF7]">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 text-gray-700 shrink-0" />
                <div>
                  <h3 className="text-[15px] font-bold tracking-tight text-black">Press inquiries</h3>
                  <p className="text-[14px] text-gray-600 mt-1">
                    <a className="underline" href="mailto:[email protected]">[email protected]</a> — interviews, original
                    quotes, embargoed news, or partnership.
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
