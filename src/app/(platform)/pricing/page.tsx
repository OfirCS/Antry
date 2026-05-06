import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Minus,
  Sparkles,
  Zap,
  Lock,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

const TITLE = "Pricing — free for builders, fair for companies";
const DESCRIPTION =
  "Builders mint Receipts free, forever. Companies pay only when a Receipt surfaces a hire-worthy human. No posting fees. No per-seat trickery.";

export const metadata: Metadata = {
  title: "Pricing",
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/pricing",
    image: ogImageUrl({
      title: "Free for builders. Fair for companies.",
      subtitle: "Solo $99 · Growth $499 · Enterprise $2,499",
      eyebrow: "Pricing",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

type Tier = {
  slug: "solo" | "growth" | "enterprise" | "payg";
  name: string;
  blurb: string;
  price: string;
  cadence: string;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
  tone: "light" | "dark";
};

const TIERS: Tier[] = [
  {
    slug: "solo",
    name: "Solo",
    blurb: "For solo founders and sub-10-person teams hiring their first AI engineers.",
    price: "$99",
    cadence: "/ month",
    features: [
      "1 active Brief at a time",
      "10 candidate Receipt seats / month",
      "Public Briefs only (visible on /briefs)",
      "5 outbound intro requests / month",
      "Receipts retained 90 days",
      "Email support",
    ],
    cta: { label: "Start with Solo", href: "/c/start?plan=solo" },
    tone: "light",
  },
  {
    slug: "growth",
    name: "Growth",
    blurb: "For funded teams (Series A / YC) hiring AI engineers at pace.",
    price: "$499",
    cadence: "/ month",
    features: [
      "4 concurrent active Briefs",
      "50 candidate Receipt seats / month",
      "Public + Private (invite-only) Briefs",
      "30 outbound intro requests / month",
      "Receipts retained 12 months",
      "Read-only Receipts API",
      "Priority support · 1-day SLA",
    ],
    cta: { label: "Start with Growth", href: "/c/start?plan=growth" },
    highlight: true,
    tone: "dark",
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    blurb: "For platform teams + late-stage. Custom rubrics, dedicated success.",
    price: "$2,499",
    cadence: "/ month",
    features: [
      "Unlimited active Briefs",
      "250 Receipt seats / month + concierge sourcing",
      "Public + Private + Hold-out Briefs",
      "Unlimited intro requests + Antry Scout dispatch",
      "Receipts retained forever + export",
      "Full Receipts API + SSO + DPA",
      "Dedicated success engineer",
    ],
    cta: { label: "Talk to us", href: "mailto:[email protected]?subject=Antry%20Enterprise" },
    tone: "light",
  },
];

const COMPARE_ROWS: {
  feature: string;
  solo: string | true | false;
  growth: string | true | false;
  enterprise: string | true | false;
}[] = [
  { feature: "Active Briefs", solo: "1", growth: "4", enterprise: "Unlimited" },
  { feature: "Receipt seats / month", solo: "10", growth: "50", enterprise: "250" },
  { feature: "Public Briefs", solo: true, growth: true, enterprise: true },
  { feature: "Private (invite-only) Briefs", solo: false, growth: true, enterprise: true },
  { feature: "Hold-out Briefs", solo: false, growth: false, enterprise: true },
  { feature: "Intro requests / month", solo: "5", growth: "30", enterprise: "Unlimited" },
  { feature: "Receipt retention", solo: "90 days", growth: "12 months", enterprise: "Forever" },
  { feature: "Read-only Receipts API", solo: false, growth: true, enterprise: true },
  { feature: "Full Receipts API", solo: false, growth: false, enterprise: true },
  { feature: "SSO + DPA", solo: false, growth: false, enterprise: true },
  { feature: "Custom rubric authoring", solo: false, growth: false, enterprise: true },
  { feature: "Concierge sourcing", solo: false, growth: false, enterprise: true },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Why are builders free forever?",
    a: "Because the moment builders pay to be discoverable, the incentive corrupts the network. The signal is what makes Antry valuable; charging the side that produces signal would destroy it.",
  },
  {
    q: "What's a Receipt seat?",
    a: "One surfaced Receipt — meaning a Receipt that's been opened, attributed to a real person, and made available for an intro request. We only count a seat as consumed when you actually open the trace, not when it appears in a list.",
  },
  {
    q: "Can a Brief get more attempts than I have seats for?",
    a: "Yes. Public Briefs accept unlimited builder attempts; you only consume a seat when you open a specific Receipt to evaluate it. The rest stay free in the network.",
  },
  {
    q: "What if I run out mid-month?",
    a: "Solo and Growth roll over unused seats once. After that, you can either upgrade or buy individual seats at the pay-as-you-go rate ($15/seat, 5 minimum).",
  },
  {
    q: "How is private mode different?",
    a: "A private Brief never appears on /briefs, only invited builders see it, the trace stays company-only, and the resulting Receipt is invisible to non-company users.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. Cancellation takes effect at the end of the current period. Receipts you already opened stay yours; remaining seats expire.",
  },
  {
    q: "Why is enterprise so much more than Growth?",
    a: "Concierge sourcing, custom rubric authoring, hold-out Briefs (separate test set per company), SSO, DPA, and a dedicated success engineer aren't features — they're a relationship. Pricing reflects it.",
  },
  {
    q: "Do builders ever see who paid for their Receipt?",
    a: "Only when a company sends an intro request. Receipt views are anonymous; intros are explicit.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TierGrid />
        <PaygCallout />
        <ComparisonTable />
        <MathCallout />
        <FairnessNote />
        <Faq />
        <FinalCTA />
      </main>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(198,241,53,0.16) 0%, transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto max-w-[920px] px-6 sm:px-10 pt-24 sm:pt-28 pb-32 sm:pb-36 text-center">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "#C6F135" }}
        >
          Pricing
        </p>
        <h1
          className="mt-3 font-display font-bold leading-[1.02] tracking-[-0.04em]"
          style={{ color: "#FFFFFF", fontSize: "clamp(2.6rem, 6vw, 4rem)" }}
        >
          Free for builders.
          <br />
          <span style={{ color: "#C6F135" }}>Fair for companies.</span>
        </h1>
        <p
          className="mt-7 max-w-[640px] mx-auto text-[16px] sm:text-[17px] leading-[1.6]"
          style={{ color: "rgba(255,255,255,0.66)" }}
        >
          Builders mint Receipts free, forever. Companies pay only when a Receipt
          surfaces a hire-worthy human. No posting fees. No per-seat trickery.{" "}
          <span style={{ color: "#FFFFFF" }}>
            Solo $99 · Growth $499 · Enterprise $2,499.
          </span>
        </p>
      </div>
    </section>
  );
}

function TierGrid() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1180px] px-6 sm:px-10 -mt-24 sm:-mt-28 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {TIERS.filter((t) => t.slug !== "payg").map((t) => (
            <TierCard key={t.slug} tier={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  const isDark = tier.tone === "dark";
  return (
    <div
      className="relative rounded-[24px] p-7 sm:p-9 overflow-hidden"
      style={{
        background: isDark ? "#0A0A0A" : "#ffffff",
        color: isDark ? "#fff" : "#0A0A0A",
        border: isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid #EBEBEB",
        boxShadow: isDark
          ? "0 32px 64px -32px rgba(0,0,0,0.5), 0 0 0 1px rgba(198,241,53,0.20)"
          : "0 12px 40px -24px rgba(0,0,0,0.10)",
      }}
    >
      {isDark && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 100% 0%, rgba(198,241,53,0.12) 0%, transparent 60%)",
          }}
        />
      )}
      {tier.highlight && (
        <div
          className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ background: "#C6F135", color: "#0A0A0A" }}
        >
          <Zap className="w-3 h-3" />
          Most popular
        </div>
      )}

      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] mb-5"
          style={{ color: isDark ? "#C6F135" : "rgba(0,0,0,0.55)" }}
        >
          {tier.name}
        </p>
        <div className="flex items-baseline gap-2">
          <span
            className="font-bold tracking-tight font-display"
            style={{ fontSize: "clamp(2.4rem, 5vw, 3.4rem)", lineHeight: 1 }}
          >
            {tier.price}
          </span>
          <span
            className="text-[14px]"
            style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)" }}
          >
            {tier.cadence}
          </span>
        </div>
        <p
          className="mt-4 text-[14px] leading-[1.6]"
          style={{ color: isDark ? "rgba(255,255,255,0.66)" : "rgba(0,0,0,0.6)" }}
        >
          {tier.blurb}
        </p>

        <Link
          href={tier.cta.href}
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-[14px] px-5 h-[52px] text-[14px] font-semibold w-full transition-all hover:-translate-y-0.5"
          style={
            isDark
              ? {
                  background: "#C6F135",
                  color: "#0A0A0A",
                  boxShadow: "0 8px 24px rgba(198,241,53,0.35)",
                }
              : {
                  background: "#0A0A0A",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(10,10,10,0.20)",
                }
          }
        >
          {tier.cta.label} <ArrowRight className="w-4 h-4" />
        </Link>

        <ul className="mt-7 space-y-3">
          {tier.features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-3 text-[14px] leading-[1.5]"
              style={{ color: isDark ? "rgba(255,255,255,0.85)" : "#0A0A0A" }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: isDark
                    ? "rgba(198,241,53,0.16)"
                    : "rgba(10,10,10,0.06)",
                }}
              >
                <Check
                  className="w-3 h-3"
                  style={{ color: isDark ? "#C6F135" : "#0A0A0A" }}
                  strokeWidth={3}
                />
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PaygCallout() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1180px] px-6 sm:px-10 pb-16">
        <div
          className="rounded-[20px] p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5 items-center relative overflow-hidden"
          style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
              Pay as you go
            </p>
            <h3 className="text-[20px] sm:text-[22px] font-bold tracking-[-0.015em] text-black">
              $15 per Receipt seat. 5-seat minimum. No subscription.
            </h3>
            <p className="mt-2 text-[14px] leading-[1.55] text-gray-600 max-w-[680px]">
              For companies that just want to evaluate a small candidate pool.
              Public Briefs only. 30-day retention. Upgrade to Growth any time
              and your remaining PAYG balance carries over.
            </p>
          </div>
          <Link
            href="/c/start?plan=payg"
            className="inline-flex items-center justify-center gap-2 rounded-[14px] px-5 h-[48px] text-[14px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
            style={{
              background: "#0A0A0A",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(10,10,10,0.20)",
            }}
          >
            Buy 5 seats · $75 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ComparisonTable() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1180px] px-6 sm:px-10 pb-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">
          Compare tiers
        </p>
        <h2
          className="font-display font-bold tracking-[-0.025em] text-black leading-[1.08] mb-8"
          style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)" }}
        >
          Every line item. No hidden math.
        </h2>

        <div className="rounded-[20px] overflow-hidden border border-gray-200 bg-white">
          <div
            className="grid grid-cols-[1.6fr_1fr_1fr_1fr] text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 px-5 py-3"
            style={{ background: "#FAFAF7", borderBottom: "1px solid #EBEBEB" }}
          >
            <div>Feature</div>
            <div>Solo</div>
            <div>Growth</div>
            <div>Enterprise</div>
          </div>
          {COMPARE_ROWS.map((r, i) => (
            <div
              key={r.feature}
              className="grid grid-cols-[1.6fr_1fr_1fr_1fr] text-[14px] px-5 py-3.5 items-center"
              style={{
                borderBottom:
                  i === COMPARE_ROWS.length - 1 ? "none" : "1px solid #F5F5F5",
              }}
            >
              <div className="font-semibold text-black">{r.feature}</div>
              <div className="text-gray-700">{renderCell(r.solo)}</div>
              <div className="text-gray-700">{renderCell(r.growth)}</div>
              <div className="text-gray-700">{renderCell(r.enterprise)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderCell(v: string | true | false): React.ReactNode {
  if (v === true)
    return (
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-full"
        style={{ background: "rgba(198,241,53,0.30)" }}
      >
        <Check className="w-3 h-3" style={{ color: "#0A0A0A" }} strokeWidth={3} />
      </span>
    );
  if (v === false)
    return <Minus className="w-3.5 h-3.5 text-gray-300" />;
  return <span className="tabular-nums">{v}</span>;
}

function MathCallout() {
  return (
    <section style={{ background: "#FAFAF7" }} className="border-y border-gray-100">
      <div className="mx-auto max-w-[920px] px-6 sm:px-10 py-20 sm:py-24">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">
          How the math works
        </p>
        <h2
          className="font-display font-bold tracking-[-0.025em] text-black leading-[1.08] mb-6"
          style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)" }}
        >
          What one Receipt actually costs us.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            className="rounded-[16px] p-6 bg-white"
            style={{ border: "1px solid #EBEBEB" }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-3">
              Per Receipt, raw cost
            </p>
            <ul className="space-y-2 text-[14px] text-gray-700 leading-[1.6]">
              <li>
                ~7K Anthropic API tokens
                <span className="text-gray-400"> — $0.057</span>
              </li>
              <li>
                Rubric grading (~3K judge tokens)
                <span className="text-gray-400"> — $0.030</span>
              </li>
              <li>
                Storage, signing, CDN
                <span className="text-gray-400"> — $0.013</span>
              </li>
              <li className="pt-2 mt-2 border-t border-gray-100 font-semibold text-black">
                Total: <span className="tabular-nums">$0.10 / Receipt</span>
              </li>
            </ul>
          </div>
          <div
            className="rounded-[16px] p-6"
            style={{ background: "#0A0A0A", color: "#fff" }}
          >
            <p
              className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3"
              style={{ color: "#C6F135" }}
            >
              Growth tier — gross margin
            </p>
            <ul className="space-y-2 text-[14px] leading-[1.6]"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              <li>
                50 Receipts at $0.10 raw =
                <span className="text-white font-semibold"> $5.00</span>
              </li>
              <li>
                Plus fixed infra ≈
                <span className="text-white font-semibold"> $4.00</span>
              </li>
              <li>
                Total COGS / customer / month:
                <span className="text-white font-semibold"> $9</span>
              </li>
              <li className="pt-2 mt-2 border-t border-white/10 font-semibold text-white">
                Margin on $499 ≈ 98.2%.
              </li>
              <li className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                We charge for the seat, not the tokens.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FairnessNote() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[920px] px-6 sm:px-10 py-20 sm:py-24">
        <div
          className="rounded-[24px] p-7 sm:p-9 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 items-start"
          style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "#0A0A0A" }}
          >
            <Sparkles className="w-5 h-5" style={{ color: "#C6F135" }} />
          </div>
          <div>
            <h3 className="text-[18px] font-bold tracking-[-0.015em] text-black">
              Why builders are free forever
            </h3>
            <p className="mt-3 text-[14px] leading-[1.65] text-gray-700">
              The moment builders pay to be discoverable, the incentive
              corrupts the network. The signal Antry surfaces is what makes
              Receipts valuable — charging the side that produces signal would
              destroy the very thing companies pay for. So builders mint, share,
              and earn intros for free. Companies pay only when a Receipt
              actually surfaces a hire-worthy human.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[760px] px-6 sm:px-10 pb-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">
          Questions
        </p>
        <h2
          className="font-display font-bold tracking-[-0.025em] text-black leading-[1.08] mb-2"
          style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)" }}
        >
          The ones we get every week.
        </h2>
        <ul className="mt-8 divide-y divide-gray-100 border-t border-gray-100">
          {FAQ.map((f) => (
            <li key={f.q} className="py-5">
              <h3 className="text-[16px] font-bold tracking-[-0.01em] text-black">
                {f.q}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.65] text-gray-700">{f.a}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section style={{ background: "#0A0A0A" }} className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(198,241,53,0.10) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-[920px] px-6 sm:px-10 py-24 sm:py-32 text-center">
        <p
          className="text-[11px] font-bold tracking-[0.22em] uppercase mb-7"
          style={{ color: "#C6F135" }}
        >
          Get started
        </p>
        <h2
          className="font-display font-bold leading-[1.05] tracking-[-0.035em] mx-auto"
          style={{
            color: "#FFFFFF",
            fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
            maxWidth: "780px",
          }}
        >
          Pick a tier. Post a Brief.{" "}
          <span style={{ color: "#C6F135" }}>Hire on Receipts.</span>
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/c/start?plan=growth"
            className="inline-flex items-center justify-center gap-2 rounded-[14px] px-7 h-[56px] text-[15px] font-semibold transition-all hover:-translate-y-0.5"
            style={{
              background: "#C6F135",
              color: "#0A0A0A",
              boxShadow: "0 12px 30px rgba(198,241,53,0.35)",
            }}
          >
            Start with Growth · $499/mo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="mailto:[email protected]"
            className="inline-flex items-center justify-center gap-2 rounded-[14px] px-7 h-[56px] text-[15px] font-semibold transition-colors"
            style={{
              color: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <Lock className="w-4 h-4" />
            Talk to enterprise
          </Link>
        </div>
        <p className="mt-6 text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          Cancel any time. No setup fees. Upgrade or downgrade with one click.
        </p>
      </div>
    </section>
  );
}
