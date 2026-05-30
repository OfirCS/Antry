import type { Metadata } from "next";
import Link from "next/link";
import { Wand2 } from "lucide-react";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { demoBriefs } from "@/lib/receipts/demo-data";
import type { Brief, BriefDifficulty } from "@/lib/receipts/types";
import {
  BriefsFilter,
  type CategoryFilter,
  type DifficultyFilter,
} from "./_components/BriefsFilter";
import { SortMenu } from "./_components/SortMenu";
import { BriefCard } from "./_components/BriefCard";

// Inline the catalog dimensions so this Server Component never needs to
// import iterable runtime values from "use client" modules (which Turbopack
// proxies to non-iterable references at runtime).
const DIFFICULTY_KEYS = ["intro", "mid", "senior", "staff"] as const;
const CATEGORY_KEYS = ["ai-agents", "data-ml", "tools"] as const;
const SORT_KEYS = ["newest", "most-attempted", "highest-median"] as const;
type SortKey = (typeof SORT_KEYS)[number];

const TITLE = "Briefs — Antry";
const DESCRIPTION =
  "Real missions from 325 hiring companies. Ship in Cursor with the Antry MCP. Mint a signed Receipt.";

export const metadata: Metadata = {
  title: "Briefs",
  description: DESCRIPTION,
  alternates: { canonical: "/briefs" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/briefs",
    image: ogImageUrl({
      title: "Briefs.",
      subtitle: "Real work. Signed Receipts. Not take-homes.",
      eyebrow: "ANTRY",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

const DIFFICULTY_SET = new Set<BriefDifficulty>(DIFFICULTY_KEYS);
const CATEGORY_SET = new Set<string>(CATEGORY_KEYS);
const SORT_SET = new Set<SortKey>(SORT_KEYS);

function pickOne(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

function parseDifficulty(
  raw: string | string[] | undefined,
): DifficultyFilter {
  const v = pickOne(raw);
  if (v && DIFFICULTY_SET.has(v as BriefDifficulty)) {
    return v as BriefDifficulty;
  }
  return "all";
}

function parseCategory(raw: string | string[] | undefined): CategoryFilter {
  const v = pickOne(raw);
  if (v && CATEGORY_SET.has(v)) return v as CategoryFilter;
  return "all";
}

function parseSort(raw: string | string[] | undefined): SortKey {
  const v = pickOne(raw);
  if (v && SORT_SET.has(v as SortKey)) return v as SortKey;
  return "newest";
}

function sortBriefs(briefs: Brief[], sort: SortKey): Brief[] {
  const arr = [...briefs];
  switch (sort) {
    case "most-attempted":
      arr.sort((a, b) => b.attempts_count - a.attempts_count);
      break;
    case "highest-median":
      arr.sort(
        (a, b) => (b.median_score ?? -1) - (a.median_score ?? -1),
      );
      break;
    case "newest":
    default:
      arr.sort(
        (a, b) =>
          Date.parse(b.created_at) - Date.parse(a.created_at),
      );
      break;
  }
  return arr;
}

export default async function BriefsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const difficulty = parseDifficulty(sp.difficulty);
  const category = parseCategory(sp.category);
  const sort = parseSort(sp.sort);

  const visible = sortBriefs(
    demoBriefs.filter((b) => {
      if (difficulty !== "all" && b.difficulty !== difficulty) return false;
      if (category !== "all" && b.category !== category) return false;
      return true;
    }),
    sort,
  );

  const now = Date.now();
  const totalCount = demoBriefs.length;
  const visibleCount = visible.length;
  const hasActiveFilters = difficulty !== "all" || category !== "all";

  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      <section
        className="relative"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EBEBEB" }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "#0A0A0A" }}
        />
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-10 pb-7 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
              Briefs
            </p>
            <h1
              className="font-display font-bold tracking-[-0.025em] text-black leading-[1.05]"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}
            >
              The resume for the AI era.
            </h1>
            <p className="mt-2 max-w-[520px] text-[14px] leading-[1.55] text-gray-600">
              Real work from 325 hiring companies. Opus 4.5 already broke
              the take-home. Receipts measure how you collaborate with it.
            </p>
          </div>
          <Link
            href="/briefs/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 h-10 text-[13px] font-bold transition-all hover:-translate-y-0.5"
            style={{ background: "#0A0A0A", color: "#FFFFFF" }}
          >
            <Wand2 className="w-3.5 h-3.5" />
            Author a Brief
          </Link>
        </div>
      </section>

      <section className="pt-6 pb-3">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[260px]">
              <BriefsFilter
                difficulty={difficulty}
                category={category}
                sort={sort}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-gray-500 tabular-nums hidden sm:inline">
                {visibleCount} of {totalCount}
              </span>
              <SortMenu
                active={sort}
                difficulty={difficulty}
                category={category}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          {visible.length === 0 ? (
            <div
              className="rounded-[14px] py-12 px-6 flex flex-col items-center text-center"
              style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
            >
              <p className="text-[14px] text-gray-600 mb-3">
                No Briefs match these filters.
              </p>
              <Link
                href="/briefs"
                className="inline-flex items-center gap-1 text-[13px] font-bold text-black hover:gap-1.5 transition-all"
              >
                Clear filters
                <span aria-hidden>→</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visible.map((b) => (
                <BriefCard key={b.id} brief={b} now={now} />
              ))}
            </div>
          )}
          {hasActiveFilters && visible.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Link
                href="/briefs"
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 hover:text-black transition-colors"
              >
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
