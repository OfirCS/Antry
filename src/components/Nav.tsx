"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import {
  Plus,
  Home as HomeIcon,
  Trophy,
  User,
  Telescope,
  Sparkles,
  Building2,
} from "lucide-react";
import { AntryLogoFull } from "@/components/AntryLogo";

/**
 * Slim nav for the social feed era.
 *
 * Desktop (sm+): logo + Feed / Hack / Scout tabs + Post CTA + avatar.
 * Mobile (< sm): logo + Post + avatar only — the Feed/Hack/Scout tabs
 * live in `MobileBottomNav` so we don't duplicate. A subtle "Sign in"
 * chip fades in after the user scrolls a bit (logged-out only) so the
 * top bar stays uncluttered at rest but gives signed-out users an
 * always-reachable affordance once they start consuming the feed.
 */

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const seg = pathname.split("/").filter(Boolean)[0];
  const targetSeg = href.split("/").filter(Boolean)[0];
  return seg === targetSeg;
}

export function Nav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 transition-shadow"
      style={{
        background: "#FFFFFFEE",
        backdropFilter: "saturate(180%) blur(8px)",
        WebkitBackdropFilter: "saturate(180%) blur(8px)",
        boxShadow: scrolled ? "0 1px 0 #EBEBEB" : "none",
      }}
    >
      <nav className="mx-auto max-w-[1240px] px-4 sm:px-6 h-16 flex items-center gap-1 sm:gap-2">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center hover:opacity-70 transition-opacity mr-2"
          aria-label="Antry — Home"
        >
          <AntryLogoFull size={26} />
        </Link>

        {/* Tabs — hidden on mobile (bottom nav owns those tabs there).
            Order mirrors the product loop: watch the Feed → take a
            Brief → climb the Leaderboard → get found via Scout. */}
        <div className="hidden sm:flex items-center gap-0.5">
          <NavTab
            href="/"
            label="Feed"
            icon={<HomeIcon className="w-3.5 h-3.5" />}
            active={isActive(pathname, "/")}
          />
          <NavTab
            href="/briefs"
            label="Briefs"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            active={isActive(pathname, "/briefs")}
          />
          <NavTab
            href="/leaderboard"
            label="Leaderboard"
            icon={<Trophy className="w-3.5 h-3.5" />}
            active={isActive(pathname, "/leaderboard")}
          />
          <NavTab
            href="/scout"
            label="Scout"
            icon={<Telescope className="w-3.5 h-3.5" />}
            active={isActive(pathname, "/scout")}
          />
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2">
          {/* Companies-side entry point — quiet but always present, so
              a hiring manager landing anywhere can find their lane. */}
          <Link
            href="/for-companies"
            className="hidden md:inline-flex items-center gap-1.5 px-3 h-9 rounded-[10px] text-[13px] font-bold transition-colors hover:bg-[#FAFAF7]"
            style={{ color: "#525252" }}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>For companies</span>
          </Link>
          {/* Scroll-aware Sign-in chip — mobile only, signed-out only.
              Fades in once the user has scrolled past the hero so the
              top bar can stay quiet at first paint. */}
          {!user && (
            <Link
              href="/login"
              className="sm:hidden inline-flex items-center justify-center rounded-full px-3 h-8 text-[12px] font-bold transition-opacity duration-200"
              style={{
                background: "#FAFAF7",
                border: "1px solid #EBEBEB",
                color: "#0A0A0A",
                opacity: scrolled ? 1 : 0,
                pointerEvents: scrolled ? "auto" : "none",
              }}
              aria-hidden={!scrolled}
              tabIndex={scrolled ? 0 : -1}
            >
              Sign in
            </Link>
          )}

          <Link
            href="/compose"
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 sm:px-4 min-w-[44px] h-11 sm:h-9 text-[13px] font-bold transition-all hover:-translate-y-0.5"
            style={{ background: "#0A0A0A", color: "#FFFFFF" }}
            aria-label="Post"
          >
            <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Post</span>
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 rounded-full text-[12px] font-bold text-white transition-all hover:-translate-y-0.5"
              style={{
                background:
                  "linear-gradient(135deg, #FF6B35 0%, #C6F135 100%)",
              }}
              aria-label="Profile"
            >
              {(user.email ?? "?").charAt(0).toUpperCase()}
            </Link>
          ) : (
            // Desktop sign-in (always visible at sm+). Mobile version is
            // the scroll-aware chip above.
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-9 text-[13px] font-bold transition-colors"
              style={{ color: "#0A0A0A" }}
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

function NavTab({
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
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[10px] text-[13px] font-bold transition-colors"
      style={{
        background: active ? "#0A0A0A" : "transparent",
        color: active ? "#FFFFFF" : "#525252",
      }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
