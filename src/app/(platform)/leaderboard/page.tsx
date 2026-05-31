import type { Metadata } from "next";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { demoReceipts } from "@/lib/receipts/demo-data";
import {
  DIMENSION_LABELS,
  type FingerprintDimension,
  type Receipt,
} from "@/lib/receipts/types";
import { ALL_DIMENSIONS } from "@/lib/receipts/fingerprint";
import {
  LeaderboardFilter,
  type FilterOption,
} from "./_components/LeaderboardFilter";
import {
  LeaderboardRow,
  buildEntryFromReceipts,
  rowMax,
  rowMedian,
} from "./_components/LeaderboardRow";

const DIMENSION_KEYS: Array<"composite" | FingerprintDimension> = [
  "composite",
  ...ALL_DIMENSIONS,
];
const WINDOW_KEYS = ["all", "30d", "7d"] as const;
type WindowKey = (typeof WINDOW_KEYS)[number];

const DIMENSION_SET = new Set<string>(DIMENSION_KEYS);
const WINDOW_SET = new Set<WindowKey>(WINDOW_KEYS);

const DIMENSION_FILTER_LABELS: Record<string, string> = {
  composite: "Composite",
  ...DIMENSION_LABELS,
};

const WINDOW_LABELS: Record<WindowKey, string> = {
  all: "All time",
  "30d": "Last 30 days",
  "7d": "Last 7 days",
};

const TITLE = "Leaderboard — Top builders on Antry";
const DESCRIPTION =
  "Builders ranked by median composite across their signed Receipts. Filter by dimension and time window.";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: DESCRIPTION,
  alternates: { canonical: "/leaderboard" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/leaderboard",
    image: ogImageUrl({
      title: "Top builders, all time.",
      subtitle: "Ranked by median composite across all their Receipts.",
      eyebrow: "ANTRY · LEADERBOARD",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

function pickOne(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

function parseDimension(
  raw: string | string[] | undefined,
): "composite" | FingerprintDimension {
  const v = pickOne(raw);
  if (v && DIMENSION_SET.has(v)) return v as "composite" | FingerprintDimension;
  return "composite";
}

function parseWindow(raw: string | string[] | undefined): WindowKey {
  const v = pickOne(raw);
  if (v && WINDOW_SET.has(v as WindowKey)) return v as WindowKey;
  return "all";
}

const DAY_MS = 24 * 60 * 60 * 1000;

function applyWindow(receipts: Receipt[], window: WindowKey): Receipt[] {
  if (window === "all") return receipts;
  const cutoffDays = window === "7d" ? 7 : 30;
  // Anchor the cutoff to the freshest Receipt in the demo set so the time
  // filter still has signal in this seed corpus (real production would just
  // use Date.now() — but our demo data is dated April–May 2026).
  const newest = receipts.reduce((latest, r) => {
    const t = Date.parse(r.signed_at);
    return t > latest ? t : latest;
  }, 0);
  const cutoff = newest - cutoffDays * DAY_MS;
  return receipts.filter((r) => Date.parse(r.signed_at) >= cutoff);
}

function scoreFor(
  r: Receipt,
  dimension: "composite" | FingerprintDimension,
): number {
  return dimension === "composite"
    ? r.composite_score
    : r.fingerprint[dimension];
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const dimension = parseDimension(sp.dimension);
  const window = parseWindow(sp.window);

  // 1. Apply time window. 2. Group receipts by builder username.
  const windowed = applyWindow(demoReceipts, window);

  const byBuilder = new Map<
    string,
    {
      username: string;
      name: string;
      gradient: string;
      receipts: Receipt[];
    }
  >();
  for (const r of windowed) {
    const key = r.builder.username;
    const bucket = byBuilder.get(key);
    if (bucket) {
      bucket.receipts.push(r);
    } else {
      byBuilder.set(key, {
        username: r.builder.username,
        name: r.builder.name,
        gradient: r.builder.gradient,
        receipts: [r],
      });
    }
  }

  // 3. Compute median (primary rank) + max (tiebreaker) for the selected
  //    dimension. 4. Sort descending. 5. Slice to top 20.
  const ranked = Array.from(byBuilder.values())
    .map((b) => {
      const values = b.receipts.map((r) => scoreFor(r, dimension));
      return {
        ...b,
        median: rowMedian(values),
        max: rowMax(values),
        values,
      };
    })
    .sort((a, b) => {
      if (b.median !== a.median) return b.median - a.median;
      return b.max - a.max;
    })
    .slice(0, 20);

  const dimensionOptions: FilterOption[] = DIMENSION_KEYS.map((k) => ({
    value: k,
    label: DIMENSION_FILTER_LABELS[k] ?? k,
  }));
  const windowOptions: FilterOption[] = WINDOW_KEYS.map((k) => ({
    value: k,
    label: WINDOW_LABELS[k],
  }));

  const primaryLabel = DIMENSION_FILTER_LABELS[dimension] ?? "Composite";
  const showComposite = dimension !== "composite";

  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      {/* HEADER BAND — lime accent stripe pinned to top edge. */}
      <section
        className="relative"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB" }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "#C6F135" }}
        />
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-10 pb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
            Leaderboard
          </p>
          <h1
            className="font-display font-bold tracking-[-0.025em] text-black leading-[1.05]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}
          >
            Top builders, all time.
          </h1>
          <p className="mt-2 max-w-[560px] text-[14px] leading-[1.55] text-gray-600">
            Ranked by median composite across all their Receipts.
          </p>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="pt-6 pb-3">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          <LeaderboardFilter
            dimension={dimension}
            window={window}
            dimensionOptions={dimensionOptions}
            windowOptions={windowOptions}
          />
          <div className="mt-3 text-[11px] text-gray-500 tabular-nums">
            {ranked.length} builder{ranked.length === 1 ? "" : "s"} · ranking by{" "}
            <span className="font-bold text-[#262626]">{primaryLabel}</span> ·{" "}
            <span className="font-bold text-[#262626]">
              {WINDOW_LABELS[window]}
            </span>
          </div>
        </div>
      </section>

      {/* LIST */}
      <section className="pb-16">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          {ranked.length === 0 ? (
            <div
              className="rounded-[14px] py-12 px-6 flex flex-col items-center text-center"
              style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
            >
              <p className="text-[14px] text-gray-600">
                No Receipts in this window yet.
              </p>
            </div>
          ) : (
            <ol className="flex flex-col gap-2.5">
              {ranked.map((b, i) => (
                <li key={b.username}>
                  <LeaderboardRow
                    entry={buildEntryFromReceipts({
                      rank: i + 1,
                      username: b.username,
                      name: b.name,
                      gradient: b.gradient,
                      receipts: b.receipts,
                      primaryLabel,
                      primaryValues: b.values,
                      showComposite,
                    })}
                  />
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
