"use client";

import { motion } from "framer-motion";
import { Nav } from "@/components/Nav";
import Link from "next/link";

export type LegalSection = {
  id: string;
  title: string;
  body: React.ReactNode;
};

export function LegalLayout({
  eyebrow,
  title,
  intro,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <Nav />
      <main>
        <section className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-[1080px] px-6 sm:px-10 pt-16 sm:pt-20 pb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">{eyebrow}</p>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 font-display text-[clamp(2.2rem,4.6vw,3rem)] font-bold tracking-[-0.035em] text-black leading-[1.05]"
            >
              {title}
            </motion.h1>
            <p className="mt-4 max-w-[640px] text-[15px] sm:text-[16px] leading-[1.65] text-gray-700">{intro}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-[12px] text-gray-500">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAF7] border border-gray-200">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#C6F135" }} />
                Last updated: {updated}
              </span>
              <a
                href="mailto:[email protected]"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAF7] border border-gray-200 hover:border-black hover:text-black transition-colors"
              >
                Questions? [email protected]
              </a>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-14 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">
              {/* Sidebar TOC (sticky on desktop) */}
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-4">
                    On this page
                  </p>
                  <ul className="space-y-2">
                    {sections.map((s) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className="text-[13px] text-gray-600 hover:text-black transition-colors block py-0.5"
                        >
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <Link
                      href="/"
                      className="text-[12px] text-gray-500 hover:text-black transition-colors"
                    >
                      ← Back to Antry
                    </Link>
                  </div>
                </div>
              </aside>

              {/* Sections */}
              <div className="max-w-[680px] space-y-12">
                {sections.map((s) => (
                  <section key={s.id} id={s.id} className="scroll-mt-24">
                    <h2 className="text-[20px] sm:text-[22px] font-bold tracking-[-0.015em] text-black mb-4 font-display">
                      {s.title}
                    </h2>
                    <div className="text-[15px] leading-[1.75] text-gray-700 space-y-4 prose-a:text-black prose-a:underline prose-a:underline-offset-2">
                      {s.body}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
