// Server component — picks the top 3 Fingerprint dimensions that this Brief's
// ideal_fingerprint emphasizes most, and shows them as small chips with a
// short blurb. Tells a builder *what skill they're being tested on* before
// they read the prompt.

import {
  DIMENSION_LABELS,
  DIMENSION_BLURB,
  type Fingerprint,
  type FingerprintDimension,
} from "@/lib/receipts/types";

type Props = {
  ideal: Fingerprint;
  sponsorColor: string;
};

export function WhatYoullLearn({ ideal, sponsorColor }: Props) {
  // Rank dimensions by emphasis (highest value first), take top 3.
  const top: FingerprintDimension[] = (
    Object.entries(ideal) as [FingerprintDimension, number][]
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([d]) => d);

  return (
    <section
      className="rounded-[14px] p-5 sm:p-6"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
          What this Brief tests
        </p>
        <p className="text-[11px] text-gray-500">
          Top 3 dimensions of the Ideal Shape
        </p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {top.map((d) => (
          <li
            key={d}
            className="rounded-[10px] p-3"
            style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: sponsorColor }}
              />
              <span className="text-[11px] font-bold tracking-[-0.005em] text-black">
                {DIMENSION_LABELS[d]}
              </span>
            </div>
            <p className="text-[11px] leading-[1.55] text-gray-600">
              {DIMENSION_BLURB[d]}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
