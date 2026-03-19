"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/discover", label: "Discover" },
  { href: "/hackathons", label: "Hackathons" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] border-b border-border-tertiary bg-background-primary/80 backdrop-blur-xl">
      <div className="max-w-[1080px] mx-auto h-full px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <Image src="/logo.png" alt="Antry" width={20} height={20} className="dark:invert" priority />
          <span className="text-[13px] font-medium tracking-[0.14em] text-text-primary uppercase">antry</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-[13px] transition-colors",
                pathname.startsWith(l.href) ? "text-text-primary" : "text-text-tertiary hover:text-text-primary"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-5">
          <Link href="/login" className="text-[13px] text-text-tertiary hover:text-text-primary transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-[13px] font-medium bg-text-primary text-background-primary px-4 py-1.5 rounded-md hover:opacity-85 transition-opacity"
          >
            Join
          </Link>
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
            className="md:hidden overflow-hidden border-b border-border-tertiary bg-background-primary"
          >
            <div className="px-6 py-5 flex flex-col gap-4">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-[14px] text-text-secondary">
                  {l.label}
                </Link>
              ))}
              <hr className="border-border-tertiary" />
              <div className="flex gap-4 items-center">
                <Link href="/login" onClick={() => setOpen(false)} className="text-[14px] text-text-secondary">Sign in</Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="text-[14px] font-medium bg-text-primary text-background-primary px-4 py-1.5 rounded-md">Join</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
