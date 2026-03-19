"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { hackathons, formatDate, type Hackathon } from "@/lib/mock-data";

function HackathonCard({ hackathon, index }: { hackathon: Hackathon; index: number }) {
  const dotColor = hackathon.status === "active" ? "bg-green-500" : hackathon.status === "upcoming" ? "bg-accent" : "bg-text-tertiary";
  const label = hackathon.status === "active" ? "Live" : hackathon.status === "upcoming" ? "Soon" : "Ended";
  const total = hackathon.prizes.map((p) => parseInt(p.reward.replace(/\D/g, "")) || 0).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <Link
        href={`/hackathons/${hackathon.id}`}
        className={cn(
          "block rounded-2xl bg-white border-2 border-gray-50 p-6 md:p-10 transition-all duration-300",
          hackathon.status === "completed"
            ? "opacity-60 hover:opacity-100"
            : "hover:border-blue-100 hover:shadow-xl hover:shadow-gray-100"
        )}
      >
        <div className="flex items-center gap-2 mb-6">
          <span className={cn("w-2 h-2 rounded-full", dotColor)} />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
          <span className="text-sm font-medium text-gray-500 ml-auto flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDate(hackathon.startDate)} — {formatDate(hackathon.endDate)}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">{hackathon.title}</h2>
        <p className="text-lg text-gray-500 mb-8 leading-relaxed">{hackathon.theme}</p>
        <div className="flex flex-wrap items-center gap-8 text-sm font-medium text-gray-400">
          <span className="flex items-center gap-2 text-blue-600">
            <Trophy className="w-4 h-4" />
            ${total.toLocaleString()} in prizes
          </span>
          {hackathon.participantCount > 0 && (
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {hackathon.participantCount} builders
            </span>
          )}
          <span className="bg-gray-50 px-3 py-1 rounded-full text-xs font-bold text-gray-400">
            {hackathon.sponsors.join(" / ")}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function HackathonsPage() {
  const active = hackathons.filter((h) => h.status === "active");
  const upcoming = hackathons.filter((h) => h.status === "upcoming");
  const completed = hackathons.filter((h) => h.status === "completed");
  let idx = 0;

  return (
    <div className="max-w-[740px] mx-auto px-6 py-10 md:py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-[28px] md:text-[36px] text-text-primary leading-snug mb-2">Hackathons</h1>
        <p className="text-[14px] text-text-secondary mb-10">Build challenges with real prizes and sponsor visibility.</p>
      </motion.div>

      {active.length > 0 && (
        <div className="mb-8">
          <span className="text-[11px] font-mono text-accent block mb-3">live</span>
          <div className="space-y-3">{active.map((h) => <HackathonCard key={h.id} hackathon={h} index={idx++} />)}</div>
        </div>
      )}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <span className="text-[11px] font-mono text-text-tertiary block mb-3">upcoming</span>
          <div className="space-y-3">{upcoming.map((h) => <HackathonCard key={h.id} hackathon={h} index={idx++} />)}</div>
        </div>
      )}
      {completed.length > 0 && (
        <div>
          <span className="text-[11px] font-mono text-text-tertiary block mb-3">past</span>
          <div className="space-y-3">{completed.map((h) => <HackathonCard key={h.id} hackathon={h} index={idx++} />)}</div>
        </div>
      )}
    </div>
  );
}
