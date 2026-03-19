"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ArrowRight, Heart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/ProjectCard";
import {
  projects,
  builders,
  CATEGORIES,
  getProjectsByCategory,
  getBuilderProjects,
  getInitials,
  type Category,
  type Builder,
} from "@/lib/mock-data";

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Immersive Ant Card (full-width, hero-style) ── */
function AntSpotlight({ builder, index }: { builder: Builder; index: number }) {
  const antProjects = getBuilderProjects(builder.username);
  const topProject = antProjects.sort((a, b) => b.likes - a.likes)[0];
  const totalLikes = antProjects.reduce((s, p) => s + p.likes, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease }}
    >
      <Link
        href={`/builders/${builder.username}`}
        className="group block relative overflow-hidden rounded-2xl border border-border-tertiary hover:border-accent/30 transition-all duration-300"
      >
        {/* Gradient hero bar */}
        <div className="h-32 sm:h-40 relative overflow-hidden" style={{ background: builder.gradient }}>
          <div
            className="absolute inset-0 opacity-[0.15] mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
          {/* Large initials watermark */}
          <span className="absolute bottom-2 right-6 text-white/10 text-[80px] sm:text-[120px] font-mono font-bold leading-none select-none">
            {getInitials(builder.name)}
          </span>
        </div>

        {/* Content */}
        <div className="relative px-6 sm:px-8 pb-7 pt-0">
          {/* Avatar overlapping the gradient */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center -mt-8 mb-4 border-4 border-background-primary shadow-sm"
            style={{ background: builder.gradient }}
          >
            <span className="text-xl font-medium text-white">{getInitials(builder.name)}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-[20px] sm:text-[22px] font-display text-text-primary leading-snug group-hover:text-accent transition-colors">
                {builder.name}
              </h3>
              <p className="text-[14px] text-text-secondary mt-1 leading-relaxed line-clamp-2 max-w-[420px]">
                {builder.tagline}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {builder.skills.slice(0, 4).map((s) => (
                  <span key={s} className="text-[10px] font-mono text-text-tertiary bg-background-secondary rounded-md px-2 py-0.5">
                    {s}
                  </span>
                ))}
                {builder.skills.length > 4 && (
                  <span className="text-[10px] font-mono text-text-tertiary">+{builder.skills.length - 4}</span>
                )}
              </div>
            </div>

            {/* Stats + featured project */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="flex gap-5 text-center">
                <div>
                  <div className="text-[18px] font-mono text-text-primary">{antProjects.length}</div>
                  <div className="text-[10px] text-text-tertiary">projects</div>
                </div>
                <div>
                  <div className="text-[18px] font-mono text-text-primary">{totalLikes}</div>
                  <div className="text-[10px] text-text-tertiary">likes</div>
                </div>
              </div>
              {topProject && (
                <div className="flex items-center gap-2 text-[12px] text-text-tertiary">
                  <span className="font-mono">{topProject.title}</span>
                  <Heart className="w-3 h-3" />
                  <span>{topProject.likes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Featured project preview */}
          {topProject && (
            <div className="mt-5 pt-5 border-t border-border-tertiary">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg shrink-0 relative overflow-hidden"
                  style={{ background: topProject.gradient }}
                >
                  <span className="absolute bottom-0.5 left-1.5 text-white/25 text-[14px] font-mono font-bold">
                    {topProject.title.slice(0, 2).toLowerCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-text-primary">{topProject.title}</div>
                  <div className="text-[12px] text-text-tertiary line-clamp-1">{topProject.tagline}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function DiscoverPage() {
  const [cat, setCat] = useState<Category>("all");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"ants" | "projects">("ants");

  const filteredProjects = getProjectsByCategory(cat).filter(
    (p) =>
      !q ||
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.tagline.toLowerCase().includes(q.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(q.toLowerCase()))
  );

  const filteredBuilders = builders.filter(
    (b) =>
      !q ||
      b.name.toLowerCase().includes(q.toLowerCase()) ||
      b.tagline.toLowerCase().includes(q.toLowerCase()) ||
      b.skills.some((s) => s.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-10 md:py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-[28px] md:text-[36px] text-text-primary leading-snug mb-2">Discover</h1>
        <p className="text-[14px] text-text-secondary mb-8">Explore the colony. Meet the ants. See what they&apos;ve built.</p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ants, projects, tech..."
          className="w-full pl-10 pr-4 py-2.5 bg-background-secondary border border-border-tertiary rounded-lg text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border-tertiary">
        {(["ants", "projects"] as const).map((t) => (
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

      {/* Category filters (projects only) */}
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

      {tab === "ants" ? (
        <>
          {/* Immersive ant cards — single column, large format */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredBuilders.map((b, i) => (
              <AntSpotlight key={b.id} builder={b} index={i} />
            ))}
          </div>
          {filteredBuilders.length === 0 && (
            <p className="text-center py-16 text-[13px] text-text-tertiary">No ants found.</p>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
          {filteredProjects.length === 0 && (
            <p className="text-center py-16 text-[13px] text-text-tertiary">Nothing found.</p>
          )}
        </>
      )}
    </div>
  );
}
