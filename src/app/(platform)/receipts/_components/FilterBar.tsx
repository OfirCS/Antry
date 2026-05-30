"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type FilterOption = { value: string; label: string };

type FilterBarProps = {
  difficulty: string;
  category: string;
  sponsor: string;
  sort: string;
  difficultyOptions: FilterOption[];
  categoryOptions: FilterOption[];
  sponsorOptions: FilterOption[];
  sortOptions: FilterOption[];
};

/**
 * Filter bar for /receipts. All state lives in the URL — we read the active
 * value from props (server reads searchParams) and write via the router. Each
 * group is a chip row; clicking a chip swaps just that param and pushes a
 * scroll-stable navigation so the grid below updates in place.
 */
export function FilterBar({
  difficulty,
  category,
  sponsor,
  sort,
  difficultyOptions,
  categoryOptions,
  sponsorOptions,
  sortOptions,
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string, defaultValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === defaultValue) params.delete(key);
      else params.set(key, value);
      const qs = params.toString();
      router.push(qs ? `/receipts?${qs}` : "/receipts", { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div
      className="rounded-[18px] bg-white"
      style={{ border: "1px solid #EBEBEB" }}
    >
      <div className="p-4 sm:p-5 space-y-3">
        <FilterRow
          label="Difficulty"
          active={difficulty}
          options={difficultyOptions}
          onChange={(v) => setParam("difficulty", v, "all")}
        />
        <FilterRow
          label="Category"
          active={category}
          options={categoryOptions}
          onChange={(v) => setParam("category", v, "all")}
        />
        <FilterRow
          label="Sponsor"
          active={sponsor}
          options={sponsorOptions}
          onChange={(v) => setParam("sponsor", v, "all")}
        />
        <FilterRow
          label="Sort"
          active={sort}
          options={sortOptions}
          onChange={(v) => setParam("sort", v, "newest")}
        />
      </div>
    </div>
  );
}

function FilterRow({
  label,
  active,
  options,
  onChange,
}: {
  label: string;
  active: string;
  options: FilterOption[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 pt-2 w-full sm:w-[68px] shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = active === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="text-[12px] font-semibold rounded-full px-3 h-8 transition-colors"
              style={{
                background: isActive ? "#0A0A0A" : "#FAFAF7",
                color: isActive ? "#FFFFFF" : "#525252",
                border: isActive
                  ? "1px solid #0A0A0A"
                  : "1px solid #EBEBEB",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
