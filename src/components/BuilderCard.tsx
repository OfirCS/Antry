"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Builder } from "@/lib/mock-data";
import { getInitials } from "@/lib/mock-data";

interface BuilderCardProps {
  builder: Builder;
  index?: number;
  className?: string;
}

export function BuilderCard({ builder, index = 0, className }: BuilderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] as const }}
      className={cn("group", className)}
    >
      <Link
        href={`/builders/${builder.username}`}
        className="flex items-start gap-4 p-5 rounded-xl border border-border-tertiary hover:border-border-secondary hover:bg-background-secondary/40 transition-all duration-200"
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: builder.gradient }}
        >
          <span className="text-[13px] font-medium text-white leading-none">{getInitials(builder.name)}</span>
        </div>

        <div className="min-w-0">
          <h3 className="text-[14px] font-medium text-text-primary leading-snug group-hover:text-accent transition-colors">
            {builder.name}
          </h3>
          <p className="text-[12px] text-text-tertiary leading-relaxed mt-1 line-clamp-2">{builder.bio}</p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {builder.skills.slice(0, 3).map((s) => (
              <span key={s} className="text-[10px] font-mono text-text-tertiary bg-background-secondary rounded px-1.5 py-0.5">{s}</span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
