import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Receipt } from "@/lib/receipts/types";

/**
 * One row in the global leaderboard. Server component.
 *
 *   • Rank number on the left — top-3 get accented backgrounds (lime / silver
 *     / orange) so the podium reads from a peripheral glance.
 *   • Avatar circle uses the builder's saved gradient — same identity used on
 *     `/u/[username]` so the visual matches when a recruiter clicks through.
 *   • 3 most-recent Receipt titles get truncated then concatenated with the
 *     thin middot to keep the right column dense without wrapping.
 *   • Right column: the selected dimension's score is the headline. Composite
 *     appears smaller below it when the dimension isn't already composite.
 */

const RANK_ACCENT: Record<number, { bg: string; fg: string }> = {
  1: { bg: "#C6F135", fg: "#0A0A0A" }, // lime — first place
  2: { bg: "#D4D4D4", fg: "#0A0A0A" }, // silver — second
  3: { bg: "#F59E0B", fg: "#0A0A0A" }, // orange — third
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  name: string;
  gradient: string;
  recentTitles: string[];
  primaryScore: number;
  primaryLabel: string;
  compositeScore: number;
  showComposite: boolean;
  receiptCount: number;
};

export function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const accent = RANK_ACCENT[entry.rank];
  const initials = entry.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/u/${entry.username}`}
      className="group block rounded-[14px] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(10,10,10,0.12)] hover:border-[#D4D4D4]"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      <div className="grid grid-cols-[44px_auto_1fr_auto] sm:grid-cols-[56px_auto_1fr_auto] items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
        {/* Rank */}
        <div className="flex items-center justify-center">
          {accent ? (
            <span
              className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-display font-bold tracking-tight tabular-nums"
              style={{
                background: accent.bg,
                color: accent.fg,
                fontSize: entry.rank >= 10 ? "16px" : "20px",
                lineHeight: 1,
              }}
            >
              {entry.rank}
            </span>
          ) : (
            <span
              className="font-display font-bold tracking-tight tabular-nums text-gray-400"
              style={{
                fontSize: "clamp(1.4rem, 2.4vw, 1.75rem)",
                lineHeight: 1,
              }}
            >
              {entry.rank}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
          style={{ background: entry.gradient }}
          aria-hidden="true"
        >
          {initials}
        </div>

        {/* Name + recent titles */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <p className="text-[14px] sm:text-[15px] font-bold text-black tracking-[-0.005em] truncate">
              {entry.name}
            </p>
            <span className="text-[11px] text-gray-400 truncate">
              @{entry.username}
            </span>
          </div>
          {entry.recentTitles.length > 0 && (
            <p className="mt-0.5 text-[11.5px] leading-[1.5] text-gray-500 truncate">
              {entry.recentTitles.join(" · ")}
            </p>
          )}
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-gray-400">
            {entry.receiptCount} Receipt{entry.receiptCount === 1 ? "" : "s"}
          </p>
        </div>

        {/* Score column */}
        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-baseline gap-1">
            <span
              className="font-display font-bold tabular-nums tracking-tight text-black"
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2rem)",
                lineHeight: 1,
              }}
            >
              {entry.primaryScore}
            </span>
            <span className="text-[10px] text-gray-400 font-semibold">/100</span>
          </div>
          <span className="mt-0.5 text-[9.5px] uppercase tracking-[0.16em] text-gray-500 font-bold">
            {entry.primaryLabel}
          </span>
          {entry.showComposite && (
            <span className="mt-1 text-[10px] text-gray-500 tabular-nums">
              composite{" "}
              <span className="font-bold text-[#262626]">
                {entry.compositeScore}
              </span>
            </span>
          )}
          <span
            aria-hidden
            className="mt-1.5 hidden sm:inline-flex items-center gap-0.5 text-[10.5px] font-bold text-gray-400 group-hover:text-black transition-colors"
          >
            View profile
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function rowMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

export function rowMax(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

export function buildEntryFromReceipts(args: {
  rank: number;
  username: string;
  name: string;
  gradient: string;
  receipts: Receipt[];
  primaryLabel: string;
  primaryValues: number[];
  showComposite: boolean;
}): LeaderboardEntry {
  const sortedByDate = [...args.receipts].sort(
    (a, b) => Date.parse(b.signed_at) - Date.parse(a.signed_at),
  );
  return {
    rank: args.rank,
    username: args.username,
    name: args.name,
    gradient: args.gradient,
    recentTitles: sortedByDate.slice(0, 3).map((r) => r.brief_title),
    primaryScore: rowMedian(args.primaryValues),
    primaryLabel: args.primaryLabel,
    compositeScore: rowMedian(args.receipts.map((r) => r.composite_score)),
    showComposite: args.showComposite,
    receiptCount: args.receipts.length,
  };
}
