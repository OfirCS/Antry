"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, Mail } from "lucide-react";

export type FaqItem = { q: string; a: string };

export function FaqClient({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <ul className="mt-12 divide-y divide-gray-100 border-t border-gray-100">
        {faqs.map((f, i) => {
          const isOpen = openIndex === i;
          return (
            <li key={f.q}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full text-left flex items-start justify-between gap-4 py-5 group transition-all"
                aria-expanded={isOpen}
              >
                <h3
                  className="text-[16px] sm:text-[17px] font-bold tracking-[-0.01em] pr-4 transition-colors leading-[1.4]"
                  style={{ color: isOpen ? "#0A0A0A" : "#0A0A0A" }}
                >
                  {f.q}
                </h3>
                <motion.span
                  className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full shrink-0 transition-all"
                  style={{
                    background: isOpen ? "#0A0A0A" : "#F5F5F5",
                    color: isOpen ? "#C6F135" : "#525252",
                  }}
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 pr-12 text-[15px] leading-[1.7] text-gray-700">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden"
        style={{ background: "#0A0A0A" }}
      >
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(198,241,53,0.18) 0%, transparent 65%)",
          }}
        />
        <div className="relative">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "#C6F135" }}
          >
            Ready to claim?
          </p>
          <h3
            className="mt-2 text-[18px] sm:text-[20px] font-bold tracking-[-0.015em]"
            style={{ color: "#FFFFFF" }}
          >
            Get a builder profile in 5 seconds.
          </h3>
          <p
            className="mt-1 text-[13px]"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Paste a GitHub username — we&apos;ll do the rest.
          </p>
        </div>
        <Link
          href="/claim-card"
          className="relative inline-flex items-center justify-center gap-2 rounded-[14px] px-5 h-[48px] text-[14px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
          style={{
            background: "#C6F135",
            color: "#0A0A0A",
            boxShadow: "0 8px 24px rgba(198,241,53,0.35)",
          }}
        >
          Try Antry Card <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <p className="mt-10 text-center text-[14px] text-gray-500 inline-flex items-center gap-2 w-full justify-center">
        <Mail className="w-3.5 h-3.5" />
        Still stuck?{" "}
        <a className="font-semibold text-black hover:underline underline-offset-4" href="mailto:[email protected]">
          [email protected]
        </a>
      </p>
    </>
  );
}
