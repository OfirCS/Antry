"use client";

/**
 * Sort toggle — "Newest" vs "Hot".
 *
 * Inline-right of the FilterChips on desktop. Hidden on mobile to keep
 * the chip row tap-friendly; on small screens the feed defaults to Newest.
 *
 * State lives in the URL (`?sort=hot`) so it's shareable and the server
 * re-renders the reordered feed. We read the current params client-side
 * to preserve any `?kind=` filter the user already selected.
 *
 * Style follows the editorial language: selected option = bold + underline;
 * the other = gray and clickable. No background pill, no shadow.
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Flame } from "lucide-react";

export type SortKey = "new" | "hot";

export function SortToggle({ active }: { active: SortKey }) {
  const sp = useSearchParams();

  // Preserve every other param (kind=, topic=, etc.) when flipping sort.
  const buildHref = (next: SortKey) => {
    const params = new URLSearchParams(sp?.toString() ?? "");
    if (next === "new") params.delete("sort");
    else params.set("sort", "hot");
    const qs = params.toString();
    return qs.length > 0 ? `/?${qs}` : "/";
  };

  return (
    <div
      role="tablist"
      aria-label="Sort feed"
      // Hidden on mobile per spec; the feed defaults to Newest there.
      className="hidden sm:inline-flex items-center gap-3 ml-auto text-[12px] tracking-[-0.005em] shrink-0"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
        Sort
      </span>
      <Link
        href={buildHref("new")}
        role="tab"
        aria-selected={active === "new"}
        scroll={false}
        className={
          active === "new"
            ? "font-bold text-black underline underline-offset-4 decoration-2"
            : "text-gray-500 hover:text-black transition-colors"
        }
      >
        Newest
      </Link>
      <Link
        href={buildHref("hot")}
        role="tab"
        aria-selected={active === "hot"}
        scroll={false}
        className={
          active === "hot"
            ? "inline-flex items-center gap-1 font-bold text-black underline underline-offset-4 decoration-2"
            : "inline-flex items-center gap-1 text-gray-500 hover:text-black transition-colors"
        }
      >
        <Flame
          className="w-3 h-3"
          fill={active === "hot" ? "#FF6B35" : "none"}
          stroke={active === "hot" ? "#FF6B35" : "currentColor"}
          strokeWidth={1.75}
        />
        Hot
      </Link>
    </div>
  );
}
