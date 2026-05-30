import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FingerprintGlyph } from "@/components/BuilderFingerprint";
import { fingerprintTier } from "@/lib/receipts/fingerprint";
import type { Receipt } from "@/lib/receipts/types";

/**
 * Receipt card for /receipts. The grid hero — one card per signed Receipt.
 * Sponsor accent on the top edge, builder + title in the body, score badge
 * and tiny FingerprintGlyph on the right. Hover lifts the card by 2px.
 */
export function ReceiptCard({ receipt }: { receipt: Receipt }) {
  const tier = fingerprintTier(receipt.composite_score);
  const signedAt = new Date(receipt.signed_at);
  const dateLabel = signedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const highlight = receipt.highlights[0] ?? "";

  return (
    <Link
      href={`/receipts/${receipt.id}`}
      className="group block rounded-[20px] bg-white transition-all duration-200 hover:-translate-y-0.5"
      style={{
        border: "1px solid #EBEBEB",
        boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
      }}
    >
      <div className="p-5 sm:p-6">
        {/* Top row: sponsor + score badge + arrow */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: receipt.company.sponsor_color }}
              aria-hidden="true"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 truncate">
              {receipt.company.name}
            </span>
          </div>
          <ArrowUpRight
            className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors shrink-0"
            aria-hidden="true"
          />
        </div>

        {/* Title */}
        <h3 className="mt-3 text-[18px] sm:text-[19px] font-bold tracking-[-0.02em] text-black leading-[1.2]">
          {receipt.brief_title}
        </h3>

        {/* Body: builder + highlight on left, score + glyph on right */}
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-4 items-end">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ background: receipt.builder.gradient }}
                aria-hidden="true"
              >
                {receipt.builder.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-black truncate leading-tight">
                  {receipt.builder.name}
                </p>
                <p className="text-[11px] text-gray-400 truncate leading-tight">
                  @{receipt.builder.username}
                </p>
              </div>
            </div>

            {highlight && (
              <p className="mt-3 text-[12.5px] text-gray-600 leading-[1.5] line-clamp-1">
                {highlight}
              </p>
            )}

            <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-400">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
                style={{ background: tier.bg, color: tier.color }}
              >
                {tier.label}
              </span>
              <span aria-hidden="true">·</span>
              <span>{dateLabel}</span>
            </div>
          </div>

          {/* Score + glyph */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div
              className="rounded-[10px] px-2.5 py-1.5 inline-flex items-baseline gap-1"
              style={{ background: "#0A0A0A" }}
            >
              <span
                className="font-display font-bold tabular-nums text-[20px] leading-none"
                style={{ color: "#FFFFFF" }}
              >
                {receipt.composite_score}
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                /100
              </span>
            </div>
            <div className="opacity-90" aria-hidden="true">
              <FingerprintGlyph
                fingerprint={receipt.fingerprint}
                size={36}
                primaryColor={receipt.company.sponsor_color}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
