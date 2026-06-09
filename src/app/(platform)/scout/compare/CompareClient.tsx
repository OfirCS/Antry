"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Crown,
  FileX2,
  Sparkles,
  Telescope,
} from "lucide-react";
import {
  DIMENSION_LABELS,
  type FingerprintDimension,
  type Receipt,
} from "@/lib/receipts/types";
import {
  OutreachDrawer,
  type OutreachTarget,
} from "@/components/scout/OutreachDrawer";

/** Map a full Receipt to the slim shape the outreach drawer needs. */
function targetFromReceipt(r: Receipt): OutreachTarget {
  return {
    receipt_id: r.id,
    builder_username: r.builder.username,
    builder_name: r.builder.name,
    builder_gradient: r.builder.gradient,
    brief_title: r.brief_title,
    composite_score: r.composite_score,
  };
}

// Same palette as ScoutClient — keep in sync. The dimension dot color
// here doubles as the bar-fill color for the horizontal meters below,
// so the visual vocabulary carries across the Scout → Compare hand-off.
const DIMENSION_DOT: Record<FingerprintDimension, string> = {
  tokenEconomy: "#C6F135",
  throughput: "#3B82F6",
  toolChoiceIQ: "#8B5CF6",
  recoveryIndex: "#10B981",
  promptDiscipline: "#F59E0B",
  verificationRigor: "#FF6B35",
  spendVsJudgment: "#0EA5E9",
};

const ALL_DIMS: FingerprintDimension[] = [
  "tokenEconomy",
  "throughput",
  "toolChoiceIQ",
  "recoveryIndex",
  "promptDiscipline",
  "verificationRigor",
  "spendVsJudgment",
];

export type CompareColumn =
  | { kind: "receipt"; id: string; receipt: Receipt }
  | { kind: "missing"; id: string };

type Props = {
  columns: CompareColumn[];
  min: number;
};

export function CompareClient({ columns, min }: Props) {
  // Candidate currently open in the outreach drawer (null = closed).
  const [outreachFor, setOutreachFor] = useState<OutreachTarget | null>(null);
  const validColumns = columns.filter(
    (c): c is Extract<CompareColumn, { kind: "receipt" }> => c.kind === "receipt",
  );
  const count = columns.length;
  // Below the minimum to render anything useful — fall back to a soft
  // empty state. The page is still reachable (e.g. an old bookmark) so
  // we render the empty surface rather than redirecting silently.
  const tooFew = count < min;

  // Pick winners per row. We compute these once at the top so each cell
  // can ask "am I the winner?" cheaply during render.
  const winners = pickWinners(validColumns);

  // Grid template: a left "row label" gutter on desktop, then one
  // column per candidate. We cap at 3 candidates per the upstream cap.
  const gridCols = `minmax(140px, 180px) repeat(${columns.length}, minmax(0, 1fr))`;

  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      {/* Pure-CSS reveal so the page feels alive without framer-motion. */}
      <style jsx>{`
        @keyframes compareRise {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes barGrow {
          0% { width: 0%; }
          100% { width: var(--bar-w, 0%); }
        }
        .compare-rise {
          opacity: 0;
          animation: compareRise 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .compare-bar-fill {
          animation: barGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Header — keeps brand parity with Scout. Blue 3px top stripe,
          eyebrow + display heading + tight sub-copy. */}
      <section
        className="relative"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB" }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "#3B82F6" }}
        />
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-10 pb-6">
          <Link
            href="/scout"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Scout
          </Link>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] mb-3 inline-flex items-center gap-2 text-[#0A0A0A]">
            <Telescope className="w-3 h-3" />
            Scout · Compare
          </p>
          <h1
            className="font-display font-bold tracking-[-0.025em] text-black leading-[1.05]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}
          >
            {tooFew
              ? "Pick candidates to compare"
              : count === 1
                ? "Reviewing 1 candidate"
                : `Comparing ${count} candidates`}
          </h1>
          <p className="mt-2 max-w-[640px] text-[14px] leading-[1.55] text-gray-600">
            {tooFew
              ? "Head back to Scout and tick the boxes next to 2 or 3 results to compare them side by side."
              : "Each row is a dimension across all candidates. The crown marks the highest-scoring candidate in that row."}
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          {tooFew ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop grid: row label + one column per candidate. */}
              <div className="hidden md:block">
                <DesktopGrid
                  columns={columns}
                  winners={winners}
                  gridCols={gridCols}
                  onReachOut={(r) => setOutreachFor(targetFromReceipt(r))}
                />
              </div>

              {/* Mobile: stack each candidate as a self-contained card.
                  Cross-row comparison breaks down on a phone — by design.
                  Recruiters do the actual decision-making on a laptop. */}
              <div className="md:hidden space-y-4">
                {columns.map((c, i) => (
                  <MobileCard
                    key={`${c.id}-${i}`}
                    column={c}
                    revealDelayMs={i * 100}
                    onReachOut={(r) => setOutreachFor(targetFromReceipt(r))}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Outreach drawer — Claude drafts a first-contact message citing
          the candidate's actual Receipt evidence. */}
      <OutreachDrawer
        target={outreachFor}
        onClose={() => setOutreachFor(null)}
      />
    </div>
  );
}

// ── Desktop ────────────────────────────────────────────────────

function DesktopGrid({
  columns,
  winners,
  gridCols,
  onReachOut,
}: {
  columns: CompareColumn[];
  winners: WinnerMap;
  gridCols: string;
  onReachOut: (r: Receipt) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Header row — avatar, name, handle, score badge per column. */}
      <Row gridCols={gridCols} revealDelayMs={0}>
        <RowLabel kind="header" />
        {columns.map((c, i) => (
          <HeaderCell key={`h-${c.id}-${i}`} column={c} />
        ))}
      </Row>

      {/* Brief title — what they actually did. */}
      <Row gridCols={gridCols} revealDelayMs={40}>
        <RowLabel title="Brief" subtitle="The challenge they shipped" />
        {columns.map((c, i) => (
          <Cell key={`b-${c.id}-${i}`} column={c}>
            {(r) => (
              <Link href={`/briefs/${r.brief_slug}`} className="block group">
                <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-[0.08em]">
                  {r.company.name}
                </p>
                <p className="mt-1 text-[14px] font-semibold text-black leading-[1.35] group-hover:underline">
                  {r.brief_title}
                </p>
              </Link>
            )}
          </Cell>
        ))}
      </Row>

      {/* Composite score — the headline number. Big, prominent. */}
      <Row gridCols={gridCols} revealDelayMs={80}>
        <RowLabel title="Composite" subtitle="Overall score out of 100" />
        {columns.map((c, i) => (
          <Cell
            key={`s-${c.id}-${i}`}
            column={c}
            winner={c.kind === "receipt" && winners.composite === c.id}
          >
            {(r) => <CompositeCell score={r.composite_score} />}
          </Cell>
        ))}
      </Row>

      {/* One row per Fingerprint dimension. */}
      {ALL_DIMS.map((dim, dimIdx) => (
        <Row key={dim} gridCols={gridCols} revealDelayMs={120 + dimIdx * 30}>
          <RowLabel
            title={DIMENSION_LABELS[dim]}
            dotColor={DIMENSION_DOT[dim]}
          />
          {columns.map((c, i) => (
            <Cell
              key={`${dim}-${c.id}-${i}`}
              column={c}
              winner={c.kind === "receipt" && winners.dims[dim] === c.id}
            >
              {(r) => (
                <DimensionBar
                  value={r.fingerprint[dim]}
                  color={DIMENSION_DOT[dim]}
                />
              )}
            </Cell>
          ))}
        </Row>
      ))}

      {/* Highlight — the candidate's strongest one-liner. */}
      <Row gridCols={gridCols} revealDelayMs={120 + ALL_DIMS.length * 30 + 30}>
        <RowLabel title="Top highlight" subtitle="Their strongest signal" />
        {columns.map((c, i) => (
          <Cell key={`hl-${c.id}-${i}`} column={c}>
            {(r) => {
              const best = r.highlights[0];
              if (!best) {
                return (
                  <p className="text-[12px] text-gray-400 italic">
                    No highlights captured.
                  </p>
                );
              }
              return (
                <p className="text-[13px] leading-[1.55] text-gray-700 inline-flex gap-1.5 items-start">
                  <Sparkles className="w-3 h-3 mt-1 shrink-0 text-gray-400" />
                  <span>{best}</span>
                </p>
              );
            }}
          </Cell>
        ))}
      </Row>

      {/* CTAs — open Receipt + reach out per candidate. */}
      <Row gridCols={gridCols} revealDelayMs={120 + ALL_DIMS.length * 30 + 70}>
        <RowLabel title="Next step" />
        {columns.map((c, i) => (
          <Cell key={`cta-${c.id}-${i}`} column={c}>
            {(r) => (
              <div className="flex flex-col gap-2">
                <Link
                  href={`/receipts/${r.id}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-9 text-[12px] font-semibold transition-colors"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #EBEBEB",
                    color: "#0A0A0A",
                  }}
                >
                  View Receipt
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
                <button
                  type="button"
                  // Opens the outreach drawer with this candidate's
                  // Receipt evidence pre-loaded for the draft.
                  onClick={() => onReachOut(r)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-9 text-[12px] font-bold transition-transform hover:-translate-y-0.5"
                  style={{ background: "#3B82F6", color: "#FFFFFF" }}
                >
                  Reach out
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </Cell>
        ))}
      </Row>
    </div>
  );
}

function Row({
  children,
  gridCols,
  revealDelayMs,
}: {
  children: React.ReactNode;
  gridCols: string;
  revealDelayMs: number;
}) {
  return (
    <div
      className="grid gap-3 compare-rise"
      style={{
        gridTemplateColumns: gridCols,
        animationDelay: `${revealDelayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}

function RowLabel({
  title,
  subtitle,
  dotColor,
  kind = "row",
}: {
  title?: string;
  subtitle?: string;
  dotColor?: string;
  kind?: "row" | "header";
}) {
  if (kind === "header") {
    return <div aria-hidden />;
  }
  return (
    <div className="px-3 py-3 self-start">
      {title && (
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-500 inline-flex items-center gap-1.5">
          {dotColor && (
            <span
              aria-hidden
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: dotColor }}
            />
          )}
          {title}
        </p>
      )}
      {subtitle && (
        <p className="mt-1 text-[11px] text-gray-400 leading-[1.4]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function HeaderCell({ column }: { column: CompareColumn }) {
  if (column.kind === "missing") {
    return <MissingHeaderCell id={column.id} />;
  }
  const r = column.receipt;
  const tier = compositeTier(r.composite_score);
  return (
    <div
      className="rounded-[14px] p-4"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      <div className="flex items-start gap-3">
        <Avatar gradient={r.builder.gradient} name={r.builder.name} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/u/${r.builder.username}`}
            className="text-[15px] font-bold text-black hover:underline truncate inline-block max-w-full"
          >
            {r.builder.name}
          </Link>
          <p className="text-[11px] text-gray-500 truncate">
            @{r.builder.username}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className="font-display font-bold tabular-nums leading-none text-black"
          style={{ fontSize: 28 }}
        >
          {r.composite_score}
          <span className="text-[12px] text-gray-400 font-mono ml-1">/100</span>
        </span>
        {tier && (
          <span
            className="text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded shrink-0"
            style={{ background: tier.bg, color: tier.fg }}
          >
            {tier.label}
          </span>
        )}
      </div>
    </div>
  );
}

function MissingHeaderCell({ id }: { id: string }) {
  return (
    <div
      className="rounded-[14px] p-4 flex items-center gap-3"
      style={{
        background: "#FFFFFF",
        border: "1px dashed #D4D4D4",
        color: "#9CA3AF",
      }}
    >
      <FileX2 className="w-5 h-5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-gray-600">
          Receipt not found
        </p>
        <p className="text-[11px] text-gray-400 truncate font-mono">{id}</p>
      </div>
    </div>
  );
}

function Cell({
  column,
  winner,
  children,
}: {
  column: CompareColumn;
  winner?: boolean;
  children: (r: Receipt) => React.ReactNode;
}) {
  if (column.kind === "missing") {
    return (
      <div
        className="rounded-[14px] p-4 text-[12px] text-gray-400 italic"
        style={{ background: "#FFFFFF", border: "1px dashed #EBEBEB" }}
      >
        —
      </div>
    );
  }
  return (
    <div
      className="relative rounded-[14px] p-4 transition-colors"
      style={{
        background: "#FFFFFF",
        border: winner ? "1px solid #C6F135" : "1px solid #EBEBEB",
        boxShadow: winner ? "0 0 0 2px rgba(198,241,53,0.18)" : undefined,
      }}
    >
      {winner && (
        <span
          aria-label="Top in this row"
          className="absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full"
          style={{
            background: "#C6F135",
            width: 22,
            height: 22,
            boxShadow: "0 2px 6px rgba(10,10,10,0.12)",
          }}
        >
          <Crown className="w-3 h-3" style={{ color: "#0A0A0A" }} />
        </span>
      )}
      {children(column.receipt)}
    </div>
  );
}

function CompositeCell({ score }: { score: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className="font-display font-bold tabular-nums leading-none text-black"
        style={{ fontSize: 32 }}
      >
        {score}
      </span>
      <span className="text-[12px] text-gray-400 font-mono">/100</span>
    </div>
  );
}

function DimensionBar({ value, color }: { value: number; color: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ background: "#F1F1EA", height: 8 }}
        aria-hidden
      >
        <div
          className="compare-bar-fill h-full rounded-full"
          style={{
            background: color,
            // Custom property feeds the keyframe target width so each
            // bar animates to its own value.
            ["--bar-w" as string]: `${width}%`,
          }}
        />
      </div>
      <span
        className="font-mono font-bold tabular-nums text-[13px] text-black w-8 text-right"
        aria-label={`${value} out of 100`}
      >
        {value}
      </span>
    </div>
  );
}

// ── Mobile ─────────────────────────────────────────────────────

function MobileCard({
  column,
  revealDelayMs,
  onReachOut,
}: {
  column: CompareColumn;
  revealDelayMs: number;
  onReachOut: (r: Receipt) => void;
}) {
  if (column.kind === "missing") {
    return (
      <div
        className="rounded-[14px] p-4 compare-rise"
        style={{
          background: "#FFFFFF",
          border: "1px dashed #D4D4D4",
          animationDelay: `${revealDelayMs}ms`,
        }}
      >
        <div className="flex items-center gap-3">
          <FileX2 className="w-5 h-5 text-gray-400" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-gray-600">
              Receipt not found
            </p>
            <p className="text-[11px] text-gray-400 truncate font-mono">
              {column.id}
            </p>
          </div>
        </div>
      </div>
    );
  }
  const r = column.receipt;
  const tier = compositeTier(r.composite_score);

  return (
    <div
      className="rounded-[14px] p-4 compare-rise"
      style={{
        background: "#FFFFFF",
        border: "1px solid #EBEBEB",
        animationDelay: `${revealDelayMs}ms`,
      }}
    >
      <div className="flex items-start gap-3">
        <Avatar gradient={r.builder.gradient} name={r.builder.name} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/u/${r.builder.username}`}
            className="text-[15px] font-bold text-black hover:underline truncate inline-block max-w-full"
          >
            {r.builder.name}
          </Link>
          <p className="text-[11px] text-gray-500 truncate">
            @{r.builder.username}
          </p>
        </div>
        {tier && (
          <span
            className="text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded shrink-0"
            style={{ background: tier.bg, color: tier.fg }}
          >
            {tier.label}
          </span>
        )}
      </div>

      <div className="mt-4 pb-4 border-b" style={{ borderColor: "#EBEBEB" }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
          Composite
        </p>
        <div className="mt-1">
          <CompositeCell score={r.composite_score} />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
          Brief
        </p>
        <Link href={`/briefs/${r.brief_slug}`} className="block mt-1 group">
          <p className="text-[11px] font-semibold text-gray-500">
            {r.company.name}
          </p>
          <p className="text-[14px] font-semibold text-black leading-[1.35] group-hover:underline">
            {r.brief_title}
          </p>
        </Link>
      </div>

      <div className="mt-4 space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
          Fingerprint
        </p>
        {ALL_DIMS.map((dim) => (
          <div key={dim} className="flex items-center gap-2.5">
            <span
              className="text-[12px] font-semibold text-black"
              style={{ width: 110 }}
            >
              {DIMENSION_LABELS[dim]}
            </span>
            <div className="flex-1">
              <DimensionBar
                value={r.fingerprint[dim]}
                color={DIMENSION_DOT[dim]}
              />
            </div>
          </div>
        ))}
      </div>

      {r.highlights[0] && (
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
            Top highlight
          </p>
          <p className="mt-1.5 text-[13px] leading-[1.55] text-gray-700 inline-flex gap-1.5 items-start">
            <Sparkles className="w-3 h-3 mt-1 shrink-0 text-gray-400" />
            <span>{r.highlights[0]}</span>
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/receipts/${r.id}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-10 text-[12px] font-semibold transition-colors"
          style={{
            background: "#FFFFFF",
            border: "1px solid #EBEBEB",
            color: "#0A0A0A",
          }}
        >
          View Receipt
          <ArrowUpRight className="w-3 h-3" />
        </Link>
        <button
          type="button"
          onClick={() => onReachOut(r)}
          className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-10 text-[12px] font-bold transition-transform hover:-translate-y-0.5"
          style={{ background: "#3B82F6", color: "#FFFFFF" }}
        >
          Reach out
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ── Shared atoms ───────────────────────────────────────────────

function Avatar({ gradient, name }: { gradient?: string; name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-full font-display font-bold shrink-0"
      style={{
        background:
          gradient ?? "linear-gradient(135deg, #0A0A0A 0%, #525252 100%)",
        color: "#FFFFFF",
        width: 40,
        height: 40,
        fontSize: 15,
        boxShadow: "0 0 0 1px rgba(10,10,10,0.06)",
      }}
    >
      {initial}
    </span>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-[14px] p-8 text-center"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      <p className="text-[14px] text-gray-600 max-w-[420px] mx-auto leading-[1.55]">
        Compare needs at least one Receipt to render. Go to Scout, pick 2 or 3
        results, and the comparison surface will open with them lined up.
      </p>
      <Link
        href="/scout"
        className="mt-5 inline-flex items-center gap-1.5 rounded-[10px] px-4 h-10 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
        style={{ background: "#0A0A0A", color: "#FFFFFF" }}
      >
        Open Scout
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────

type WinnerMap = {
  composite: string | null;
  dims: Record<FingerprintDimension, string | null>;
};

// Per-row argmax across candidates. Ties get no crown — a "winner" of
// {A:90, B:90} is not actually a winner, and crowning both would just
// add noise.
function pickWinners(
  columns: Extract<CompareColumn, { kind: "receipt" }>[],
): WinnerMap {
  const out: WinnerMap = {
    composite: null,
    dims: {
      tokenEconomy: null,
      throughput: null,
      toolChoiceIQ: null,
      recoveryIndex: null,
      promptDiscipline: null,
      verificationRigor: null,
      spendVsJudgment: null,
    },
  };
  if (columns.length < 2) return out;

  // Composite
  {
    const top = columns.reduce(
      (best, c) =>
        c.receipt.composite_score > best.receipt.composite_score ? c : best,
      columns[0],
    );
    const ties = columns.filter(
      (c) => c.receipt.composite_score === top.receipt.composite_score,
    );
    if (ties.length === 1) out.composite = top.id;
  }

  // Each dimension
  for (const dim of ALL_DIMS) {
    const top = columns.reduce(
      (best, c) =>
        c.receipt.fingerprint[dim] > best.receipt.fingerprint[dim] ? c : best,
      columns[0],
    );
    const ties = columns.filter(
      (c) => c.receipt.fingerprint[dim] === top.receipt.fingerprint[dim],
    );
    if (ties.length === 1) out.dims[dim] = top.id;
  }

  return out;
}

function compositeTier(
  score: number,
): { label: string; bg: string; fg: string } | null {
  if (score >= 85) return { label: "Top quartile", bg: "#3B82F6", fg: "#FFFFFF" };
  if (score >= 70) return { label: "Strong", bg: "#FAFAF7", fg: "#0A0A0A" };
  if (score >= 50) return { label: "Solid", bg: "#FAFAF7", fg: "#525252" };
  return null;
}
