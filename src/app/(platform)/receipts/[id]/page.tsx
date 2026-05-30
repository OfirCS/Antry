import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  Hash,
  KeyRound,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { BuilderFingerprint } from "@/components/BuilderFingerprint";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import {
  getDemoReceipt,
  getDemoBrief,
  demoReceipts,
} from "@/lib/receipts/demo-data";
import {
  fingerprintTier,
  ALL_DIMENSIONS,
} from "@/lib/receipts/fingerprint";
import {
  DIMENSION_LABELS,
  DIMENSION_BLURB,
  type FingerprintDimension,
} from "@/lib/receipts/types";
import { ShareActions } from "./ShareActions";
import { EmbedBadge } from "./EmbedBadge";

// Page background — light editorial.
const PAGE_BG = "#FAFAF7";
const CARD_BG = "#FFFFFF";
const HAIRLINE = "#EBEBEB";
const INK = "#0A0A0A";

export async function generateStaticParams() {
  return demoReceipts.map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const r = getDemoReceipt(id);
  if (!r)
    return {
      title: "Receipt not found",
      robots: { index: false, follow: true },
    };
  const path = `/receipts/${id}`;
  const tier = fingerprintTier(r.composite_score);
  const title = `${r.builder.name}'s Receipt · ${r.brief_title}`;
  const description = `${tier.label} · composite ${r.composite_score} · ${r.tokens_spent.toLocaleString()} tokens · sponsored by ${r.company.name}.`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: defaultOpenGraph({
      title,
      description,
      path,
      image: ogImageUrl({
        title: `${r.builder.name} · ${r.composite_score}`,
        subtitle: `${r.brief_title} — ${r.company.name} Brief · ${tier.label}`,
        eyebrow: "Antry Receipt",
      }),
    }),
    twitter: defaultTwitter({ title, description }),
  };
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = getDemoReceipt(id);
  if (!r) notFound();
  const brief = getDemoBrief(r.brief_slug);
  const tier = fingerprintTier(r.composite_score);
  const signedAt = new Date(r.signed_at);
  const sponsor = r.company.sponsor_color;

  // Pick the highest-scoring dimension as the inline "what this Receipt
  // proves" sentence. Recruiters get a one-line read of the standout signal.
  const topDim = ALL_DIMENSIONS.reduce<FingerprintDimension>(
    (best, d) => (r.fingerprint[d] > r.fingerprint[best] ? d : best),
    ALL_DIMENSIONS[0],
  );
  const topProofLine = proofLineFor(topDim, r.fingerprint[topDim]);

  return (
    <>
      <Nav />
      <main style={{ background: PAGE_BG }} className="min-h-screen">
        {/* 3px sponsor accent stripe pinned to the top of the credential. */}
        <div
          className="h-[3px] w-full print:hidden"
          style={{ background: sponsor }}
          aria-hidden
        />

        <div className="mx-auto max-w-[1120px] px-6 sm:px-10 pt-8 sm:pt-12 pb-24">
          {/* Breadcrumb row */}
          <div className="flex items-center justify-between gap-3 mb-8 flex-wrap print:hidden">
            <Link
              href="/briefs"
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Briefs
            </Link>
            <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">
              Antry Receipt · {signedAt.toLocaleDateString()}
            </p>
          </div>

          {/* HEADER */}
          <ReceiptHeader
            r={r}
            tier={tier}
            sponsor={sponsor}
          />

          {/* BODY: 2-col on desktop, stacks on mobile */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
            {/* MAIN COLUMN */}
            <div className="space-y-10 min-w-0">
              {/* Fingerprint card */}
              <section
                className="rounded-[20px] overflow-hidden"
                style={{ background: CARD_BG, border: `1px solid ${HAIRLINE}` }}
              >
                <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-2 text-center">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2"
                    style={{ color: "#737373" }}
                  >
                    Builder Fingerprint
                  </p>
                  <h2
                    className="font-display font-bold tracking-[-0.025em]"
                    style={{
                      color: INK,
                      fontSize: "clamp(1.4rem, 2.5vw, 1.75rem)",
                      lineHeight: 1.15,
                    }}
                  >
                    Seven axes. A passive trace of judgment.
                  </h2>
                  <p
                    className="mt-2 text-[12px]"
                    style={{ color: "#737373" }}
                  >
                    Solid line: this Receipt.{" "}
                    {brief?.ideal_fingerprint && (
                      <>Dashed line: the Brief&apos;s ideal shape.</>
                    )}
                  </p>
                </div>
                <div className="flex items-center justify-center px-6 sm:px-10 pt-4 pb-8">
                  <BuilderFingerprint
                    fingerprint={r.fingerprint}
                    ideal={brief?.ideal_fingerprint}
                    size={380}
                    primaryColor={sponsor}
                    idealColor={INK}
                  />
                </div>

                {/* What this Receipt proves — inline paragraph */}
                <div
                  className="px-6 sm:px-10 py-6 border-t"
                  style={{ borderColor: HAIRLINE, background: PAGE_BG }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2"
                    style={{ color: "#737373" }}
                  >
                    What this Receipt proves
                  </p>
                  <p
                    className="text-[15px] leading-[1.6]"
                    style={{ color: "#262626" }}
                  >
                    {topProofLine}
                    {r.highlights[0] && (
                      <>
                        {" "}
                        <span style={{ color: "#525252" }}>
                          Also: {lowercaseFirst(r.highlights[0])}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </section>

              {/* Embed badge — the portability hook */}
              <EmbedBadge receiptId={r.id} />

              {/* Per-dimension breakdown */}
              <section>
                <div className="flex items-baseline justify-between gap-3 mb-5 flex-wrap">
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1"
                      style={{ color: "#737373" }}
                    >
                      Dimension breakdown
                    </p>
                    <h2
                      className="font-display font-bold tracking-[-0.025em]"
                      style={{
                        color: INK,
                        fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)",
                        lineHeight: 1.1,
                      }}
                    >
                      Each axis, scored.
                    </h2>
                  </div>
                  <Link
                    href="/receipts/methodology"
                    className="text-[12px] font-semibold text-neutral-900 underline underline-offset-4 hover:opacity-70"
                  >
                    How this is computed
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ALL_DIMENSIONS.map((d) => {
                    const score = r.fingerprint[d];
                    const dimTier = fingerprintTier(score);
                    return (
                      <div
                        key={d}
                        className="rounded-[14px] p-4"
                        style={{
                          background: CARD_BG,
                          border: `1px solid ${HAIRLINE}`,
                        }}
                      >
                        <div className="flex items-baseline justify-between gap-3 mb-2">
                          <p
                            className="text-[13px] font-semibold tracking-[-0.005em]"
                            style={{ color: INK }}
                          >
                            {DIMENSION_LABELS[d]}
                          </p>
                          <span
                            className="text-[10px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
                            style={{ background: dimTier.bg, color: dimTier.color }}
                          >
                            {dimTier.label}
                          </span>
                        </div>
                        <div className="flex items-end justify-between gap-3">
                          <p
                            className="text-[28px] font-bold font-display tracking-tight tabular-nums"
                            style={{ color: INK, lineHeight: 1 }}
                          >
                            {score}
                          </p>
                          <div
                            className="flex-1 h-1 rounded-full overflow-hidden mb-1.5"
                            style={{ background: "#F5F5F5" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${score}%`, background: sponsor }}
                            />
                          </div>
                        </div>
                        <p
                          className="mt-2 text-[12px] leading-[1.5]"
                          style={{ color: "#737373" }}
                        >
                          {DIMENSION_BLURB[d]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-5">
              {/* Provenance card */}
              <ProvenanceCard
                receiptId={r.id}
                contentHash={r.content_hash}
                signature={r.signature}
                signedAt={signedAt}
              />

              {/* Brief link */}
              <SidebarLink
                eyebrow="The Brief"
                title={r.brief_title}
                meta={`${r.company.name} · sponsor`}
                href={`/briefs/${r.brief_slug}`}
                icon={<FileText className="w-4 h-4" />}
                accent={sponsor}
              />

              {/* Builder link */}
              <SidebarLink
                eyebrow="Builder"
                title={r.builder.name}
                meta={`@${r.builder.username}`}
                href={`/builders/${r.builder.username}`}
                icon={<UserRound className="w-4 h-4" />}
                accent={sponsor}
              />

              {/* Signed-by gateway badge */}
              <div
                className="rounded-[14px] p-4 print:hidden"
                style={{
                  background: INK,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: "rgba(198,241,53,0.14)" }}
                  >
                    <ShieldCheck
                      className="w-4 h-4"
                      style={{ color: "#C6F135" }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-[9px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      Signed by
                    </p>
                    <p
                      className="mt-0.5 text-[13px] font-bold tracking-[-0.01em]"
                      style={{ color: "#FFFFFF" }}
                    >
                      Anthropic MCP gateway
                    </p>
                    <p
                      className="mt-1 text-[11px] leading-[1.5]"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      Every tool call routed and notarized at mint time.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

function ReceiptHeader({
  r,
  tier,
  sponsor,
}: {
  r: ReturnType<typeof getDemoReceipt> & object;
  tier: { label: string; color: string; bg: string };
  sponsor: string;
}) {
  return (
    <header
      className="rounded-[20px] p-6 sm:p-10 relative overflow-hidden"
      style={{
        background: CARD_BG,
        border: `1px solid ${HAIRLINE}`,
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-10 items-start">
        <div className="min-w-0">
          {/* Sponsor + Brief eyebrow */}
          <p
            className="text-[10px] font-bold uppercase tracking-[0.24em] mb-3"
            style={{ color: sponsor }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
              style={{ background: sponsor }}
            />
            {r.company.name} Brief
          </p>

          {/* Title — builder + brief */}
          <h1
            className="font-display font-bold tracking-[-0.03em] leading-[1.05]"
            style={{
              color: INK,
              fontSize: "clamp(1.7rem, 3.6vw, 2.4rem)",
            }}
          >
            <Link
              href={`/builders/${r.builder.username}`}
              className="hover:opacity-70 transition-opacity"
            >
              {r.builder.name}
            </Link>{" "}
            shipped{" "}
            <span className="text-neutral-500 font-display font-normal italic">
              {r.brief_title}
            </span>
          </h1>

          {/* Anti-Karat positioning aside */}
          <p
            className="mt-3 text-[13px] italic leading-[1.55] max-w-[640px]"
            style={{ color: "#737373" }}
          >
            Not an interview transcript. Not a take-home submission. A signed
            trace of how this builder collaborated with Claude on a real Brief.
          </p>

          {/* Quick stats row */}
          <div className="mt-6 flex items-center gap-5 flex-wrap">
            <StatInline
              icon={<Cpu className="w-3.5 h-3.5" />}
              label="Tokens"
              value={r.tokens_spent.toLocaleString()}
            />
            <Divider />
            <StatInline
              icon={<Clock className="w-3.5 h-3.5" />}
              label="Duration"
              value={`${Math.round(r.attempt_duration_seconds / 60)}m`}
            />
            <Divider />
            <StatInline
              icon={<Sparkles className="w-3.5 h-3.5" />}
              label="Cost"
              value={`$${(r.cost_usd_cents / 100).toFixed(2)}`}
            />
          </div>
        </div>

        {/* Right column: score + share */}
        <div className="flex flex-col items-start lg:items-end gap-4 shrink-0">
          {/* Composite score badge */}
          <div
            className="flex items-baseline gap-2 rounded-[14px] px-5 py-3"
            style={{
              background: PAGE_BG,
              border: `1px solid ${HAIRLINE}`,
            }}
          >
            <span
              className="font-display font-bold tracking-tight tabular-nums"
              style={{
                color: INK,
                fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                lineHeight: 0.95,
              }}
            >
              {r.composite_score}
            </span>
            <div className="flex flex-col">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "#737373" }}
              >
                Composite
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.16em] mt-0.5 px-1.5 py-0.5 rounded self-start"
                style={{ background: tier.bg, color: tier.color }}
              >
                {tier.label}
              </span>
            </div>
          </div>

          {/* Share actions */}
          <ShareActions
            receiptId={r.id}
            builderName={r.builder.name}
            briefTitle={r.brief_title}
            score={r.composite_score}
          />
        </div>
      </div>
    </header>
  );
}

function ProvenanceCard({
  receiptId,
  contentHash,
  signature,
  signedAt,
}: {
  receiptId: string;
  contentHash: string;
  signature?: string;
  signedAt: Date;
}) {
  // Truncate signature for display; full value lives on the verify endpoint.
  const sigDisplay = signature
    ? `${signature.slice(0, 10)}…${signature.slice(-6)}`
    : "computed on verify";
  const hashDisplay =
    contentHash.length > 28
      ? `${contentHash.slice(0, 14)}…${contentHash.slice(-8)}`
      : contentHash;

  return (
    <div
      className="rounded-[14px] p-5"
      style={{
        background: CARD_BG,
        border: `1px solid ${HAIRLINE}`,
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
          style={{ background: PAGE_BG, border: `1px solid ${HAIRLINE}` }}
        >
          <ShieldCheck className="w-4 h-4" style={{ color: INK }} />
        </div>
        <div className="min-w-0">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "#737373" }}
          >
            Provenance
          </p>
          <p
            className="mt-0.5 text-[13px] font-bold tracking-[-0.01em]"
            style={{ color: INK }}
          >
            SHA-256 + HMAC chain
          </p>
        </div>
      </div>

      <div className="space-y-3 text-[11px]">
        <ProvenanceRow
          icon={<Hash className="w-3 h-3" />}
          label="Content hash"
          value={hashDisplay}
          full={contentHash}
          mono
        />
        <ProvenanceRow
          icon={<KeyRound className="w-3 h-3" />}
          label="Signature"
          value={sigDisplay}
          full={signature ?? ""}
          mono
        />
        <ProvenanceRow
          icon={<Clock className="w-3 h-3" />}
          label="Signed at"
          value={`${signedAt.toISOString().slice(0, 19).replace("T", " ")} UTC`}
        />
      </div>

      <Link
        href={`/api/v1/receipts/${receiptId}/verify`}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] h-[38px] text-[12px] font-semibold transition-opacity hover:opacity-90 print:hidden"
        style={{ background: INK, color: "#FFFFFF" }}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Verify
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function ProvenanceRow({
  icon,
  label,
  value,
  full,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  full?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p
        className="text-[9px] font-bold uppercase tracking-[0.2em] inline-flex items-center gap-1"
        style={{ color: "#A3A3A3" }}
      >
        {icon}
        {label}
      </p>
      <p
        className={`mt-0.5 truncate ${mono ? "font-mono" : ""}`}
        style={{ color: "#404040" }}
        title={full || value}
      >
        {value}
      </p>
    </div>
  );
}

function SidebarLink({
  eyebrow,
  title,
  meta,
  href,
  icon,
  accent,
}: {
  eyebrow: string;
  title: string;
  meta: string;
  href: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-[14px] p-4 transition-all hover:-translate-y-0.5"
      style={{ background: CARD_BG, border: `1px solid ${HAIRLINE}` }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
          style={{ background: `${accent}14`, color: accent }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "#737373" }}
          >
            {eyebrow}
          </p>
          <p
            className="mt-0.5 text-[13px] font-bold tracking-[-0.01em] truncate"
            style={{ color: INK }}
          >
            {title}
          </p>
          <p
            className="mt-0.5 text-[11px] truncate"
            style={{ color: "#737373" }}
          >
            {meta}
          </p>
        </div>
        <ArrowUpRight
          className="w-4 h-4 mt-0.5 text-neutral-400 group-hover:text-neutral-900 transition-colors"
          aria-hidden
        />
      </div>
    </Link>
  );
}

function StatInline({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p
        className="text-[10px] font-bold uppercase tracking-[0.18em] inline-flex items-center gap-1"
        style={{ color: "#A3A3A3" }}
      >
        {icon}
        {label}
      </p>
      <p
        className="mt-0.5 text-[16px] font-bold tabular-nums"
        style={{ color: INK }}
      >
        {value}
      </p>
    </div>
  );
}

function Divider() {
  return (
    <span
      className="hidden sm:block w-px h-8"
      style={{ background: HAIRLINE }}
      aria-hidden
    />
  );
}

// Compose a one-line "what this Receipt proves" sentence keyed to the
// builder's strongest dimension. Speaks to the recruiter directly —
// what the trace surfaces about how they collaborate with Claude.
function proofLineFor(d: FingerprintDimension, score: number): string {
  const base = `${DIMENSION_LABELS[d]} ${score}`;
  switch (d) {
    case "tokenEconomy":
      return `${base} — they shipped without burning the budget. Lean tokens, verified output.`;
    case "throughput":
      return `${base} — first verified-correct output well under Brief median. They don't stall.`;
    case "toolChoiceIQ":
      return `${base} — they reached for deterministic tools before generative ones. Senior taste.`;
    case "recoveryIndex":
      return `${base} — they backed out of dead-ends cleanly and re-converged. Pivoting, not thrashing.`;
    case "promptDiscipline":
      return `${base} — focused, additive prompts. No kitchen-sink instruction sprawl.`;
    case "verificationRigor":
      return `${base} — they ran their own evals before submitting. Self-check, not vibes.`;
    case "spendVsJudgment":
      return `${base} — front-loaded spend on exploration, then tapered to verification. The mature curve.`;
  }
}

function lowercaseFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}
