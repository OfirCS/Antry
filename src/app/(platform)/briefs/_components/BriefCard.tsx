import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Brief } from "@/lib/receipts/types";

/**
 * Catalog card for a single Brief in the /briefs grid.
 *
 * Server component. Renders the difficulty pill, sponsor/category tags,
 * tagline, a tightened single-line stats row, an optional "New" pulse
 * (created in last 7 days), and a "Start in Cursor" badge that links
 * directly to the Brief detail page where the Cursor instructions live.
 *
 * The whole card is a single <Link> so any pixel is clickable; the
 * Cursor badge is a nested decorative span (not a nested link) to keep
 * the markup valid.
 */

const DIFFICULTY_BG: Record<string, string> = {
  intro: "#A7F3D0",
  mid: "#3B82F6",
  senior: "#8B5CF6",
  staff: "#EC4899",
};

const DIFFICULTY_FG: Record<string, string> = {
  intro: "#0A0A0A",
  mid: "#FFFFFF",
  senior: "#FFFFFF",
  staff: "#FFFFFF",
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function isRecentlyAdded(createdAt: string, now: number): boolean {
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return false;
  return now - created <= SEVEN_DAYS_MS && now >= created;
}

export function BriefCard({ brief, now }: { brief: Brief; now: number }) {
  const isNew = isRecentlyAdded(brief.created_at, now);
  return (
    <Link
      href={`/briefs/${brief.slug}`}
      className="group relative rounded-[14px] p-5 pb-14 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(10,10,10,0.12)] hover:border-[#D4D4D4]"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      {isNew && (
        <span
          className="absolute top-3 right-3 inline-flex items-center gap-1 px-1.5 h-5 rounded-full text-[9px] font-bold uppercase tracking-[0.16em]"
          style={{
            background: "#FEF3C7",
            color: "#92400E",
            border: "1px solid #FDE68A",
          }}
        >
          <span
            aria-hidden
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#F59E0B" }}
          />
          New
        </span>
      )}

      <div className="flex items-center gap-2 mb-2 flex-wrap pr-12">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.16em] inline-flex items-center gap-1.5"
          style={{ color: brief.company.sponsor_color }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: brief.company.sponsor_color }}
          />
          {brief.company.name}
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
          style={{
            background: DIFFICULTY_BG[brief.difficulty],
            color: DIFFICULTY_FG[brief.difficulty],
          }}
        >
          {brief.difficulty}
        </span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">
          {brief.category}
        </span>
      </div>

      <h3 className="text-[16px] font-bold tracking-[-0.005em] text-black leading-[1.3]">
        {brief.title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-[1.5] text-gray-600 line-clamp-2">
        {brief.tagline}
      </p>

      <div className="mt-3 flex items-center gap-2 text-[10.5px] text-gray-500 tabular-nums whitespace-nowrap overflow-hidden">
        <span>{brief.attempts_count} att</span>
        <span aria-hidden className="text-gray-300">·</span>
        <span>{brief.receipts_count} rcpt</span>
        <span aria-hidden className="text-gray-300">·</span>
        <span>
          med{" "}
          <span className="text-black font-bold">
            {brief.median_score ?? "—"}
          </span>
        </span>
        <span aria-hidden className="text-gray-300">·</span>
        <span>{Math.round(brief.time_cap_seconds / 60)}m cap</span>
      </div>

      <span
        aria-hidden
        className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 h-6 rounded-full text-[10px] font-bold tracking-[-0.005em] transition-[gap,background] duration-150 group-hover:gap-1.5 group-hover:bg-[#F7FBE6]"
        style={{
          background: "#FFFFFF",
          color: "#0A0A0A",
          border: "1px solid #C6F135",
        }}
      >
        Start in Cursor
        <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  );
}
