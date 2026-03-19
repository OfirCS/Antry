"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Users, Trophy, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHackathon, formatDate } from "@/lib/mock-data";

export default function HackathonDetailPage() {
  const { id } = useParams() as { id: string };
  const h = getHackathon(id);

  if (!h) {
    return (
      <div className="max-w-[740px] mx-auto px-6 py-20 text-center">
        <p className="text-text-tertiary text-[14px]">Hackathon not found.</p>
        <Link href="/hackathons" className="text-[13px] text-accent mt-3 inline-block">Back</Link>
      </div>
    );
  }

  const dotColor = h.status === "active" ? "bg-green-500" : h.status === "upcoming" ? "bg-accent" : "bg-text-tertiary";
  const label = h.status === "active" ? "Live now" : h.status === "upcoming" ? "Upcoming" : "Ended";
  const total = h.prizes.map((p) => parseInt(p.reward.replace(/\D/g, "")) || 0).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-[740px] mx-auto px-6 py-10 md:py-16">
      <Link href="/hackathons" className="inline-flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors mb-8">
        <ArrowLeft className="w-3 h-3" /> Hackathons
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-5">
          <span className={cn("w-2 h-2 rounded-full", dotColor)} />
          <span className={cn("text-[11px] font-mono", h.status === "active" ? "text-green-600 dark:text-green-400" : h.status === "upcoming" ? "text-accent" : "text-text-tertiary")}>{label}</span>
        </div>

        <h1 className="font-display text-[28px] md:text-[36px] text-text-primary leading-snug mb-2">{h.title}</h1>
        <p className="text-[16px] text-text-secondary mb-6">{h.theme}</p>

        <div className="flex flex-wrap gap-5 text-[13px] text-text-tertiary mb-10">
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(h.startDate)} — {formatDate(h.endDate)}</span>
          <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-accent" />${total.toLocaleString()}</span>
          {h.participantCount > 0 && <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{h.participantCount} builders</span>}
        </div>
      </motion.div>

      <div className="mb-10">
        <span className="text-[11px] font-mono text-text-tertiary block mb-3">about</span>
        <p className="text-[14px] text-text-secondary leading-[1.8]">{h.description}</p>
      </div>

      <div className="mb-10">
        <span className="text-[11px] font-mono text-text-tertiary block mb-3">prizes</span>
        <div className="flex flex-wrap gap-3">
          {h.prizes.map((p) => (
            <div key={p.place} className="border border-border-tertiary rounded-lg px-5 py-3 text-center">
              <div className="text-[16px] font-mono text-text-primary">{p.reward}</div>
              <div className="text-[11px] text-text-tertiary mt-0.5">{p.place}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <span className="text-[11px] font-mono text-text-tertiary block mb-3">sponsors</span>
        <div className="flex flex-wrap gap-2">
          {h.sponsors.map((s) => (
            <span key={s} className="text-[13px] text-text-secondary border border-border-secondary rounded-md px-3 py-1.5">{s}</span>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <span className="text-[11px] font-mono text-text-tertiary block mb-3">schedule</span>
        {[
          { time: "Day 1 AM", event: "Kickoff & teams" },
          { time: "Day 1 PM", event: "Building starts" },
          { time: "Day 2", event: "Build day — mentors available" },
          { time: "Day 3 AM", event: "Submissions due" },
          { time: "Day 3 PM", event: "Demos & judging" },
        ].map((item, i) => (
          <div key={i} className="flex gap-4 py-2.5 border-b border-border-tertiary last:border-0">
            <span className="text-[12px] font-mono text-text-tertiary w-[100px] shrink-0 flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>
            <span className="text-[13px] text-text-secondary">{item.event}</span>
          </div>
        ))}
      </div>

      {h.status !== "completed" ? (
        <div className="pt-8 border-t border-border-tertiary">
          <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2.5 bg-text-primary text-background-primary rounded-lg text-[13px] font-medium hover:opacity-85 transition-opacity">
            {h.status === "active" ? "Submit project" : "Register"} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <p className="text-[12px] text-text-tertiary mt-3">
            {h.status === "active" ? `${h.submissionCount} submitted` : "Free entry. Solo or team."}
          </p>
        </div>
      ) : (
        <div className="pt-8 border-t border-border-tertiary text-center">
          <p className="text-[13px] text-text-tertiary">{h.submissionCount} projects by {h.participantCount} builders.</p>
          <Link href="/discover" className="text-[13px] text-accent mt-2 inline-flex items-center gap-1">Browse projects <ArrowRight className="w-3 h-3" /></Link>
        </div>
      )}
    </div>
  );
}
