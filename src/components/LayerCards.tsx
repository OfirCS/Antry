"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const layers = [
  {
    num: "01",
    title: "Showcase",
    desc: "Your profile is your portfolio. Live demos, project walkthroughs, and shipped work — not bullet points on a resume.",
    accent: "group-hover:border-accent/40",
  },
  {
    num: "02",
    title: "Build together",
    desc: "Hackathons and sponsored build events where builders in AI gather, compete for real prizes, and find collaborators.",
    accent: "group-hover:border-text-secondary/30",
  },
  {
    num: "03",
    title: "Launch fast",
    desc: "We spot high-potential ideas from the community and help them go from prototype to validated product.",
    accent: "group-hover:border-text-tertiary/40",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function LayerCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {layers.map((layer, i) => (
        <motion.div
          key={layer.num}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: i * 0.1, ease }}
          className={cn(
            "group border border-border-tertiary rounded-xl p-7 transition-all duration-300 hover:bg-background-secondary/60",
            layer.accent
          )}
        >
          <span className="text-[11px] font-mono text-accent tracking-wide">{layer.num}</span>
          <h3 className="text-[16px] font-medium text-text-primary mt-3 mb-2">{layer.title}</h3>
          <p className="text-[13px] text-text-secondary leading-relaxed">{layer.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
