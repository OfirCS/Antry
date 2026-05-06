import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { demoBriefs } from "@/lib/receipts/demo-data";
import { BriefCard } from "@/components/BriefCard";

const TITLE = "Briefs — Antry";
const DESCRIPTION =
  "Real AI engineering missions from real companies. Solve in the instrumented Lab, mint a Receipt that proves how you think.";

export const metadata: Metadata = {
  title: "Briefs",
  description: DESCRIPTION,
  alternates: { canonical: "/briefs" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/briefs",
    image: ogImageUrl({
      title: "Show your receipts.",
      subtitle: "AI engineering Briefs from companies hiring on output, not résumés.",
      eyebrow: "Antry Briefs",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

export default function BriefsPage() {
  const briefs = demoBriefs;
  return (
    <>
      <Nav />
      <main>
        <BriefsHero />

        <section className="bg-white">
          <div className="mx-auto max-w-[1080px] px-6 sm:px-10 -mt-20 sm:-mt-24 pb-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {briefs.map((b, i) => (
                <BriefCard key={b.id} brief={b} index={i} />
              ))}
            </div>

            <HowItWorks />
          </div>
        </section>
      </main>
    </>
  );
}

function BriefsHero() {
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
      <div className="relative mx-auto max-w-[920px] px-6 pt-24 pb-32 sm:px-10 sm:pt-28 sm:pb-36 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-7 backdrop-blur-sm"
          style={{
            background: "rgba(198,241,53,0.12)",
            border: "1px solid rgba(198,241,53,0.28)",
          }}
        >
          <Sparkles className="w-3 h-3" style={{ color: "#C6F135" }} />
          <span
            className="text-[11px] font-bold tracking-[0.18em] uppercase"
            style={{ color: "#C6F135" }}
          >
            Antry Receipts · Beta
          </span>
        </div>
        <h1
          className="font-display text-[clamp(2.4rem,5.5vw,3.8rem)] font-bold leading-[1.02] tracking-[-0.035em] max-w-[820px] mx-auto"
          style={{ color: "#FFFFFF" }}
        >
          Anyone can prompt their way to an answer.
          <br />
          <span style={{ color: "#C6F135" }}>Antry shows how.</span>
        </h1>
        <p
          className="mt-7 max-w-[640px] mx-auto text-[16px] sm:text-[17px] leading-[1.6]"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          Companies post AI engineering Briefs. Builders solve them in the instrumented Lab. Antry
          mints an immutable Receipt that captures not just <em>what</em> shipped, but <em>how</em>{" "}
          you got there — token economy, tool taste, recovery, and judgment.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-8 gap-y-3 flex-wrap text-[12px] font-medium">
          {[
            { label: "Briefs live", value: demoBriefs.length.toString() },
            { label: "Average attempt", value: "32m" },
            { label: "Dimensions measured", value: "7" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              {i > 0 && (
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                />
              )}
              <span
                className="tabular-nums font-bold tracking-tight"
                style={{ color: "#FFFFFF" }}
              >
                {s.value}
              </span>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Pick a Brief",
      desc: "Each Brief is authored by a real company with a real rubric. Filter by difficulty, category, or sponsor.",
      bg: "bg-bg-sage",
    },
    {
      num: "02",
      title: "Solve in the Lab",
      desc: "An instrumented sandbox. Every token, tool call, and pivot is logged through Antry's gateway.",
      bg: "bg-bg-lavender",
    },
    {
      num: "03",
      title: "Mint your Receipt",
      desc: "A 7-dimension Builder Fingerprint. Pinned to your profile, signed, verifiable. Companies see who shipped, and how.",
      bg: "bg-bg-sky",
    },
  ];
  return (
    <section className="mt-24">
      <div className="text-center mb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">
          How it works
        </p>
        <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.025em] text-black max-w-[640px] mx-auto leading-[1.1]">
          Show your receipts.
        </h2>
        <p className="mt-4 max-w-[520px] mx-auto text-[15px] leading-relaxed text-gray-500">
          GitHub showed proof of code. CV showed proof of credentials. Antry shows proof of
          judgment.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {steps.map((s) => (
          <div
            key={s.num}
            className={`${s.bg} rounded-[20px] p-7 sm:p-8 transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)]`}
          >
            <span
              className="text-[52px] font-bold tracking-tighter leading-none font-display"
              style={{ color: "rgba(17,17,17,0.10)" }}
            >
              {s.num}
            </span>
            <h3 className="text-[17px] font-bold mt-3 mb-2 tracking-tight text-black">
              {s.title}
            </h3>
            <p className="text-[14px] leading-relaxed text-gray-700">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/receipts/methodology"
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-black hover:underline underline-offset-4"
        >
          Read the full methodology <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
