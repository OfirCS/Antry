"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/auth-context";
import { AntryLogoFull } from "@/components/AntryLogo";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

/**
 * Match nav links by exact first-segment so deeply-nested routes
 * (e.g. /briefs/[slug]/lab) don't light up an unrelated tab.
 */
function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const seg = pathname.split("/").filter(Boolean)[0];
  const targetSeg = href.split("/").filter(Boolean)[0];
  return seg === targetSeg;
}

function checkIsAdmin(userId: string | undefined): boolean {
  if (!userId) return false;
  const ids = process.env.NEXT_PUBLIC_ADMIN_USER_IDS || "";
  return ids
    .split(",")
    .map((s) => s.trim())
    .includes(userId);
}

const navLinks = [
  { href: "/discover", label: "Community" },
  { href: "/builders", label: "Builders" },
  { href: "/briefs", label: "Briefs" },
  { href: "/hackathons", label: "Hackathons" },
  { href: "/agent", label: "Scout" },
];

export function Nav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const showAdmin = checkIsAdmin(user?.id);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !mobileOpen;

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
  const markNavigation = useCallback((href: string) => {
    if (href !== pathname) setPendingHref(href);
  }, [pathname]);
  const activePendingHref = pendingHref === pathname ? null : pendingHref;

  return (
    <>
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          transparent
            ? "bg-transparent border-b border-transparent"
            : scrolled
            ? "bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
            : "bg-white border-b border-transparent"
        )}
      >
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 sm:px-10 h-[68px]">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity" aria-label="Antry home">
            <AntryLogoFull size={32} tone={transparent ? "light" : "dark"} />
          </Link>

          {/* Center links - flat */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
               const isActive = isNavActive(pathname, link.href);
               return (
                 <Link
                   key={link.href}
                   href={link.href}
                   onClick={() => markNavigation(link.href)}
                   className={cn(
                     "relative px-4 py-2 rounded-md text-[14px] font-semibold transition-colors duration-200",
                     isActive
                       ? transparent
                         ? "text-white bg-white/10"
                         : "text-black bg-gray-50"
                       : transparent
                         ? "text-white/[0.65] hover:text-white hover:bg-white/10"
                         : "text-gray-500 hover:text-black hover:bg-gray-50"
                   )}
                 >
                   {link.label}
                   <LinkPendingIndicator light={transparent} pending={activePendingHref === link.href} />
                 </Link>
               );
            })}

            {showAdmin && (
              <Link
                href="/admin/discovery"
                onClick={() => markNavigation("/admin/discovery")}
                className={cn(
                  "px-4 py-2 rounded-md text-[14px] font-semibold transition-colors duration-200",
                  isNavActive(pathname, "/admin")
                    ? transparent
                      ? "text-white bg-white/10"
                      : "text-black bg-gray-50"
                    : transparent
                      ? "text-white/[0.65] hover:text-white hover:bg-white/10"
                      : "text-gray-500 hover:text-black hover:bg-gray-50"
                )}
              >
                Admin
                <LinkPendingIndicator light={transparent} pending={activePendingHref === "/admin/discovery"} />
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-md bg-gray-100" />
            ) : user ? (
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  href="/dashboard"
                  onClick={() => markNavigation("/dashboard")}
                  className={cn(
                    "relative text-[14px] font-semibold transition-colors",
                    transparent ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-black"
                  )}
                >
                  Dashboard
                  <LinkPendingIndicator light={transparent} pending={activePendingHref === "/dashboard"} />
                </Link>
                <Link
                  href="/submit"
                  onClick={() => markNavigation("/submit")}
                  className="relative inline-flex items-center justify-center rounded-md px-4 py-2.5 text-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5 shadow-sm"
                  style={{
                    background: transparent ? "#B8FF3D" : "#0A0A0A",
                    color: transparent ? "#070806" : "#ffffff",
                  }}
                >
                  Submit project
                  <LinkPendingIndicator light={!transparent} pending={activePendingHref === "/submit"} />
                </Link>
              </div>
            ) : (
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  href="/login"
                  onClick={() => markNavigation("/login")}
                  className={cn(
                    "relative px-2 text-[14px] font-semibold transition-colors",
                    transparent ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-black"
                  )}
                >
                  Log in
                  <LinkPendingIndicator light={transparent} pending={activePendingHref === "/login"} />
                </Link>
                <Link
                  href="/signup"
                  onClick={() => markNavigation("/signup")}
                  className="relative inline-flex items-center justify-center rounded-md px-5 py-2.5 text-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5 shadow-sm"
                  style={{
                    background: transparent ? "#B8FF3D" : "#0A0A0A",
                    color: transparent ? "#070806" : "#ffffff",
                  }}
                >
                  Get started
                  <LinkPendingIndicator light={!transparent} pending={activePendingHref === "/signup"} />
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={toggleMobile}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-md transition-colors lg:hidden",
                transparent ? "text-white hover:bg-white/10" : "text-black hover:bg-gray-100"
              )}
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
                <AntryLogoFull size={28} tone="dark" />
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
                    const isActive = isNavActive(pathname, link.href);
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.2 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => {
                            markNavigation(link.href);
                            setMobileOpen(false);
                          }}
                          className={cn(
                            "flex items-center px-4 py-3.5 rounded-xl text-[16px] font-semibold transition-colors min-h-[44px]",
                            isActive
                              ? "text-[#111111] bg-gray-50"
                              : "text-[#4B5563] hover:text-[#111111] hover:bg-gray-50"
                          )}
                        >
                          {link.label}
                          <LinkPendingIndicator pending={activePendingHref === link.href} />
                        </Link>
                      </motion.div>
                    );
                  })}

                  {showAdmin && (
                    <Link
                      href="/admin/discovery"
                      onClick={() => {
                        markNavigation("/admin/discovery");
                        setMobileOpen(false);
                      }}
                      className={cn(
                        "flex items-center px-4 py-3.5 rounded-xl text-[16px] font-semibold transition-colors min-h-[44px]",
                        isNavActive(pathname, "/admin")
                          ? "text-[#111111] bg-gray-50"
                          : "text-[#4B5563] hover:text-[#111111] hover:bg-gray-50"
                      )}
                    >
                      Admin
                      <LinkPendingIndicator pending={activePendingHref === "/admin/discovery"} />
                    </Link>
                  )}
                </div>

                <div className="my-4 border-t border-gray-100" />

                <div className="flex flex-col gap-2">
                  {loading ? (
                    <div className="h-10 animate-pulse rounded-md bg-gray-100" />
                  ) : user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => {
                          markNavigation("/dashboard");
                          setMobileOpen(false);
                        }}
                        className="relative flex items-center px-4 py-3.5 rounded-md text-[16px] font-medium text-[#4B5563] hover:text-[#111111] hover:bg-gray-50 min-h-[44px]"
                      >
                        Dashboard
                        <LinkPendingIndicator pending={activePendingHref === "/dashboard"} />
                      </Link>
                      <Link
                        href="/submit"
                        onClick={() => {
                          markNavigation("/submit");
                          setMobileOpen(false);
                        }}
                        className="relative flex items-center justify-center px-4 py-3.5 rounded-md text-[16px] font-semibold min-h-[44px]"
                        style={{ background: "#0A0A0A", color: "#ffffff" }}
                      >
                        Submit project
                        <LinkPendingIndicator light pending={activePendingHref === "/submit"} />
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => {
                          markNavigation("/login");
                          setMobileOpen(false);
                        }}
                        className="relative flex items-center justify-center px-4 py-3.5 rounded-md text-[16px] font-medium text-[#4B5563] hover:text-[#111111] hover:bg-gray-50 min-h-[44px]"
                      >
                        Log in
                        <LinkPendingIndicator pending={activePendingHref === "/login"} />
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => {
                          markNavigation("/signup");
                          setMobileOpen(false);
                        }}
                        className="relative flex items-center justify-center px-4 py-3.5 rounded-md text-[16px] font-semibold min-h-[44px]"
                        style={{ background: "#111111", color: "#ffffff" }}
                      >
                        Get started
                        <LinkPendingIndicator light pending={activePendingHref === "/signup"} />
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

function LinkPendingIndicator({ light = false, pending }: { light?: boolean; pending: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-2 bottom-1 h-0.5 origin-left rounded-full transition-all duration-200",
        pending ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0",
        light ? "bg-white/80" : "bg-black"
      )}
    />
  );
}
