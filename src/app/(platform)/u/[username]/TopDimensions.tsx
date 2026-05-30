// Top three Fingerprint dimensions for a builder, sourced from their
// strongest signed Receipt. Pure presentational — receives already-sorted
// values from the server component. Rendered as labeled chips with a
// colored dot per dimension; sorted descending by score.

import {
  DIMENSION_LABELS,
  type Fingerprint,
  type FingerprintDimension,
} from "@/lib/receipts/types";

// Per-dimension accent palette. Distinct hues so each chip reads at a
// glance, but all sit comfortably on a #FAFAF7 page. Keep in sync with
// the lime accents elsewhere — these are *category* colors, not status.
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

export function TopDimensions({ fingerprint }: { fingerprint: Fingerprint }) {
  const top = ALL_DIMS.map((d) => ({ dim: d, score: fingerprint[d] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <section className="mt-5" aria-label="Top Fingerprint dimensions">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">
        Top dimensions
      </p>
      <div className="flex flex-wrap gap-1.5">
        {top.map(({ dim, score }) => (
          <span
            key={dim}
            className="inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1 text-[12px]"
            style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
          >
            <span
              aria-hidden
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: DIMENSION_DOT[dim] }}
            />
            <span className="font-semibold text-black">
              {DIMENSION_LABELS[dim]}
            </span>
            <span className="font-display font-bold text-black tabular-nums">
              {score}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
