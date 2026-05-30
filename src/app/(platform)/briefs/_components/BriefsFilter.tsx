import Link from "next/link";
import type { BriefDifficulty } from "@/lib/receipts/types";

/**
 * Difficulty + Category filter chips for the Briefs catalog.
 *
 * Uses URL search params so the page stays a Server Component and
 * filter state is shareable. `All` clears the param; every other
 * chip rewrites it. Selecting one chip preserves the other dimension.
 */

export const DIFFICULTY_KEYS = ["intro", "mid", "senior", "staff"] as const;
export const CATEGORY_KEYS = ["ai-agents", "data-ml", "tools"] as const;

export type DifficultyFilter = "all" | BriefDifficulty;
export type CategoryFilter = "all" | (typeof CATEGORY_KEYS)[number];

const DIFFICULTY_ACCENT: Record<BriefDifficulty, { bg: string; fg: string }> = {
  intro: { bg: "#A7F3D0", fg: "#0A0A0A" },
  mid: { bg: "#3B82F6", fg: "#FFFFFF" },
  senior: { bg: "#8B5CF6", fg: "#FFFFFF" },
  staff: { bg: "#EC4899", fg: "#FFFFFF" },
};

const DIFFICULTY_LABELS: Record<DifficultyFilter, string> = {
  all: "All",
  intro: "Intro",
  mid: "Mid",
  senior: "Senior",
  staff: "Staff",
};

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "All",
  "ai-agents": "ai-agents",
  "data-ml": "data-ml",
  tools: "tools",
};

function buildHref(
  base: string,
  patch: Record<string, string | undefined>,
  current: { difficulty: DifficultyFilter; category: CategoryFilter; sort?: string },
): string {
  const next = new URLSearchParams();
  const difficulty = patch.difficulty ?? current.difficulty;
  const category = patch.category ?? current.category;
  const sort = patch.sort ?? current.sort;
  if (difficulty && difficulty !== "all") next.set("difficulty", difficulty);
  if (category && category !== "all") next.set("category", category);
  if (sort && sort !== "newest") next.set("sort", sort);
  const qs = next.toString();
  return qs ? `${base}?${qs}` : base;
}

export function BriefsFilter({
  difficulty,
  category,
  sort,
}: {
  difficulty: DifficultyFilter;
  category: CategoryFilter;
  sort: string;
}) {
  const current = { difficulty, category, sort };

  const difficultyChips: { key: DifficultyFilter; label: string }[] = [
    { key: "all", label: DIFFICULTY_LABELS.all },
    ...DIFFICULTY_KEYS.map((k) => ({ key: k, label: DIFFICULTY_LABELS[k] })),
  ];
  const categoryChips: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: CATEGORY_LABELS.all },
    ...CATEGORY_KEYS.map((k) => ({ key: k, label: CATEGORY_LABELS[k] })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 shrink-0 w-[68px]">
          Difficulty
        </span>
        <div
          role="tablist"
          aria-label="Filter by difficulty"
          className="flex items-center gap-1.5 flex-wrap"
        >
          {difficultyChips.map((c) => {
            const isActive = c.key === difficulty;
            const href = buildHref("/briefs", { difficulty: c.key }, current);
            let style: React.CSSProperties = {
              background: "#FFFFFF",
              color: "#525252",
              border: "1px solid #EBEBEB",
            };
            if (isActive) {
              if (c.key === "all") {
                style = {
                  background: "#0A0A0A",
                  color: "#FFFFFF",
                  border: "1px solid #0A0A0A",
                };
              } else {
                const accent = DIFFICULTY_ACCENT[c.key];
                style = {
                  background: accent.bg,
                  color: accent.fg,
                  border: `1px solid ${accent.bg}`,
                };
              }
            }
            return (
              <Link
                key={c.key}
                href={href}
                role="tab"
                aria-selected={isActive}
                scroll={false}
                className="inline-flex items-center h-7 px-2.5 rounded-full text-[11px] font-bold tracking-[-0.005em] transition-colors"
                style={style}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 shrink-0 w-[68px]">
          Category
        </span>
        <div
          role="tablist"
          aria-label="Filter by category"
          className="flex items-center gap-1.5 flex-wrap"
        >
          {categoryChips.map((c) => {
            const isActive = c.key === category;
            const href = buildHref("/briefs", { category: c.key }, current);
            const style: React.CSSProperties = isActive
              ? {
                  background: "#0A0A0A",
                  color: "#FFFFFF",
                  border: "1px solid #0A0A0A",
                }
              : {
                  background: "#FFFFFF",
                  color: "#525252",
                  border: "1px solid #EBEBEB",
                };
            return (
              <Link
                key={c.key}
                href={href}
                role="tab"
                aria-selected={isActive}
                scroll={false}
                className="inline-flex items-center h-7 px-2.5 rounded-full text-[11px] font-bold tracking-[-0.005em] transition-colors"
                style={style}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { buildHref };
