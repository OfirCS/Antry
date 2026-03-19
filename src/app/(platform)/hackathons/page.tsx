"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Trophy, Users, Layers, Filter, Calendar } from "lucide-react";
import Link from "next/link";
import { antathons, formatDate } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function AntathonsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const filteredEvents = antathons.filter(
    (e) => 
      (!q || e.title.toLowerCase().includes(q.toLowerCase()) || e.theme.toLowerCase().includes(q.toLowerCase())) &&
      (filter === "all" || e.status === filter)
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Sticky Header */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search 100+ Antathons..."
              className="w-full pl-11 pr-6 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                  filter === f ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto pt-52 pb-24 px-6">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event, index) => (
              <AntathonListCard key={event.id} event={event} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {filteredEvents.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-gray-400 font-medium">No Antathons found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AntathonListCard({ event, index }: { event: any; index: number }) {
  const prizePool = event.prizes.reduce((s: number, p: any) => s + (parseInt(p.reward.replace(/[^0-9]/g, "")) || 0), 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link 
        href={`/hackathons/${event.id}`}
        className="group flex flex-col lg:flex-row items-start lg:items-center gap-6 p-6 md:p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all"
      >
        {/* Visual & Identity */}
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div 
            className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-lg relative overflow-hidden"
            style={{ background: event.gradient }}
          >
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
            <span className="relative z-10">{event.title[0]}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {event.title}
              </h2>
              <span className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                event.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
              )}>
                {event.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-1 font-medium leading-relaxed">
              {event.theme}
            </p>
          </div>
        </div>

        {/* Simple Measurements */}
        <div className="flex items-center gap-10 px-4 py-4 lg:py-0 border-t lg:border-t-0 lg:border-l border-gray-100 w-full lg:w-auto">
          <div className="text-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 justify-center">
              <Trophy className="w-3.5 h-3.5 text-blue-600" /> Prizes
            </div>
            <div className="text-lg font-bold text-gray-900">${prizePool.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 justify-center">
              <Users className="w-3.5 h-3.5 text-blue-600" /> Ants
            </div>
            <div className="text-lg font-bold text-gray-900">{event.participantCount}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 justify-center">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> Demos
            </div>
            <div className="text-lg font-bold text-gray-900">{event.submissionCount}</div>
          </div>
        </div>

        <ArrowRight className="hidden lg:block w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all ml-2" />
      </Link>
    </motion.div>
  );
}
