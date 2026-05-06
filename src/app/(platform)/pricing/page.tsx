import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
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
  "Join every Antathon",
  "5 invites per claimed profile",
  "GitHub auto-import (Antry Card)",
  "Project share cards (OG + X intent)",
];

const recruiterFeatures = [
  "Natural-language Scout queries",
  "Side-by-side builder comparisons",
  "Filter by tech stack, build cadence, hackathon performance",
  "Direct intro requests with builder consent",
  "Weekly inbox of matches",
  "Concierge sourcing on enterprise tier",
];

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="bg-white">
        <section className="relative overflow-hidden" style={{ background: "#111111" }}>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(198,241,53,0.12) 0%, transparent 60%)" }}
          />
          <div className="relative mx-auto max-w-[920px] px-6 pt-20 pb-12 sm:px-10 sm:pt-24 sm:pb-16 text-center">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: "#C6F135" }}>
              Pricing
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.03em] text-white">
              Free for builders.
              <br />
              <span style={{ color: "#C6F135" }}>Always will be.</span>
            </h1>
            <p className="mt-6 max-w-[620px] mx-auto text-[16px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              The deal: builders ship and get discovered for free. Teams that want to hire pay to use Scout —
              the AI agent that searches the network in plain English. That&apos;s it.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[1080px] px-6 sm:px-10 -mt-10 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PricingCard
                eyebrow="Builders"
                price="$0"
                cadence="forever"
                title="Build your proof of work"
                description="Showcase shipped projects, join Antathons, and get matched with teams hiring on output."
                features={builderFeatures}
                cta={{ label: "Start building", href: "/signup", primary: true }}
                tone="dark"
              />
              <PricingCard
                eyebrow="Recruiters & teams"
                price="Waitlist"
                cadence="opens Q3"
                title="Find builders by what they ship"
                description="Search the network in plain English. Compare, request intros, hire on real signal."
                features={recruiterFeatures}
                cta={{ label: "Join recruiter waitlist", href: "mailto:[email protected]?subject=Antry%20recruiter%20waitlist", primary: false }}
                tone="light"
              />
            </div>

            <div className="mt-16 rounded-[20px] border border-gray-200 bg-[#FAFAF7] p-6 sm:p-8 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#0A0A0A" }}>
                <Sparkles className="w-4 h-4" style={{ color: "#C6F135" }} />
              </div>
              <div>
                <h3 className="text-[18px] font-bold tracking-tight text-black">Why we&apos;re structured this way</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-gray-600 max-w-[640px]">
                  We don&apos;t want builders paying to be discoverable — that incentive corrupts the network. The
                  builder side is free, and will stay free. Revenue comes from teams that hire on real shipping
                  signal, which is exactly the audience builders want to be in front of.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
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

function PricingCard({
  eyebrow,
  price,
  cadence,
  title,
  description,
  features,
  cta,
  tone,
}: {
  eyebrow: string;
  price: string;
  cadence: string;
  title: string;
  description: string;
  features: string[];
  cta: { label: string; href: string; primary: boolean };
  tone: "dark" | "light";
}) {
  const isDark = tone === "dark";
  return (
    <div
      className="relative rounded-[24px] p-7 sm:p-9 overflow-hidden border"
      style={{
        background: isDark ? "#0A0A0A" : "#ffffff",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#EBEBEB",
        color: isDark ? "#fff" : "#111",
        boxShadow: isDark ? "0 24px 60px -28px rgba(0,0,0,0.4)" : "0 12px 40px -24px rgba(0,0,0,0.08)",
      }}
    >
      {isDark && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 60% at 100% 0%, rgba(198,241,53,0.10) 0%, transparent 60%)" }}
        />
      )}
      <div className="relative">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ color: isDark ? "#C6F135" : "rgba(0,0,0,0.55)" }}
        >
          {eyebrow}
        </p>
        <div className="mt-5 flex items-baseline gap-2">
          <span className="text-[44px] font-bold tracking-tight font-display">{price}</span>
          <span className="text-[14px]" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>
            / {cadence}
          </span>
        </div>
        <h3 className="mt-3 text-[20px] font-bold tracking-tight">{title}</h3>
        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)" }}>
          {description}
        </p>

        <ul className="mt-6 space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-[14px]" style={{ color: isDark ? "rgba(255,255,255,0.85)" : "#111" }}>
              <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: isDark ? "#C6F135" : "#0A0A0A" }} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <Link
          href={cta.href}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-5 h-[48px] text-[14px] font-semibold w-full"
          style={
            cta.primary
              ? { background: "#C6F135", color: "#111" }
              : { background: isDark ? "#fff" : "#0A0A0A", color: isDark ? "#0A0A0A" : "#fff" }
          }
        >
          {cta.label} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
