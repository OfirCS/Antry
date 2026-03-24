"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, Zap } from "lucide-react";
import Link from "next/link";
import { getInitials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const skillFilters = ["All", "AI", "React", "Python", "Go", "Design", "Mobile"] as const;

interface BuilderItem {
  id: string;
  username: string;
  name: string;
  tagline: string;
  skills: string[];
  gradient: string;
  projectCount: number;
  totalLikes: number;
}

export default function BuildersClient({ builders }: { builders: BuilderItem[] }) {
  const [query, setQuery] = useState("");
  const [activeSkill, setActiveSkill] = useState<string>("All");

  const filtered = builders.filter((b) => {
    const matchesQuery =
      !query ||
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.tagline.toLowerCase().includes(query.toLowerCase()) ||
      b.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()));

    const matchesSkill =
      activeSkill === "All" ||
      b.skills.some((s) => s.toLowerCase().includes(activeSkill.toLowerCase()));

    return matchesQuery && matchesSkill;
  });

  return (
    <div className="bg-background-primary min-h-screen">
      {/* Sticky search + filters */}
      <div className="fixed top-[72px] left-0 right-0 z-40 bg-background-primary/90 backdrop-blur-xl border-b border-border-tertiary transition-all duration-300">
        <div className="max-w-[1100px] mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-[480px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-accent pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search verified builders..."
                className="w-full pl-12 pr-4 py-3 bg-surface border border-border-primary shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-full text-[15px] font-medium text-text-primary placeholder:text-text-tertiary focus:border-accent/40 focus:ring-4 focus:ring-accent/10 outline-none transition-all duration-300"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
              {skillFilters.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setActiveSkill(skill)}
                  className={cn(
                    "px-4 py-2 text-[12px] font-bold rounded-full transition-all whitespace-nowrap tracking-tight",
                    activeSkill === skill
                      ? "bg-text-primary text-background-primary shadow-md"
                      : "bg-surface border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-secondary hover:bg-background-secondary"
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Builder grid */}
      <div className="max-w-[1100px] mx-auto pt-52 pb-24 px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2rem,4vw,3rem)] text-text-primary tracking-[-0.03em]"
            >
              The Network
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[16px] text-text-secondary mt-2"
            >
              Discover builders by their verified shipping history.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="hidden sm:flex items-center gap-2 text-[13px] font-bold text-text-tertiary uppercase tracking-wider"
          >
            <span className="text-text-primary">{filtered.length}</span> Builders Match
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((builder, i) => (
              <motion.div
                key={builder.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/builders/${builder.username}`}
                  className="group card-premium block p-8 h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-[16px] font-bold text-white shrink-0 shadow-lg"
                        style={{ background: builder.gradient }}
                      >
                        {getInitials(builder.name)}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-background-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <ArrowUpRight className="w-4 h-4 text-text-primary" />
                      </div>
                    </div>

                    <h3 className="text-[18px] font-bold text-text-primary group-hover:text-accent transition-colors tracking-tight mb-1.5">
                      {builder.name}
                    </h3>
                    <p className="text-[14px] text-text-secondary line-clamp-2 leading-relaxed mb-6">
                      {builder.tagline}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {builder.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] font-bold text-text-tertiary bg-background-secondary border border-border-secondary rounded-md px-2.5 py-1"
                        >
                          {skill}
                        </span>
                      ))}
                      {builder.skills.length > 3 && (
                        <span className="text-[11px] font-bold text-text-tertiary px-1 py-1">
                          +{builder.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-border-tertiary mt-auto">
                    <div className="flex items-center gap-4 text-[12px] font-bold text-text-tertiary uppercase tracking-wider">
                      <span>{builder.projectCount} SHIP{builder.projectCount !== 1 && "S"}</span>
                      <span className="flex items-center gap-1.5 text-accent">
                        <Zap className="w-3.5 h-3.5" /> {builder.totalLikes}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center"
          >
            <p className="text-[16px] text-text-secondary font-medium">No builders match your search.</p>
            <button
              onClick={() => { setQuery(""); setActiveSkill("All"); }}
              className="mt-4 text-accent text-[14px] font-bold hover:underline"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
