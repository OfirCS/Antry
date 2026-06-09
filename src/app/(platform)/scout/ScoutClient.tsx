"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Telescope,
  ArrowUpRight,
  Bot,
  ArrowRight,
  Sparkles,
  Check,
  GitCompare,
} from "lucide-react";
import {
  DIMENSION_LABELS,
  type Fingerprint,
  type FingerprintDimension,
} from "@/lib/receipts/types";
import { rankScout, type ScoutReasoning } from "@/lib/agent/scout-client";

// Multi-select cap for the compare drawer. 2 is the floor (you can't
// "compare" one candidate); 3 is the ceiling because past that the
// columns get too narrow on a 1280-wide laptop and the value tanks.
const COMPARE_MIN = 2;
const COMPARE_MAX = 3;

type Match = {
  receipt_id: string;
  builder_username: string;
  builder_name: string;
  builder_gradient?: string;
  composite_score: number;
  brief_title: string;
  rationale: string;
  // Optional fingerprint so we can render top-3 dimension chips inline.
  // Provided by the API; falls back to a flat radar if absent.
  fingerprint?: Fingerprint;
};

// Per-dimension chip color — mirrors the palette used on the builder
// profile (TopDimensions.tsx) so the visual vocabulary stays consistent
// across surfaces. Keep in sync.
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

type FilterKey = "all" | "top" | "strong" | "solid";

const FILTERS: { key: FilterKey; label: string; predicate: (s: number) => boolean }[] = [
  { key: "all", label: "All", predicate: () => true },
  { key: "top", label: "Top quartile · 85+", predicate: (s) => s >= 85 },
  { key: "strong", label: "Strong · 70–84", predicate: (s) => s >= 70 && s < 85 },
  { key: "solid", label: "Solid · 50–69", predicate: (s) => s >= 50 && s < 70 },
];

const SKELETON_ROWS = 5;

export function ScoutClient() {
  const router = useRouter();
  // On the static GitHub Pages export the server-rendered compare page
  // isn't available, so the multi-select compare drawer is hidden there.
  // Everything else on Scout works fully client-side.
  const isStatic = Boolean(process.env.NEXT_PUBLIC_BASE_PATH);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [grader, setGrader] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  // Agent reasoning trace — populated when ranking runs client-side
  // (static demo / no server). Surfaces the "thinking" behind the rank.
  const [reasoning, setReasoning] = useState<ScoutReasoning | null>(null);
  // Selected receipt_ids for the compare surface. A Set keeps toggle
  // semantics cheap and dedupes for free.
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < COMPARE_MAX) {
        next.add(id);
      }
      // If user is at the cap and clicks an unselected row, we silently
      // no-op — the row's tooltip explains why.
      return next;
    });
  };

  const onCompare = () => {
    if (selected.size < COMPARE_MIN) return;
    // Preserve the order the matches were ranked in, not insertion order.
    // It reads better in the compare view (#1 on the left).
    const orderedIds =
      matches
        ?.map((m) => m.receipt_id)
        .filter((id) => selected.has(id)) ?? [];
    router.push(`/scout/compare?ids=${orderedIds.join(",")}`);
  };

  const onSearch = async () => {
    if (query.trim().length < 10) return;
    setSearching(true);
    setError(null);
    setMatches(null);
    setReasoning(null);
    setFilter("all");
    setSelected(new Set());
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      if (!res.ok) throw new Error(`api_${res.status}`);
      const j = (await res.json()) as
        | { matches: Match[]; grader: string }
        | { error: string; message?: string };
      if ("error" in j) {
        setError(j.message ?? humanError(j.error));
      } else {
        setMatches(j.matches);
        setGrader(j.grader);
      }
    } catch {
      // No server (static demo) — rank in the browser against the same
      // signed-Receipt pool. Brief pause so the trace animates.
      await new Promise((r) => setTimeout(r, 650));
      const result = rankScout(query.trim());
      setMatches(result.matches);
      setReasoning(result.reasoning);
      setGrader(result.grader);
    } finally {
      setSearching(false);
    }
  };

  const filtered = useMemo(() => {
    if (!matches) return [] as Match[];
    const pred = FILTERS.find((f) => f.key === filter)?.predicate ?? (() => true);
    return matches.filter((m) => pred(m.composite_score));
  }, [matches, filter]);

  const filterCounts = useMemo(() => {
    const out: Record<FilterKey, number> = { all: 0, top: 0, strong: 0, solid: 0 };
    if (!matches) return out;
    for (const m of matches) {
      out.all += 1;
      if (m.composite_score >= 85) out.top += 1;
      else if (m.composite_score >= 70) out.strong += 1;
      else if (m.composite_score >= 50) out.solid += 1;
    }
    return out;
  }, [matches]);

  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      {/* Scoped CSS for skeleton shimmer + staggered row reveal. No
          framer-motion — pure keyframes so the surface stays light. */}
      <style jsx>{`
        @keyframes scoutRise {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scoutShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes scoutPulse {
          0%, 100% { opacity: 0.35; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
        .scout-rise {
          opacity: 0;
          animation: scoutRise 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scout-skeleton {
          background: linear-gradient(
            90deg,
            #f1f1ea 0%,
            #ffffff 40%,
            #f1f1ea 80%
          );
          background-size: 200% 100%;
          animation: scoutShimmer 1.6s ease-in-out infinite;
        }
        .scout-pulse {
          animation: scoutPulse 1s ease-in-out infinite;
        }
      `}</style>

      <section
        className="relative"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB" }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "#3B82F6" }}
        />
        <div className="mx-auto max-w-[920px] px-4 sm:px-6 pt-10 pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3 inline-flex items-center gap-2 text-[#0A0A0A]">
            <Telescope className="w-3 h-3" />
            Scout
          </p>
          <h1
            className="font-display font-bold tracking-[-0.025em] text-black leading-[1.05]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}
          >
            Who do you need?
          </h1>
          <p className="mt-2 max-w-[560px] text-[14px] leading-[1.55] text-gray-600">
            One sentence — JD, vibes, anything. Antry returns signed
            Receipts, not LinkedIn profiles. 325 companies, 1,000+ roles
            a month — the long tail Cursor&apos;s funnel never sees.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-[920px] px-4 sm:px-6 space-y-5">
          <div
            className="rounded-[14px] p-4"
            style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
          >
            <div className="flex items-start gap-2">
              <Search className="w-4 h-4 mt-3 ml-2 text-gray-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !searching) onSearch();
                }}
                placeholder="Senior who can ship streaming RAG under deadline, strong on verification"
                maxLength={800}
                className="flex-1 px-2 h-11 text-[15px] outline-none bg-transparent text-black placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={onSearch}
                disabled={searching || query.trim().length < 10}
                className="inline-flex items-center justify-center rounded-[10px] px-4 h-10 text-[13px] font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                style={{ background: "#0A0A0A", color: "#FFFFFF" }}
              >
                {searching ? "Scouting…" : "Find"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[13px] text-red-600 font-semibold">{error}</p>
          )}

          {/* Empty state — example chips to seed action */}
          {!matches && !searching && !error && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
                Try
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Senior who can ship streaming RAG with strong verification",
                  "Mid-level engineer who writes idempotent code under pressure",
                  "Tool-Choice IQ ≥ 90 — they reach for grep before tokens",
                  "Builder who topped a leaderboard on agent work",
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuery(q)}
                    className="text-left text-[12px] rounded-[10px] px-3 h-9 transition-colors hover:bg-[#FFFFFF]"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #EBEBEB",
                      color: "#0A0A0A",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Streaming-like reveal: skeleton rows while searching */}
          {searching && (
            <div className="space-y-3">
              <p className="text-[11px] text-gray-500 inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block w-1.5 h-1.5 rounded-full scout-pulse"
                  style={{ background: "#3B82F6" }}
                />
                Scouting Receipt pool…
              </p>
              <ol className="space-y-2" aria-busy>
                {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <SkeletonRow key={i} index={i} />
                ))}
              </ol>
            </div>
          )}

          {matches && !searching && matches.length === 0 && (
            <p className="text-[14px] text-gray-500">
              No Receipts match yet. New ones mint every day.
            </p>
          )}

          {matches && !searching && matches.length > 0 && (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[11px] text-gray-500 inline-flex items-center gap-1.5">
                  <Bot className="w-3 h-3" />
                  Ranked by{" "}
                  <span className="font-mono text-black">
                    {grader === "heuristic"
                      ? "heuristic (set ANTHROPIC_API_KEY for LLM ranking)"
                      : grader === "client-heuristic"
                        ? "in-browser agent (no server, no keys)"
                        : grader}
                  </span>
                </p>
                <p className="text-[11px] text-gray-500">
                  {filtered.length} of {matches.length}
                </p>
              </div>

              {/* Agent reasoning trace — shows how the rank was reached.
                  Only present when ranking ran client-side. */}
              {reasoning && (
                <div
                  className="rounded-[12px] p-4 scout-rise"
                  style={{ background: "#0A0A0A", border: "1px solid #1f1f1f" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C6F135] inline-flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-3 h-3" />
                    Agent trace
                  </p>
                  <ol className="space-y-1.5">
                    {reasoning.steps.map((s, i) => (
                      <li
                        key={i}
                        className="text-[12px] text-gray-300 font-mono flex items-start gap-2"
                      >
                        <span className="text-gray-600 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Filter chips */}
              <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label="Filter matches by composite score"
              >
                {FILTERS.map((f) => {
                  const count = filterCounts[f.key];
                  const active = filter === f.key;
                  const disabled = count === 0 && f.key !== "all";
                  return (
                    <button
                      key={f.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      disabled={disabled}
                      onClick={() => setFilter(f.key)}
                      className="text-[12px] rounded-[10px] px-3 h-9 font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: active ? "#0A0A0A" : "#FFFFFF",
                        border: "1px solid #EBEBEB",
                        color: active ? "#FFFFFF" : "#0A0A0A",
                      }}
                    >
                      {f.label}
                      <span
                        className="ml-1.5 font-mono text-[10px] tabular-nums"
                        style={{ color: active ? "rgba(255,255,255,0.6)" : "#9ca3af" }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filtered.length === 0 ? (
                <p className="text-[13px] text-gray-500">
                  No matches in this band. Try a different filter.
                </p>
              ) : (
                <ol className="space-y-2 pb-24">
                  {filtered.map((m, i) => (
                    <MatchRow
                      key={m.receipt_id}
                      match={m}
                      // Use the rank from the ORIGINAL list, not the
                      // filtered slice — the agent's #1 is still #1
                      // even if it's the only one in a band.
                      rank={
                        (matches.findIndex(
                          (x) => x.receipt_id === m.receipt_id
                        ) ?? i) + 1
                      }
                      revealDelayMs={i * 90}
                      selectable={!isStatic}
                      selected={selected.has(m.receipt_id)}
                      capReached={
                        selected.size >= COMPARE_MAX &&
                        !selected.has(m.receipt_id)
                      }
                      onToggle={() => toggleSelect(m.receipt_id)}
                    />
                  ))}
                </ol>
              )}
            </>
          )}
        </div>
      </section>

      {/* Sticky compare bar — slides in only when ≥2 are selected. The
          fixed footer guarantees visibility even while the user is mid-
          scroll. pb-24 on the list above leaves clearance. */}
      {!isStatic && (
        <CompareBar
          count={selected.size}
          onCompare={onCompare}
          onClear={() => setSelected(new Set())}
        />
      )}
    </div>
  );
}

function CompareBar({
  count,
  onCompare,
  onClear,
}: {
  count: number;
  onCompare: () => void;
  onClear: () => void;
}) {
  const visible = count >= COMPARE_MIN;
  return (
    <div
      className="fixed inset-x-0 bottom-0 sm:bottom-4 z-30 pointer-events-none"
      aria-hidden={!visible}
    >
      <div
        className="mx-auto max-w-[560px] px-4 sm:px-0 transition-all duration-300 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(120%)",
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        <div
          className="rounded-t-[14px] sm:rounded-[14px] flex items-center gap-3 p-3 pl-4"
          style={{
            background: "#0A0A0A",
            color: "#FFFFFF",
            boxShadow: "0 12px 32px -8px rgba(0,0,0,0.32)",
          }}
        >
          <span
            aria-hidden
            className="inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0"
            style={{ background: "#3B82F6" }}
          >
            <span className="font-display font-bold text-[13px] tabular-nums">
              {count}
            </span>
          </span>
          <p className="text-[13px] font-semibold flex-1 min-w-0">
            <span className="hidden sm:inline">Selected for comparison</span>
            <span className="sm:hidden">Selected</span>
          </p>
          <button
            type="button"
            onClick={onClear}
            className="text-[12px] font-semibold opacity-60 hover:opacity-100 transition-opacity px-2 h-9"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onCompare}
            className="inline-flex items-center gap-1.5 rounded-[10px] px-4 h-9 text-[12px] font-bold transition-transform hover:-translate-y-0.5 shrink-0"
            style={{ background: "#3B82F6", color: "#FFFFFF" }}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Compare {count} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MatchRow({
  match,
  rank,
  revealDelayMs,
  selectable,
  selected,
  capReached,
  onToggle,
}: {
  match: Match;
  rank: number;
  revealDelayMs: number;
  selectable: boolean;
  selected: boolean;
  capReached: boolean;
  onToggle: () => void;
}) {
  const tier = scoreTier(match.composite_score);
  const top3 = pickTopDimensions(match.fingerprint);
  const checkboxDisabled = capReached && !selected;

  return (
    <li
      className="rounded-[14px] p-4 transition-colors hover:bg-[#FAFAF7] scout-rise"
      style={{
        background: selected ? "#F5F8FF" : "#FFFFFF",
        border: selected ? "1px solid #3B82F6" : "1px solid #EBEBEB",
        animationDelay: `${revealDelayMs}ms`,
      }}
    >
      <div className="grid grid-cols-[20px_28px_36px_1fr_auto] items-center gap-3">
        {selectable ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label={
              selected
                ? `Remove ${match.builder_name} from compare`
                : capReached
                  ? `Compare full — deselect another candidate first`
                  : `Add ${match.builder_name} to compare`
            }
            title={
              checkboxDisabled
                ? `You can compare up to ${COMPARE_MAX} candidates at once`
                : undefined
            }
            disabled={checkboxDisabled}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="inline-flex items-center justify-center rounded-[5px] transition-all disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              width: 18,
              height: 18,
              background: selected ? "#3B82F6" : "#FFFFFF",
              border: selected ? "1px solid #3B82F6" : "1px solid #D4D4D4",
            }}
          >
            {selected && <Check className="w-3 h-3" style={{ color: "#FFFFFF" }} />}
          </button>
        ) : (
          <span aria-hidden />
        )}
        <div
          className="font-display font-bold text-[18px] tabular-nums"
          style={{ color: rank === 1 ? "#3B82F6" : "#0A0A0A" }}
        >
          {rank}
        </div>
        <BuilderAvatar
          gradient={match.builder_gradient}
          name={match.builder_name}
        />
        <div className="min-w-0">
          <Link
            href={`/u/${match.builder_username}`}
            className="text-[14px] font-bold text-black hover:underline truncate inline-block max-w-full"
          >
            {match.builder_name}
          </Link>
          <p className="text-[11px] text-gray-500 truncate">
            {match.brief_title} ·{" "}
            <span className="font-mono text-black">
              {match.composite_score}/100
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tier && (
            <span
              className="text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
              style={{ background: tier.bg, color: tier.fg }}
            >
              {tier.label}
            </span>
          )}
          <Link
            href={`/receipts/${match.receipt_id}`}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-500 hover:text-black transition-colors"
          >
            Receipt <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Top dimensions chips */}
      {top3.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {top3.map(({ dim, score }) => (
            <span
              key={dim}
              className="inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-0.5 text-[11px]"
              style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
            >
              <span
                aria-hidden
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: DIMENSION_DOT[dim] }}
              />
              <span className="font-semibold text-black">
                {DIMENSION_LABELS[dim]}
              </span>
              <span className="font-mono font-bold text-black tabular-nums">
                {score}
              </span>
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 text-[13px] leading-[1.55] text-gray-700 inline-flex gap-1.5 items-start">
        <Sparkles className="w-3 h-3 mt-1 shrink-0 text-gray-400" />
        <span>{match.rationale}</span>
      </p>

      <div className="mt-3 flex items-center justify-end">
        <button
          type="button"
          // Placeholder — no real flow yet, but visually present so a
          // hiring company immediately knows what the "next step" is.
          onClick={() => {
            /* TODO: route to outreach drawer when wired up */
          }}
          className="inline-flex items-center gap-1.5 rounded-[10px] px-3 h-9 text-[12px] font-bold transition-all hover:-translate-y-0.5"
          style={{ background: "#3B82F6", color: "#FFFFFF" }}
        >
          Reach out
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </li>
  );
}

function BuilderAvatar({
  gradient,
  name,
}: {
  gradient?: string;
  name: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-full w-9 h-9 font-display font-bold text-[14px]"
      style={{
        background:
          gradient ?? "linear-gradient(135deg, #0A0A0A 0%, #525252 100%)",
        color: "#FFFFFF",
        // Faint outer ring so light gradients still read on the white card.
        boxShadow: "0 0 0 1px rgba(10,10,10,0.06)",
      }}
    >
      {initial}
    </span>
  );
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <li
      className="rounded-[14px] p-4 scout-rise"
      style={{
        background: "#FFFFFF",
        border: "1px solid #EBEBEB",
        animationDelay: `${index * 90}ms`,
      }}
      aria-hidden
    >
      <div className="grid grid-cols-[20px_28px_36px_1fr_auto] items-center gap-3">
        <div
          className="rounded scout-skeleton"
          style={{ height: 18, width: 18 }}
        />
        <div
          className="rounded scout-skeleton"
          style={{ height: 18, width: 18 }}
        />
        <div
          className="rounded-full scout-skeleton"
          style={{ height: 36, width: 36 }}
        />
        <div className="space-y-1.5">
          <div
            className="rounded scout-skeleton"
            style={{ height: 13, width: "45%" }}
          />
          <div
            className="rounded scout-skeleton"
            style={{ height: 10, width: "65%" }}
          />
        </div>
        <div
          className="rounded-[10px] scout-skeleton"
          style={{ height: 24, width: 60 }}
        />
      </div>
      <div className="mt-3 flex gap-1.5">
        <div
          className="rounded-full scout-skeleton"
          style={{ height: 16, width: 90 }}
        />
        <div
          className="rounded-full scout-skeleton"
          style={{ height: 16, width: 100 }}
        />
        <div
          className="rounded-full scout-skeleton"
          style={{ height: 16, width: 82 }}
        />
      </div>
      <div
        className="mt-3 rounded scout-skeleton"
        style={{ height: 10, width: "92%" }}
      />
      <div
        className="mt-1.5 rounded scout-skeleton"
        style={{ height: 10, width: "70%" }}
      />
    </li>
  );
}

function scoreTier(
  score: number
): { label: string; bg: string; fg: string } | null {
  if (score >= 85) return { label: "Top quartile", bg: "#3B82F6", fg: "#FFFFFF" };
  if (score >= 70) return { label: "Strong", bg: "#FAFAF7", fg: "#0A0A0A" };
  return null;
}

function pickTopDimensions(
  fp?: Fingerprint
): { dim: FingerprintDimension; score: number }[] {
  if (!fp) return [];
  return ALL_DIMS.map((d) => ({ dim: d, score: fp[d] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function humanError(code: string): string {
  switch (code) {
    case "rate_limited":
      return "Too many scouts — try again in a moment.";
    case "invalid_json":
      return "Couldn't parse the request.";
    case "invalid_query":
      return "Query must be 10–800 characters.";
    default:
      return "Scouting failed. Try once more.";
  }
}
