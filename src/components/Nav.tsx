"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/about", label: "About" },
  { href: "/builders", label: "Builders" },
  { href: "/hackathons", label: "Hackathons" },
  { href: "/companies", label: "For Companies" },
];

export function Nav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border-tertiary bg-background-primary/80 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 sm:px-10">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="group flex items-center gap-3 transition-all hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-text-primary">
               <Image
                src="/logo.png"
                alt="Antry"
                width={20}
                height={20}
                className="object-contain invert dark:brightness-0"
                priority
              />
            </div>
            <span className="text-[19px] font-bold tracking-tight text-text-primary">
              Antry
            </span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className={cn(
                  "text-[14px] font-bold tracking-tight transition-all duration-300",
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

        <div className="flex items-center gap-6">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-background-secondary" />
          ) : user ? (
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className={cn(
                  "text-[14px] font-bold tracking-tight transition-all",
                  pathname === "/dashboard" ? "text-text-primary" : "text-text-tertiary hover:text-text-primary"
                )}
              >
                Dashboard
              </Link>
              <Button size="sm" variant="outline" className="rounded-full px-5 h-9" asChild>
                <Link href="/submit">Submit</Link>
              </Button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[14px] font-bold tracking-tight text-text-tertiary hover:text-text-primary transition-all"
              >
                Log in
              </Link>
              <Button size="sm" className="rounded-full px-6 h-10 text-[13px] font-bold" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
