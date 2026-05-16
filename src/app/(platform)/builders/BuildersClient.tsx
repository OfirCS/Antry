"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, MessageSquare, Search } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getInitials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const segments = [
  { key: "all", label: "All" },
  { key: "ai", label: "AI", match: ["python", "langchain", "rag", "ai", "ml", "pytorch", "agents"] },
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
  const config = segments.find((entry) => entry.key === segment);
  if (!config || !("match" in config)) return true;
  const norm = skills.map((skill) => skill.toLowerCase());
  return norm.some((skill) => config.match.some((match) => skill.includes(match)));
}

function builderSignal(builder: BuilderItem) {
  return (
    builder.totalLikes * 2 +
    builder.projectCount * 18 +
    builder.skills.length * 6 +
    Math.max(0, 45 - daysSince(builder.joinedAt))
  );
}

function BuilderRow({ builder, index }: { builder: BuilderItem; index: number }) {
  const isNew = daysSince(builder.joinedAt) <= 14;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.025, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/builders/${builder.username}`}
        className="group grid gap-3 px-4 py-4 transition-colors hover:bg-gray-50 lg:grid-cols-[1fr_0.55fr_0.32fr_0.32fr_0.18fr] lg:items-center"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-black/10 bg-white text-[12px] font-bold text-black">
            {getInitials(builder.name)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[14px] font-semibold text-black">{builder.name}</h2>
              {isNew && (
                <span className="rounded border border-black/10 bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase text-gray-500">
                  New
                </span>
              )}
            </div>
            <p className="truncate text-[12px] text-gray-500">@{builder.username}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap gap-1">
          {builder.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded border border-black/10 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-500"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="text-[13px] text-gray-500">
          <span className="font-semibold text-black">{builder.projectCount}</span> shipped
        </div>

        <div className="text-[13px] text-gray-500">
          <span className="font-semibold text-black">{builder.totalLikes}</span> signal
        </div>

        <div className="flex justify-end">
          <ArrowUpRight className="h-4 w-4 text-gray-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black" />
        </div>
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
      .filter((builder) => {
        const matchesQuery =
          !q ||
          builder.name.toLowerCase().includes(q) ||
          builder.username.toLowerCase().includes(q) ||
          builder.tagline.toLowerCase().includes(q) ||
          builder.skills.some((skill) => skill.toLowerCase().includes(q));

        return matchesQuery && matchesSegment(builder.skills, activeSegment);
      })
      .sort((a, b) => builderSignal(b) - builderSignal(a));
  }, [activeSegment, builders, query]);

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-black">
      <section className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-black/10 pb-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Builders
              </p>
              <h1 className="mt-2 text-[34px] font-bold leading-none tracking-[-0.045em] sm:text-[52px]">
                Directory
              </h1>
              <Link
                href="/discover"
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-black/10 bg-white px-3 text-[12px] font-bold text-black transition-colors hover:border-black/20 hover:bg-gray-50"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Open community feed
              </Link>
            </div>
            <div className="flex items-end gap-8 sm:text-right">
              <Stat label="Builders" value={builders.length.toString()} />
              <Stat
                label="Projects"
                value={builders.reduce((sum, builder) => sum + builder.projectCount, 0).toString()}
              />
              <Stat
                label="Signal"
                value={builders.reduce((sum, builder) => sum + builder.totalLikes, 0).toString()}
              />
            </div>
          </div>
        </header>

        <section className="sticky top-[56px] z-30 -mx-4 border-b border-black/10 bg-[#F7F8FA]/92 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-[1100px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-[340px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search builders"
                className="h-10 w-full rounded-md border border-black/10 bg-white pl-9 pr-3 text-[13px] outline-none transition-colors placeholder:text-gray-400 focus:border-black/30"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {segments.map((segment) => (
                <button
                  key={segment.key}
                  onClick={() => setActiveSegment(segment.key)}
                  className={cn(
                    "h-9 shrink-0 rounded-md px-3 text-[12px] font-semibold transition-colors",
                    activeSegment === segment.key
                      ? "bg-black text-white"
                      : "text-gray-500 hover:bg-white hover:text-black"
                  )}
                >
                  {segment.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-md border border-black/10 bg-white">
          <div className="hidden grid-cols-[1fr_0.55fr_0.32fr_0.32fr_0.18fr] border-b border-black/10 bg-gray-50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500 lg:grid">
            <span>Builder</span>
            <span>Skills</span>
            <span>Output</span>
            <span>Signal</span>
            <span />
          </div>

          <div className="divide-y divide-black/10">
            {filteredBuilders.map((builder, index) => (
              <BuilderRow key={builder.id} builder={builder} index={index} />
            ))}
          </div>

          {filteredBuilders.length === 0 && (
            <div className="px-4 py-16 text-center">
              <p className="text-[14px] font-semibold text-black">No builders found</p>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveSegment("all");
                }}
                className="mt-2 text-[13px] font-semibold text-gray-500 hover:text-black"
              >
                Reset filters
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[28px] font-bold leading-none tracking-[-0.04em] text-black">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">{label}</div>
    </div>
  );
}
