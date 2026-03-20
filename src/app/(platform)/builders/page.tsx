"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, Heart } from "lucide-react";
import Link from "next/link";
import { builders, projects, getInitials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const skillFilters = ["All", "AI", "React", "Python", "Go", "Design", "Mobile"] as const;

export default function BuildersPage() {
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
      <div className="fixed top-[72px] left-0 right-0 z-40 bg-background-primary/80 backdrop-blur-xl border-b border-border-primary">
        <div className="max-w-[900px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, skill, or tagline..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-primary shadow-sm rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent/40 focus:ring-2 focus:ring-accent/20 outline-none transition-all duration-300"
              />
            </div>
            <span className="text-xs font-medium text-text-tertiary tabular-nums whitespace-nowrap">
              {filtered.length} builder{filtered.length !== 1 && "s"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {skillFilters.map((skill) => (
              <button
                key={skill}
                onClick={() => setActiveSkill(skill)}
                className={cn(
                  "px-3.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap",
                  activeSkill === skill
                    ? "bg-text-primary text-background-primary"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-background-secondary"
                )}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Builder grid */}
      <div className="max-w-[900px] mx-auto pt-52 pb-24 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[32px] text-text-primary mb-8"
        >
          Builders
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((builder, i) => {
              const bp = projects.filter((p) => p.builder.username === builder.username);
              const likes = bp.reduce((s, p) => s + p.likes, 0);
              return (
                <motion.div
                  key={builder.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35, delay: i * 0.03, ease: [0.25, 1, 0.5, 1] }}
                >
                  <Link
                    href={`/builders/${builder.username}`}
                    className="group block p-6 rounded-lg border border-border-primary bg-surface hover:border-black/10 dark:hover:border-white/10 hover:-translate-y-1  dark: transition-all duration-300 ease-out"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                        style={{ background: builder.gradient }}
                      >
                        {getInitials(builder.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                            {builder.name}
                          </h3>
                          <ArrowUpRight className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                        <p className="text-[12px] text-text-secondary truncate mt-0.5">
                          {builder.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {builder.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] font-medium text-text-tertiary bg-background-secondary rounded-lg px-2 py-0.5"
                        >
                          {skill}
                        </span>
                      ))}
                      {builder.skills.length > 3 && (
                        <span className="text-[10px] font-medium text-text-tertiary">
                          +{builder.skills.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-text-tertiary pt-4 border-t border-border-primary">
                      <span>{bp.length} project{bp.length !== 1 && "s"}</span>
                      <span className="text-border-primary">·</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {likes}
                      </span>
                      {builder.antathonIds.length > 0 && (
                        <>
                          <span className="text-border-primary">·</span>
                          <span>{builder.antathonIds.length} hackathon{builder.antathonIds.length !== 1 && "s"}</span>
                        </>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

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
