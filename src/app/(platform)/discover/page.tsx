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
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Discover</h1>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl">Explore the best projects and meet the builders behind them.</p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-12 max-w-2xl mx-auto">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects, technologies, or builders..."
          className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-100 rounded-full text-base text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-600 focus:shadow-xl focus:shadow-blue-50 transition-all shadow-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-8 mb-10">
        {(["projects", "builders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "text-base font-semibold pb-2 px-2 border-b-2 capitalize transition-all",
              tab === t ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-gray-600"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Category filters */}
      {tab === "projects" && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCat(c.value)}
              className={cn(
                "text-sm font-medium px-5 py-2 rounded-full border-2 transition-all active:scale-95",
                cat === c.value
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                  : "bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
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
