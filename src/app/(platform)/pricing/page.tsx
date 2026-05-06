import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, Sparkles, Zap } from "lucide-react";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";

const TITLE = "Pricing — free for builders, forever";
const DESCRIPTION =
  "Antry is free for every builder. Recruiters and teams pay to find talent through the Scout agent.";

export const metadata: Metadata = {
  title: "Pricing",
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/pricing",
    image: ogImageUrl({
      title: "Free for builders. Always.",
      subtitle: "Recruiters pay to find you. You ship and get discovered.",
      eyebrow: "Pricing",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

const builderFeatures = [
  "Unlimited projects + demo links",
  "Public builder profile + Scout indexing",
  "Antry Card auto-import from GitHub",
  "Join every Antathon",
  "5 invites per claimed profile",
  "Project share cards (OG + X intent)",
  "Featured builder spotlight rotation",
];

const recruiterFeatures = [
  "Natural-language Scout queries",
  "Side-by-side builder comparisons",
  "Filter by tech stack, build cadence, hackathons",
  "Direct intro requests with builder consent",
  "Weekly inbox of matches",
  "Concierge sourcing on enterprise tier",
];

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main>
        <PricingHero />
        <section className="bg-white">
          <div className="mx-auto max-w-[1100px] px-6 sm:px-10 -mt-20 sm:-mt-24 pb-20 sm:pb-28 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-5">
              <PricingCard
                eyebrow="Builders"
                price="$0"
                cadence="forever"
                title="Build your proof of work"
                description="Showcase shipped projects, join Antathons, and get matched with teams hiring on output."
                features={builderFeatures}
                cta={{ label: "Start building", href: "/signup" }}
                tone="dark"
                highlighted
              />
              <PricingCard
                eyebrow="Recruiters & teams"
                price="Waitlist"
                cadence="opens Q3"
                title="Find builders by what they ship"
                description="Search the network in plain English. Compare, request intros, hire on real signal."
                features={recruiterFeatures}
                cta={{
                  label: "Join recruiter waitlist",
                  href: "mailto:[email protected]?subject=Antry%20recruiter%20waitlist",
                }}
                tone="light"
              />
            </div>

            <FairnessNote />

            <ComparisonGrid />

            <div className="mt-16 text-center">
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-black hover:underline underline-offset-4"
              >
                More questions? Read the FAQ <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function PricingHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#0A0A0A" }}
    >
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

      <div className="relative mx-auto max-w-[920px] px-6 pt-24 pb-32 sm:px-10 sm:pt-28 sm:pb-36 text-center">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "#C6F135" }}
        >
          Pricing
        </p>
        <h1
          className="mt-3 font-display text-[clamp(2.4rem,5.5vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.035em]"
          style={{ color: "#FFFFFF" }}
        >
          Free for builders.
          <br />
          <span style={{ color: "#C6F135" }}>Always will be.</span>
        </h1>
        <p
          className="mt-7 max-w-[620px] mx-auto text-[16px] sm:text-[17px] leading-[1.6]"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          The deal: builders ship and get discovered for free. Teams that want to hire pay to use Scout — the
          AI agent that searches the network in plain English. That&apos;s it.
        </p>
      </div>
    </section>
  );
}

function PricingCard({
  eyebrow,
  price,
  cadence,
  title,
  description,
  features,
  cta,
  tone,
  highlighted = false,
}: {
  eyebrow: string;
  price: string;
  cadence: string;
  title: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  tone: "dark" | "light";
  highlighted?: boolean;
}) {
  const isDark = tone === "dark";
  return (
    <div
      className="relative rounded-[28px] p-7 sm:p-9 overflow-hidden"
      style={{
        background: isDark ? "#0A0A0A" : "#ffffff",
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #EBEBEB",
        color: isDark ? "#fff" : "#111",
        boxShadow: isDark
          ? "0 32px 64px -32px rgba(0,0,0,0.5), 0 0 0 1px rgba(198,241,53,0.15)"
          : "0 12px 40px -24px rgba(0,0,0,0.10)",
      }}
    >
      {isDark && (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 100% 0%, rgba(198,241,53,0.12) 0%, transparent 60%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </>
      )}

      {highlighted && (
        <div
          className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ background: "#C6F135", color: "#0A0A0A" }}
        >
          <Zap className="w-3 h-3" />
          Most popular
        </div>
      )}

      <div className="relative">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: isDark ? "#C6F135" : "rgba(0,0,0,0.55)" }}
        >
          {eyebrow}
        </p>
        <div className="mt-6 flex items-baseline gap-2">
          <span
            className="font-bold tracking-tight font-display"
            style={{ fontSize: "clamp(2.5rem, 5vw, 3.4rem)", lineHeight: 1 }}
          >
            {price}
          </span>
          <span
            className="text-[14px]"
            style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)" }}
          >
            / {cadence}
          </span>
        </div>
        <h3 className="mt-3 text-[20px] sm:text-[22px] font-bold tracking-[-0.015em]">{title}</h3>
        <p
          className="mt-2.5 text-[14px] leading-[1.6]"
          style={{ color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)" }}
        >
          {description}
        </p>

        <Link
          href={cta.href}
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
          {cta.label} <ArrowRight className="w-4 h-4" />
        </Link>

        <ul className="mt-7 space-y-3">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-3 text-[14px] leading-[1.5]"
              style={{ color: isDark ? "rgba(255,255,255,0.85)" : "#111" }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: isDark ? "rgba(198,241,53,0.16)" : "rgba(10,10,10,0.06)",
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

function FairnessNote() {
  return (
    <div
      className="mt-16 rounded-[24px] p-6 sm:p-8 flex items-start gap-4 sm:gap-5 relative overflow-hidden"
      style={{
        background: "#FAFAF7",
        border: "1px solid #EBEBEB",
      }}
    >
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(198,241,53,0.10) 0%, transparent 70%)",
        }}
      />
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative"
        style={{ background: "#0A0A0A" }}
      >
        <Sparkles className="w-5 h-5" style={{ color: "#C6F135" }} />
      </div>
      <div className="relative">
        <h3 className="text-[17px] font-bold tracking-[-0.015em] text-black">
          Why we&apos;re structured this way
        </h3>
        <p className="mt-2 text-[14px] leading-[1.65] text-gray-700 max-w-[680px]">
          We don&apos;t want builders paying to be discoverable — that incentive corrupts the network. The
          builder side is free, and will stay free. Revenue comes from teams that hire on real shipping
          signal, which is exactly the audience builders want to be in front of.
        </p>
      </div>
    </div>
  );
}

function ComparisonGrid() {
  const rows: { feature: string; builder: string; recruiter: string }[] = [
    { feature: "Profile + projects", builder: "Free", recruiter: "View only" },
    { feature: "Scout AI search", builder: "Be searchable", recruiter: "Run queries" },
    { feature: "Antathons", builder: "Join + ship", recruiter: "Sponsor" },
    { feature: "Direct intros", builder: "Receive (with consent)", recruiter: "Send" },
    { feature: "Antry Card auto-import", builder: "Yes", recruiter: "—" },
    { feature: "Invite codes", builder: "5 per profile", recruiter: "Volume" },
  ];
  return (
    <div className="mt-16">
      <div className="text-center mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Comparison</p>
        <h3 className="mt-2 text-[24px] sm:text-[28px] font-bold tracking-[-0.025em] text-black">
          Built for both sides of the table.
        </h3>
      </div>

      <div className="rounded-[20px] overflow-hidden border border-gray-200 bg-white">
        <div
          className="grid grid-cols-[1.4fr_1fr_1fr] text-[12px] font-bold uppercase tracking-[0.14em] text-gray-500 px-5 py-3"
          style={{ background: "#FAFAF7", borderBottom: "1px solid #EBEBEB" }}
        >
          <div>Feature</div>
          <div>Builders</div>
          <div>Recruiters</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.feature}
            className="grid grid-cols-[1.4fr_1fr_1fr] text-[14px] px-5 py-3.5 items-center"
            style={{
              borderBottom: i === rows.length - 1 ? "none" : "1px solid #F5F5F5",
            }}
          >
            <div className="font-semibold text-black">{r.feature}</div>
            <div className="text-gray-600">{r.builder}</div>
            <div className="text-gray-600">{r.recruiter}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
