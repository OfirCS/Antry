import Link from "next/link";
import { POST_COLORS, type PostKind } from "@/components/feed/FeedCard";

/**
 * Feed filter chips. Single-select, navigates via search params so the
 * server can re-render the filtered feed — no client state needed.
 *
 * `All` clears the param; every other chip sets `?kind=<key>`.
 * Selected chip uses the post-type accent color as background; idle
 * chips are the hairline border + secondary text.
 */

export type FilterKey = "all" | "receipt" | "hack-win" | "hack-launch" | "build";

const CHIPS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "receipt", label: "Receipts" },
  { key: "hack-win", label: "Wins" },
  { key: "hack-launch", label: "Launches" },
  { key: "build", label: "Builds" },
];

export function FilterChips({ active }: { active: FilterKey }) {
  return (
    <div
      role="tablist"
      aria-label="Filter feed"
      className="mb-3 flex items-center gap-1.5 overflow-x-auto hide-scrollbar"
    >
      {CHIPS.map((c) => {
        const isActive = c.key === active;
        const href = c.key === "all" ? "/" : `/?kind=${c.key}`;
        let style: React.CSSProperties = {
          background: "#FFFFFF",
          color: "#525252",
          border: "1px solid #EBEBEB",
        };
        if (isActive) {
          if (c.key === "all") {
            style = { background: "#0A0A0A", color: "#FFFFFF", border: "1px solid #0A0A0A" };
          } else {
            const accent = POST_COLORS[c.key as PostKind];
            style = { background: accent.bg, color: accent.fg, border: `1px solid ${accent.line}` };
          }
        }
        return (
          <Link
            key={c.key}
            href={href}
            role="tab"
            aria-selected={isActive}
            scroll={false}
            className="inline-flex items-center h-8 px-3 rounded-full text-[12px] font-bold tracking-[-0.005em] transition-colors shrink-0"
            style={style}
          >
            {c.label}
          </Link>
        );
      })}
    </div>
  );
}
