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
        className="flex items-center gap-4 rounded-xl border border-border-primary bg-surface p-5 hover:border-text-tertiary/40 hover:shadow-sm transition-all"
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white"
          style={{ background: builder.gradient }}
        >
          <span className="text-[14px] font-semibold">
            {getInitials(builder.name)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-accent-bright transition-colors truncate">
              {builder.name}
            </h3>
          </div>
          <p className="text-[13px] text-text-tertiary line-clamp-1">
            {builder.bio}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {builder.skills.slice(0, 2).map((s) => (
            <span
              key={s}
              className="hidden sm:inline text-[11px] font-medium text-text-tertiary bg-background-secondary px-2 py-0.5 rounded"
            >
              {s}
            </span>
          ))}
          <div className="h-7 w-7 rounded-lg bg-background-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-3.5 h-3.5 text-text-secondary" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
