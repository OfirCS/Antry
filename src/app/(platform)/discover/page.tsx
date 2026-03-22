"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";
import { projects, CATEGORIES, getInitials, type Category } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filtered = projects.filter((p) => {
    const matchesQuery =
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.tagline.toLowerCase().includes(query.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
      p.builder.name.toLowerCase().includes(query.toLowerCase());

    const matchesCategory =
      activeCategory === "all" || p.category === activeCategory;

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="bg-background-primary min-h-screen">
      {/* Sticky search + category filters */}
      <div className="fixed top-[72px] left-0 right-0 z-40 bg-background-primary/80 backdrop-blur-xl border-b border-border-primary">
        <div className="max-w-[1100px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, tech stack, or builders..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-primary shadow-sm rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent/40 focus:ring-2 focus:ring-accent/20 outline-none transition-all duration-300"
              />
            </div>
            <span className="text-xs font-medium text-text-tertiary tabular-nums whitespace-nowrap">
              {filtered.length} project{filtered.length !== 1 && "s"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  "px-3.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap",
                  activeCategory === cat.value
                    ? "bg-text-primary text-background-primary"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-background-secondary"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Project grid */}
      <div className="max-w-[1100px] mx-auto pt-52 pb-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <h1 className="font-display text-[32px] text-text-primary">
            Discover
          </h1>
          <p className="text-[14px] text-text-secondary mt-1">
            Explore projects shipped by builders in the community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{
                  duration: 0.35,
                  delay: i * 0.03,
                  ease: [0.25, 1, 0.5, 1],
                }}
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="group block rounded-lg border border-border-primary bg-surface hover:border-black/10 dark:hover:border-white/10 hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"
                >
                  {/* Gradient header */}
                  <div
                    className="h-28 relative"
                    style={{ background: project.gradient }}
                  >
                    <div
                      className="absolute inset-0 opacity-[0.12] mix-blend-soft-light"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                      }}
                    />
                    <span className="absolute bottom-2 left-3 text-white/10 text-[32px] font-mono font-bold select-none">
                      {project.title.slice(0, 3).toLowerCase()}
                    </span>
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-semibold text-white/70 bg-white/10 backdrop-blur-sm rounded-md px-2 py-0.5">
                        {project.category.replace("-", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                      <ArrowUpRight className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                    </div>
                    <p className="text-[12px] text-text-secondary line-clamp-2 mb-4">
                      {project.tagline}
                    </p>

                    {/* Builder */}
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center text-[7px] font-bold text-white shrink-0"
                        style={{ background: project.builder.gradient }}
                      >
                        {getInitials(project.builder.name)}
                      </div>
                      <span className="text-[11px] font-medium text-text-tertiary truncate">
                        {project.builder.name}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border-primary">
                      <div className="flex flex-wrap gap-1.5">
                        {project.techStack.slice(0, 2).map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] font-medium text-text-tertiary bg-background-secondary rounded px-1.5 py-0.5"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 2 && (
                          <span className="text-[10px] text-text-tertiary">
                            +{project.techStack.length - 2}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                        <Heart className="w-3 h-3" />
                        {project.likes}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center text-sm text-text-tertiary"
          >
            No projects match your search.
          </motion.p>
        )}
      </div>
    </div>
  );
}
