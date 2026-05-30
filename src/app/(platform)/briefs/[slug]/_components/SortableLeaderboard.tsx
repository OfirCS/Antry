"use client";

// Client component — leaderboard with per-dimension sort toggle.
// Default: composite score. Click any dimension button to re-rank.
//
// All Receipts are passed in pre-sorted by composite; we re-sort client-side
// when the active key changes. Stable: keeps original DOM nodes (keyed by
// receipt id) so React re-orders rather than re-mounts.

import { useMemo, useState } from "react";
import Link from "next/link";
import { FingerprintGlyph } from "@/components/BuilderFingerprint";
import { fingerprintTier } from "@/lib/receipts/fingerprint";
import {
  DIMENSION_SHORT,
  DIMENSION_LABELS,
  type FingerprintDimension,
} from "@/lib/receipts/types";
import type { Receipt } from "@/lib/receipts/types";

type SortKey = "composite" | FingerprintDimension;

const DIMENSION_ORDER: FingerprintDimension[] = [
  "tokenEconomy",
  "throughput",
  "toolChoiceIQ",
  "recoveryIndex",
  "promptDiscipline",
  "verificationRigor",
  "spendVsJudgment",
];

function scoreFor(r: Receipt, key: SortKey): number {
  return key === "composite" ? r.composite_score : r.fingerprint[key];
}

type Props = {
  receipts: Receipt[];
  sponsorColor: string;
};

export function SortableLeaderboard({ receipts, sponsorColor }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("composite");

  const sorted = useMemo(() => {
    return [...receipts].sort((a, b) => scoreFor(b, sortKey) - scoreFor(a, sortKey));
  }, [receipts, sortKey]);

  const activeLabel =
    sortKey === "composite" ? "Composite" : DIMENSION_LABELS[sortKey];

  return (
    <div>
      {/* Sort toggle row */}
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
          Sort by
        </p>
        <div
          className="flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="Sort leaderboard by dimension"
        >
          <SortButton
            active={sortKey === "composite"}
            onClick={() => setSortKey("composite")}
            sponsorColor={sponsorColor}
          >
            Composite
          </SortButton>
          {DIMENSION_ORDER.map((d) => (
            <SortButton
              key={d}
              active={sortKey === d}
              onClick={() => setSortKey(d)}
              sponsorColor={sponsorColor}
              title={DIMENSION_LABELS[d]}
            >
              {DIMENSION_SHORT[d]}
            </SortButton>
          ))}
        </div>
      </div>

      <ol className="space-y-2">
        {sorted.map((r, idx) => {
          const value = scoreFor(r, sortKey);
          return (
            <li
              key={r.id}
              className="rounded-[14px] transition-colors hover:bg-[#FAFAF7]"
              style={{
                background: "#FFFFFF",
                border: `1px solid ${idx === 0 ? sponsorColor : "#EBEBEB"}`,
              }}
            >
              <Link
                href={`/receipts/${r.id}`}
                className="grid grid-cols-[36px_1fr_auto] sm:grid-cols-[40px_1fr_auto_auto] items-center gap-3 p-4"
              >
                <div
                  className="font-display font-bold text-[18px] sm:text-[20px] tabular-nums"
                  style={{
                    color:
                      idx === 0
                        ? sponsorColor
                        : idx < 3
                          ? "#0A0A0A"
                          : "#A3A3A3",
                  }}
                >
                  {idx + 1}
                </div>
                <div className="min-w-0 flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: r.builder.gradient }}
                    aria-hidden
                  >
                    {r.builder.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold tracking-[-0.005em] text-black truncate">
                      {r.builder.name}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      @{r.builder.username} ·{" "}
                      {new Date(r.signed_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <FingerprintGlyph
                    fingerprint={r.fingerprint}
                    size={32}
                    primaryColor={sponsorColor}
                  />
                </div>
                <div className="text-right">
                  <div
                    className="font-display font-bold text-[20px] leading-none tabular-nums"
                    style={{ color: value >= 80 ? sponsorColor : "#0A0A0A" }}
                  >
                    {value}
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-500 mt-0.5">
                    {sortKey === "composite"
                      ? fingerprintTier(r.composite_score).label
                      : activeLabel}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SortButton({
  active,
  onClick,
  children,
  sponsorColor,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  sponsorColor: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      title={title}
      className="text-[11px] font-bold tracking-[-0.005em] px-2.5 h-7 rounded-[8px] transition-colors"
      style={{
        background: active ? "#0A0A0A" : "#FFFFFF",
        color: active ? "#FFFFFF" : "#525252",
        border: `1px solid ${active ? "#0A0A0A" : "#EBEBEB"}`,
        // Tiny sponsor-tinted dot on the active chip so the brand stays present
        // without overpowering the neutral chrome.
        boxShadow: active ? `inset 2px 0 0 ${sponsorColor}` : "none",
      }}
    >
      {children}
    </button>
  );
}
