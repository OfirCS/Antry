"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Editorial sub-nav shared across every /settings page.
 *
 * Three jobs, three pills. Active state shows a lime accent underline
 * (no chrome, no boxes). Designed to read as a row of links — not a
 * tab control.
 */
const TABS = [
  { href: "/settings", label: "Profile" },
  { href: "/settings/api-keys", label: "Cursor" },
  { href: "/settings/portability", label: "Portability" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="mb-10 flex items-center gap-1 border-b"
      style={{ borderColor: "#EBEBEB" }}
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="relative inline-flex items-center px-4 py-3 text-[13px] font-semibold tracking-[-0.005em] transition-colors"
            style={{ color: active ? "#0A0A0A" : "#737373" }}
          >
            {tab.label}
            {active && (
              <span
                aria-hidden="true"
                className="absolute left-3 right-3 -bottom-px h-[2px]"
                style={{ background: "#C6F135" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
