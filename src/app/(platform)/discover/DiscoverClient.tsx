"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getInitials } from "@/lib/mock-data";

interface BuilderItem {
  id: string;
  username: string;
  name: string;
  tagline: string;
  skills: string[];
  gradient: string;
}

export default function DiscoverClient({ builders }: { builders: BuilderItem[] }) {
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
      <div className="fixed top-[72px] left-0 right-0 z-40 bg-background-primary/90 backdrop-blur-xl border-b border-border-tertiary transition-all duration-300">
        <div className="max-w-[700px] mx-auto px-6 py-5 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-accent pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search builders by name or skill..."
              className="w-full pl-12 pr-4 py-3 bg-surface border border-border-primary shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-full text-[15px] font-medium text-text-primary placeholder:text-text-tertiary focus:border-accent/40 focus:ring-4 focus:ring-accent/10 outline-none transition-all duration-300"
            />
          </div>
          <span className="text-[12px] font-bold text-text-tertiary uppercase tracking-widest tabular-nums whitespace-nowrap bg-background-secondary px-3 py-1.5 rounded-md shadow-sm">
            {filtered.length} Match{filtered.length !== 1 && "es"}
          </span>
        </div>
      </div>

      {/* Builder list */}
      <div className="max-w-[700px] mx-auto pt-44 pb-24 px-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((builder, i) => (
            <motion.div
              key={builder.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href={`/builders/${builder.username}`}
                className="group flex items-center gap-5 py-6 border-b border-border-tertiary hover:border-accent/40 transition-colors"
              >
                {/* Avatar */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-[15px] font-bold text-white shrink-0 shadow-md"
                  style={{ background: builder.gradient }}
                >
                  {getInitials(builder.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-[18px] font-bold text-text-primary group-hover:text-accent transition-colors truncate tracking-tight mb-1">
                      {builder.name}
                    </h3>
                  </div>
                  <p className="text-[14px] text-text-secondary truncate font-medium">
                    {builder.tagline}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {builder.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-bold text-text-tertiary bg-background-secondary border border-border-secondary px-2.5 py-1 rounded-md tracking-tight"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0">
                  <ArrowUpRight className="w-4 h-4 text-text-primary" />
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center card-premium bg-background-secondary/30 mt-8"
          >
            <p className="text-[15px] text-text-tertiary font-medium">No builders match your search.</p>
            <button 
              onClick={() => setQuery("")}
              className="mt-4 text-accent text-[14px] font-bold hover:underline"
            >
              Clear search
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
