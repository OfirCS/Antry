"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

function checkIsAdmin(userId: string | undefined): boolean {
  if (!userId) return false;
  const ids = process.env.NEXT_PUBLIC_ADMIN_USER_IDS || "";
  return ids
    .split(",")
    .map((s) => s.trim())
    .includes(userId);
}

const navLinks = [
  { href: "/discover", label: "Discover" },
  { href: "/builders", label: "Builders" },
  { href: "/hackathons", label: "Hackathons" },
  { href: "/agent", label: "Scout" },
];

export function Nav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const showAdmin = checkIsAdmin(user?.id);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

  return (
    <>
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            : "bg-white/100 backdrop-blur-none shadow-none"
        )}
        style={{
          borderBottom: scrolled
            ? "1px solid rgba(0,0,0,0.08)"
            : "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 sm:px-10 h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <span className="text-[20px] font-bold tracking-tight" style={{ color: "#111111", fontFamily: "var(--font-display)" }}>
              antry
            </span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#C6F135" }} />
          </Link>

          {/* Center links - flat */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3.5 py-2 rounded-lg text-[14px] font-medium transition-colors duration-200",
                    isActive
                      ? "text-[#111111]"
                      : "text-[#737373] hover:text-[#111111]"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{ background: "#C6F135" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {showAdmin && (
              <Link
                href="/admin/discovery"
                className={cn(
                  "px-3.5 py-2 rounded-lg text-[14px] font-medium transition-colors duration-200",
                  pathname.startsWith("/admin")
                    ? "text-[#111111]"
                    : "text-[#737373] hover:text-[#111111]"
                )}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-100" />
            ) : user ? (
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  href="/dashboard"
                  className="text-[14px] font-medium text-[#737373] transition-colors hover:text-[#111111]"
                >
                  Dashboard
                </Link>
                <Link
                  href="/submit"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-[14px] font-semibold transition-all duration-200 hover:-translate-y-[1px]"
                  style={{
                    background: "#C6F135",
                    color: "#111111",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                  }}
                >
                  Submit project
                </Link>
              </div>
            ) : (
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  href="/login"
                  className="text-[14px] font-medium text-[#737373] transition-colors hover:text-[#111111]"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-[14px] font-semibold transition-all duration-200 hover:-translate-y-[1px]"
                  style={{
                    background: "#111111",
                    color: "#ffffff",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                  }}
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={toggleMobile}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-[#111111] transition-colors hover:bg-gray-100 lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                    <X size={20} strokeWidth={2} />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.15 }}>
                    <Menu size={20} strokeWidth={2} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              className="fixed top-0 right-0 z-50 flex h-full w-[280px] flex-col bg-white lg:hidden"
              style={{ boxShadow: "-4px 0 24px rgba(0,0,0,0.08)" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
            >
              <div className="flex items-center justify-between px-6 h-14 border-b border-gray-100">
                <span className="text-[18px] font-bold tracking-tight" style={{ color: "#111111" }}>
                  antry<span className="inline-block w-1.5 h-1.5 rounded-full ml-1" style={{ background: "#C6F135" }} />
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, i) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.2 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center px-4 py-3.5 rounded-xl text-[16px] font-medium transition-colors min-h-[44px]",
                            isActive
                              ? "text-[#111111] bg-gray-50"
                              : "text-[#525252] hover:text-[#111111] hover:bg-gray-50"
                          )}
                        >
                          {link.label}
                          {isActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#C6F135]" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}

                  {showAdmin && (
                    <Link
                      href="/admin/discovery"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-3.5 rounded-xl text-[16px] font-medium transition-colors min-h-[44px]",
                        pathname.startsWith("/admin")
                          ? "text-[#111111] bg-gray-50"
                          : "text-[#525252] hover:text-[#111111] hover:bg-gray-50"
                      )}
                    >
                      Admin
                    </Link>
                  )}
                </div>

                <div className="my-4 border-t border-gray-100" />

                <div className="flex flex-col gap-2">
                  {loading ? (
                    <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
                  ) : user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center px-4 py-3.5 rounded-xl text-[16px] font-medium text-[#525252] hover:text-[#111111] hover:bg-gray-50 min-h-[44px]"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/submit"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center px-4 py-3.5 rounded-xl text-[16px] font-semibold min-h-[44px]"
                        style={{ background: "#C6F135", color: "#111111" }}
                      >
                        Submit project
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center px-4 py-3.5 rounded-xl text-[16px] font-medium text-[#525252] hover:text-[#111111] hover:bg-gray-50 min-h-[44px]"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center px-4 py-3.5 rounded-xl text-[16px] font-semibold min-h-[44px]"
                        style={{ background: "#111111", color: "#ffffff" }}
                      >
                        Get started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
