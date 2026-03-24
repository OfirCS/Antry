"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trophy, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const filters = ["all", "active", "completed"] as const;
type Filter = (typeof filters)[number];

interface HackathonItem {
  id: string;
  title: string;
  theme: string;
  status: "active" | "upcoming" | "completed";
  gradient: string;
  prizes: { place: string; reward: string }[];
  participantCount: number;
}

export default function HackathonsClient({ hackathons }: { hackathons: HackathonItem[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = hackathons.filter(
    (e) =>
      (!q ||
        e.title.toLowerCase().includes(q.toLowerCase()) ||
        e.theme.toLowerCase().includes(q.toLowerCase())) &&
      (filter === "all" || e.status === filter)
  );

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Sticky search + filter bar */}
      <div className="fixed top-[72px] left-0 right-0 z-40 bg-background-primary/90 backdrop-blur-xl border-b border-border-tertiary transition-all duration-300">
        <div className="max-w-[900px] mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-accent pointer-events-none" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search antathons..."
              className="w-full pl-12 pr-4 py-3 bg-surface border border-border-primary shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-full text-[15px] font-medium text-text-primary placeholder:text-text-tertiary focus:border-accent/40 focus:ring-4 focus:ring-accent/10 outline-none transition-all duration-300"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 text-[12px] font-bold uppercase tracking-widest rounded-full transition-all duration-300",
                  filter === f
                    ? "bg-text-primary text-background-primary shadow-md"
                    : "bg-surface border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-secondary"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-[900px] mx-auto px-6 pt-52 pb-24">
        {/* Page heading */}
        <div className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2rem,4vw,3rem)] text-text-primary tracking-[-0.03em]"
          >
            Antathons
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[16px] text-text-secondary mt-2 max-w-[500px]"
          >
            Compete, build, and earn verified credentials on the platform.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((event, i) => (
              <HackathonCard key={event.id} event={event} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-[16px] text-text-secondary font-medium">No antathons found.</p>
            <button
              onClick={() => { setQ(""); setFilter("all"); }}
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

/* Card */

function HackathonCard({
  event,
  index,
}: {
  event: HackathonItem;
  index: number;
}) {
  const prizePool = event.prizes.reduce(
    (sum, p) => sum + (parseInt(p.reward.replace(/[^0-9]/g, "")) || 0),
    0
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link
        href={`/hackathons/${event.id}`}
        className="group card-premium flex flex-col sm:flex-row sm:items-center gap-6 p-6 sm:p-8"
      >
        {/* Gradient initial */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-[18px] font-bold text-white shrink-0 shadow-lg"
          style={{ background: event.gradient }}
        >
          {event.title[0]}
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <h2 className="text-[20px] font-bold text-text-primary truncate tracking-tight group-hover:text-accent transition-colors">
              {event.title}
            </h2>
            <StatusBadge status={event.status} />
          </div>
          <p className="text-[15px] text-text-secondary truncate max-w-[90%]">
            {event.theme}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 shrink-0 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border-tertiary">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Prize Pool</span>
            <span className="flex items-center gap-1.5 text-[15px] font-bold text-text-primary">
              <Trophy className="w-4 h-4 text-accent" />
              ${prizePool.toLocaleString()}
            </span>
          </div>
          <div className="w-px h-10 bg-border-tertiary hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Builders</span>
            <span className="flex items-center gap-1.5 text-[15px] font-bold text-text-primary">
              <Users className="w-4 h-4 text-text-tertiary" />
              {event.participantCount}
            </span>
          </div>
          <div className="h-10 w-10 rounded-full bg-background-secondary flex items-center justify-center ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex">
            <ArrowRight className="w-5 h-5 text-text-primary group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* Status Badge */

function StatusBadge({
  status,
}: {
  status: "upcoming" | "active" | "completed";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest shrink-0",
        status === "active" &&
          "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
        status === "upcoming" && "bg-accent-muted text-accent border border-accent/20",
        status === "completed" && "bg-background-secondary text-text-tertiary border border-border-secondary"
      )}
    >
      {status === "active" && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
      )}
      {status}
    </span>
  );
}
