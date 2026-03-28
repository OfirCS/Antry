"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, ArrowRight, Trophy, Flame } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const filters = ["all", "active", "upcoming", "completed"] as const;
type Filter = (typeof filters)[number];

interface HackathonItem {
  id: string;
  title: string;
  theme: string;
  status: "active" | "upcoming" | "completed";
  gradient: string;
  prizes: { place: string; reward: string }[];
  participantCount: number;
  startDate: string;
  endDate: string;
}

/* -- Countdown hook ---------------------------------------- */

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function formatCountdown(t: { days: number; hours: number; minutes: number }) {
  if (t.days > 0) return `${t.days}d ${t.hours}h left`;
  if (t.hours > 0) return `${t.hours}h ${t.minutes}m left`;
  return `${t.minutes}m left`;
}

/* -- Main component ---------------------------------------- */

export default function HackathonsClient({
  hackathons,
}: {
  hackathons: HackathonItem[];
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const featuredHackathon =
    hackathons.find((h) => h.status === "active") ||
    hackathons.find((h) => h.status === "upcoming");

  const filtered = hackathons.filter(
    (e) =>
      (!q ||
        e.title.toLowerCase().includes(q.toLowerCase()) ||
        e.theme.toLowerCase().includes(q.toLowerCase())) &&
      (filter === "all" || e.status === filter)
  );

  // Animate tab indicator
  useEffect(() => {
    const activeTab = tabRefs.current.get(filter);
    const indicator = indicatorRef.current;
    if (activeTab && indicator) {
      const { offsetLeft, offsetWidth } = activeTab;
      indicator.style.transform = `translateX(${offsetLeft}px)`;
      indicator.style.width = `${offsetWidth}px`;
    }
  }, [filter]);

  const featuredTarget = featuredHackathon
    ? featuredHackathon.status === "active"
      ? featuredHackathon.endDate
      : featuredHackathon.startDate
    : null;

  const featuredCountdown = useCountdown(
    featuredTarget || new Date().toISOString()
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* -- Header + Featured banner ------------------------------ */}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6">
        <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#111]">
          Hackathons
        </h1>
        <p className="mt-1 text-[14px] sm:text-[15px] text-[#111]/50">
          Weekend sprints. Ship a demo. Win prizes.
        </p>

        {/* Featured hackathon banner */}
        {featuredHackathon && (
          <Link href={`/hackathons/${featuredHackathon.id}`} className="group block mt-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-2xl bg-[#111] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
            >
              {/* Subtle gradient accent */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#C6F135]/[0.06] blur-[80px] pointer-events-none" />

              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-white/10 text-white/80 border border-white/10">
                    {featuredHackathon.status === "active" ? (
                      <>
                        <Flame className="w-3 h-3 text-[#C6F135]" />
                        Live now
                      </>
                    ) : (
                      "Up next"
                    )}
                  </span>
                  {featuredHackathon.prizes[0] && (
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-white/50">
                      <Trophy className="w-3 h-3" />
                      {featuredHackathon.prizes[0].reward}
                    </span>
                  )}
                </div>
                <h2 className="text-[22px] sm:text-[26px] font-bold text-white tracking-tight leading-tight">
                  {featuredHackathon.title}
                </h2>
                <p className="mt-1.5 text-[14px] text-white/50 truncate max-w-[500px]">
                  {featuredHackathon.theme}
                </p>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 shrink-0 relative z-10 flex-wrap">
                <div className="flex items-center gap-2 text-white/60">
                  <Users className="w-4 h-4" />
                  <span className="text-[14px] font-semibold tabular-nums">
                    {featuredHackathon.participantCount}
                  </span>
                </div>

                {featuredTarget && (
                  <span className="text-[12px] sm:text-[13px] font-bold tabular-nums text-[#C6F135] bg-[#C6F135]/10 px-3 py-1.5 rounded-lg">
                    {formatCountdown(featuredCountdown)}
                  </span>
                )}

                <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-white text-[#111] text-[13px] font-bold transition-transform duration-200 group-hover:scale-105 min-h-[44px]">
                  Join
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </motion.div>
          </Link>
        )}
      </div>

      {/* -- Sticky search + filter bar -------------------------- */}
      <div className="sticky top-[56px] z-40 backdrop-blur-xl border-b border-[#111]/[0.06] bg-[#FAFAF7]/90">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-[320px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111]/25 pointer-events-none" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search hackathons..."
              className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-white border border-[#111]/[0.08] rounded-xl text-[14px] text-[#111] placeholder:text-[#111]/30 outline-none focus:border-[#111]/20 focus:shadow-[0_0_0_3px_rgba(17,17,17,0.04)] transition-all"
            />
          </div>

          {/* Filter tabs */}
          <div className="relative flex items-center gap-0.5 p-1 rounded-xl bg-[#111]/[0.04] overflow-x-auto scrollbar-none">
            <div
              ref={indicatorRef}
              className="absolute top-1 h-[calc(100%-8px)] rounded-lg bg-[#111] shadow-sm transition-all duration-300 ease-out"
            />
            {filters.map((f) => (
              <button
                key={f}
                ref={(el) => {
                  if (el) tabRefs.current.set(f, el);
                }}
                onClick={() => setFilter(f)}
                className={cn(
                  "relative z-10 px-3.5 py-2.5 sm:py-1.5 text-[12px] font-semibold capitalize rounded-lg transition-colors duration-200 whitespace-nowrap min-h-[44px] sm:min-h-0",
                  filter === f ? "text-white" : "text-[#111]/40 hover:text-[#111]/60"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* -- Hackathon list --------------------------------------- */}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-8">
        <p className="text-[13px] font-medium text-[#111]/40 mb-5">
          {filtered.length} hackathon{filtered.length !== 1 ? "s" : ""}
          {filter !== "all" ? ` \u00b7 ${filter}` : ""}
        </p>

        <div className="space-y-3">
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
            className="text-center py-20"
          >
            <div className="w-12 h-12 rounded-xl bg-[#111]/[0.04] flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5 text-[#111]/20" />
            </div>
            <p className="text-[15px] font-medium text-[#111]/40">
              No hackathons match your search.
            </p>
            <button
              onClick={() => {
                setQ("");
                setFilter("all");
              }}
              className="mt-3 text-[13px] font-semibold text-[#C6F135] hover:underline"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>

      {/* -- Bottom CTA ------------------------------------------ */}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl bg-[#111] p-6 sm:p-10 text-center">
          <h2 className="text-[20px] sm:text-[26px] font-bold text-white tracking-tight">
            Want to host a hackathon?
          </h2>
          <p className="mt-2 text-[13px] sm:text-[14px] text-white/50 max-w-[380px] mx-auto">
            Bring your community together. We handle the infra.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 mt-5 px-6 py-3.5 sm:py-3 rounded-xl bg-[#C6F135] text-[#111] text-[14px] font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* -- Hackathon Card ----------------------------------------- */

function HackathonCard({
  event,
  index,
}: {
  event: HackathonItem;
  index: number;
}) {
  const targetDate =
    event.status === "active"
      ? event.endDate
      : event.status === "upcoming"
        ? event.startDate
        : null;

  const countdown = useCountdown(targetDate || new Date().toISOString());

  const statusColor: Record<string, string> = {
    active: "bg-[#C6F135] shadow-[0_0_6px_rgba(198,241,53,0.6)]",
    upcoming: "bg-[#111]/30",
    completed: "bg-[#111]/15",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <Link
        href={`/hackathons/${event.id}`}
        className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 px-4 sm:px-5 py-4 rounded-xl bg-white border border-[#111]/[0.06] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] min-h-[64px]"
      >
        {/* Top/Left: status dot + title + theme */}
        <div className="flex items-center gap-3 sm:gap-3.5 flex-1 min-w-0">
          <span
            className={cn(
              "w-2.5 h-2.5 rounded-full shrink-0",
              statusColor[event.status]
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-[#111] truncate">
                {event.title}
              </h3>
              <span className="hidden sm:inline text-[13px] text-[#111]/35 truncate max-w-[200px]">
                {event.theme}
              </span>
            </div>
            <span className="sm:hidden text-[12px] text-[#111]/40 truncate block mt-0.5">
              {event.theme}
            </span>
            {/* Mobile-only: show participants + prize inline */}
            <div className="flex items-center gap-3 mt-1.5 md:hidden text-[12px] text-[#111]/40">
              <span className="flex items-center gap-1 font-medium tabular-nums">
                <Users className="w-3 h-3" />
                {event.participantCount}
              </span>
              {event.prizes[0] && (
                <span className="flex items-center gap-1 font-medium">
                  <Trophy className="w-3 h-3" />
                  {event.prizes[0].reward}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: participants + prize (desktop) */}
        <div className="hidden md:flex items-center gap-5 shrink-0 text-[13px] text-[#111]/50">
          <span className="flex items-center gap-1.5 font-medium tabular-nums">
            <Users className="w-3.5 h-3.5" />
            {event.participantCount}
          </span>
          {event.prizes[0] && (
            <span className="flex items-center gap-1.5 font-medium">
              <Trophy className="w-3.5 h-3.5" />
              {event.prizes[0].reward}
            </span>
          )}
        </div>

        {/* Bottom/Right: countdown + button */}
        <div className="flex items-center gap-3 shrink-0 pl-5 sm:pl-0">
          {targetDate && (
            <span className="text-[12px] font-semibold tabular-nums text-[#111]/40">
              {formatCountdown(countdown)}
            </span>
          )}
          {event.status === "completed" ? (
            <span className="px-3.5 py-2 sm:py-1.5 rounded-lg bg-[#111]/[0.04] text-[12px] font-semibold text-[#111]/40 min-h-[36px] sm:min-h-0 inline-flex items-center">
              View
            </span>
          ) : (
            <span className="px-3.5 py-2 sm:py-1.5 rounded-lg bg-[#111] text-white text-[12px] font-semibold transition-transform duration-200 group-hover:scale-105 min-h-[36px] sm:min-h-0 inline-flex items-center">
              Join
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
