"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const rows = [
  { name: "Mara Chen", projects: "3", signal: "High", score: 94 },
  { name: "Jake Torres", projects: "2", signal: "High", score: 91 },
  { name: "Aisha Patel", projects: "2", signal: "Medium", score: 88 },
  { name: "Leo Kim", projects: "2", signal: "Medium", score: 85 },
];

export function HeroAnimation() {
  return (
    <motion.div 
      initial={{ rotateY: -10, rotateX: 5, opacity: 0 }}
      animate={{ rotateY: 0, rotateX: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="mx-auto max-w-[620px] overflow-hidden rounded-xl border border-border-primary bg-surface shadow-2xl shadow-black/5"
      style={{ perspective: "1000px" }}
    >
      <div className="flex items-center justify-between border-b border-border-primary bg-white px-4 py-2.5 text-[12px] text-text-secondary">
        <span className="font-medium">Antry Scout Workspace</span>
        <span className="rounded-md bg-accent px-2 py-1 text-[11px] font-semibold text-white">Live</span>
      </div>

      <div className="grid grid-cols-[1fr_190px]">
        <div className="border-r border-border-primary">
          <div className="grid grid-cols-4 border-b border-border-primary px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-text-tertiary">
            <span>Builder</span>
            <span>Projects</span>
            <span>Signal</span>
            <span>Score</span>
          </div>
          <div className="divide-y divide-border-secondary bg-white">
            {rows.map((row, index) => (
              <motion.div
                key={row.name}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.28 }}
                className="grid grid-cols-4 items-center px-4 py-2.5 text-[12px] text-text-secondary"
              >
                <span className="truncate font-medium text-text-primary">{row.name}</span>
                <span>{row.projects}</span>
                <span>{row.signal}</span>
                <span className="font-semibold text-accent">{row.score}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-background-secondary p-3">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">Match confidence</p>
          <div className="space-y-2.5">
            {[82, 67, 75, 58].map((value, index) => (
              <div key={`${value}-${index}`}>
                <div className="mb-1 flex items-center justify-between text-[10px] text-text-tertiary">
                  <span>Query {index + 1}</span>
                  <span>{value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-border-secondary">
                  <motion.div
                    className="h-full rounded-full bg-text-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface LottieAnimationProps {
  animationData?: object;
  path?: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export function LottieAnimation({
  animationData,
  path,
  loop = true,
  autoplay = true,
  className,
}: LottieAnimationProps) {
  if (!animationData && !path) return null;

  return (
    <div className={className}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
