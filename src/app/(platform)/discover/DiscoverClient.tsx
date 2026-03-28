"use client";

import { useMemo, useState } from "react";
import { Search, Heart, ArrowUpRight, Bot, Wrench, Layout, Flame, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getInitials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  category: string;
  techStack: string[];
  gradient: string;
  likes: number;
  createdAt: string;
  builder: { username: string; name: string; gradient: string };
}

interface BuilderPreview {
  id: string;
  username: string;
  name: string;
  tagline: string;
  skills: string[];
  gradient: string;
  projectCount: number;
}

const categories = [
  { key: "all", label: "All" },
  { key: "ai-agents", label: "AI Agents" },
  { key: "web-apps", label: "Web Apps" },
  { key: "tools", label: "Tools" },
  { key: "data-ml", label: "Data / ML" },
];

function ProjectRow({ project, index, locked }: { project: ProjectItem; index: number; locked: boolean }) {
  const daysAgo = Math.floor((Date.now() - new Date(project.createdAt).getTime()) / 86400000);
  const timeLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={locked ? "#" : `/projects/${project.id}`}
        onClick={locked ? (e) => e.preventDefault() : undefined}
        className={cn(
          "group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-4 sm:py-3.5 rounded-xl transition-all duration-200 min-h-[56px]",
          locked ? "opacity-50 cursor-default" : "hover:bg-white hover:shadow-sm"
        )}
      >
        {/* Rank */}
        <span className="text-[12px] font-mono text-gray-300 w-5 sm:w-6 text-right shrink-0 hidden sm:block">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Project icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[13px] font-bold shrink-0"
          style={{ background: project.gradient || "#111" }}
        >
          {project.title.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] sm:text-[14px] font-semibold text-[#111] truncate">{project.title}</h3>
            <span className="hidden sm:inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize shrink-0">
              {project.category.replace("-", " ")}
            </span>
          </div>
          <p className="text-[12px] text-gray-400 truncate">{project.tagline}</p>
          {/* Mobile-only: show builder name inline */}
          <div className="flex items-center gap-1.5 mt-1 md:hidden">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
              style={{ background: project.builder.gradient || "#666" }}
            >
              {project.builder.name.charAt(0)}
            </div>
            <span className="text-[11px] text-gray-400 truncate">{project.builder.name}</span>
          </div>
        </div>

        {/* Builder */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: project.builder.gradient || "#666" }}
          >
            {project.builder.name.charAt(0)}
          </div>
          <span className="text-[12px] text-gray-500 max-w-[100px] truncate">{project.builder.name}</span>
        </div>

        {/* Tech */}
        <div className="hidden lg:flex gap-1 shrink-0">
          {project.techStack.slice(0, 2).map((t) => (
            <span key={t} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{t}</span>
          ))}
        </div>

        {/* Signal */}
        <div className="flex items-center gap-1 shrink-0 w-12 sm:w-14 justify-end">
          {locked ? (
            <Lock className="w-3.5 h-3.5 text-gray-300" />
          ) : (
            <>
              <Heart className="w-3 h-3 text-gray-300" />
              <span className="text-[12px] font-semibold text-gray-500">{project.likes}</span>
            </>
          )}
        </div>

        {/* Time */}
        <span className="text-[11px] text-gray-300 w-16 text-right shrink-0 hidden sm:block">{timeLabel}</span>

        {/* Arrow */}
        {!locked && (
          <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#111] transition-colors shrink-0 hidden sm:block" />
        )}
      </Link>
    </motion.div>
  );
}

export default function DiscoverClient({
  projects,
  featuredBuilders,
}: {
  projects: ProjectItem[];
  featuredBuilders: BuilderPreview[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => {
        const matchesQuery = !q || p.title.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.techStack.some((t) => t.toLowerCase().includes(q)) || p.builder.name.toLowerCase().includes(q);
        const matchesCat = activeCategory === "all" || p.category === activeCategory;
        return matchesQuery && matchesCat;
      })
      .sort((a, b) => b.likes - a.likes);
  }, [projects, query, activeCategory]);

  const FREE_LIMIT = 5;

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
      <div className="mx-auto max-w-[960px] px-4 sm:px-10 pb-20 pt-8 sm:pt-10">
        {/* Header row */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight text-[#111]">Discover</h1>
            <p className="text-[13px] sm:text-[14px] text-gray-400 mt-1">What builders are shipping right now</p>
          </div>
          <Link href="/submit" className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold transition-all hover:scale-[1.02] min-h-[44px] shrink-0" style={{ background: "#C6F135", color: "#111" }}>
            <Sparkles className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Submit yours</span><span className="sm:hidden">Submit</span>
          </Link>
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1 sm:max-w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-lg border border-gray-200 bg-white py-3 sm:py-2.5 pl-10 pr-3 text-[14px] sm:text-[13px] text-[#111] outline-none placeholder:text-gray-400 focus:border-[#C6F135] focus:ring-1 focus:ring-[#C6F135]/20"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                className={cn(
                  "rounded-lg px-3 py-2.5 sm:px-2.5 sm:py-1.5 text-[13px] sm:text-[12px] font-medium transition-all whitespace-nowrap min-h-[44px] sm:min-h-0",
                  activeCategory === c.key ? "bg-[#111] text-white" : "text-gray-500 hover:text-[#111] hover:bg-gray-100"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column headers -- hidden on mobile for clean card-style list */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-300 border-b border-gray-100">
          <span className="w-6 text-right">#</span>
          <span className="w-10" />
          <span className="flex-1">Project</span>
          <span className="hidden md:block w-[130px]">Builder</span>
          <span className="hidden lg:block w-[120px]">Stack</span>
          <span className="w-14 text-right">Signal</span>
          <span className="hidden sm:block w-16 text-right">When</span>
          <span className="w-3.5" />
        </div>

        {/* Project list */}
        <div className="divide-y divide-gray-50">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-5 h-5 text-gray-300 mx-auto mb-3" />
              <p className="text-[14px] text-gray-400">No projects match your search</p>
            </div>
          ) : (
            filteredProjects.map((project, i) => (
              <ProjectRow key={project.id} project={project} index={i} locked={i >= FREE_LIMIT} />
            ))
          )}
        </div>

        {/* Paywall */}
        {filteredProjects.length > FREE_LIMIT && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl p-8 text-center"
            style={{ background: "#111", border: "1px solid rgba(198,241,53,0.15)" }}
          >
            <Lock className="w-5 h-5 mx-auto mb-3" style={{ color: "#C6F135" }} />
            <h3 className="text-[18px] font-bold text-white tracking-tight">
              Unlock full access
            </h3>
            <p className="text-[14px] mt-1 max-w-[360px] mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              See all {filteredProjects.length} projects, builder profiles, and detailed analytics.
            </p>
            <button className="mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-semibold transition-all hover:scale-[1.02]" style={{ background: "#C6F135", color: "#111" }}>
              Upgrade to Pro
            </button>
            <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>Starting at $9/mo</p>
          </motion.div>
        )}

        {/* Active builders */}
        {featuredBuilders.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-[#111]">Active builders</h2>
              <Link href="/builders" className="text-[12px] font-medium text-gray-400 hover:text-[#111]">See all &rarr;</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none snap-x snap-mandatory">
              {featuredBuilders.map((b) => (
                <Link key={b.id} href={`/builders/${b.username}`} className="shrink-0 flex items-center gap-2.5 rounded-lg border border-gray-200/80 bg-white px-3.5 py-3 transition-all hover:shadow-sm hover:border-gray-300 min-h-[48px] snap-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: b.gradient }}>{getInitials(b.name)}</div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#111]">{b.name}</p>
                    <p className="text-[11px] text-gray-400">{b.projectCount} shipped</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
