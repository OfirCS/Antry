"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/auth-context";

const links = [
  { href: "/about", label: "About Us" },
  { href: "/builders", label: "Builders" },
  { href: "/hackathons", label: "Hackathons" },
  { href: "/companies", label: "For Companies" },
  { href: "/blog", label: "Blog" },
];

export function Nav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] glass-card backdrop-blur-2xl shadow-[0_1px_0_0_var(--glass-border),0_8px_32px_-12px_rgba(0,0,0,0.05)] transition-all">
      <div className="max-w-[1200px] mx-auto h-full px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <Image
              src="/logo.png"
              alt="Antry"
              width={28}
              height={28}
              className="dark:invert object-contain transition-transform group-hover:scale-105 duration-300 mix-blend-multiply dark:mix-blend-screen brightness-0"
              priority
            />
            <span className="text-[18px] font-bold tracking-[-0.04em] text-text-primary">
              Antry
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className={cn(
                  "text-[14px] font-medium transition-colors duration-200",
                  pathname.startsWith(l.href)
                    ? "text-text-primary"
                    : "text-text-tertiary hover:text-text-primary"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-border-secondary animate-pulse" />
          ) : user ? (
            <Link
              href="/dashboard"
              className="text-[14px] font-semibold text-text-primary hover:text-accent transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[14px] font-medium text-text-tertiary hover:text-text-primary transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-[13px] font-semibold bg-text-primary text-background-primary px-5 py-2.5 rounded-full glow-border hover:shadow-[0_4px_14px_0_var(--glow-orange)] hover:bg-[#222] transition-all duration-300 ease-out active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:shadow-[0_4px_14px_0_var(--glow-orange)]"
              >
                Apply now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
