"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home as HomeIcon, Sparkles, Telescope, User, Plus } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";

/**
 * Mobile-only bottom tab bar. Visible below the `sm` breakpoint (< 640px).
 *
 * Five items: Feed · Briefs · Compose (center FAB) · Scout · Profile.
 * The Compose button is intentionally prominent — circular, black, +
 * glyph, slight elevation — because Compose is the only "create" action
 * in the product and we want it thumb-reachable.
 *
 * Active item: black text + a 16px underline indicator (2px, near-black).
 * Inactive: neutral-500.
 *
 * Hidden on `sm:` and above — desktop already has the top nav.
 *
 * Important: pages should account for the ~64px bottom nav with
 * sufficient bottom padding so content isn't hidden behind it.
 */

type TabHref =
  | "/"
  | "/briefs"
  | "/scout"
  | "/dashboard"
  | "/login";

function tabActive(pathname: string, href: TabHref): boolean {
  if (href === "/") return pathname === "/";
  const seg = pathname.split("/").filter(Boolean)[0];
  const targetSeg = href.split("/").filter(Boolean)[0];
  return seg === targetSeg;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);
  const profileHref: TabHref = isLoggedIn ? "/dashboard" : "/login";

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40"
      style={{
        background: "#FFFFFFF2",
        backdropFilter: "saturate(180%) blur(10px)",
        WebkitBackdropFilter: "saturate(180%) blur(10px)",
        borderTop: "1px solid #EBEBEB",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <ul className="mx-auto max-w-[640px] flex items-end justify-around h-16 px-2">
        <BottomTab
          href="/"
          label="Feed"
          icon={<HomeIcon className="w-5 h-5" />}
          active={tabActive(pathname, "/")}
        />
        <BottomTab
          href="/briefs"
          label="Briefs"
          icon={<Sparkles className="w-5 h-5" />}
          active={tabActive(pathname, "/briefs")}
        />

        {/* Centerpiece Compose FAB */}
        <li className="flex-1 flex items-end justify-center">
          <Link
            href="/compose"
            aria-label="Compose"
            className="inline-flex items-center justify-center -translate-y-2 transition-transform active:scale-95"
            style={{
              width: 56,
              height: 56,
              borderRadius: 9999,
              background: "#0A0A0A",
              color: "#FFFFFF",
              boxShadow:
                "0 6px 16px rgba(10,10,10,0.18), 0 2px 4px rgba(10,10,10,0.10)",
            }}
          >
            <Plus className="w-6 h-6" strokeWidth={2.4} />
          </Link>
        </li>

        <BottomTab
          href="/scout"
          label="Scout"
          icon={<Telescope className="w-5 h-5" />}
          active={tabActive(pathname, "/scout")}
        />
        <BottomTab
          href={profileHref}
          label="Profile"
          icon={<User className="w-5 h-5" />}
          active={
            pathname.startsWith("/dashboard") ||
            pathname.startsWith("/settings") ||
            pathname.startsWith("/u/") ||
            (!isLoggedIn && pathname.startsWith("/login"))
          }
        />
      </ul>
    </nav>
  );
}

function BottomTab({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <li className="flex-1">
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className="flex flex-col items-center justify-center gap-0.5 h-16 w-full transition-colors"
        style={{ color: active ? "#0A0A0A" : "#737373", minHeight: 44 }}
      >
        {icon}
        <span
          className="text-[10px] font-bold tracking-[0.04em] leading-none"
          style={{ color: active ? "#0A0A0A" : "#737373" }}
        >
          {label}
        </span>
        <span
          aria-hidden
          className="block rounded-full"
          style={{
            height: 2,
            width: active ? 16 : 0,
            background: "#0A0A0A",
            transition: "width 160ms ease",
          }}
        />
      </Link>
    </li>
  );
}
