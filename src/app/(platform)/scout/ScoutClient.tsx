"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Telescope,
  ArrowUpRight,
  Bot,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  DIMENSION_LABELS,
  type Fingerprint,
  type FingerprintDimension,
} from "@/lib/receipts/types";

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
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [grader, setGrader] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");

  const onSearch = async () => {
    if (query.trim().length < 10) return;
    setSearching(true);
    setError(null);
    setMatches(null);
    setFilter("all");
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const j = (await res.json()) as
        | { matches: Match[]; grader: string }
        | { error: string; message?: string };
      if ("error" in j) {
        setError(j.message ?? humanError(j.error));
      } else {
        setMatches(j.matches);
        setGrader(j.grader);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
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
            One sentence — JD, vibes, anything. Antry ranks Receipt-holders
            who fit, with rationale on every match.
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
              No matches in the current Receipt pool.
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
                      ? "heuristic (set ANTHROPIC_API_KEY for real ranking)"
                      : grader}
                  </span>
                </p>
                <p className="text-[11px] text-gray-500">
                  {filtered.length} of {matches.length}
                </p>
              </div>

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
                <ol className="space-y-2">
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
                    />
                  ))}
                </ol>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function MatchRow({
  match,
  rank,
  revealDelayMs,
}: {
  match: Match;
  rank: number;
  revealDelayMs: number;
}) {
  const tier = scoreTier(match.composite_score);
  const top3 = pickTopDimensions(match.fingerprint);

  return (
    <li
      className="rounded-[14px] p-4 transition-colors hover:bg-[#FAFAF7] scout-rise"
      style={{
        background: "#FFFFFF",
        border: "1px solid #EBEBEB",
        animationDelay: `${revealDelayMs}ms`,
      }}
    >
      <div className="grid grid-cols-[32px_36px_1fr_auto] items-center gap-3">
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
      <div className="grid grid-cols-[32px_36px_1fr_auto] items-center gap-3">
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
