import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Github, Twitter, Linkedin, Sparkles, ShieldCheck, Wrench } from "lucide-react";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { FingerprintGlyph } from "@/components/BuilderFingerprint";
import {
  demoBriefs,
  demoReceipts,
  demoCompanies,
  getDemoReceipt,
} from "@/lib/receipts/demo-data";
import { ALL_DIMENSIONS } from "@/lib/receipts/fingerprint";
import { DIMENSION_SHORT } from "@/lib/receipts/types";
import { LandingHeroAside, ReceiptCompare, StaggerInView } from "./_landing/LandingClient";

const TITLE = "Antry — Show your receipts.";
const DESCRIPTION =
  "Antry is the proof-of-work network for AI builders. Companies post Briefs. Builders solve them in an instrumented Lab. Antry mints a signed Receipt that captures not just what shipped — but how you got there.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/",
    image: ogImageUrl({
      title: "Show your receipts.",
      subtitle: "GitHub showed what you ship. Antry shows how you think.",
      eyebrow: "Antry",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

export default function Home() {
  const heroReceipt = getDemoReceipt("rc_mara_anthropic_001") ?? demoReceipts[0];
  const compareHigh = demoReceipts.find((r) => r.composite_score >= 84) ?? demoReceipts[0];
  const compareLow =
    demoReceipts.find((r) => r.composite_score < 80 && r.composite_score >= 70) ??
    demoReceipts[demoReceipts.length - 1];
  const liveBriefs = demoBriefs.slice(0, 4);

  return (
    <>
      <Nav />
      <main>
        <Hero receipt={heroReceipt} />
        <SponsorWall />
        <Wedge />
        <ReceiptShowcase high={compareHigh} low={compareLow} />
        <BriefStrip briefs={liveBriefs} />
        <SignedSection />
        <CardCallout />
        <MethodologyHook />
        <FinalCTA />
        <SiteFooter />
      </main>
    </>
  );
}

/* ─────────────────────────────────────────────
   1. HERO — editorial, real Receipt embedded
   ───────────────────────────────────────────── */
function Hero({ receipt }: { receipt: typeof demoReceipts[number] }) {
  return (
    <section className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 0% 0%, rgba(198,241,53,0.10) 0%, transparent 55%), radial-gradient(ellipse 35% 30% at 100% 100%, rgba(198,241,53,0.06) 0%, transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-[1240px] px-6 sm:px-10 pt-20 pb-24 sm:pt-28 sm:pb-32 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-16 lg:gap-24 items-center">
        <div>
          <p
            className="text-[11px] font-bold tracking-[0.28em] uppercase mb-7 inline-flex items-center gap-2"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            <span
              className="inline-block w-1 h-1 rounded-full"
              style={{ background: "#C6F135" }}
            />
            Antry · Proof of work for AI builders
          </p>

          <h1
            className="font-display font-bold leading-[0.95] tracking-[-0.045em]"
            style={{ color: "#FFFFFF", fontSize: "clamp(3rem, 7.5vw, 5.4rem)" }}
          >
            Show your <span style={{ color: "#C6F135" }}>receipts.</span>
          </h1>

          <p
            className="mt-7 max-w-[560px] text-[18px] leading-[1.55]"
            style={{ color: "rgba(255,255,255,0.66)" }}
          >
            GitHub showed what you ship. Antry shows{" "}
            <span style={{ color: "rgba(255,255,255,0.95)" }}>how you got there</span>.
            Solve a Brief in our instrumented Lab — every prompt, tool call, and pivot is signed at the gateway. The result: an immutable Receipt pinned to your profile.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link
              href="/briefs"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] px-6 h-[54px] text-[15px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
              style={{
                background: "#C6F135",
                color: "#0A0A0A",
                boxShadow: "0 10px 26px rgba(198,241,53,0.32)",
              }}
            >
              Browse Briefs <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/receipts/methodology"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] px-6 h-[54px] text-[15px] font-semibold whitespace-nowrap transition-colors"
              style={{
                color: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              How it works
            </Link>
          </div>

          <p
            className="mt-10 text-[12px] tracking-[0.04em]"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            Briefs by Anthropic, Vercel, Resend, Supabase. Live methodology at{" "}
            <Link
              href="/receipts/methodology"
              className="underline underline-offset-4 hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              /receipts/methodology
            </Link>
            .
          </p>
        </div>

        <LandingHeroAside receipt={receipt} />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   2. SPONSOR WALL
   ───────────────────────────────────────────── */
function SponsorWall() {
  const sponsors = Object.values(demoCompanies);
  // Duplicate the list so the marquee can loop seamlessly.
  const loop = [...sponsors, ...sponsors];
  return (
    <section className="bg-white border-y border-gray-100 overflow-hidden">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-9 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400 shrink-0">
          Brief sponsors
        </p>
        <div
          className="relative overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
          }}
        >
          <div className="flex items-center gap-x-14 animate-trustbar-marquee w-max group-hover:[animation-play-state:paused]">
            {loop.map((c, i) => (
              <Link
                key={`${c.slug}-${i}`}
                href={`/c/${c.slug}`}
                className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-100 shrink-0"
                style={{ opacity: 0.55 }}
                aria-hidden={i >= sponsors.length || undefined}
                tabIndex={i >= sponsors.length ? -1 : 0}
              >
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md font-bold text-[12px] font-display"
                  style={{
                    background: c.sponsor_color,
                    color: ["#0A0A0A", "#000000", "#1E1E1E"].includes(c.sponsor_color)
                      ? "#C6F135"
                      : "#FFFFFF",
                  }}
                >
                  {c.name.charAt(0)}
                </span>
                <span className="text-[15px] font-semibold tracking-tight text-gray-700">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   3. WEDGE — the thesis in 3 columns
   ───────────────────────────────────────────── */
function Wedge() {
  const cards = [
    {
      eyebrow: "01 / Resume",
      title: "What you said",
      tone: "muted",
      caption: "Self-reported. Unverifiable.",
    },
    {
      eyebrow: "02 / GitHub",
      title: "What you shipped",
      tone: "muted",
      caption: "Output, not process.",
    },
    {
      eyebrow: "03 / Antry",
      title: "How you got there",
      tone: "lime",
      caption: "Signed at the gateway.",
    },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-24 sm:py-32">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-4">
          The thesis
        </p>
        <h2
          className="font-display font-bold tracking-[-0.035em] text-black max-w-[920px] leading-[1.05]"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)" }}
        >
          Resumes show what you said. <br className="hidden sm:block" />
          GitHub shows what you shipped.{" "}
          <span style={{ color: "rgba(0,0,0,0.32)" }}>Receipts show</span>{" "}
          <span
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(198,241,53,0) 60%, rgba(198,241,53,0.55) 60%, rgba(198,241,53,0.55) 95%, rgba(198,241,53,0) 95%)",
              padding: "0 0.05em",
            }}
          >
            how you got there
          </span>
          .
        </h2>

        <StaggerInView className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5" delayStep={0.08}>
          {cards.map((c) => (
            <article
              key={c.eyebrow}
              className="rounded-[20px] p-7 sm:p-8 h-full transition-all duration-300 hover:-translate-y-[2px]"
              style={{
                background: c.tone === "lime" ? "rgba(198,241,53,0.10)" : "#FAFAF7",
                border:
                  c.tone === "lime"
                    ? "1px solid rgba(198,241,53,0.45)"
                    : "1px solid #EBEBEB",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em] mb-5"
                style={{ color: c.tone === "lime" ? "#0A0A0A" : "rgba(0,0,0,0.4)" }}
              >
                {c.eyebrow}
              </p>
              <h3 className="text-[22px] font-bold tracking-[-0.015em] text-black leading-[1.2]">
                {c.title}
              </h3>
              <p
                className="mt-3 text-[13px] leading-[1.5]"
                style={{ color: c.tone === "lime" ? "#0A0A0A" : "rgba(0,0,0,0.55)" }}
              >
                {c.caption}
              </p>
            </article>
          ))}
        </StaggerInView>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. RECEIPT SHOWCASE — the Bottom Quartile move
   ───────────────────────────────────────────── */
function ReceiptShowcase({
  high,
  low,
}: {
  high: typeof demoReceipts[number];
  low: typeof demoReceipts[number];
}) {
  return (
    <section style={{ background: "#FAFAF7" }} className="border-y border-gray-100">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-24 sm:py-28">
        <div className="flex items-end justify-between flex-wrap gap-5 mb-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">
              Two attempts. Same Brief.
            </p>
            <h2
              className="font-display font-bold tracking-[-0.03em] text-black leading-[1.08]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.4rem)" }}
            >
              We don&apos;t hide the bottom quartile.
            </h2>
            <p className="mt-3 text-[15px] text-gray-600 max-w-[560px] leading-[1.6]">
              Receipts are honest. Same prompt, same hold-out test — different shapes. Read the radar before you read the score.
            </p>
          </div>
          <Link
            href="/receipts/methodology"
            className="text-[14px] font-semibold text-black hover:underline underline-offset-4 inline-flex items-center gap-1.5"
          >
            Read the methodology <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ReceiptCompare high={high} low={low} />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   5. BRIEF STRIP — real Briefs, sponsor-tinted
   ───────────────────────────────────────────── */
function BriefStrip({ briefs }: { briefs: typeof demoBriefs }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-24 sm:py-28">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">
              Live Briefs
            </p>
            <h2
              className="font-display font-bold tracking-[-0.03em] text-black leading-[1.08]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.4rem)" }}
            >
              Real assignments from real companies.
            </h2>
          </div>
          <Link
            href="/briefs"
            className="text-[14px] font-semibold text-black hover:underline underline-offset-4 inline-flex items-center gap-1.5"
          >
            All Briefs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {briefs.map((b) => (
            <Link
              key={b.id}
              href={`/briefs/${b.slug}`}
              className="group rounded-[20px] bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ border: "1px solid #EBEBEB", boxShadow: "0 1px 0 rgba(0,0,0,0.03)" }}
            >
              <div className="h-1.5" style={{ background: b.company.sponsor_color }} />
              <div className="p-6 grid grid-cols-[1fr_auto] gap-4 items-start">
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
                    style={{ color: b.company.sponsor_color }}
                  >
                    {b.sponsor_label}
                  </p>
                  <h3 className="text-[16px] font-bold tracking-[-0.01em] text-black leading-[1.35]">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-[13px] text-gray-600 line-clamp-2 leading-[1.55]">
                    {b.tagline}
                  </p>
                  <div className="mt-4 flex items-center gap-x-4 gap-y-1 flex-wrap text-[11px] text-gray-500">
                    <span className="capitalize">{b.difficulty}</span>
                    <span>·</span>
                    <span>≤{(b.token_cap / 1000).toFixed(0)}k tokens</span>
                    <span>·</span>
                    <span>{b.attempts_count} attempts</span>
                  </div>
                </div>
                {b.ideal_fingerprint && (
                  <div className="opacity-90 -mt-1 -mr-1">
                    <FingerprintGlyph
                      fingerprint={b.ideal_fingerprint}
                      size={88}
                      primaryColor={b.company.sponsor_color}
                    />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   6. SIGNED SECTION — every call signed
   ───────────────────────────────────────────── */
function SignedSection() {
  const points = [
    {
      icon: <ShieldCheck className="w-4 h-4" />,
      label: "Gateway-signed",
      body: "Every LLM call HMAC-signed server-side.",
    },
    {
      icon: <Wrench className="w-4 h-4" />,
      label: "Tool-aware",
      body: "Deterministic tools score above raw tokens.",
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: "Antagonist-paired",
      body: "Single-axis gaming pulled down by counter-axis.",
    },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-28 sm:py-36 border-t border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-end mb-12">
          <h2
            className="font-display font-bold tracking-[-0.03em] text-black leading-[1.05] max-w-[820px]"
            style={{ fontSize: "clamp(2rem, 4.2vw, 3rem)" }}
          >
            Every prompt.{" "}
            <span style={{ color: "rgba(0,0,0,0.35)" }}>Every tool call.</span>{" "}
            Signed at the gateway.
          </h2>
          <Link
            href="/receipts/methodology"
            className="text-[14px] font-semibold text-black hover:underline underline-offset-4 inline-flex items-center gap-1.5"
          >
            Read the methodology <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100 border border-gray-100 rounded-[20px] overflow-hidden">
          {points.map((p) => (
            <div key={p.label} className="bg-white p-7 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg"
                  style={{ background: "#0A0A0A", color: "#C6F135" }}
                >
                  {p.icon}
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                  {p.label}
                </p>
              </div>
              <p className="text-[14px] leading-[1.65] text-gray-700">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-x-5 gap-y-2 flex-wrap">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">
            7 dimensions
          </p>
          {ALL_DIMENSIONS.map((d, i) => (
            <span key={d} className="inline-flex items-center gap-1.5 text-[12px] text-gray-600">
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: i % 2 === 0 ? "#C6F135" : "#0A0A0A" }}
              />
              {DIMENSION_SHORT[d]}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   7. CARD CALLOUT — onramp, not the hero
   ───────────────────────────────────────────── */
function CardCallout() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 pb-24 sm:pb-28">
        <div
          className="rounded-[28px] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 items-center relative overflow-hidden"
          style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
        >
          <div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(198,241,53,0.16) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">
              Onramp
            </p>
            <h2
              className="font-display font-bold tracking-[-0.03em] text-black leading-[1.05]"
              style={{ fontSize: "clamp(1.75rem, 3.4vw, 2.4rem)" }}
            >
              Paste your GitHub URL. Get a profile in 5 seconds.
            </h2>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/claim-card"
                className="inline-flex items-center justify-center gap-2 rounded-[14px] px-6 h-[48px] text-[14px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
                style={{
                  background: "#0A0A0A",
                  color: "#fff",
                  boxShadow: "0 6px 18px rgba(10,10,10,0.18)",
                }}
              >
                Try Antry Card <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center justify-center gap-2 rounded-[14px] px-6 h-[48px] text-[14px] font-semibold whitespace-nowrap text-black hover:underline underline-offset-4"
              >
                Browse builders
              </Link>
            </div>
          </div>

          <div className="relative">
            <div
              className="rounded-[16px] bg-white shadow-[0_24px_48px_-24px_rgba(0,0,0,0.18)] overflow-hidden"
              style={{ border: "1px solid #EBEBEB" }}
            >
              <div
                className="px-4 py-2.5 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-gray-400"
                style={{ background: "#FAFAF7", borderBottom: "1px solid #EBEBEB" }}
              >
                /claim-card
              </div>
              <div className="p-5">
                <div
                  className="flex items-center gap-3 px-4 py-3.5 rounded-[12px]"
                  style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
                >
                  <Github className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-[13px] font-mono text-gray-500 truncate flex-1">
                    github.com/<span className="text-gray-900 font-semibold">shadcn</span>
                  </span>
                  <span
                    className="text-[11px] font-bold px-2 py-1 rounded"
                    style={{ background: "#C6F135", color: "#0A0A0A" }}
                  >
                    Generate
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
                  {["scout-engine", "rag-streaming", "antathon-kit"].map((p, i) => (
                    <div
                      key={p}
                      className="rounded-md p-2"
                      style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
                    >
                      <p className="font-mono text-gray-500 truncate">{p}</p>
                      <p className="mt-0.5 font-bold text-black tabular-nums">
                        {[92, 88, 81][i]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   8. METHODOLOGY HOOK — dark, one big quote
   ───────────────────────────────────────────── */
function MethodologyHook() {
  return (
    <section className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(198,241,53,0.10) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-[920px] px-6 sm:px-10 py-28 sm:py-36 text-center">
        <p
          className="text-[11px] font-bold tracking-[0.22em] uppercase mb-7"
          style={{ color: "#C6F135" }}
        >
          Methodology
        </p>
        <h2
          className="font-display font-bold leading-[1.05] tracking-[-0.035em]"
          style={{ color: "#FFFFFF", fontSize: "clamp(1.85rem, 4.2vw, 3rem)" }}
        >
          The shape of the radar — not just the area —{" "}
          <span style={{ color: "rgba(255,255,255,0.5)" }}>is the signal.</span>
        </h2>
        <p
          className="mt-7 max-w-[560px] mx-auto text-[16px] leading-[1.55]"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Min-of-quartile composite. Open YAML rubric. Every formula published.
        </p>
        <div className="mt-9">
          <Link
            href="/receipts/methodology"
            className="inline-flex items-center gap-2 rounded-[14px] px-6 h-[52px] text-[14px] font-semibold transition-all hover:-translate-y-0.5"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#FFFFFF",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            Read the full methodology <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   9. FINAL CTA
   ───────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-28 sm:py-36 text-center">
        <h2
          className="font-display font-bold tracking-[-0.04em] text-black leading-[0.98] mx-auto"
          style={{ fontSize: "clamp(2.6rem, 6.5vw, 4.6rem)", maxWidth: "880px" }}
        >
          Show your <span style={{ color: "#C6F135" }}>receipts.</span>
        </h2>
        <p className="mt-6 max-w-[560px] mx-auto text-[16px] leading-[1.6] text-gray-600">
          Pick a Brief. Solve it in the Lab. Mint a Receipt that pins to your profile, signed and shareable, in under an hour.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/briefs"
            className="inline-flex items-center justify-center gap-2 rounded-[14px] px-7 h-[56px] text-[15px] font-semibold transition-all hover:-translate-y-0.5"
            style={{
              background: "#C6F135",
              color: "#0A0A0A",
              boxShadow: "0 12px 30px rgba(198,241,53,0.35)",
            }}
          >
            Browse Briefs <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/claim-card"
            className="inline-flex items-center justify-center gap-2 rounded-[14px] px-7 h-[56px] text-[15px] font-semibold transition-all hover:-translate-y-0.5"
            style={{
              background: "#0A0A0A",
              color: "#fff",
              boxShadow: "0 6px 18px rgba(10,10,10,0.18)",
            }}
          >
            Claim your card
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
   ───────────────────────────────────────────── */
function SiteFooter() {
  const cols = [
    {
      title: "Receipts",
      links: [
        { label: "Briefs", href: "/briefs" },
        { label: "Methodology", href: "/receipts/methodology" },
        { label: "Lab", href: "/briefs/streaming-rag-pipeline/lab" },
        { label: "For companies", href: "/c/anthropic" },
      ],
    },
    {
      title: "Network",
      links: [
        { label: "Discover", href: "/discover" },
        { label: "Builders", href: "/builders" },
        { label: "Hackathons", href: "/hackathons" },
        { label: "Antry Card", href: "/claim-card" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Changelog", href: "/changelog" },
        { label: "Press", href: "/press" },
        { label: "Pricing", href: "/pricing" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-16 sm:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,_1fr)] gap-10 sm:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80">
              <span
                className="text-[20px] font-bold tracking-tight"
                style={{ color: "#0A0A0A", fontFamily: "var(--font-display)" }}
              >
                antry
              </span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#C6F135" }} />
            </Link>
            <p className="mt-4 text-[14px] leading-[1.6] text-gray-500 max-w-[280px]">
              Proof of work for AI builders. Show your receipts.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <SocialIconLink href="https://github.com" label="GitHub">
                <Github className="w-4 h-4" />
              </SocialIconLink>
              <SocialIconLink href="https://x.com" label="X / Twitter">
                <Twitter className="w-4 h-4" />
              </SocialIconLink>
              <SocialIconLink href="https://linkedin.com" label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </SocialIconLink>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-4">
                {c.title}
              </p>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[14px] text-gray-600 hover:text-black transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[12px] text-gray-400 tracking-wide">
            © {new Date().getFullYear()} Antry. Built for the builders of tomorrow.
          </p>
          <p className="text-[12px] text-gray-400">
            Status:{" "}
            <span
              className="inline-flex items-center gap-1.5 ml-1 font-semibold"
              style={{ color: "#0A0A0A" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#22C55E" }}
              />
              Gateway live
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
    >
      {children}
    </a>
  );
}
