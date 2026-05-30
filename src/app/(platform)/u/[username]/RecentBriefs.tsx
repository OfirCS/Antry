// Horizontal strip of the builder's most recent Receipts as mini-cards.
// Mobile: horizontal scroll (snap). Desktop: 3-column grid (4 if room).
// Each card shows brief title, composite score, and a small Fingerprint
// glyph so a recruiter can scan shape + score without leaving the page.

import Link from "next/link";
import { FingerprintGlyph } from "@/components/BuilderFingerprint";
import type { Receipt } from "@/lib/receipts/types";

export function RecentBriefs({ receipts }: { receipts: Receipt[] }) {
  // Newest first by signed_at. We cap at 4 so the grid stays single-row on
  // desktop and the horizontal scroll on mobile stays short.
  const recent = [...receipts]
    .sort(
      (a, b) =>
        new Date(b.signed_at).getTime() - new Date(a.signed_at).getTime()
    )
    .slice(0, 4);

  if (recent.length === 0) return null;

  return (
    <section className="mt-5" aria-label="Recent Briefs">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">
        Recent Briefs
      </p>
      <div
        className="
          flex gap-2.5 overflow-x-auto snap-x snap-mandatory
          -mx-4 px-4 pb-1
          sm:mx-0 sm:px-0 sm:overflow-visible sm:snap-none
          sm:grid sm:gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
        "
      >
        {recent.map((r) => (
          <Link
            key={r.id}
            href={`/receipts/${r.id}`}
            className="
              group snap-start shrink-0 w-[68%] sm:w-auto
              rounded-[12px] p-3 bg-white
              transition-colors hover:bg-[#FAFAF7]
            "
            style={{ border: "1px solid #EBEBEB" }}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 -m-1">
                <FingerprintGlyph
                  fingerprint={r.fingerprint}
                  size={56}
                  primaryColor={r.company.sponsor_color}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500 truncate">
                  {r.company.name}
                </p>
                <p className="mt-0.5 text-[13px] font-bold text-black leading-[1.25] line-clamp-2">
                  {r.brief_title}
                </p>
                <p className="mt-1.5 flex items-baseline gap-1">
                  <span className="font-display font-bold text-[18px] text-black tabular-nums leading-none">
                    {r.composite_score}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-gray-500">
                    composite
                  </span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
