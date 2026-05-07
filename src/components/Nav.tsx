"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { Plus, Home as HomeIcon, Trophy, User } from "lucide-react";
import { AntryLogoFull } from "@/components/AntryLogo";

/**
 * Slim nav for the social feed era.
 *
 * Three tabs only: Feed (/), Hackathons (/hackathons/new), Profile.
 * One persistent CTA: + Compose.
 * Avatar on the right opens settings/profile/logout (logged in) or
 * Sign in / Sign up (logged out).
 *
 * No mobile drawer — everything fits in the top bar at every viewport
 * because there are only ~5 elements.
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
        >
          <AntryLogoFull size={26} />
        </Link>

        {/* Tabs */}
        <div className="flex items-center gap-0.5">
          <NavTab
            href="/"
            label="Feed"
            icon={<HomeIcon className="w-3.5 h-3.5" />}
            active={isActive(pathname, "/")}
          />
          <NavTab
            href="/hackathons/new"
            label="Hack"
            icon={<Trophy className="w-3.5 h-3.5" />}
            active={isActive(pathname, "/hackathons")}
          />
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/compose"
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 sm:px-4 h-9 text-[13px] font-bold transition-all hover:-translate-y-0.5"
            style={{ background: "#0A0A0A", color: "#FFFFFF" }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Post</span>
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[12px] font-bold text-white transition-all hover:-translate-y-0.5"
              style={{
                background:
                  "linear-gradient(135deg, #FF6B35 0%, #C6F135 100%)",
              }}
              aria-label="Profile"
            >
              {(user.email ?? "?").charAt(0).toUpperCase()}
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-9 text-[13px] font-bold transition-colors"
              style={{ color: "#0A0A0A" }}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign in</span>
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
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
