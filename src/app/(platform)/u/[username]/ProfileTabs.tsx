"use client";

import { useState } from "react";

export function ProfileTabs({
  tabs,
}: {
  tabs: { key: string; label: string; count: number }[];
}) {
  const [active, setActive] = useState(tabs[0]?.key);
  return (
    <div
      className="flex items-center gap-0 -mx-4 sm:mx-0"
      style={{ borderBottom: "1px solid #EBEBEB" }}
      role="tablist"
    >
      {tabs.map((t) => {
        const on = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => setActive(t.key)}
            className="px-4 py-3 text-[13px] font-bold tracking-[-0.005em] transition-colors relative"
            style={{
              color: on ? "#0A0A0A" : "#737373",
            }}
          >
            {t.label}
            <span
              className="ml-1.5 text-[11px] font-semibold"
              style={{ color: on ? "#525252" : "#A3A3A3" }}
            >
              {t.count}
            </span>
            {on && (
              <span
                className="absolute left-3 right-3 -bottom-px h-[2px]"
                style={{ background: "#0A0A0A" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
