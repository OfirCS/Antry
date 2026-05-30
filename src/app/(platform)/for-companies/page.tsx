import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

/**
 * /for-companies — companies-side pricing & pitch surface.
 *
 * Builders are free. Companies pay. This page exists to convert a
 * hiring manager who arrived via a colleague's link in under 30 seconds.
 *
 * Server component. No client interactivity. All copy editorial / terse.
 */

const FOUNDER_MAILTO =
  "mailto:[email protected]?subject=Antry%20for%20companies";

const TITLE = "For companies — hire on output";
const DESCRIPTION =
  "Antry returns signed Receipts of how candidates actually code. Cut time-to-hire from 90 days to under 20.";

export const metadata: Metadata = {
  title: "For companies",
  description: DESCRIPTION,
  alternates: { canonical: "/for-companies" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/for-companies",
    image: ogImageUrl({
      title: "Hire on output.",
      subtitle: "Signed Receipts. Real work. Under 20 days to offer.",
      eyebrow: "Antry · For companies",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

/* ── Section data ─────────────────────────────────────── */

const PIPELINE_TODAY = [
  "Take-homes ghostwritten by AI",
  "LeetCode solved by Claude in 3 seconds",
  "Interview transcripts that miss how candidates think with AI",
  "90+ day time-to-hire (industry average, 2026)",
];

const PIPELINE_ANTRY = [
  "Passive capture during real work — no interview theater",
  "Signed traces (HMAC + MCP gateway) — verifiable, tamper-proof",
  "Scout agent ranks candidates with rationale in seconds",
  "Under 20 days from search to offer",
];

type Plan = {
  name: string;
  price: string;
  cadence?: string;
  blurb: string;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "Browse the network. Get a feel for the signal.",
    features: [
      "Browse public Receipts",
      "Basic Scout — 10 queries / month",
      "Read full Receipt summaries",
      "1 seat",
      "No Reach Out",
    ],
    cta: { label: "Start free", href: "/scout" },
  },
  {
    name: "Team",
    price: "$300",
    cadence: "/ month",
    blurb: "For one hiring loop, running hot.",
    features: [
      "Unlimited Scout queries",
      "Post 1 active Brief",
      "View full Receipt traces (every event)",
      "Reach Out via Antry inbox",
      "5 seats",
    ],
    cta: { label: "Start with Team", href: "/scout" },
    highlight: true,
  },
  {
    name: "Growth",
    price: "$1,200",
    cadence: "/ month",
    blurb: "For multi-team hiring orgs.",
    features: [
      "Unlimited Briefs",
      "ATS integration (Greenhouse, Ashby, Lever)",
      "Hire reporting dashboard",
      "Reach Out via Antry inbox",
      "20 seats",
      "Priority support",
    ],
    cta: { label: "Talk to founder", href: FOUNDER_MAILTO },
  },
];

const POSITIONING = [
  {
    vs: "vs Karat",
    headline: "Shipping replays, not interview replays.",
  },
  {
    vs: "vs HackerRank",
    headline: "Real work captured, not synthetic puzzles.",
  },
  {
    vs: "vs Mercor",
    headline: "We hire engineers to ship products.",
  },
];

const FAQ = [
  {
    q: "How fast can we go live?",
    a: "Same day. Browse Scout, post a Brief in 60 seconds, share with candidates.",
  },
  {
    q: "What if a candidate's not on Antry?",
    a: "Send them a Brief link. They install MCP, mint a Receipt, you get the trace.",
  },
  {
    q: "Is the placement fee net or gross?",
    a: "8% of first-year base salary, capped at $10K. Net of bonuses, equity, sign-ons.",
  },
  {
    q: "Do you handle outreach?",
    a: "Reach Out flow ships via the Antry inbox. No spam, no double messages.",
  },
  {
    q: "Can we integrate with our ATS?",
    a: "Greenhouse, Ashby, Lever — Growth plan.",
  },
];

/* ── Page ─────────────────────────────────────────────── */

export default function ForCompaniesPage() {
  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      {/* ── Header band ─────────────────────────────────── */}
      <section
        className="relative"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB" }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "#0A0A0A" }}
        />
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "#737373" }}
          >
            For companies
          </p>
          <h1
            className="mt-4 font-display font-bold tracking-[-0.035em] leading-[1.02]"
            style={{ color: "#0A0A0A", fontSize: "clamp(2.4rem, 5.5vw, 3.8rem)" }}
          >
            Hire on output.
          </h1>
          <p
            className="mt-5 max-w-[600px] text-[16px] leading-[1.6]"
            style={{ color: "#525252" }}
          >
            Antry returns signed Receipts of how candidates actually code.
            Cut time-to-hire from 90 days to under 20.
          </p>
          <div className="mt-8 flex items-center gap-5 flex-wrap">
            <Link
              href="/scout"
              className="inline-flex items-center gap-2 rounded-[12px] px-5 h-[44px] text-[14px] font-semibold whitespace-nowrap transition-transform hover:-translate-y-[1px]"
              style={{ background: "#0A0A0A", color: "#FFFFFF" }}
            >
              Start with Scout <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={FOUNDER_MAILTO}
              className="text-[14px] font-semibold underline-offset-4 hover:underline transition-colors"
              style={{ color: "#0A0A0A" }}
            >
              Talk to founder →
            </a>
          </div>
        </div>
      </section>

      {/* ── The problem ─────────────────────────────────── */}
      <section className="mx-auto max-w-[1080px] px-6 sm:px-10 pt-20 sm:pt-24">
        <SectionHeader
          eyebrow="The problem"
          title="The signal is gone."
          subtitle="The 2010s hiring stack measured solving. In 2026, models solve. What's left is collaboration — and you can't see it in a take-home."
        />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProblemCard
            label="Today's pipeline"
            items={PIPELINE_TODAY}
            tone="neg"
          />
          <ProblemCard
            label="With Antry"
            items={PIPELINE_ANTRY}
            tone="pos"
          />
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────── */}
      <section className="mx-auto max-w-[1080px] px-6 sm:px-10 pt-24">
        <SectionHeader
          eyebrow="Pricing"
          title="Three plans. One placement fee."
          subtitle="Subscribe for access. Pay a fee when you actually hire. No seat tax for engineers you'll never meet."
        />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <PlanCard key={p.name} plan={p} />
          ))}
        </div>

        <p
          className="mt-8 text-center text-[15px] sm:text-[16px] leading-[1.6]"
          style={{ color: "#0A0A0A" }}
        >
          <strong className="font-bold">
            + 8% placement fee on hire (capped at $10K).
          </strong>{" "}
          <span style={{ color: "#525252" }}>You pay when it works.</span>
        </p>
      </section>

      {/* ── Anti-incumbent positioning ──────────────────── */}
      <section className="mx-auto max-w-[1080px] px-6 sm:px-10 pt-24">
        <SectionHeader eyebrow="Why Antry" title="Not another testing tool." />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {POSITIONING.map((p) => (
            <div
              key={p.vs}
              className="rounded-[14px] p-5 sm:p-6"
              style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
            >
              <p
                className="text-[10.5px] font-bold uppercase tracking-[0.22em]"
                style={{ color: "#737373" }}
              >
                {p.vs}
              </p>
              <p
                className="mt-2.5 text-[16px] font-semibold tracking-[-0.005em] leading-[1.35]"
                style={{ color: "#0A0A0A" }}
              >
                {p.headline}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust signals ───────────────────────────────── */}
      <section className="mx-auto max-w-[1080px] px-6 sm:px-10 pt-24">
        <div
          className="rounded-[20px] p-7 sm:p-10"
          style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
        >
          <p
            className="text-[10.5px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "#737373" }}
          >
            Why the signal holds
          </p>
          <p
            className="mt-3 font-display font-semibold tracking-[-0.015em] leading-[1.35]"
            style={{ color: "#0A0A0A", fontSize: "clamp(1.05rem, 2vw, 1.35rem)" }}
          >
            Receipt is structurally AI-proof — Anthropic&apos;s Opus 4.5 broke
            their own take-home in 2026. Antry&apos;s signal isn&apos;t whether
            the candidate can solve it without AI — it&apos;s how they
            collaborate with it.
          </p>

          <div
            className="mt-7 pt-6 flex items-center gap-3 text-[13px] flex-wrap"
            style={{ borderTop: "1px solid #EBEBEB", color: "#525252" }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "#C6F135" }}
              aria-hidden
            />
            <span>
              <strong className="font-bold" style={{ color: "#0A0A0A" }}>
                9,652 MCP servers
              </strong>{" "}
              in the ecosystem (May 2026). Antry is the canonical example
              for hiring.
            </span>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1080px] px-6 sm:px-10 pt-24">
        <SectionHeader eyebrow="FAQ" title="Common questions." />

        <dl
          className="mt-10 rounded-[14px] overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
        >
          {FAQ.map((item, i) => (
            <div
              key={item.q}
              className="px-5 py-5 sm:px-7 sm:py-6"
              style={{
                borderBottom:
                  i === FAQ.length - 1 ? "none" : "1px solid #EBEBEB",
              }}
            >
              <dt
                className="text-[14.5px] font-semibold tracking-[-0.005em]"
                style={{ color: "#0A0A0A" }}
              >
                {item.q}
              </dt>
              <dd
                className="mt-1.5 text-[14px] leading-[1.6]"
                style={{ color: "#525252" }}
              >
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Footer CTA ──────────────────────────────────── */}
      <section className="mx-auto max-w-[1080px] px-6 sm:px-10 pt-24 pb-28">
        <div
          className="rounded-[20px] p-8 sm:p-12 text-center"
          style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
        >
          <h2
            className="font-display font-bold tracking-[-0.03em] leading-[1.05]"
            style={{ color: "#0A0A0A", fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}
          >
            Start hiring on output.
          </h2>
          <p
            className="mt-3 max-w-[520px] mx-auto text-[15px] leading-[1.6]"
            style={{ color: "#525252" }}
          >
            Browse Scout free. Post a Brief in 60 seconds. Or get the founder
            on a 20-minute call this week.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
            <a
              href={FOUNDER_MAILTO}
              className="inline-flex items-center gap-2 rounded-[12px] px-5 h-[48px] text-[14px] font-semibold whitespace-nowrap transition-transform hover:-translate-y-[1px]"
              style={{ background: "#0A0A0A", color: "#FFFFFF" }}
            >
              Talk to founder <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/scout"
              className="inline-flex items-center gap-2 rounded-[12px] px-5 h-[48px] text-[14px] font-semibold whitespace-nowrap transition-transform hover:-translate-y-[1px]"
              style={{
                background: "#FFFFFF",
                color: "#0A0A0A",
                border: "1px solid #0A0A0A",
              }}
            >
              Browse Scout
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Local building blocks ────────────────────────────── */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-[640px]">
      <p
        className="text-[11px] font-bold uppercase tracking-[0.22em]"
        style={{ color: "#737373" }}
      >
        {eyebrow}
      </p>
      <h2
        className="mt-3 font-display font-bold tracking-[-0.025em] leading-[1.05]"
        style={{ color: "#0A0A0A", fontSize: "clamp(1.6rem, 3.2vw, 2.1rem)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-3 text-[15px] leading-[1.6]"
          style={{ color: "#525252" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ProblemCard({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "neg" | "pos";
}) {
  const isPos = tone === "pos";
  return (
    <div
      className="rounded-[14px] p-6 sm:p-7"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      <p
        className="text-[10.5px] font-bold uppercase tracking-[0.22em]"
        style={{ color: isPos ? "#0A0A0A" : "#737373" }}
      >
        {label}
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-3">
            <span
              className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full mt-[2px]"
              style={{
                background: isPos
                  ? "rgba(198,241,53,0.22)"
                  : "rgba(115,115,115,0.10)",
              }}
              aria-hidden
            >
              {isPos ? (
                <Check
                  className="w-3 h-3"
                  style={{ color: "#0A0A0A" }}
                  strokeWidth={3}
                />
              ) : (
                <X
                  className="w-3 h-3"
                  style={{ color: "#737373" }}
                  strokeWidth={2.5}
                />
              )}
            </span>
            <span
              className="text-[14px] leading-[1.5]"
              style={{ color: isPos ? "#0A0A0A" : "#525252" }}
            >
              {it}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const highlight = !!plan.highlight;
  const isMailto = plan.cta.href.startsWith("mailto:");
  return (
    <div
      className="relative rounded-[16px] p-6 sm:p-7 flex flex-col"
      style={{
        background: "#FFFFFF",
        border: highlight ? "1.5px solid #0A0A0A" : "1px solid #EBEBEB",
      }}
    >
      {highlight && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2.5 h-6 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] whitespace-nowrap"
          style={{
            background: "#C6F135",
            color: "#0A0A0A",
            border: "1px solid #0A0A0A",
          }}
        >
          Most popular
        </span>
      )}

      <p
        className="text-[11px] font-bold uppercase tracking-[0.22em]"
        style={{ color: "#737373" }}
      >
        {plan.name}
      </p>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span
          className="font-display font-bold tracking-[-0.03em] leading-none"
          style={{ color: "#0A0A0A", fontSize: "clamp(1.8rem, 3.4vw, 2.2rem)" }}
        >
          {plan.price}
        </span>
        {plan.cadence && (
          <span className="text-[13px]" style={{ color: "#737373" }}>
            {plan.cadence}
          </span>
        )}
      </div>

      <p
        className="mt-2.5 text-[13.5px] leading-[1.55]"
        style={{ color: "#525252" }}
      >
        {plan.blurb}
      </p>

      <ul
        className="mt-5 pt-5 flex flex-col gap-2.5 flex-1"
        style={{ borderTop: "1px solid #EBEBEB" }}
      >
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check
              className="w-3.5 h-3.5 mt-[3px] shrink-0"
              style={{ color: "#0A0A0A" }}
              strokeWidth={3}
            />
            <span
              className="text-[13.5px] leading-[1.5]"
              style={{ color: "#0A0A0A" }}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {isMailto ? (
          <a
            href={plan.cta.href}
            className="inline-flex items-center justify-center gap-1.5 w-full rounded-[12px] h-[44px] text-[13.5px] font-semibold transition-transform hover:-translate-y-[1px]"
            style={{
              background: highlight ? "#0A0A0A" : "#FFFFFF",
              color: highlight ? "#FFFFFF" : "#0A0A0A",
              border: highlight ? "1px solid #0A0A0A" : "1px solid #0A0A0A",
            }}
          >
            {plan.cta.label} <ArrowRight className="w-3.5 h-3.5" />
          </a>
        ) : (
          <Link
            href={plan.cta.href}
            className="inline-flex items-center justify-center gap-1.5 w-full rounded-[12px] h-[44px] text-[13.5px] font-semibold transition-transform hover:-translate-y-[1px]"
            style={{
              background: highlight ? "#0A0A0A" : "#FFFFFF",
              color: highlight ? "#FFFFFF" : "#0A0A0A",
              border: highlight ? "1px solid #0A0A0A" : "1px solid #0A0A0A",
            }}
          >
            {plan.cta.label} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
