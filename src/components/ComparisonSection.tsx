"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const features = [
  {
    label: "Live demos",
    resume: false,
    github: false,
    linkedin: false,
    antry: true,
  },
  {
    label: "Verified shipping",
    resume: false,
    github: "partial",
    linkedin: false,
    antry: true,
  },
  {
    label: "Technical depth",
    resume: false,
    github: "partial",
    linkedin: false,
    antry: true,
  },
  {
    label: "Peer validation",
    resume: false,
    github: "partial",
    linkedin: "partial",
    antry: true,
  },
  {
    label: "Builder community",
    resume: false,
    github: false,
    linkedin: "partial",
    antry: true,
  },
] as const;

type CellValue = boolean | "partial";

function CellIcon({ value }: { value: CellValue }) {
  if (value === true) return <Check className="w-4 h-4 text-accent" />;
  if (value === "partial") return <Minus className="w-4 h-4 text-text-tertiary" />;
  return <X className="w-4 h-4 text-text-tertiary/40" />;
}

export function ComparisonSection() {
  return (
    <section className="py-32 px-8 mesh-gradient">
      <div className="max-w-[860px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-16"
        >
          <span className="text-[12px] font-semibold text-accent uppercase tracking-wider">
            Why Antry
          </span>
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-text-primary tracking-[-0.025em] mt-4">
            Resumes say what you did.
            <br />
            <span className="italic gradient-text">Antry proves what you built.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="rounded-2xl glass-card bg-surface/80 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08),0_0_40px_-12px_var(--glow-orange)] overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-5 text-center text-[12px] font-semibold uppercase tracking-wider border-b border-border-primary/40">
            <div className="p-4 text-left text-text-tertiary">Feature</div>
            <div className="p-4 text-text-tertiary">Resume</div>
            <div className="p-4 text-text-tertiary">GitHub</div>
            <div className="p-4 text-text-tertiary">LinkedIn</div>
            <div className="p-4 text-accent bg-accent-muted font-bold relative">
              Antry
              <span className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            </div>
          </div>

          {/* Rows */}
          {features.map((f, i) => (
            <div
              key={f.label}
              className={`grid grid-cols-5 text-center items-center ${
                i < features.length - 1 ? "border-b border-border-primary/30" : ""
              }`}
            >
              <div className="p-4 text-left text-[14px] font-medium text-text-primary">
                {f.label}
              </div>
              <div className="p-4 flex justify-center"><CellIcon value={f.resume} /></div>
              <div className="p-4 flex justify-center"><CellIcon value={f.github} /></div>
              <div className="p-4 flex justify-center"><CellIcon value={f.linkedin} /></div>
              <div className="p-4 flex justify-center bg-accent-muted/30"><CellIcon value={f.antry} /></div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
