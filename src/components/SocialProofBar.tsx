"use client";

import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { antathons, builders, projects } from "@/lib/mock-data";

const metrics = [
  { value: `${builders.length}+`, label: "Verified builders" },
  { value: `${projects.length}+`, label: "Shipped projects" },
  { value: `${antathons.length}`, label: "Agent hackathons" },
];

const sponsors = Array.from(
  new Set(antathons.flatMap((antathon) => antathon.sponsors.map((sponsor) => sponsor.name)))
);

const ease = [0.22, 1, 0.36, 1] as const;

export function SocialProofBar() {
  return (
    <section className="px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-[1240px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="relative overflow-hidden border border-border-primary bg-surface p-8 sm:p-12 rounded-xl shadow-sm"
        >
          <div className="relative flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-12 sm:gap-16">
              {metrics.map((m) => (
                <div key={m.label}>
                  <p className="font-display text-[32px] font-bold tracking-tight text-text-primary sm:text-[48px]">
                    {m.value}
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="w-full lg:max-w-[480px]">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary">
                Backing the builder network
              </p>
              <div
                className="relative overflow-hidden rounded border border-border-secondary bg-background-tertiary py-3.5"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                  WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                }}
              >
                <div className="marquee-track" aria-label="Sponsors">
                  {[...sponsors, ...sponsors].map((name, i) => (
                    <span
                      key={`${name}-${i}`}
                      className="shrink-0 px-6 text-[13px] font-bold tracking-tight text-text-secondary"
                      aria-hidden={i >= sponsors.length}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
