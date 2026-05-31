"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type FilterOption = { value: string; label: string };

type Props = {
  dimension: string;
  window: string;
  dimensionOptions: FilterOption[];
  windowOptions: FilterOption[];
};

/**
 * Filter bar for /leaderboard. All state lives in the URL — the server
 * reads it via searchParams and renders the ranked list. Clicking a chip
 * pushes a scroll-stable navigation so the list updates in place.
 *
 * Two dimensions of control:
 *   • dimension = which axis to rank by (Composite or one of the 7 axes)
 *   • window    = time slice of Receipts to consider
 */
export function LeaderboardFilter({
  dimension,
  window,
  dimensionOptions,
  windowOptions,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string, defaultValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === defaultValue) params.delete(key);
      else params.set(key, value);
      const qs = params.toString();
      router.push(qs ? `/leaderboard?${qs}` : "/leaderboard", {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  return (
    <div
      className="rounded-[18px] bg-white"
      style={{ border: "1px solid #EBEBEB" }}
    >
      <div className="p-4 sm:p-5 space-y-3">
        <FilterRow
          label="Rank by"
          active={dimension}
          options={dimensionOptions}
          onChange={(v) => setParam("dimension", v, "composite")}
        />
        <FilterRow
          label="Window"
          active={window}
          options={windowOptions}
          onChange={(v) => setParam("window", v, "all")}
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
                border: isActive ? "1px solid #0A0A0A" : "1px solid #EBEBEB",
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
