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
      <main className="bg-white">
        <section className="relative overflow-hidden" style={{ background: "#111111" }}>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(198,241,53,0.14) 0%, transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-[920px] px-6 pt-20 pb-12 sm:px-10 sm:pt-24 sm:pb-16 text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-5"
              style={{ background: "rgba(198,241,53,0.12)", border: "1px solid rgba(198,241,53,0.25)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#C6F135" }} />
              <span className="text-[12px] font-semibold tracking-wide" style={{ color: "#C6F135" }}>
                Antry Card · Beta
              </span>
            </div>
            <h1
              className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.03em]"
              style={{ color: "#FFFFFF" }}
            >
              Paste a GitHub URL.
              <br />
              <span style={{ color: "#C6F135" }}>Get a builder profile in 5 seconds.</span>
            </h1>
            <p className="mt-6 max-w-[560px] mx-auto text-[16px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              We scan public repos, score them on shipped-quality signals, and draft an Antry profile from
              your real work. No form. No resume. Claim it in one click.
            </p>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-[920px] px-6 sm:px-10 -mt-10 pb-24 sm:pb-32">
            <ClaimCardClient />
          </div>
        </section>

        <section style={{ background: "#FAFAF7" }}>
          <div className="mx-auto max-w-[920px] px-6 sm:px-10 py-20 sm:py-24">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3 text-center">How it works</p>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.4rem)] font-bold tracking-[-0.02em] text-black text-center max-w-[640px] mx-auto">
              Your work is the profile.
            </h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  num: "01",
                  title: "Paste a GitHub URL",
                  desc: "Drop a username (yours or a friend's). We pull public repos — pinned and recently-pushed.",
                },
                {
                  num: "02",
                  title: "We score every project",
                  desc: "Shipping signals: live demo, README depth, commit cadence, language signals, and stars.",
                },
                {
                  num: "03",
                  title: "Claim in one click",
                  desc: "If it's your profile, click claim — we import the top 6 projects under your Antry account.",
                },
              ].map((s) => (
                <div key={s.num} className="rounded-[20px] p-6 bg-white border border-gray-100">
                  <span className="text-[44px] font-bold tracking-tighter leading-none font-display" style={{ color: "rgba(17,17,17,0.10)" }}>
                    {s.num}
                  </span>
                  <h3 className="text-lg font-bold mt-3 mb-2 tracking-tight text-black">{s.title}</h3>
                  <p className="text-[14px] leading-relaxed text-gray-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
