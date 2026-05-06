"use client";

import { motion } from "framer-motion";
import { Check, Minus, X } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const features = [
  { label: "Live demo-first profiles", resume: false, github: "partial", linkedin: false, antry: true },
  { label: "Verified shipping signal", resume: false, github: "partial", linkedin: false, antry: true },
  { label: "AI-based builder matching", resume: false, github: false, linkedin: false, antry: true },
  { label: "Hackathon performance data", resume: false, github: false, linkedin: false, antry: true },
  { label: "Community validation", resume: false, github: "partial", linkedin: "partial", antry: true },
] as const;

type CellValue = boolean | "partial";

function CellIcon({ value }: { value: CellValue }) {
  if (value === true) return <Check className="h-4 w-4 text-text-primary" />;
  if (value === "partial") return <Minus className="h-4 w-4 text-text-tertiary" />;
  return <X className="h-4 w-4 text-text-tertiary/20" />;
}

export function ComparisonSection() {
  return (
    <section className="border-y border-border-primary bg-background-secondary/30 px-6 py-28 sm:px-8">
      <div className="relative z-10 mx-auto max-w-[1240px]">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-16 max-w-[800px]"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-text-tertiary">Signal Comparison</span>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,6vw,4.2rem)] leading-[0.95] tracking-[-0.04em] text-text-primary">
            The internet has profiles.
            <br />
            Antry has proof.
          </h2>
          <p className="mt-6 max-w-[600px] text-[17px] leading-relaxed text-text-secondary">
            Decision routing requires real shipping data. This is the difference between talent discovery and simple resume parsing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.08, ease }}
          className="grid gap-px bg-border-primary border border-border-primary lg:grid-cols-[1fr_320px]"
        >
          <div className="bg-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-border-primary bg-background-secondary/50 text-[10px] font-bold uppercase tracking-[0.15em] text-text-tertiary">
                    <th className="px-6 py-5 text-left">Capability</th>
                    <th className="px-6 py-5 text-center">Resume</th>
                    <th className="px-6 py-5 text-center">GitHub</th>
                    <th className="px-6 py-5 text-center">LinkedIn</th>
                    <th className="px-6 py-5 text-center bg-background-secondary text-text-primary">Antry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-tertiary">
                  {features.map((feature) => (
                    <tr key={feature.label} className="group hover:bg-background-tertiary transition-colors">
                      <td className="px-6 py-5 text-[14px] font-semibold text-text-primary">{feature.label}</td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <CellIcon value={feature.resume} />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <CellIcon value={feature.github} />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <CellIcon value={feature.linkedin} />
                        </div>
                      </td>
                      <td className="bg-background-tertiary/50 px-6 py-5">
                        <div className="flex justify-center">
                          <CellIcon value={feature.antry} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface flex flex-col justify-between p-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-text-tertiary">Hiring Velocity</p>
              <p className="mt-4 font-display text-6xl tracking-[-0.05em] text-text-primary">2.7x</p>
              <p className="mt-4 text-[14px] leading-relaxed text-text-secondary">
                Teams using builder-proof data cut the discovery cycle and spend less time on manual screening.
              </p>
            </div>
            <div className="mt-12 border-t border-border-primary pt-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-text-tertiary">Industrial Logic</p>
              <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
                AI recommendations become reliable only when the dataset is narrow, trusted, and behavior-linked.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
