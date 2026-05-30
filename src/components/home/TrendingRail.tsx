import Link from "next/link";

/**
 * Trending topics rail card.
 *
 * Five hardcoded topic chips with synthesized counts — the v0 community
 * vibe layer. Each chip links to `/?topic=<slug>` (the homepage doesn't
 * yet filter by topic across the whole feed; for now only the Pinned
 * post pattern surfaces topic context).
 *
 * Pure CSS. No client state — the chips are server-rendered Links.
 */

type TrendingTopic = { tag: string; count: number };

const TRENDING: TrendingTopic[] = [
  { tag: "streaming-rag", count: 47 },
  { tag: "mcp", count: 32 },
  { tag: "cursor-tips", count: 28 },
  { tag: "agent-cup", count: 19 },
  { tag: "sub-30min", count: 12 },
];

export function TrendingRail() {
  return (
    <ul className="flex flex-wrap gap-1.5 -mx-0.5">
      {TRENDING.map((t) => (
        <li key={t.tag}>
          <Link
            href={`/?topic=${t.tag}`}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 h-7 text-[11px] font-bold tracking-[-0.005em] transition-colors"
            style={{
              background: "#FAFAF7",
              color: "#0A0A0A",
              border: "1px solid #EBEBEB",
            }}
          >
            <span className="text-gray-500">#</span>
            <span>{t.tag}</span>
            <span className="text-[10px] font-semibold text-gray-500 tabular-nums">
              {t.count}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
