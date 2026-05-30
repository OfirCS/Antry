import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDemoReceipt } from "@/lib/receipts/demo-data";
import type { Receipt } from "@/lib/receipts/types";
import { CompareClient, type CompareColumn } from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare Receipts · Scout",
  description:
    "Side-by-side comparison of candidate Receipts. Decide who to reach out to before the first email goes out.",
  robots: { index: false, follow: false },
};

// Compare surface caps. Mirrors COMPARE_MIN/MAX in ScoutClient — keep in sync.
const COMPARE_MIN = 1;
const COMPARE_MAX = 3;

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = sp.ids;
  const rawString =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw.join(",") : "";

  // No IDs at all — bounce back to Scout. The query param tells Scout to
  // surface a soft inline message so the user understands what happened.
  if (!rawString.trim()) {
    redirect("/scout?compare=missing");
  }

  // Dedupe + cap so a tampered URL can't blow up the layout.
  const ids = Array.from(
    new Set(
      rawString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ).slice(0, COMPARE_MAX);

  // Resolve each ID to either a Receipt or a placeholder marker. Keeping
  // the column slot even when an ID misses lets the recruiter see which
  // link broke — easier to debug than a silent drop.
  const columns: CompareColumn[] = ids.map((id) => {
    const r = getDemoReceipt(id);
    if (!r) return { kind: "missing", id };
    return { kind: "receipt", id, receipt: r satisfies Receipt };
  });

  return <CompareClient columns={columns} min={COMPARE_MIN} />;
}
