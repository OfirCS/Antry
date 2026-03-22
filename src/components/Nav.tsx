"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/discover", label: "Discover" },
  { href: "/builders", label: "Builders" },
  { href: "/hackathons", label: "Hackathons" },
  { href: "/companies", label: "For Companies" },
];

export function Nav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border-primary bg-background-primary/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 sm:px-8">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <Image
              src="/logo.png"
              alt="Antry"
              width={24}
              height={24}
              className="object-contain brightness-0 dark:invert"
              priority
            />
            <span className="text-[17px] font-bold tracking-tight text-text-primary">
              Antry
            </span>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className={cn(
                  "text-[13px] font-medium transition-colors duration-200",
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

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-border-secondary" />
          ) : user ? (
            <Link
              href="/dashboard"
              className="text-[13px] font-medium text-text-primary hover:opacity-80"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13px] font-medium text-text-tertiary hover:text-text-primary transition-colors"
              >
                Log in
              </Link>
              <Button size="sm" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
