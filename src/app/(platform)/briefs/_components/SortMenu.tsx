"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Check } from "lucide-react";

export const SORT_KEYS = ["newest", "most-attempted", "highest-median"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest",
  "most-attempted": "Most attempted",
  "highest-median": "Highest median",
};

function buildHref(
  patch: { sort: SortKey },
  current: { difficulty: string; category: string },
): string {
  const next = new URLSearchParams();
  if (current.difficulty && current.difficulty !== "all")
    next.set("difficulty", current.difficulty);
  if (current.category && current.category !== "all")
    next.set("category", current.category);
  if (patch.sort && patch.sort !== "newest") next.set("sort", patch.sort);
  const qs = next.toString();
  return qs ? `/briefs?${qs}` : "/briefs";
}

/**
 * Sort dropdown for the Briefs catalog. Client component because the
 * open/close state is interactive. Selecting an option navigates via
 * Link so the page re-renders server-side with the new sort.
 */
export function SortMenu({
  active,
  difficulty,
  category,
}: {
  active: SortKey;
  difficulty: string;
  category: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-bold tracking-[-0.005em] transition-colors"
        style={{
          background: "#FFFFFF",
          color: "#0A0A0A",
          border: "1px solid #EBEBEB",
        }}
      >
        <span className="text-gray-500">Sort:</span>
        <span>{SORT_LABELS[active]}</span>
        <ChevronDown
          className="w-3 h-3 text-gray-500 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-9 z-10 min-w-[180px] rounded-[10px] p-1"
          style={{
            background: "#FFFFFF",
            border: "1px solid #EBEBEB",
            boxShadow: "0 8px 24px rgba(10,10,10,0.08)",
          }}
        >
          {SORT_KEYS.map((k) => {
            const isActive = k === active;
            return (
              <Link
                key={k}
                href={buildHref({ sort: k }, { difficulty, category })}
                role="option"
                aria-selected={isActive}
                scroll={false}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-2 h-8 px-2.5 rounded-md text-[12px] font-medium text-[#0A0A0A] hover:bg-[#FAFAF7] transition-colors"
              >
                <span>{SORT_LABELS[k]}</span>
                {isActive && <Check className="w-3.5 h-3.5" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
