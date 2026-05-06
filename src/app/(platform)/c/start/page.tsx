import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Mail, Sparkles } from "lucide-react";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { StartSignupForm } from "./StartSignupForm";

const TITLE = "Start your Antry workspace";
const DESCRIPTION =
  "Pick a tier, claim your slug, post your first Brief in 60 seconds. Builders mint Receipts free; you only pay when one surfaces a hire-worthy human.";

export const metadata: Metadata = {
  title: "Start your workspace",
  description: DESCRIPTION,
  alternates: { canonical: "/c/start" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/c/start",
    image: ogImageUrl({
      title: "Start your Antry workspace.",
      subtitle: "Post your first Brief in 60 seconds.",
      eyebrow: "Antry · For companies",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
  robots: { index: false, follow: true },
};

const PLAN_PRESETS = {
  solo: { name: "Solo", price: "$99/mo", features: ["1 Brief", "10 Receipt seats"] },
  growth: {
    name: "Growth",
    price: "$499/mo",
    features: ["4 Briefs", "50 Receipt seats", "Private mode", "API access"],
    highlight: true,
  },
  enterprise: {
    name: "Enterprise",
    price: "$2,499/mo",
    features: ["Unlimited Briefs", "250 seats", "SSO + DPA", "Dedicated success"],
  },
  payg: {
    name: "Pay-as-you-go",
    price: "$15/seat",
    features: ["5-seat minimum", "30-day retention", "Public Briefs only"],
  },
} as const;

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const sp = await searchParams;
  const planKey = (sp.plan ?? "growth") as keyof typeof PLAN_PRESETS;
  const plan = PLAN_PRESETS[planKey] ?? PLAN_PRESETS.growth;

  return (
    <>
      <Nav />
      <main>
        <Hero plan={plan} planKey={planKey} />
        <section className="bg-white">
          <div className="mx-auto max-w-[920px] px-6 sm:px-10 -mt-20 sm:-mt-24 pb-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
              <StartSignupForm planKey={planKey} />
              <PlanRecap plan={plan} planKey={planKey} />
            </div>
            <ContactRow />
          </div>
        </section>
      </main>
    </>
  );
}

type PlanPreset = (typeof PLAN_PRESETS)[keyof typeof PLAN_PRESETS];

function Hero({ plan, planKey }: { plan: PlanPreset; planKey: string }) {
  return (
    <section className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(198,241,53,0.16) 0%, transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-[920px] px-6 sm:px-10 pt-20 pb-32 sm:pt-24 sm:pb-36">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.22em] mb-6 hover:opacity-80 transition-opacity"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to pricing
        </Link>
        <p
          className="text-[11px] font-bold tracking-[0.22em] uppercase mb-3"
          style={{ color: "#C6F135" }}
        >
          Start · {plan.name} · {plan.price}
        </p>
        <h1
          className="font-display font-bold leading-[1.02] tracking-[-0.04em]"
          style={{ color: "#FFFFFF", fontSize: "clamp(2.4rem, 5.5vw, 3.8rem)" }}
        >
          Three steps.{" "}
          <span style={{ color: "#C6F135" }}>Live in 60 seconds.</span>
        </h1>
        <p
          className="mt-6 max-w-[560px] text-[16px] leading-[1.6]"
          style={{ color: "rgba(255,255,255,0.66)" }}
        >
          Claim your workspace slug, pick a Brief template, drop in a rubric
          line. Antry handles the rest — gateway, signing, telemetry, ranking.
          You can keep editing later.
        </p>
        {planKey === "payg" && (
          <p
            className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium"
            style={{
              background: "rgba(198,241,53,0.12)",
              color: "#C6F135",
              border: "1px solid rgba(198,241,53,0.28)",
            }}
          >
            <Sparkles className="w-3 h-3" /> No subscription. 5-seat minimum.
          </p>
        )}
      </div>
    </section>
  );
}

function PlanRecap({ plan, planKey }: { plan: PlanPreset; planKey: string }) {
  return (
    <aside
      className="rounded-[24px] p-7 sm:p-8 sticky top-24"
      style={{ background: "#0A0A0A", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3"
        style={{ color: "#C6F135" }}
      >
        Your plan
      </p>
      <h3 className="text-[20px] font-bold tracking-[-0.015em]">{plan.name}</h3>
      <p
        className="mt-1 text-[26px] font-bold tracking-tight font-display tabular-nums leading-none"
        style={{ color: "#FFFFFF" }}
      >
        {plan.price}
      </p>
      <ul className="mt-6 space-y-3">
        {plan.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2.5 text-[13px] leading-[1.5]"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "rgba(198,241,53,0.16)" }}
            >
              <Check className="w-2.5 h-2.5" style={{ color: "#C6F135" }} strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/pricing"
        className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        Change plan →
      </Link>
      {planKey !== "enterprise" && (
        <p className="mt-6 text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
          You won&apos;t be charged today. We email you to confirm before any
          card is captured.
        </p>
      )}
    </aside>
  );
}

function ContactRow() {
  return (
    <p className="mt-14 text-center text-[13px] text-gray-500">
      Questions? Email{" "}
      <a
        href="mailto:[email protected]"
        className="inline-flex items-center gap-1.5 text-black font-semibold underline underline-offset-4"
      >
        <Mail className="w-3.5 h-3.5" />
        [email protected]
      </a>
    </p>
  );
}
