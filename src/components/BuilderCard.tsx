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

export function BuilderCard({ builder, index = 0, className }: BuilderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group", className)}
    >
      <Link
        href={`/builders/${builder.username}`}
        className="relative block overflow-hidden rounded-md border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-gray-200 bg-[#F7F8FA] text-[#0A0A0A]"
          >
            <span className="text-[14px] font-bold">{getInitials(builder.name)}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-[#111] truncate tracking-tight">
                {builder.name}
              </h3>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-100 transition-colors duration-200 group-hover:bg-[#0A0A0A]">
                <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors duration-200" />
              </div>
            </div>
            <p className="text-[13px] text-gray-500 line-clamp-1 mt-0.5">
              {builder.bio}
            </p>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {builder.skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-600"
            >
              {s}
            </span>
          ))}
          {builder.skills.length > 3 && (
            <span className="inline-flex items-center rounded bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-400">
              +{builder.skills.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
          <span className="text-[12px] text-gray-400">
            <span className="font-semibold text-[#111]">{builder.projectCount}</span> projects
          </span>
          <span className="text-[12px] text-gray-400">
            {builder.skills.length} skills
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
