"use client";

import { useState, useMemo } from "react";
import { FeedCard, type Post } from "@/components/feed/FeedCard";

type TabKey = "feed" | "receipts" | "wins";

const TAB_DEFS: { key: TabKey; label: string }[] = [
  { key: "feed", label: "Feed" },
  { key: "receipts", label: "Receipts" },
  { key: "wins", label: "Wins" },
];

/**
 * Functional profile tabs.
 *
 * Filters the same source feed by post kind:
 *   feed     → all posts
 *   receipts → kind === "receipt"  (composite < 80, regular Receipts)
 *   wins     → kind === "hack-win" (composite ≥ 80, leaderboard tops)
 *
 * Empty-state treatment when a tab has no matching posts so the page
 * never looks broken.
 */
export function ProfileTabs({
  feed,
  totalReceipts,
}: {
  feed: Post[];
  totalReceipts: number;
}) {
  const [active, setActive] = useState<TabKey>("feed");

  const counts = useMemo(() => {
    const c = { feed: feed.length, receipts: 0, wins: 0 };
    for (const p of feed) {
      if (p.kind === "receipt") c.receipts++;
      else if (p.kind === "hack-win") c.wins++;
    }
    return c;
  }, [feed]);

  const filtered = useMemo(() => {
    if (active === "feed") return feed;
    if (active === "receipts") return feed.filter((p) => p.kind === "receipt");
    return feed.filter((p) => p.kind === "hack-win");
  }, [feed, active]);

  return (
    <>
      <div
        className="flex items-center gap-0 overflow-x-auto -mx-4 sm:mx-0"
        style={{ borderBottom: "1px solid #EBEBEB" }}
        role="tablist"
      >
        {TAB_DEFS.map((t) => {
          const on = active === t.key;
          const n =
            t.key === "feed"
              ? counts.feed
              : t.key === "receipts"
                ? counts.receipts
                : counts.wins;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(t.key)}
              className="px-4 py-3 text-[13px] font-bold tracking-[-0.005em] transition-colors relative whitespace-nowrap"
              style={{ color: on ? "#0A0A0A" : "#737373" }}
            >
              {t.label}
              <span
                className="ml-1.5 text-[11px] font-semibold tabular-nums"
                style={{ color: on ? "#525252" : "#A3A3A3" }}
              >
                {n}
              </span>
              {on && (
                <span
                  className="absolute left-3 right-3 -bottom-px h-[2px]"
                  style={{ background: "#0A0A0A" }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        className="rounded-[14px] overflow-hidden mt-4 mb-12"
        style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
      >
        {filtered.length === 0 ? (
          <p className="px-6 py-10 text-center text-[13px] text-gray-500">
            {active === "wins"
              ? `No wins yet. ${totalReceipts} Receipt${totalReceipts === 1 ? "" : "s"} below 80 composite.`
              : "Nothing here yet."}
          </p>
        ) : (
          filtered.map((p) => <FeedCard key={p.id} post={p} />)
        )}
      </div>
    </>
  );
}
