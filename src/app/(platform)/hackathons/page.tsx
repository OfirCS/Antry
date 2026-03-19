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
          "block rounded-xl border p-6 md:p-8 transition-all duration-200",
          hackathon.status === "completed"
            ? "border-border-tertiary opacity-55 hover:opacity-75"
            : "border-border-tertiary hover:border-accent/30 hover:bg-accent-muted"
        )}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
          <span className="text-[11px] font-mono text-text-tertiary">{label}</span>
          <span className="text-[11px] text-text-tertiary ml-auto flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(hackathon.startDate)} — {formatDate(hackathon.endDate)}
          </span>
        </div>
        <h2 className="font-display text-[20px] md:text-[24px] text-text-primary leading-snug mb-1.5">{hackathon.title}</h2>
        <p className="text-[13px] text-text-secondary mb-5">{hackathon.theme}</p>
        <div className="flex flex-wrap items-center gap-5 text-[12px] text-text-tertiary">
          <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-accent" />${total.toLocaleString()}</span>
          {hackathon.participantCount > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{hackathon.participantCount}</span>}
          <span className="font-mono">{hackathon.sponsors.join(" / ")}</span>
        </div>
        {hackathon.status !== "completed" && (
          <div className="mt-5 text-[13px] font-medium text-text-primary flex items-center gap-1.5">
            {hackathon.status === "active" ? "View" : "Details"} <ArrowRight className="w-3.5 h-3.5" />
          </div>
        )}
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
