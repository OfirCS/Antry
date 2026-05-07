import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Github, Twitter, Linkedin, Sparkles, ShieldCheck } from "lucide-react";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { demoReceipts, getDemoReceipt } from "@/lib/receipts/demo-data";
import { LandingHeroAside } from "./_landing/LandingClient";
import { ReceiptReveal } from "./_landing/ReceiptReveal";

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

  return (
    <>
      <Nav />
      <main>
        <Hero receipt={heroReceipt} />
        <TheReceipt fingerprint={heroReceipt.fingerprint} />
        <ForBuilders />
        <ForCompanies />
        <FinalCTA />
        <SiteFooter />
      </main>
    </>
  );
}

/* ─────────────────────────────────────────────
   1. HERO — single artifact, single CTA
   ───────────────────────────────────────────── */
function Hero({ receipt }: { receipt: typeof demoReceipts[number] }) {
  return (
    <section className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 0% 0%, rgba(198,241,53,0.08) 0%, transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-[1240px] px-6 sm:px-10 pt-24 pb-24 sm:pt-32 sm:pb-32 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-16 lg:gap-24 items-center">
        <div>
          <p
            className="text-[11px] font-bold tracking-[0.28em] uppercase mb-7 inline-flex items-center gap-2"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            <span
              className="inline-block w-1 h-1 rounded-full"
              style={{ background: "#C6F135" }}
            />
            Proof of work for AI builders
          </p>

          <h1
            className="font-display font-bold leading-[0.95] tracking-[-0.045em]"
            style={{ color: "#FFFFFF", fontSize: "clamp(3rem, 7.5vw, 5.4rem)" }}
          >
            Show your <span style={{ color: "#C6F135" }}>receipts.</span>
          </h1>

          <p
            className="mt-7 max-w-[480px] text-[18px] leading-[1.55]"
            style={{ color: "rgba(255,255,255,0.66)" }}
          >
            Solve a Brief. Mint a Receipt. Get hired on{" "}
            <span style={{ color: "rgba(255,255,255,0.95)" }}>how you think</span>,
            not what your résumé says.
          </p>

          <div className="mt-10 flex items-center gap-x-6 gap-y-3 flex-wrap">
            <Link
              href="/briefs"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] px-7 h-[56px] text-[15px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
              style={{
                background: "#C6F135",
                color: "#0A0A0A",
                boxShadow: "0 12px 30px rgba(198,241,53,0.32)",
              }}
              data-cta="lime"
            >
              Browse Briefs <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/receipts/methodology"
              className="text-[14px] font-semibold underline-offset-4 hover:underline transition-colors"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              How it works →
            </Link>
          </div>
        </div>

        <LandingHeroAside receipt={receipt} />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   2. THE RECEIPT — what's actually in it
   ───────────────────────────────────────────── */
function TheReceipt({
  fingerprint,
}: {
  fingerprint: typeof demoReceipts[number]["fingerprint"];
}) {
  return (
    <section style={{ background: "#FAFAF7" }} className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1080px] px-6 sm:px-10">
        <div className="max-w-[640px] mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-4">
            What&apos;s in a Receipt
          </p>
          <h2
            className="font-display font-bold tracking-[-0.035em] text-black leading-[0.98]"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}
          >
            Seven dimensions.
            <br />
            <span className="text-gray-400">Signed. Yours.</span>
          </h2>
          <p className="mt-6 text-[16px] leading-[1.6] text-gray-600 max-w-[520px]">
            We instrument every prompt, tool call, and pivot in the Lab.
            What comes out is a Fingerprint — how you actually think under
            constraint.
          </p>
        </div>

        <ReceiptReveal fingerprint={fingerprint} />

        <div className="mt-16 flex items-center gap-x-6 gap-y-2 flex-wrap text-[13px] text-gray-500">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-black" />
            SHA-256 + qualified timestamp
          </span>
          <span className="text-gray-300">·</span>
          <Link
            href="/receipts/methodology"
            className="font-semibold text-black hover:underline underline-offset-4"
          >
            Read the methodology →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   3. FOR BUILDERS — Duolingo voice (playful, big pills)
   ───────────────────────────────────────────── */
function ForBuilders() {
  const steps = [
    { n: 1, t: "Pick a Brief.", d: "Real assignments from Anthropic, Vercel, Resend." },
    { n: 2, t: "Solve it in the Lab.", d: "10 to 90 minutes. Instrumented. No timer panic." },
    { n: 3, t: "Mint your Receipt.", d: "Pin it to your profile. Share it. Embed it." },
  ];
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden" style={{ background: "#FFFFFF" }}>
      {/* Soft lime wash */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(198,241,53,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-[1080px] px-6 sm:px-10">
        <div className="text-center max-w-[640px] mx-auto mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-4 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" style={{ color: "#0A0A0A" }} />
            For builders
          </p>
          <h2
            className="font-display font-bold tracking-[-0.03em] text-black leading-[1.02]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
          >
            Three steps. Under an hour.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-[24px] p-7 sm:p-8 bg-white relative group transition-transform duration-200 hover:-translate-y-1"
              style={{
                border: "1.5px solid #EBEBEB",
                boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-[20px] font-bold font-display mb-5"
                style={{
                  background: "#C6F135",
                  color: "#0A0A0A",
                }}
              >
                {s.n}
              </div>
              <h3 className="text-[18px] font-bold tracking-[-0.015em] text-black leading-[1.3]">
                {s.t}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.55] text-gray-600">
                {s.d}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/briefs"
            className="inline-flex items-center justify-center gap-2 rounded-full px-8 h-[60px] text-[16px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "#0A0A0A",
              color: "#FFFFFF",
              boxShadow: "0 12px 32px rgba(10,10,10,0.18)",
            }}
          >
            Start your first Brief <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-[13px] text-gray-500">Free for builders. Always.</p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. FOR COMPANIES — Wealthsimple voice (calm, generous, single decision)
   ───────────────────────────────────────────── */
function ForCompanies() {
  return (
    <section className="py-24 sm:py-36" style={{ background: "#F4F1EA" }}>
      <div className="mx-auto max-w-[920px] px-6 sm:px-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-6">
          For companies
        </p>

        <h2
          className="font-display font-bold tracking-[-0.04em] text-black leading-[0.98]"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)" }}
        >
          Hire on output.
          <br />
          <span className="text-gray-500">Not résumés.</span>
        </h2>

        <p className="mt-10 max-w-[560px] text-[18px] sm:text-[20px] leading-[1.55] text-gray-700">
          Post a Brief in 60 seconds. We host the Lab. You get Receipts ranked by composite Fingerprint — every score traceable, every signature verifiable.
        </p>

        <div className="mt-14 flex items-center gap-x-6 gap-y-3 flex-wrap">
          <Link
            href="/hackathons/new"
            className="inline-flex items-center justify-center gap-2 rounded-[14px] px-6 h-[56px] text-[15px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
            style={{
              background: "#0A0A0A",
              color: "#FFFFFF",
              boxShadow: "0 8px 24px rgba(10,10,10,0.16)",
            }}
          >
            Run a Vibe Hackathon <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="text-[14px] font-semibold text-black hover:underline underline-offset-4 inline-flex items-center gap-1.5"
          >
            See pricing →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   5. FINAL CTA — minimal closer
   ───────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 text-center" style={{ background: "#0A0A0A" }}>
      <div className="mx-auto max-w-[720px] px-6 sm:px-10">
        <h2
          className="font-display font-bold tracking-[-0.04em] leading-[1]"
          style={{ color: "#FFFFFF", fontSize: "clamp(2rem, 5vw, 3.4rem)" }}
        >
          Show your <span style={{ color: "#C6F135" }}>receipts.</span>
        </h2>
        <div className="mt-10">
          <Link
            href="/briefs"
            className="inline-flex items-center justify-center gap-2 rounded-full px-9 h-[64px] text-[17px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "#C6F135",
              color: "#0A0A0A",
              boxShadow: "0 16px 40px rgba(198,241,53,0.35)",
            }}
            data-cta="lime"
          >
            Browse Briefs <ArrowRight className="w-5 h-5" />
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
        { label: "For companies", href: "/c/start" },
      ],
    },
    {
      title: "Network",
      links: [
        { label: "Discover", href: "/discover" },
        { label: "Builders", href: "/builders" },
        { label: "Hackathons", href: "/hackathons" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Pricing", href: "/pricing" },
        { label: "Press", href: "/press" },
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
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-black hover:bg-gray-50 transition-colors"
    >
      {children}
    </a>
  );
}
