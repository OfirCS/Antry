"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AntTrail({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center gap-[5px]", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay: i * 0.35,
          }}
          className="h-1 w-1 rounded-full bg-accent"
        />
      ))}
    </div>
  );
}
