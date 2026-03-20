"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "I landed my current role because a CTO saw my Antry profile. No resume, no cover letter, just shipped work and clear proof.",
    name: "Mara Chen",
    role: "AI Engineer",
    initials: "MC",
    gradient: "linear-gradient(135deg, #2563eb 0%, #0891b2 100%)",
  },
  {
    quote:
      "Antathons changed my shipping pace. I built and deployed Flowstate in 48 hours and got qualified inbound leads the same week.",
    name: "Jake Torres",
    role: "Full-Stack Builder",
    initials: "JT",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
  },
  {
    quote:
      "It finally feels fair. Teams judge me on depth, polish, and momentum instead of buzzwords or company logos.",
    name: "Aisha Patel",
    role: "Design Engineer",
    initials: "AP",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #4338ca 100%)",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Testimonials() {
  return (
    <section className="px-6 py-28 sm:px-8">
      <div className="mx-auto max-w-[1160px]">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary">Success Stories</span>
            <h2 className="mt-4 font-display text-[clamp(2.3rem,6vw,4.2rem)] leading-[0.95] tracking-[-0.04em] text-text-primary">
              Teams discover builders.
              <br />
              Builders get momentum.
            </h2>
          </div>
          <p className="max-w-[340px] text-[15px] leading-relaxed text-text-secondary">
            Verified outcomes from builders who converted shipping signal into real opportunity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-px bg-border-primary border border-border-primary md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1, ease }}
              className="bg-surface relative flex h-full flex-col justify-between gap-10 p-8 hover:bg-background-tertiary transition-colors"
            >
              <p className="relative z-10 text-[15px] leading-relaxed text-text-secondary">&ldquo;{t.quote}&rdquo;</p>

              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded bg-text-primary text-[11px] font-bold text-background-primary"
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-text-primary">{t.name}</p>
                  <p className="text-[12px] font-medium text-text-tertiary">{t.role}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
