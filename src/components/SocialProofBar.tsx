"use client";

import { motion } from "framer-motion";

const metrics = [
  { value: "500+", label: "Builders" },
  { value: "200+", label: "Projects Shipped" },
  { value: "3", label: "Hackathons Hosted" },
];

const sponsors = ["Anthropic", "Vercel", "GitHub", "Supabase", "Neon", "Cloudflare"];

const ease = [0.22, 1, 0.36, 1] as const;

export function SocialProofBar() {
  return (
    <section className="py-20 px-8 radial-spotlight relative overflow-hidden">
      <div className="max-w-[1100px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="flex flex-col md:flex-row items-center justify-between gap-10"
        >
          {/* Metrics */}
          <div className="flex items-center gap-8 md:gap-12">
            {metrics.map((m, i) => (
              <div key={m.label} className="flex items-center gap-8 md:gap-12">
                <div className="text-center md:text-left">
                  <span className="text-[32px] md:text-[40px] font-display font-semibold gradient-text tracking-tight">
                    {m.value}
                  </span>
                  <p className="text-[12px] font-medium text-text-tertiary uppercase tracking-wider mt-0.5">
                    {m.label}
                  </p>
                </div>
                {i < metrics.length - 1 && (
                  <span className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
                )}
              </div>
            ))}
          </div>

          {/* Sponsor marquee */}
          <div className="relative overflow-hidden max-w-[320px] md:max-w-[400px]" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
            <div className="marquee-track" aria-label="Sponsors">
              {[...sponsors, ...sponsors].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="text-[13px] font-semibold text-text-tertiary/60 tracking-tight select-none px-4 shrink-0"
                  aria-hidden={i >= sponsors.length}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
