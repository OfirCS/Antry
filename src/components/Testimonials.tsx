"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "I landed my current role because a CTO saw my Antry profile. No resume, no cover letter — just my shipped work.",
    name: "Mara Chen",
    role: "AI Engineer",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    initials: "MC",
  },
  {
    quote: "Antathons pushed me to ship faster than I ever have. Built and deployed Flowstate in 48 hours — and won.",
    name: "Jake Torres",
    role: "Full-Stack Builder",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%)",
    initials: "JT",
  },
  {
    quote: "Finally, a platform that cares about what I've built, not which company I worked at. This is how it should be.",
    name: "Aisha Patel",
    role: "Design Engineer",
    gradient: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
    initials: "AP",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Testimonials() {
  return (
    <section className="py-32 px-8 mesh-gradient">
      <div className="max-w-[1100px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-16"
        >
          <span className="text-[12px] font-semibold text-accent uppercase tracking-wider">
            From the community
          </span>
          <h2 className="font-display text-[clamp(2rem,5vw,3rem)] text-text-primary tracking-[-0.02em] mt-4">
            Builders who ship here.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15, ease }}
              className="relative p-8 rounded-3xl glass-card glow-border bg-surface/80 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Quotation mark */}
              <span
                className="text-[48px] font-display leading-none absolute top-4 right-6 select-none gradient-text"
                style={{ opacity: 0.25 }}
              >
                &ldquo;
              </span>

              <p className="text-[15px] text-text-secondary leading-relaxed mb-8 relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: t.gradient }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-text-primary">{t.name}</p>
                  <p className="text-[12px] text-text-tertiary">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
