import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import {
  demoReceipts,
  demoBriefs,
  demoCompanies,
} from "@/lib/receipts/demo-data";
import type { Receipt, BriefDifficulty } from "@/lib/receipts/types";
import { FilterBar, type FilterOption } from "./_components/FilterBar";
import { ReceiptCard } from "./_components/ReceiptCard";

// Catalog dimensions for filters. Mirrors /briefs conventions so the two
// browse surfaces feel consistent.
const DIFFICULTY_KEYS = ["intro", "mid", "senior", "staff"] as const;
const CATEGORY_KEYS = ["ai-agents", "data-ml", "tools"] as const;
const SPONSOR_KEYS = Object.keys(demoCompanies) as Array<
  keyof typeof demoCompanies
>;
const SORT_KEYS = [
  "newest",
  "highest-composite",
  "most-recent",
  "random",
] as const;

type SortKey = (typeof SORT_KEYS)[number];

const DIFFICULTY_SET = new Set<BriefDifficulty>(DIFFICULTY_KEYS);
const CATEGORY_SET = new Set<string>(CATEGORY_KEYS);
const SPONSOR_SET = new Set<string>(SPONSOR_KEYS);
const SORT_SET = new Set<SortKey>(SORT_KEYS);

const TITLE = "Receipts — Every signed Receipt on Antry";
const DESCRIPTION =
  "Browse every signed Receipt. Filter by difficulty, category, sponsor; sort by score or recency. Each one verifiable.";

export const metadata: Metadata = {
  title: "Receipts",
  description: DESCRIPTION,
  alternates: { canonical: "/receipts" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/receipts",
    image: ogImageUrl({
      title: "Every signed Receipt.",
      subtitle: "Filter, sort, browse. Each one verifiable.",
      eyebrow: "ANTRY · RECEIPTS",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

function pickOne(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

function parseDifficulty(raw: string | string[] | undefined): "all" | BriefDifficulty {
  const v = pickOne(raw);
  if (v && DIFFICULTY_SET.has(v as BriefDifficulty)) return v as BriefDifficulty;
  return "all";
}
function parseCategory(raw: string | string[] | undefined): string {
  const v = pickOne(raw);
  if (v && CATEGORY_SET.has(v)) return v;
  return "all";
}
function parseSponsor(raw: string | string[] | undefined): string {
  const v = pickOne(raw);
  if (v && SPONSOR_SET.has(v)) return v;
  return "all";
}
function parseSort(raw: string | string[] | undefined): SortKey {
  const v = pickOne(raw);
  if (v && SORT_SET.has(v as SortKey)) return v as SortKey;
  return "newest";
}

// Lookup brief by id once, then index for O(1) category/difficulty lookups
// during filtering. Server-only — no client cost.
const BRIEF_INDEX = new Map(demoBriefs.map((b) => [b.id, b]));

// Deterministic shuffle for sort=random. Uses content_hash as the seed so
// repeated server renders produce the same order — important for caching
// and SEO. xmur3 hash + mulberry32 PRNG, tiny and stable.
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function pseudoRandomKey(r: Receipt): number {
  // Stable per receipt — same order on every render.
  const seed = xmur3(r.id)();
  return seed;
}

function sortReceipts(receipts: Receipt[], sort: SortKey): Receipt[] {
  const arr = [...receipts];
  switch (sort) {
    case "highest-composite":
      arr.sort((a, b) => b.composite_score - a.composite_score);
      break;
    case "most-recent": {
      // Most recently *published* Brief first, then signed_at as tiebreaker.
      // Distinct from `newest` which orders purely by when the Receipt was
      // signed — `most-recent` surfaces Receipts on the freshest Briefs.
      arr.sort((a, b) => {
        const ba = BRIEF_INDEX.get(a.brief_id);
        const bb = BRIEF_INDEX.get(b.brief_id);
        const ta = ba ? Date.parse(ba.created_at) : 0;
        const tb = bb ? Date.parse(bb.created_at) : 0;
        if (tb !== ta) return tb - ta;
        return Date.parse(b.signed_at) - Date.parse(a.signed_at);
      });
      break;
    }
    case "random":
      arr.sort((a, b) => pseudoRandomKey(a) - pseudoRandomKey(b));
      break;
    case "newest":
    default:
      arr.sort((a, b) => Date.parse(b.signed_at) - Date.parse(a.signed_at));
      break;
  }
  return arr;
}

export default async function ReceiptsListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp: { [key: string]: string | string[] | undefined } =
    process.env.STATIC_EXPORT === "1" ? {} : await searchParams;
  const difficulty = parseDifficulty(sp.difficulty);
  const category = parseCategory(sp.category);
  const sponsor = parseSponsor(sp.sponsor);
  const sort = parseSort(sp.sort);

  const visible = sortReceipts(
    demoReceipts.filter((r) => {
      if (sponsor !== "all" && r.company.slug !== sponsor) return false;
      const brief = BRIEF_INDEX.get(r.brief_id);
      if (!brief) return true;
      if (difficulty !== "all" && brief.difficulty !== difficulty) return false;
      if (category !== "all" && brief.category !== category) return false;
      return true;
    }),
    sort,
  );

  const totalCount = demoReceipts.length;
  const visibleCount = visible.length;
  const hasActiveFilters =
    difficulty !== "all" ||
    category !== "all" ||
    sponsor !== "all" ||
    sort !== "newest";

  const difficultyOptions: FilterOption[] = [
    { value: "all", label: "All" },
    ...DIFFICULTY_KEYS.map((k) => ({
      value: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
    })),
  ];
  const categoryOptions: FilterOption[] = [
    { value: "all", label: "All" },
    ...CATEGORY_KEYS.map((k) => ({ value: k, label: k })),
  ];
  const sponsorOptions: FilterOption[] = [
    { value: "all", label: "All" },
    ...SPONSOR_KEYS.map((k) => ({
      value: k,
      label: demoCompanies[k].name,
    })),
  ];
  const sortOptions: FilterOption[] = [
    { value: "newest", label: "Newest" },
    { value: "highest-composite", label: "Highest composite" },
    { value: "most-recent", label: "Most recent" },
    { value: "random", label: "Random" },
  ];

  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      {/* HEADER BAND — black 3px accent stripe pinned to top edge. */}
      <section
        className="relative"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB" }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "#0A0A0A" }}
        />
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-10 pb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
            Receipts
          </p>
          <h1
            className="font-display font-bold tracking-[-0.025em] text-black leading-[1.05]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}
          >
            Every signed Receipt.
          </h1>
          <p className="mt-2 max-w-[520px] text-[14px] leading-[1.55] text-gray-600">
            Filter, sort, browse. Each one verifiable.
          </p>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="pt-6 pb-3">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          <Suspense fallback={null}>
            <FilterBar
              difficulty={difficulty}
              category={category}
              sponsor={sponsor}
              sort={sort}
              difficultyOptions={difficultyOptions}
              categoryOptions={categoryOptions}
              sponsorOptions={sponsorOptions}
              sortOptions={sortOptions}
            />
          </Suspense>
          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[11px] text-gray-500 tabular-nums">
              {visibleCount} of {totalCount} Receipts
            </span>
            {hasActiveFilters && (
              <Link
                href="/receipts"
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 hover:text-black transition-colors"
              >
                Clear filters
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="pb-16">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          {visible.length === 0 ? (
            <div
              className="rounded-[14px] py-12 px-6 flex flex-col items-center text-center"
              style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
            >
              <p className="text-[14px] text-gray-600 mb-3">
                No Receipts match these filters.
              </p>
              <Link
                href="/receipts"
                className="inline-flex items-center gap-1 text-[13px] font-bold text-black hover:gap-1.5 transition-all"
              >
                Clear
                <span aria-hidden>→</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visible.map((r) => (
                <ReceiptCard key={r.id} receipt={r} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
