import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { ClaimCardClient } from "./ClaimCardClient";

const TITLE = "Antry Card — paste a GitHub URL, get a builder profile in 5 seconds";
const DESCRIPTION =
  "Skip the form. Paste a GitHub username and Antry generates a draft builder profile from your shipped projects, scored and ready to claim in one click.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/claim-card" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/claim-card",
    image: ogImageUrl({
      title: "Paste a GitHub URL.",
      subtitle: "Get a ranked builder profile in 5 seconds. Claim it in one click.",
      eyebrow: "Antry Card",
      variant: "default",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

export default function ClaimCardPage() {
  return (
    <>
      <Nav />
      <main>
        <ClaimCardHero />

        <section className="bg-white">
          <div className="mx-auto max-w-[920px] px-6 sm:px-10 -mt-16 pb-20 sm:pb-28 relative z-10">
            <ClaimCardClient />
          </div>
        </section>

        <HowItWorks />
      </main>
    </>
  );
}

function ClaimCardHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#0A0A0A" }}
    >
      {/* Lime ambient glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(198,241,53,0.18) 0%, transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 35% 40% at 12% 90%, rgba(198,241,53,0.10) 0%, transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 25% 30% at 88% 80%, rgba(198,241,53,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <DecorDots />

      <div className="relative mx-auto max-w-[920px] px-6 pt-24 pb-28 sm:px-10 sm:pt-28 sm:pb-32 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-7 backdrop-blur-sm"
          style={{
            background: "rgba(198,241,53,0.12)",
            border: "1px solid rgba(198,241,53,0.28)",
          }}
        >
          <span
            className="relative flex h-1.5 w-1.5"
            aria-hidden="true"
          >
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: "#C6F135", opacity: 0.7 }}
            />
            <span className="relative w-1.5 h-1.5 rounded-full" style={{ background: "#C6F135" }} />
          </span>
          <span
            className="text-[11px] font-bold tracking-[0.18em] uppercase"
            style={{ color: "#C6F135" }}
          >
            Antry Card · Beta
          </span>
        </div>

        <h1
          className="font-display text-[clamp(2.4rem,5.5vw,4rem)] font-bold leading-[1.02] tracking-[-0.035em] max-w-[820px] mx-auto"
          style={{ color: "#FFFFFF" }}
        >
          Paste a GitHub URL.
          <br />
          <span style={{ color: "#C6F135" }}>Get a builder profile in 5 seconds.</span>
        </h1>

        <p
          className="mt-7 max-w-[580px] mx-auto text-[16px] sm:text-[17px] leading-[1.6]"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          We scan public repos, score them on shipped-quality signals, and draft an Antry profile from
          your real work. <span style={{ color: "rgba(255,255,255,0.85)" }}>No form. No resume.</span>{" "}
          Claim it in one click.
        </p>

        {/* Stats row */}
        <div className="mt-10 flex items-center justify-center gap-x-8 gap-y-3 flex-wrap text-[12px] font-medium">
          {[
            { label: "Avg. generation", value: "4.2s" },
            { label: "Quality signals", value: "7" },
            { label: "Profile completeness", value: "92%" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              {i > 0 && (
                <span className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
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

function DecorDots() {
  const dots = [
    { x: "8%", y: "22%", size: 5, color: "rgba(198,241,53,0.5)" },
    { x: "92%", y: "18%", size: 4, color: "rgba(198,241,53,0.4)" },
    { x: "15%", y: "70%", size: 6, color: "rgba(198,241,53,0.35)" },
    { x: "85%", y: "65%", size: 5, color: "rgba(198,241,53,0.45)" },
    { x: "6%", y: "45%", size: 3, color: "rgba(255,255,255,0.18)" },
    { x: "94%", y: "40%", size: 3, color: "rgba(255,255,255,0.15)" },
    { x: "22%", y: "85%", size: 4, color: "rgba(198,241,53,0.25)" },
    { x: "78%", y: "82%", size: 4, color: "rgba(198,241,53,0.3)" },
  ];

  return (
    <>
      {dots.map((d, i) => (
        <span
          key={i}
          className="pointer-events-none absolute rounded-full animate-float"
          style={{
            left: d.x,
            top: d.y,
            width: d.size,
            height: d.size,
            background: d.color,
            animationDelay: `${(i * 0.7) % 4}s`,
            animationDuration: `${4 + (i % 3)}s`,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Paste a GitHub URL",
      desc: "Drop a username (yours or a friend's). We pull public repos — pinned and recently-pushed.",
      bg: "bg-bg-sage",
    },
    {
      num: "02",
      title: "We score every project",
      desc: "Shipping signals: live demo, README depth, commit cadence, language signals, and stars.",
      bg: "bg-bg-lavender",
    },
    {
      num: "03",
      title: "Claim in one click",
      desc: "If it's your profile, click claim — we import the top 6 projects under your Antry account.",
      bg: "bg-bg-sky",
    },
  ];

  return (
    <section style={{ background: "#FAFAF7" }}>
      <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-24 sm:py-28">
        <div className="text-center mb-14 sm:mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-4">
            How it works
          </p>
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.025em] text-black max-w-[640px] mx-auto leading-[1.1]">
            Your work is the profile.
          </h2>
          <p className="mt-4 max-w-[480px] mx-auto text-[15px] leading-relaxed text-gray-500">
            No resume to fill out. No skills self-report. Just real shipped projects, scored on signals
            that matter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((s) => (
            <article
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
              <div
                className="mt-5 h-[2px] rounded-full origin-left"
                style={{
                  background: "linear-gradient(90deg, #C6F135 0%, transparent 100%)",
                  width: "32px",
                }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
