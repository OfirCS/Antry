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
        className="flex items-start gap-4 p-5 rounded-2xl bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: builder.gradient }}
        >
          <span className="text-sm font-bold text-white leading-none">{getInitials(builder.name)}</span>
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
            {builder.name}
          </h3>
          <p className="text-[13px] text-gray-500 leading-relaxed mt-1 line-clamp-2">{builder.bio}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {builder.skills.slice(0, 3).map((s) => (
              <span key={s} className="text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-0.5">{s}</span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
