import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Cpu,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { demoBriefs, demoReceipts } from "@/lib/receipts/demo-data";
import { FingerprintGlyph } from "@/components/BuilderFingerprint";
import { fingerprintTier } from "@/lib/receipts/fingerprint";

const TITLE = "Missions — your inbox";
const DESCRIPTION =
  "Every Brief you can attempt this month. 8 graded missions per builder, free, forever. Pick one, solve it in the Lab, mint a Receipt.";

export const metadata: Metadata = {
  title: "Missions",
  description: DESCRIPTION,
  alternates: { canonical: "/missions" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/missions",
    image: ogImageUrl({
      title: "Your missions.",
      subtitle: "8 graded attempts per month, free forever.",
      eyebrow: "Antry · Missions",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

const MAX_PER_MONTH = 8;

export default function MissionsPage() {
  // Demo state — in production these come from the logged-in user.
  const usedThisMonth = 3;
  const remainingThisMonth = MAX_PER_MONTH - usedThisMonth;
  const myReceipts = demoReceipts.slice(0, 2); // simulate user's completed missions
  const completedBriefIds = new Set(myReceipts.map((r) => r.brief_id));
  const availableBriefs = demoBriefs.filter((b) => !completedBriefIds.has(b.id));

  return (
    <>
      <Nav />
      <main>
        <Hero used={usedThisMonth} remaining={remainingThisMonth} />
        <section className="bg-white">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-10 -mt-20 sm:-mt-24 pb-24 relative z-10">
            {myReceipts.length > 0 && (
              <CompletedSection receipts={myReceipts} />
            )}
            <AvailableSection
              briefs={availableBriefs}
              remaining={remainingThisMonth}
            />
            <ResetCallout />
          </div>
        </section>
      </main>
    </>
  );
}

function Hero({ used, remaining }: { used: number; remaining: number }) {
  return (
    <section className="relative overflow-hidden" style={{ background: "#0A0A0A" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(198,241,53,0.14) 0%, transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-[1240px] px-6 pt-20 pb-32 sm:px-10 sm:pt-24 sm:pb-36">
        <p
          className="text-[11px] font-bold tracking-[0.22em] uppercase mb-4"
          style={{ color: "#C6F135" }}
        >
          Missions · Inbox
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
          <div>
            <h1
              className="font-display font-bold leading-[1.02] tracking-[-0.04em]"
              style={{ color: "#FFFFFF", fontSize: "clamp(2.4rem, 5.5vw, 3.8rem)" }}
            >
              Pick a mission.{" "}
              <span style={{ color: "#C6F135" }}>Mint a Receipt.</span>
            </h1>
            <p
              className="mt-6 max-w-[560px] text-[16px] leading-[1.6]"
              style={{ color: "rgba(255,255,255,0.66)" }}
            >
              Eight graded missions per builder, per month, free forever. Attempts
              that fall below the quality floor stay private — protect your
              fingerprint. Re-attempts allowed once per Brief if your composite
              came in under 60.
            </p>
          </div>

          {/* Quota meter */}
          <div
            className="rounded-[20px] p-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              This month
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className="font-display font-bold tracking-tight tabular-nums leading-none"
                style={{ color: "#FFFFFF", fontSize: "clamp(3rem, 5.5vw, 4rem)" }}
              >
                {remaining}
              </span>
              <span
                className="text-[14px]"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                / {MAX_PER_MONTH} missions left
              </span>
            </div>
            <div
              className="mt-4 grid grid-cols-8 gap-1.5"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={MAX_PER_MONTH}
              aria-valuenow={used}
            >
              {Array.from({ length: MAX_PER_MONTH }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full"
                  style={{
                    background:
                      i < used
                        ? "rgba(255,255,255,0.18)"
                        : "#C6F135",
                  }}
                />
              ))}
            </div>
            <p
              className="mt-3 text-[11px]"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Resets on the 1st. Unused missions don&apos;t carry over.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompletedSection({ receipts }: { receipts: typeof demoReceipts }) {
  return (
    <div className="mb-16">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
            Your minted Receipts
          </p>
          <h2
            className="font-display font-bold tracking-[-0.025em] text-black leading-[1.08]"
            style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.1rem)" }}
          >
            What you&apos;ve already shipped.
          </h2>
        </div>
        <Link
          href="/builders/mara-chen"
          className="text-[14px] font-semibold text-black hover:underline underline-offset-4 inline-flex items-center gap-1.5"
        >
          See on profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {receipts.map((r) => {
          const tier = fingerprintTier(r.composite_score);
          return (
            <Link
              key={r.id}
              href={`/receipts/${r.id}`}
              className="group rounded-[20px] bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                border: "1px solid #EBEBEB",
                boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
              }}
            >
              <div className="h-1.5" style={{ background: r.company.sponsor_color }} />
              <div className="p-5 grid grid-cols-[1fr_auto] gap-4 items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded"
                      style={{ background: tier.bg, color: tier.color }}
                    >
                      {tier.label}
                    </span>
                    <span className="text-[12px] font-bold tabular-nums text-gray-700">
                      {r.composite_score}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-[12px] text-gray-500">
                      {r.company.name}
                    </span>
                  </div>
                  <h3 className="text-[16px] font-bold tracking-[-0.01em] text-black leading-[1.35]">
                    {r.brief_title}
                  </h3>
                  <p className="mt-2 text-[12px] text-gray-500 line-clamp-2">
                    {r.highlights[0]}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {r.tokens_spent.toLocaleString()} tokens
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.round(r.attempt_duration_seconds / 60)}m
                    </span>
                  </div>
                </div>
                <div className="opacity-90">
                  <FingerprintGlyph
                    fingerprint={r.fingerprint}
                    size={84}
                    primaryColor={r.company.sponsor_color}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AvailableSection({
  briefs,
  remaining,
}: {
  briefs: typeof demoBriefs;
  remaining: number;
}) {
  const noQuota = remaining <= 0;
  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
            Available Briefs
          </p>
          <h2
            className="font-display font-bold tracking-[-0.025em] text-black leading-[1.08]"
            style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.1rem)" }}
          >
            Real assignments. Real companies. Real signal.
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
          <div
            key={b.id}
            className="group rounded-[20px] bg-white overflow-hidden transition-all duration-300"
            style={{
              border: "1px solid #EBEBEB",
              boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
              opacity: noQuota ? 0.55 : 1,
            }}
          >
            <div className="h-1.5" style={{ background: b.company.sponsor_color }} />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: b.company.sponsor_color }}
                >
                  {b.sponsor_label}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
                  {b.difficulty}
                </span>
              </div>
              <h3 className="text-[16px] font-bold tracking-[-0.01em] text-black leading-[1.35]">
                {b.title}
              </h3>
              <p className="mt-2 text-[13px] leading-[1.55] text-gray-600 line-clamp-2">
                {b.tagline}
              </p>

              <div className="mt-4 flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
                <span>
                  ≤{(b.token_cap / 1000).toFixed(0)}k tokens
                </span>
                <span>·</span>
                <span>{Math.round(b.time_cap_seconds / 60)}m cap</span>
                <span>·</span>
                <span>{b.attempts_count} attempts</span>
                {b.median_score !== null && (
                  <>
                    <span>·</span>
                    <span>median {b.median_score}</span>
                  </>
                )}
              </div>

              <div className="mt-5 flex items-center gap-2">
                <Link
                  href={`/briefs/${b.slug}`}
                  className="text-[12px] font-semibold text-gray-600 hover:text-black"
                >
                  View Brief
                </Link>
                <span className="text-gray-300">·</span>
                <Link
                  href={noQuota ? "#" : `/briefs/${b.slug}/lab`}
                  aria-disabled={noQuota}
                  className="ml-auto inline-flex items-center justify-center gap-2 rounded-[12px] px-4 h-[40px] text-[12px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
                  style={{
                    background: noQuota ? "#F5F5F5" : "#C6F135",
                    color: noQuota ? "#A3A3A3" : "#0A0A0A",
                    boxShadow: noQuota ? "none" : "0 6px 18px rgba(198,241,53,0.30)",
                    pointerEvents: noQuota ? "none" : "auto",
                  }}
                >
                  {noQuota ? "Quota used" : "Enter the Lab"}
                  {!noQuota && <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResetCallout() {
  const now = new Date();
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilReset = Math.ceil(
    (nextReset.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
  );
  return (
    <div className="mt-16 rounded-[20px] p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-4 items-center"
         style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "#0A0A0A" }}
      >
        <Sparkles className="w-4 h-4" style={{ color: "#C6F135" }} />
      </div>
      <div>
        <h3 className="text-[15px] font-bold tracking-[-0.01em] text-black">
          Quota resets in {daysUntilReset} {daysUntilReset === 1 ? "day" : "days"}.
        </h3>
        <p className="mt-1 text-[13px] text-gray-600">
          Each builder gets 8 graded missions per month, free forever. Save your
          best for the Briefs that match your stack.
        </p>
      </div>
      <Link
        href="/receipts/methodology"
        className="text-[13px] font-semibold text-black hover:underline underline-offset-4 inline-flex items-center gap-1.5"
      >
        How scoring works <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// Suppress unused imports
export { CheckCircle2 };
