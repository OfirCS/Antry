// Server component — top 3 Receipts in a tight rank-style row.
// rank · avatar · name · composite score · small Fingerprint glyph.
// Pure leaderboard preview, no card chrome per row.

import Link from "next/link";
import { FingerprintGlyph } from "@/components/BuilderFingerprint";
import { fingerprintTier } from "@/lib/receipts/fingerprint";
import type { Receipt } from "@/lib/receipts/types";

type Props = {
  receipts: Receipt[];
  briefSlug: string;
  sponsorColor: string;
};

export function MiniLeaderboard({ receipts, briefSlug, sponsorColor }: Props) {
  const top = receipts.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <section
      className="rounded-[14px] overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
    >
      <div
        className="px-5 py-3.5 flex items-baseline justify-between gap-3 flex-wrap"
        style={{ borderBottom: "1px solid #EBEBEB" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
          Top fingerprints
        </p>
        <Link
          href={`/briefs/${briefSlug}/leaderboard`}
          className="text-[12px] font-semibold text-black hover:underline underline-offset-4"
        >
          Full leaderboard →
        </Link>
      </div>

      <ol>
        {top.map((r, idx) => {
          const tier = fingerprintTier(r.composite_score);
          return (
            <li
              key={r.id}
              style={{
                borderTop: idx === 0 ? "none" : "1px solid #EBEBEB",
              }}
            >
              <Link
                href={`/receipts/${r.id}`}
                className="grid grid-cols-[28px_36px_1fr_auto_28px] sm:grid-cols-[32px_40px_1fr_auto_auto_32px] items-center gap-3 px-5 py-3 transition-colors hover:bg-[#FAFAF7]"
              >
                <div
                  className="font-display font-bold text-[16px] tabular-nums"
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
                <div
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: r.builder.gradient }}
                  aria-hidden
                >
                  {r.builder.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold tracking-[-0.005em] text-black truncate">
                    {r.builder.name}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    @{r.builder.username}
                  </p>
                </div>
                <span
                  className="hidden sm:inline-flex text-[9px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
                  style={{ background: tier.bg, color: tier.color }}
                >
                  {tier.label}
                </span>
                <div className="text-right">
                  <span
                    className="font-display font-bold text-[18px] leading-none tabular-nums"
                    style={{
                      color:
                        r.composite_score >= 80 ? sponsorColor : "#0A0A0A",
                    }}
                  >
                    {r.composite_score}
                  </span>
                </div>
                <div className="shrink-0">
                  <FingerprintGlyph
                    fingerprint={r.fingerprint}
                    size={24}
                    primaryColor={sponsorColor}
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
