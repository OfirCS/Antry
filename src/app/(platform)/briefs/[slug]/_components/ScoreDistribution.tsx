// Pure-CSS horizontal histogram of composite score distribution across all
// Receipts on this Brief. Bucket size 10, x-axis 0–100, bar height encodes
// count. Tinted with the sponsor color. Renders on the server.

import type { Receipt } from "@/lib/receipts/types";

type Props = {
  receipts: Receipt[];
  sponsorColor: string;
  metricLabel?: string;
};

const BUCKETS = 10;

export function ScoreDistribution({
  receipts,
  sponsorColor,
  metricLabel = "Composite score",
}: Props) {
  // Build 10 buckets covering 0–100.
  const counts = new Array(BUCKETS).fill(0) as number[];
  for (const r of receipts) {
    const idx = Math.min(BUCKETS - 1, Math.floor(r.composite_score / 10));
    counts[idx]++;
  }
  const max = Math.max(1, ...counts);
  const median =
    receipts.length === 0
      ? null
      : [...receipts]
          .map((r) => r.composite_score)
          .sort((a, b) => a - b)[Math.floor(receipts.length / 2)];

  return (
    <section
      className="rounded-[14px] p-5 sm:p-6"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
          {metricLabel} distribution
        </p>
        <p className="text-[11px] text-gray-500 tabular-nums">
          {receipts.length} Receipt{receipts.length === 1 ? "" : "s"}
          {median !== null ? (
            <>
              {" "}· median{" "}
              <span className="font-bold text-black">{median}</span>
            </>
          ) : null}
        </p>
      </div>

      <div
        className="grid items-end gap-[3px] sm:gap-[4px]"
        style={{
          gridTemplateColumns: `repeat(${BUCKETS}, minmax(0,1fr))`,
          height: 56,
        }}
        role="img"
        aria-label={`${metricLabel} distribution histogram`}
      >
        {counts.map((c, i) => {
          const h = (c / max) * 100;
          return (
            <div
              key={i}
              className="rounded-[3px] relative"
              style={{
                height: `${Math.max(c === 0 ? 3 : 12, h)}%`,
                background:
                  c === 0
                    ? "#F5F5F5"
                    : i >= 8
                      ? sponsorColor
                      : i >= 6
                        ? `${sponsorColor}cc`
                        : i >= 4
                          ? `${sponsorColor}66`
                          : `${sponsorColor}33`,
              }}
              title={`${i * 10}–${i * 10 + 9}: ${c}`}
            />
          );
        })}
      </div>

      <div
        className="mt-2 grid text-[10px] font-mono text-gray-400 tabular-nums"
        style={{ gridTemplateColumns: `repeat(${BUCKETS}, minmax(0,1fr))` }}
        aria-hidden
      >
        {counts.map((_, i) => (
          <span key={i} className="text-center">
            {i * 10}
          </span>
        ))}
      </div>
    </section>
  );
}
