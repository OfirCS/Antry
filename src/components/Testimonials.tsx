"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { testimonials, hasVerifiedTestimonials } from "@/lib/testimonials";

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
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary">
              {hasVerifiedTestimonials ? "Success Stories" : "Early Access Feedback"}
            </span>
            <h2 className="mt-4 font-display text-[clamp(2.3rem,6vw,4.2rem)] leading-[0.95] tracking-[-0.04em] text-text-primary">
              Teams discover builders.
              <br />
              Builders get momentum.
            </h2>
          </div>
          <p className="max-w-[340px] text-[15px] leading-relaxed text-text-secondary">
            {hasVerifiedTestimonials
              ? "Verified outcomes from builders who converted shipping signal into real opportunity."
              : "Early feedback from builders piloting Antry. Verified case studies arrive as the network seeds."}
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
                  style={{ background: t.gradient }}
                >
                  {t.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[14px] font-bold text-text-primary">{t.name}</p>
                    {t.verified && (
                      <span
                        title="Verified Antry builder"
                        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full"
                        style={{ background: "#C6F135", color: "#0A0A0A" }}
                      >
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      </span>
                    )}
                  </div>
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
