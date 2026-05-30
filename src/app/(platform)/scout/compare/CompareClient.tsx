"use client";

/**
 * Minimal stub created while the compare agent's full implementation
 * finished. Renders a single-column comparison fallback so the page
 * compiles and a user navigating to /scout/compare?ids=... sees
 * something rather than a broken build. The full version will replace
 * this with a side-by-side comparison grid.
 */

import Link from "next/link";
import type { Receipt } from "@/lib/receipts/types";

export type CompareColumn =
  | { kind: "receipt"; id: string; receipt: Receipt }
  | { kind: "missing"; id: string };

export function CompareClient({
  columns,
  min,
}: {
  columns: CompareColumn[];
  min: number;
}) {
  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      <section
        className="relative"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB" }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "#3B82F6" }}
        />
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-10 pb-6">
          <Link
            href="/scout"
            className="inline-flex items-center text-[12px] font-semibold text-gray-500 hover:text-black transition-colors mb-4"
          >
            ← Back to Scout
          </Link>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
            Compare
          </p>
          <h1
            className="font-display font-bold tracking-[-0.025em] text-black leading-[1.05]"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)" }}
          >
            {columns.length} candidate{columns.length === 1 ? "" : "s"}{" "}
            side-by-side
          </h1>
          <p className="mt-2 text-[13px] text-gray-500">
            Select at least {min} candidates from Scout to see the full
            comparison grid.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div
          className={`mx-auto max-w-[1080px] px-4 sm:px-6 grid gap-4 grid-cols-1 md:grid-cols-${Math.min(
            columns.length,
            3
          )}`}
        >
          {columns.map((col, i) =>
            col.kind === "missing" ? (
              <div
                key={i}
                className="rounded-[14px] p-6 text-center text-[13px] text-gray-500"
                style={{ background: "#FFFFFF", border: "1px dashed #EBEBEB" }}
              >
                Receipt <code className="font-mono">{col.id}</code> not found.
              </div>
            ) : (
              <Link
                key={col.receipt.id}
                href={`/receipts/${col.receipt.id}`}
                className="rounded-[14px] p-5 transition-colors hover:bg-[#FAFAF7]"
                style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1"
                  style={{ color: col.receipt.company.sponsor_color }}
                >
                  {col.receipt.company.name}
                </p>
                <h3 className="text-[14px] font-bold tracking-[-0.005em] text-black leading-[1.3]">
                  {col.receipt.brief_title}
                </h3>
                <p className="mt-1 text-[12px] text-gray-500">
                  {col.receipt.builder.name} · @{col.receipt.builder.username}
                </p>
                <p className="mt-3 font-display font-bold text-[28px] text-black tabular-nums leading-none">
                  {col.receipt.composite_score}
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                  Composite
                </p>
              </Link>
            )
          )}
        </div>
      </section>
    </div>
  );
}
