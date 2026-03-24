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
        className="flex items-start gap-5 card-premium p-6"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md"
          style={{ background: builder.gradient }}
        >
          <span className="text-[13px] font-bold leading-none">
            {getInitials(builder.name)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[16px] font-bold text-text-primary leading-tight group-hover:text-accent transition-colors tracking-tight">
              {builder.name}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
          <p className="text-[14px] text-text-secondary leading-relaxed mt-2 line-clamp-2">
            {builder.bio}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {builder.skills.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[11px] font-bold text-text-tertiary bg-background-secondary border border-border-secondary rounded-md px-2.5 py-1 tracking-tight"
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
