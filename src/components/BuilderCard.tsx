"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Builder } from "@/lib/mock-data";
import { getInitials } from "@/lib/mock-data";

interface BuilderCardProps {
  builder: Builder;
  index?: number;
  className?: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function BuilderCard({ builder, index = 0, className }: BuilderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease }}
      className={cn("group", className)}
    >
      <Link
        href={`/builders/${builder.username}`}
        className="flex items-start gap-5 p-5 rounded-2xl bg-surface border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_-12px_rgba(255,255,255,0.05)] transition-all duration-300 ease-out"
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
          style={{ background: builder.gradient }}
        >
          <span className="text-[12px] font-bold leading-none">
            {getInitials(builder.name)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-text-primary leading-tight group-hover:text-accent transition-colors">
              {builder.name}
            </h3>
            <ArrowUpRight className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
          <p className="text-[13px] text-text-secondary leading-relaxed mt-1.5 line-clamp-2">
            {builder.bio}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {builder.skills.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[11px] font-medium text-text-tertiary bg-background-secondary rounded-full px-2.5 py-0.5"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
