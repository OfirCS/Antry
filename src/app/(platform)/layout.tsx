"use client";

import { Nav } from "@/components/Nav";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import { AntryLogoFull } from "@/components/AntryLogo";

const footerLinks = {
  Product: [
    { label: "Discover", href: "/discover" },
    { label: "Builders", href: "/builders" },
    { label: "Briefs", href: "/briefs" },
    { label: "Hackathons", href: "/hackathons" },
    { label: "Showcase", href: "/showcase" },
    { label: "Recruiters", href: "/companies" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Pricing", href: "/pricing" },
  ],
  Resources: [
    { label: "Submit project", href: "/submit" },
    { label: "Claim card", href: "/claim-card" },
    { label: "Methodology", href: "/receipts/methodology" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-[#0A0A0A] focus:text-white focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold"
      >
        Skip to main content
      </a>
      <Nav />

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 bg-[#F7F8FA] pt-16"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-[#E5E7EB] bg-white text-[#0A0A0A]">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10">
          {/* Top section: logo + link columns */}
          <div className="grid grid-cols-2 gap-8 py-12 sm:py-16 md:grid-cols-6 lg:grid-cols-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-6 lg:col-span-4 mb-4 lg:mb-0">
              <Link
                href="/"
                className="group inline-flex items-center transition-opacity duration-200 hover:opacity-70"
              >
                <AntryLogoFull size={28} />
              </Link>
              <p className="mt-3 text-[14px] leading-relaxed text-[#4B5563] max-w-[260px]">
                Proof of work for builders. Ship projects, join hackathons,
                and make your work easy to review.
              </p>

              {/* Social icons */}
              <div className="mt-5 flex items-center gap-3">
                {[
                  {
                    icon: <GitHubIcon />,
                    href: "https://github.com",
                    label: "GitHub",
                  },
                  {
                    icon: <XIcon />,
                    href: "https://x.com",
                    label: "X (Twitter)",
                  },
                  {
                    icon: <LinkedInIcon />,
                    href: "https://linkedin.com",
                    label: "LinkedIn",
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] transition-colors duration-200 hover:border-[#D1D5DB] hover:bg-[#F7F8FA] hover:text-[#0A0A0A]"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([category, items]) => (
              <div
                key={category}
                className="col-span-1 md:col-span-3 lg:col-span-2"
              >
                <h4 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-4">
                  {category}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {items.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[14px] text-[#4B5563] transition-colors duration-200 hover:text-[#0A0A0A]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col gap-4 border-t border-[#E5E7EB] py-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
              &copy; {new Date().getFullYear()} Antry. All rights reserved.
            </span>

            {/* Back to top button */}
            <motion.button
              onClick={scrollToTop}
              className="group inline-flex items-center gap-2 text-[13px] font-medium text-[#6B7280] transition-colors duration-200 hover:text-[#0A0A0A]"
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Back to top
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7EB] bg-white transition-colors duration-200 group-hover:border-[#D1D5DB] group-hover:bg-[#F7F8FA]">
                <ArrowUp size={14} strokeWidth={2} />
              </span>
            </motion.button>
          </div>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}
