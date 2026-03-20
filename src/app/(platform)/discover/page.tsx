"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { builders, getInitials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function DiscoverPage() {
  const [query, setQuery] = useState("");

  const filtered = builders.filter(
    (b) =>
      !query ||
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="bg-background-primary min-h-screen">
      {/* Sticky search */}
      <div className="fixed top-[72px] left-0 right-0 z-40 bg-background-primary/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or skill..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-black/5 dark:border-white/5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] rounded-full text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent/40 focus:ring-2 focus:ring-accent/20 outline-none transition-all duration-300"
            />
          </div>
          <span className="text-xs font-medium text-text-tertiary tabular-nums whitespace-nowrap">
            {filtered.length} builder{filtered.length !== 1 && "s"}
          </span>
        </div>
      </div>

      {/* Builder list */}
      <div className="max-w-2xl mx-auto pt-44 pb-24 px-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((builder, i) => (
            <motion.div
              key={builder.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{
                duration: 0.35,
                delay: i * 0.04,
                ease: [0.25, 1, 0.5, 1],
              }}
            >
              <Link
                href={`/builders/${builder.username}`}
                className="group flex items-center gap-4 py-5 border-b border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-colors"
              >
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-semibold text-white shrink-0"
                  style={{ background: builder.gradient }}
                >
                  {getInitials(builder.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                      {builder.name}
                    </h3>
                  </div>
                  <p className="text-[13px] text-text-secondary truncate mt-0.5">
                    {builder.tagline}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {builder.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-medium text-text-tertiary bg-background-secondary px-2 py-0.5 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <ArrowUpRight className="w-4 h-4 text-text-tertiary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center text-sm text-text-tertiary"
          >
            No builders match your search.
          </motion.p>
        )}
      </div>
    </div>
  );
}
