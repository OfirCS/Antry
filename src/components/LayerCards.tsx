"use client";

import { motion } from "framer-motion";
import { Zap, Globe, Play, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const layers = [
  {
    icon: Play,
    title: "Proof of Work",
    desc: "A dedicated profile for every builder. Live demos, technical walkthroughs, and shipped work — focusing on technical depth.",
  },
  {
    icon: Zap,
    title: "Build Events",
    desc: "Participate in sponsored events with real prizes and visibility. Developers compete to build high-quality solutions.",
  },
  {
    icon: Globe,
    title: "Global Network",
    desc: "Connect with an elite community of builders who value shipping. Expand your reach beyond resumes.",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function LayerCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-5", className)}>
      {layers.map((layer, i) => (
        <motion.div
          key={layer.title}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.1, ease }}
          className="group p-10 bg-surface rounded-lg border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_-12px_rgba(255,255,255,0.05)] transition-all duration-500 ease-out flex flex-col items-start text-left"
        >
          <h3 className="text-[20px] font-semibold text-text-primary mb-4 tracking-[-0.01em]">
            {layer.title}
          </h3>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-8 flex-1">
            {layer.desc}
          </p>
          <div className="flex items-center gap-2 text-[12px] font-semibold text-text-tertiary group-hover:text-accent transition-colors uppercase tracking-wide">
            Learn more <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
