"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { antathons } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const filters = ["all", "active", "completed"] as const;
type Filter = (typeof filters)[number];

export default function HackathonsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = antathons.filter(
    (e) =>
      (!q ||
        e.title.toLowerCase().includes(q.toLowerCase()) ||
        e.theme.toLowerCase().includes(q.toLowerCase())) &&
      (filter === "all" || e.status === filter)
  );

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Sticky search + filter bar */}
      <div className="fixed top-[72px] left-0 right-0 z-40 bg-background-primary/80 backdrop-blur-xl border-b border-border-primary">
        <div className="max-w-[720px] mx-auto px-6 py-4 flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-text-tertiary pointer-events-none" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search hackathons..."
              className="w-full pl-9 pr-4 py-2 bg-transparent border border-border-primary shadow-sm rounded-lg text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-accent/40 focus:ring-2 focus:ring-accent/20 outline-none transition-all duration-300"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-0.5 bg-background-secondary/60 p-1 rounded-lg">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all duration-200",
                  filter === f
                    ? "bg-text-primary text-background-primary shadow-sm"
                    : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-[720px] mx-auto px-6 pt-44 pb-24">
        {/* Page heading */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[32px] text-text-primary mb-8"
        >
          Hackathons
        </motion.h1>

        {/* Cards */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((event, i) => (
              <HackathonCard key={event.id} event={event} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-text-tertiary text-[14px] py-24"
          >
            No hackathons found.
          </motion.p>
        )}
      </div>
    </div>
  );
}

/* ─── Card ──────────────────────────────────────────── */

function HackathonCard({
  event,
  index,
}: {
  event: (typeof antathons)[number];
  index: number;
}) {
  const prizePool = event.prizes.reduce(
    (sum, p) => sum + (parseInt(p.reward.replace(/[^0-9]/g, "")) || 0),
    0
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link
        href={`/hackathons/${event.id}`}
        className="group flex items-center gap-4 px-4 py-4 rounded-lg border border-transparent hover:border-black/5 dark:hover:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all duration-200"
      >
        {/* Gradient initial */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-[15px] font-bold text-white shrink-0"
          style={{ background: event.gradient }}
        >
          {event.title[0]}
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-text-primary truncate leading-snug">
              {event.title}
            </h2>
            <StatusBadge status={event.status} />
          </div>
          <p className="text-[13px] text-text-tertiary truncate mt-0.5">
            {event.theme}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-5 shrink-0 text-text-secondary">
          <span className="flex items-center gap-1.5 text-[13px] font-medium">
            <Trophy className="w-3.5 h-3.5 text-accent" />
            ${prizePool.toLocaleString()}
          </span>
          <span className="flex items-center gap-1.5 text-[13px] font-medium">
            <Users className="w-3.5 h-3.5 text-text-tertiary" />
            {event.participantCount}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Status Badge ──────────────────────────────────── */

function StatusBadge({
  status,
}: {
  status: "upcoming" | "active" | "completed";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide shrink-0",
        status === "active" &&
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        status === "upcoming" && "bg-accent-muted text-accent",
        status === "completed" && "bg-background-secondary text-text-tertiary"
      )}
    >
      {status === "active" && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      )}
      {status}
    </span>
  );
}
