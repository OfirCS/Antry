import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Cpu,
  Clock,
  Sparkles,
  MessageSquare,
  Filter,
  Leaf,
  Code2,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { demoCompanies, demoBriefs, demoReceipts } from "@/lib/receipts/demo-data";
import { FingerprintGlyph } from "@/components/BuilderFingerprint";
import { fingerprintTier, ALL_DIMENSIONS } from "@/lib/receipts/fingerprint";
import { DIMENSION_SHORT } from "@/lib/receipts/types";
import {
  formatEnergy,
  formatCo2,
  formatCost,
} from "@/lib/receipts/compute-footprint";

export async function generateStaticParams() {
  return Object.values(demoCompanies).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = Object.values(demoCompanies).find((c) => c.slug === slug);
  if (!company) {
    return { title: "Candidates — not found", robots: { index: false, follow: true } };
  }
  const path = `/c/${slug}/candidates`;
  const title = `Candidates · ${company.name}`;
  const description = `Ranked Receipts surfaced to ${company.name} — by composite score, energy efficiency, and tool taste.`;
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: false, follow: false },
    openGraph: defaultOpenGraph({
      title,
      description,
      path,
      image: ogImageUrl({
        title: `Candidates · ${company.name}`,
        subtitle: "Hire on Receipts.",
        eyebrow: "Antry · Workspace",
      }),
    }),
    twitter: defaultTwitter({ title, description }),
  };
}

export default async function CandidatesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = Object.values(demoCompanies).find((c) => c.slug === slug);
  if (!company) notFound();

  // All Receipts surfaced to this company (demo: anything against their Briefs).
  const companyBriefIds = demoBriefs
    .filter((b) => b.company.slug === slug)
    .map((b) => b.id);
  const candidates = demoReceipts
    .filter((r) => companyBriefIds.includes(r.brief_id))
    .sort((a, b) => b.composite_score - a.composite_score);

  // Quota state (demo)
  const quotaRemaining = 47;
  const quotaTotal = 50;

  return (
    <>
      <Nav />
      <main>
        <Hero
          company={company}
          quotaRemaining={quotaRemaining}
          quotaTotal={quotaTotal}
          candidateCount={candidates.length}
        />
        <section className="bg-white">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-10 -mt-20 sm:-mt-24 pb-24 relative z-10">
            <FilterBar />
            <CandidateTable candidates={candidates} sponsorColor={company.sponsor_color} />
            <Empty count={candidates.length} />
          </div>
        </section>
      </main>
    </>
  );
}

function Hero({
  company,
  quotaRemaining,
  quotaTotal,
  candidateCount,
}: {
  company: { slug: string; name: string; sponsor_color: string };
  quotaRemaining: number;
  quotaTotal: number;
  candidateCount: number;
}) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#0A0A0A" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% -10%, ${company.sponsor_color}26 0%, transparent 55%)`,
        }}
      />
      <div className="relative mx-auto max-w-[1240px] px-6 pt-20 pb-32 sm:px-10 sm:pt-24 sm:pb-36">
        <Link
          href={`/c/${company.slug}`}
          className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] mb-6 hover:opacity-80 transition-opacity"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {company.name} workspace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em] mb-3"
              style={{ color: company.sponsor_color }}
            >
              Candidates · ranked by composite
            </p>
            <h1
              className="font-display font-bold leading-[1.02] tracking-[-0.04em]"
              style={{ color: "#FFFFFF", fontSize: "clamp(2.4rem, 5.5vw, 3.6rem)" }}
            >
              {candidateCount} Receipts.{" "}
              <span style={{ color: company.sponsor_color }}>
                Show me how they think.
              </span>
            </h1>
            <p
              className="mt-6 max-w-[560px] text-[16px] leading-[1.6]"
              style={{ color: "rgba(255,255,255,0.66)" }}
            >
              Each row is a real builder who attempted one of your Briefs.
              Ranked by composite Fingerprint with the bottom-quartile rule.
              Filter by dimension. Open one to see the full trace.
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
              Receipt seats this month
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className="font-display font-bold tracking-tight tabular-nums leading-none"
                style={{
                  color: "#FFFFFF",
                  fontSize: "clamp(3rem, 5.5vw, 4rem)",
                }}
              >
                {quotaRemaining}
              </span>
              <span
                className="text-[14px]"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                / {quotaTotal} remaining
              </span>
            </div>
            <div
              className="mt-4 h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(quotaRemaining / quotaTotal) * 100}%`,
                  background: company.sponsor_color,
                }}
              />
            </div>
            <p
              className="mt-3 text-[11px]"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Growth tier · resets monthly · seats consume on first open.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterBar() {
  return (
    <div
      className="rounded-[16px] p-4 mb-6 flex items-center gap-3 flex-wrap"
      style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
    >
      <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-gray-500 pl-2 pr-3">
        <Filter className="w-3.5 h-3.5" />
        Filter
      </span>
      <Pill label="All Briefs" active />
      <Pill label="Senior+" />
      <Pill label="Composite ≥ 80" />
      <Pill label="Top quartile" />
      <span className="text-gray-300">·</span>
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 pl-1">
        Sort
      </span>
      <Pill label="Composite ↓" active />
      <Pill label="Token economy ↓" />
      <Pill label="Most recent" />
    </div>
  );
}

function Pill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className="inline-flex items-center text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer"
      style={{
        background: active ? "#0A0A0A" : "#FFFFFF",
        color: active ? "#C6F135" : "#525252",
        border: active ? "1px solid #0A0A0A" : "1px solid #EBEBEB",
      }}
    >
      {label}
    </span>
  );
}

function CandidateTable({
  candidates,
  sponsorColor,
}: {
  candidates: typeof demoReceipts;
  sponsorColor: string;
}) {
  if (candidates.length === 0) return null;

  return (
    <div className="rounded-[20px] overflow-hidden bg-white" style={{ border: "1px solid #EBEBEB" }}>
      {/* Header */}
      <div
        className="grid grid-cols-[1.6fr_auto_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500"
        style={{ background: "#FAFAF7", borderBottom: "1px solid #EBEBEB" }}
      >
        <div>Builder</div>
        <div>Score</div>
        <div>Fingerprint</div>
        <div>Compute</div>
        <div>Tokens · Time</div>
        <div className="text-right pr-2">Action</div>
      </div>

      {candidates.map((r, i) => {
        const tier = fingerprintTier(r.composite_score);
        const fp = r.compute_footprint;
        return (
          <div
            key={r.id}
            className="grid grid-cols-[1.6fr_auto_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-[#FAFAF7] transition-colors"
            style={{
              borderBottom: i === candidates.length - 1 ? "none" : "1px solid #F5F5F5",
            }}
          >
            {/* Builder */}
            <Link href={`/builders/${r.builder.username}`} className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 font-display"
                style={{ background: r.builder.gradient }}
              >
                {r.builder.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold tracking-[-0.01em] text-black truncate">
                  {r.builder.name}
                </p>
                <p className="text-[12px] text-gray-500 truncate">
                  {r.brief_title}
                </p>
              </div>
            </Link>

            {/* Score */}
            <div className="text-center">
              <div
                className="font-display font-bold tabular-nums leading-none"
                style={{ color: "#0A0A0A", fontSize: "clamp(1.4rem, 2vw, 1.8rem)" }}
              >
                {r.composite_score}
              </div>
              <span
                className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded inline-block"
                style={{ background: tier.bg, color: tier.color }}
              >
                {tier.label}
              </span>
            </div>

            {/* Fingerprint glyph */}
            <div className="hidden md:flex justify-start">
              <FingerprintGlyph
                fingerprint={r.fingerprint}
                size={64}
                primaryColor={sponsorColor}
              />
            </div>

            {/* Compute */}
            <div className="text-[12px] text-gray-600 leading-[1.55] hidden md:block">
              {fp ? (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <Leaf className="w-3 h-3 text-green-600" />
                    {formatCo2(fp.co2_grams)}
                  </span>
                  <br />
                  <span className="inline-flex items-center gap-1.5">
                    <Code2 className="w-3 h-3 text-violet-500" />
                    {fp.lines_of_code} LOC
                  </span>
                </>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>

            {/* Tokens / time */}
            <div className="text-[12px] text-gray-600 leading-[1.55]">
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Cpu className="w-3 h-3" />
                {r.tokens_spent.toLocaleString()}
              </span>
              <br />
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Clock className="w-3 h-3" />
                {Math.round(r.attempt_duration_seconds / 60)}m
              </span>
            </div>

            {/* Action */}
            <div className="flex items-center gap-2 justify-end">
              <Link
                href={`/receipts/${r.id}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-9 text-[12px] font-semibold transition-colors"
                style={{
                  background: "#FFFFFF",
                  color: "#0A0A0A",
                  border: "1px solid #EBEBEB",
                }}
              >
                Open
                <ArrowRight className="w-3 h-3" />
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-9 text-[12px] font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  background: "#0A0A0A",
                  color: "#FFFFFF",
                }}
                title="Send an intro request to this builder"
              >
                <MessageSquare className="w-3 h-3" />
                Intro
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Empty({ count }: { count: number }) {
  if (count > 0) return null;
  return (
    <div
      className="rounded-[20px] p-12 text-center"
      style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
    >
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5"
        style={{ background: "#0A0A0A" }}
      >
        <Sparkles className="w-5 h-5" style={{ color: "#C6F135" }} />
      </div>
      <h3 className="text-[18px] font-bold tracking-[-0.015em] text-black">
        No Receipts surfaced yet.
      </h3>
      <p className="mt-2 text-[14px] text-gray-600 max-w-[460px] mx-auto leading-[1.6]">
        Once builders attempt your Briefs, their Receipts appear here ranked
        by composite Fingerprint. Open one to see the full trace.
      </p>
    </div>
  );
}

// Suppress unused imports
export { ALL_DIMENSIONS, DIMENSION_SHORT, formatEnergy, formatCost };
