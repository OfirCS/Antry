"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/ProjectCard";
import { BuilderCard } from "@/components/BuilderCard";
import { projects, builders, CATEGORIES, getProjectsByCategory, type Category } from "@/lib/mock-data";

export default function DiscoverPage() {
  const [cat, setCat] = useState<Category>("all");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"projects" | "builders">("projects");

  const filteredProjects = getProjectsByCategory(cat).filter(
    (p) => !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.tagline.toLowerCase().includes(q.toLowerCase()) || p.techStack.some((t) => t.toLowerCase().includes(q.toLowerCase()))
  );

  const filteredBuilders = builders.filter(
    (b) => !q || b.name.toLowerCase().includes(q.toLowerCase()) || b.skills.some((s) => s.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-10 md:py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-[28px] md:text-[36px] text-text-primary leading-snug mb-8">Discover</h1>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects, tech, builders..."
          className="w-full pl-10 pr-4 py-2.5 bg-background-secondary border border-border-tertiary rounded-lg text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border-tertiary">
        {(["projects", "builders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "text-[13px] pb-2.5 px-1 border-b-2 -mb-px capitalize transition-colors",
              tab === t ? "text-text-primary border-accent" : "text-text-tertiary border-transparent hover:text-text-secondary"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Category filters */}
      {tab === "projects" && (
        <div className="flex flex-wrap gap-1.5 mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCat(c.value)}
              className={cn(
                "text-[11px] font-mono px-2.5 py-1 rounded-md border transition-all",
                cat === c.value
                  ? "bg-text-primary text-background-primary border-text-primary"
                  : "text-text-tertiary border-border-tertiary hover:border-border-secondary"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {tab === "projects" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
          {filteredProjects.length === 0 && <p className="text-center py-16 text-[13px] text-text-tertiary">Nothing found.</p>}
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBuilders.map((b, i) => <BuilderCard key={b.id} builder={b} index={i} />)}
          </div>
          {filteredBuilders.length === 0 && <p className="text-center py-16 text-[13px] text-text-tertiary">Nothing found.</p>}
        </>
      )}
    </div>
  );
}
