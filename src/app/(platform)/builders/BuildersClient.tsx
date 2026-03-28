"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpRight, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getInitials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const segments = [
  { key: "all", label: "All" },
  { key: "ai", label: "AI & ML", match: ["python", "langchain", "rag", "ai", "ml", "pytorch", "agents", "multi-agent"] },
  { key: "frontend", label: "Frontend", match: ["react", "next.js", "figma", "framer", "three.js", "css"] },
  { key: "backend", label: "Backend", match: ["go", "rust", "node.js", "postgres", "kubernetes", "terraform", "cli"] },
  { key: "design", label: "Design", match: ["figma", "design", "ui", "ux", "framer"] },
] as const;

type SegmentKey = string;

interface BuilderItem {
  id: string;
  username: string;
  name: string;
  tagline: string;
  skills: string[];
  gradient: string;
  projectCount: number;
  totalLikes: number;
  joinedAt?: string;
}

function daysSince(date?: string) {
  if (!date) return 999;
  return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
}

function matchesSegment(skills: string[], segment: SegmentKey) {
  if (segment === "all") return true;
  const config = segments.find((e) => e.key === segment);
  if (!config || !("match" in config)) return true;
  const norm = skills.map((s) => s.toLowerCase());
  const matchList = "match" in config ? (config as unknown as { match: readonly string[] }).match : [];
  return norm.some((s) => matchList.some((m) => s.includes(m)));
}

function builderSignal(b: BuilderItem) {
  return b.totalLikes * 2 + b.projectCount * 18 + b.skills.length * 6 + Math.max(0, 45 - daysSince(b.joinedAt));
}

function BuilderRow({ builder, index }: { builder: BuilderItem; index: number }) {
  const isNew = daysSince(builder.joinedAt) <= 14;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/builders/${builder.username}`}
        className="group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-4 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm min-h-[64px]"
      >
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 shadow-sm"
          style={{ background: builder.gradient }}
        >
          {getInitials(builder.name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-[#111] truncate">{builder.name}</h3>
            {isNew && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#C6F135", color: "#111" }}>NEW</span>}
          </div>
          <p className="text-[12px] text-gray-400 truncate mt-0.5">{builder.tagline || "Builder on Antry"}</p>
          {/* Mobile-only: show stats inline */}
          <div className="flex items-center gap-3 mt-1 sm:hidden text-[11px] text-gray-400">
            <span><span className="font-semibold text-[#111]">{builder.projectCount}</span> shipped</span>
            <span><span className="font-semibold text-[#111]">{builder.totalLikes}</span> signal</span>
          </div>
        </div>

        {/* Skills */}
        <div className="hidden md:flex gap-1 shrink-0 max-w-[200px]">
          {builder.skills.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 truncate">{s}</span>
          ))}
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4 shrink-0 text-[12px] text-gray-400">
          <span><span className="font-semibold text-[#111]">{builder.projectCount}</span> shipped</span>
          <span><span className="font-semibold text-[#111]">{builder.totalLikes}</span> signal</span>
        </div>

        {/* Arrow */}
        <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#111] transition-colors shrink-0 hidden sm:block" />
      </Link>
    </motion.div>
  );
}

export default function BuildersClient({ builders }: { builders: BuilderItem[] }) {
  const [query, setQuery] = useState("");
  const [activeSegment, setActiveSegment] = useState<SegmentKey>("all");

  const filteredBuilders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return builders
      .filter((b) => {
        const matchesQuery = !q || b.name.toLowerCase().includes(q) || b.username.toLowerCase().includes(q) || b.tagline.toLowerCase().includes(q) || b.skills.some((s) => s.toLowerCase().includes(q));
        return matchesQuery && matchesSegment(b.skills, activeSegment);
      })
      .sort((a, b) => builderSignal(b) - builderSignal(a));
  }, [activeSegment, builders, query]);

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
      <div className="mx-auto max-w-[960px] px-4 sm:px-10 pb-20 pt-8 sm:pt-10">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight text-[#111]">Builders</h1>
            <p className="text-[13px] sm:text-[14px] text-gray-400 mt-1">{builders.length} people building with AI</p>
          </div>
          <Link href="/signup" className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold bg-[#111] text-white transition-all hover:scale-[1.02] min-h-[44px] shrink-0">
            Join<span className="hidden sm:inline">&nbsp;the network</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1 sm:max-w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or skill..."
              className="w-full rounded-lg border border-gray-200 bg-white py-3 sm:py-2.5 pl-10 pr-3 text-[14px] sm:text-[13px] text-[#111] outline-none placeholder:text-gray-400 focus:border-[#C6F135] focus:ring-1 focus:ring-[#C6F135]/20"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1">
            {segments.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSegment(s.key)}
                className={cn(
                  "rounded-lg px-3 py-2.5 sm:px-2.5 sm:py-1.5 text-[13px] sm:text-[12px] font-medium transition-all whitespace-nowrap min-h-[44px] sm:min-h-0",
                  activeSegment === s.key ? "bg-[#111] text-white" : "text-gray-500 hover:text-[#111] hover:bg-gray-100"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column headers -- hidden on mobile for clean list */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-300 border-b border-gray-100">
          <span className="w-11" />
          <span className="flex-1">Builder</span>
          <span className="hidden md:block w-[200px]">Skills</span>
          <span className="hidden sm:block w-[160px]">Output</span>
          <span className="w-3.5" />
        </div>

        {/* List */}
        <div className="divide-y divide-gray-50">
          {filteredBuilders.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-5 h-5 text-gray-300 mx-auto mb-3" />
              <p className="text-[14px] text-gray-400">No builders match your search</p>
            </div>
          ) : (
            filteredBuilders.map((b, i) => (
              <BuilderRow key={b.id} builder={b} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
