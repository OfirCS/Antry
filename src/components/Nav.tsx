"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/builders", label: "Builders" },
  { href: "/hackathons", label: "Opportunities" },
  { href: "/companies", label: "For Teams" },
];

function checkIsAdmin(userId: string | undefined): boolean {
  if (!userId) return false;
  const ids = process.env.NEXT_PUBLIC_ADMIN_USER_IDS || "";
  return ids.split(",").map((s) => s.trim()).includes(userId);
}

export function Nav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const showAdmin = checkIsAdmin(user?.id);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border-primary/60 bg-background-primary/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
              <Image
                src="/logo.png"
                alt="Antry"
                width={16}
                height={16}
                className="object-contain invert"
                priority
              />
            </div>
            <span className="text-[16px] font-semibold tracking-tight">
              Antry
            </span>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className={cn(
                  "text-[13px] font-medium transition-colors",
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
            <div className="h-5 w-20 animate-pulse rounded bg-background-secondary" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {showAdmin && (
                <Link
                  href="/admin/discovery"
                  className={cn(
                    "text-[13px] font-medium transition-colors",
                    pathname.startsWith("/admin")
                      ? "text-text-primary"
                      : "text-text-tertiary hover:text-text-primary"
                  )}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className={cn(
                  "text-[13px] font-medium transition-colors",
                  pathname === "/dashboard"
                    ? "text-text-primary"
                    : "text-text-tertiary hover:text-text-primary"
                )}
              >
                Dashboard
              </Link>
              <Button size="sm" asChild>
                <Link href="/submit">Ship project</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[13px] font-medium text-text-tertiary hover:text-text-primary transition-colors"
              >
                Log in
              </Link>
              <Button size="sm" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
