"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/auth-context";
import { signOut } from "@/app/(auth)/actions";

const links = [
  { href: "/discover", label: "Discover" },
  { href: "/hackathons", label: "Hackathons" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="Antry" width={32} height={32} className="dark:invert" priority />
          <span className="text-lg font-bold tracking-tight text-gray-900">Antry</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname.startsWith(l.href) ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white hover:bg-blue-700 transition-colors"
                title={user.user_metadata?.full_name || user.email || "Profile"}
              >
                {initials}
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 hover:shadow-md transition-all active:scale-95"
              >
                Join Antry
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-text-secondary" aria-label="Menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-b border-gray-100 bg-white shadow-lg"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  {l.label}
                </Link>
              ))}
              <hr className="border-gray-100" />
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{user.user_metadata?.full_name || user.email}</span>
                  <form action={signOut}>
                    <button
                      type="submit"
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700">Sign in</Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="text-sm font-medium bg-blue-600 text-white px-6 py-2 rounded-full">Join Antry</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
