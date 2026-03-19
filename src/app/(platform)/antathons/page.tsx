"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { antathons, formatDate, type Antathon } from "@/lib/mock-data";

const ease = [0.16, 1, 0.3, 1] as const;

function AntathonCard({ antathon, index }: { antathon: Antathon; index: number }) {
  const dotColor =
    antathon.status === "active" ? "bg-green-500" : antathon.status === "upcoming" ? "bg-accent" : "bg-text-tertiary";
  const label = antathon.status === "active" ? "Live" : antathon.status === "upcoming" ? "Soon" : "Ended";
  const total = antathon.prizes.map((p) => parseInt(p.reward.replace(/\D/g, "")) || 0).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease }}
    >
      <Link
        href={`/antathons/${antathon.id}`}
        className={cn(
          "group block rounded-2xl overflow-hidden border transition-all duration-300",
          antathon.status === "completed"
            ? "border-border-tertiary opacity-60 hover:opacity-80"
            : "border-border-tertiary hover:border-accent/30"
        )}
      >
        {/* Gradient header */}
        <div className="h-28 sm:h-32 relative overflow-hidden" style={{ background: antathon.gradient }}>
          <div
            className="absolute inset-0 opacity-[0.15] mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute top-4 left-5 flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", dotColor, antathon.status === "active" && "animate-pulse")} />
            <span className="text-[11px] font-mono text-white/80">{label}</span>
          </div>
          <Trophy className="absolute bottom-3 right-5 w-12 h-12 text-white/10" />
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 bg-background-primary group-hover:bg-background-secondary/30 transition-colors">
          <div className="flex items-center gap-2 text-[11px] text-text-tertiary mb-3">
            <Calendar className="w-3 h-3" />
            {formatDate(antathon.startDate)} — {formatDate(antathon.endDate)}
          </div>

          <h2 className="font-display text-[20px] md:text-[24px] text-text-primary leading-snug mb-1.5 group-hover:text-accent transition-colors">
            {antathon.title}
          </h2>
          <p className="text-[13px] text-text-secondary mb-5">{antathon.theme}</p>

          {/* Prizes + participants */}
          <div className="flex flex-wrap items-center gap-5 text-[12px] text-text-tertiary mb-4">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-accent" />${total.toLocaleString()}
            </span>
            {antathon.participantCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {antathon.participantCount} ants
              </span>
            )}
          </div>

          {/* Sponsors */}
          <div className="flex flex-wrap gap-2 mb-5">
            {antathon.sponsors.map((s) => (
              <span
                key={s.name}
                className={cn(
                  "text-[11px] font-mono px-2.5 py-1 rounded-md border",
                  s.tier === "title"
                    ? "text-accent border-accent/30 bg-accent-muted"
                    : "text-text-tertiary border-border-tertiary"
                )}
              >
                {s.name}
              </span>
            ))}
          </div>

          {antathon.status !== "completed" && (
            <div className="text-[13px] font-medium text-text-primary flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
              {antathon.status === "active" ? "View antathon" : "Learn more"}{" "}
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function AntathonsPage() {
  const active = antathons.filter((h) => h.status === "active");
  const upcoming = antathons.filter((h) => h.status === "upcoming");
  const completed = antathons.filter((h) => h.status === "completed");
  let idx = 0;

  return (
    <div className="max-w-[800px] mx-auto px-6 py-10 md:py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-[28px] md:text-[36px] text-text-primary leading-snug mb-2">Antathons</h1>
        <p className="text-[14px] text-text-secondary mb-10">
          Build challenges where ants compete, create, and win real prizes.
        </p>
      </motion.div>

      {active.length > 0 && (
        <div className="mb-10">
          <span className="text-[11px] font-mono text-green-500 block mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            live now
          </span>
          <div className="space-y-5">
            {active.map((h) => (
              <AntathonCard key={h.id} antathon={h} index={idx++} />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mb-10">
          <span className="text-[11px] font-mono text-accent block mb-4">upcoming</span>
          <div className="space-y-5">
            {upcoming.map((h) => (
              <AntathonCard key={h.id} antathon={h} index={idx++} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <span className="text-[11px] font-mono text-text-tertiary block mb-4">past</span>
          <div className="space-y-5">
            {completed.map((h) => (
              <AntathonCard key={h.id} antathon={h} index={idx++} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
