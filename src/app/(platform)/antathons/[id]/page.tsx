"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Users,
  Trophy,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAntathon,
  getAntathonProjects,
  getInitials,
  formatDate,
  type Project,
} from "@/lib/mock-data";

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Apple-style Demo Card ── */
function DemoCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.07, ease }}
      className="group"
    >
      <Link href={`/projects/${project.id}`} className="block">
        {/* Demo preview */}
        <div className="aspect-[4/3] rounded-xl relative overflow-hidden mb-4" style={{ background: project.gradient }}>
          <div
            className="absolute inset-0 opacity-[0.12] mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
          {/* Live demo badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white/90 text-[10px] font-mono px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            demo
          </div>
          {/* Project initial watermark */}
          <span className="absolute bottom-3 left-4 text-white/15 text-[36px] font-mono font-bold select-none">
            {project.title.slice(0, 2).toLowerCase()}
          </span>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.06] transition-colors duration-300" />
        </div>

        {/* Info */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-[15px] font-medium text-text-primary group-hover:text-accent transition-colors leading-snug">
            {project.title}
          </h3>
          <span className="flex items-center gap-1 text-text-tertiary text-[12px] shrink-0 mt-0.5">
            <Heart className="w-3 h-3" />
            {project.likes}
          </span>
        </div>
        <p className="text-[12px] text-text-tertiary line-clamp-2 mb-2.5">{project.tagline}</p>

        {/* Builder */}
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ background: project.builder.gradient }}
          >
            <span className="text-[8px] font-bold text-white leading-none">
              {getInitials(project.builder.name)}
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary">{project.builder.name}</span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function AntathonDetailPage() {
  const { id } = useParams() as { id: string };
  const h = getAntathon(id);
  const antathonProjects = h ? getAntathonProjects(h.id) : [];

  if (!h) {
    return (
      <div className="max-w-[740px] mx-auto px-6 py-20 text-center">
        <p className="text-text-tertiary text-[14px]">Antathon not found.</p>
        <Link href="/antathons" className="text-[13px] text-accent mt-3 inline-block">
          Back
        </Link>
      </div>
    );
  }

  const dotColor =
    h.status === "active" ? "bg-green-500" : h.status === "upcoming" ? "bg-accent" : "bg-text-tertiary";
  const label = h.status === "active" ? "Live now" : h.status === "upcoming" ? "Upcoming" : "Ended";
  const total = h.prizes.map((p) => parseInt(p.reward.replace(/\D/g, "")) || 0).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-[960px] mx-auto px-6 py-10 md:py-16">
      <Link
        href="/antathons"
        className="inline-flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors mb-6"
      >
        <ArrowLeft className="w-3 h-3" /> Antathons
      </Link>

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl overflow-hidden border border-border-tertiary mb-10"
      >
        {/* Gradient banner */}
        <div className="h-40 sm:h-52 relative overflow-hidden" style={{ background: h.gradient }}>
          <div
            className="absolute inset-0 opacity-[0.15] mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
          <Trophy className="absolute bottom-4 right-6 w-20 h-20 text-white/10" />

          <div className="absolute top-5 left-6 flex items-center gap-2">
            <span
              className={cn("w-2 h-2 rounded-full", dotColor, h.status === "active" && "animate-pulse")}
            />
            <span
              className={cn(
                "text-[11px] font-mono",
                h.status === "active"
                  ? "text-white/90"
                  : "text-white/70"
              )}
            >
              {label}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="px-6 sm:px-8 py-8 bg-background-primary">
          <h1 className="font-display text-[28px] md:text-[36px] text-text-primary leading-snug mb-2">
            {h.title}
          </h1>
          <p className="text-[16px] text-text-secondary mb-6">{h.theme}</p>

          <div className="flex flex-wrap gap-5 text-[13px] text-text-tertiary">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(h.startDate)} — {formatDate(h.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-accent" />${total.toLocaleString()}
            </span>
            {h.participantCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {h.participantCount} ants
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── About ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-10 max-w-[700px]"
      >
        <span className="text-[11px] font-mono text-text-tertiary block mb-3">about</span>
        <p className="text-[14px] text-text-secondary leading-[1.8]">{h.description}</p>
      </motion.div>

      {/* ── Sponsors ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-10"
      >
        <span className="text-[11px] font-mono text-text-tertiary block mb-4">sponsors</span>
        <div className="flex flex-wrap gap-3">
          {h.sponsors.map((s) => (
            <div
              key={s.name}
              className={cn(
                "rounded-xl border px-6 py-4 text-center min-w-[120px]",
                s.tier === "title"
                  ? "border-accent/30 bg-accent-muted"
                  : s.tier === "gold"
                    ? "border-border-secondary bg-background-secondary/50"
                    : "border-border-tertiary"
              )}
            >
              <div className="text-[15px] font-medium text-text-primary">{s.name}</div>
              <div className="text-[10px] font-mono text-text-tertiary mt-0.5 uppercase tracking-wider">
                {s.tier} sponsor
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Prizes ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-10"
      >
        <span className="text-[11px] font-mono text-text-tertiary block mb-4">prizes</span>
        <div className="flex flex-wrap gap-3">
          {h.prizes.map((p, i) => (
            <div
              key={p.place}
              className={cn(
                "border rounded-xl px-6 py-4 text-center min-w-[110px]",
                i === 0
                  ? "border-accent/40 bg-accent-muted"
                  : "border-border-tertiary"
              )}
            >
              <div className="text-[20px] font-mono text-text-primary">{p.reward}</div>
              <div className="text-[11px] text-text-tertiary mt-0.5">{p.place}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Schedule ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mb-10 max-w-[700px]"
      >
        <span className="text-[11px] font-mono text-text-tertiary block mb-3">schedule</span>
        {[
          { time: "Day 1 AM", event: "Kickoff & teams form" },
          { time: "Day 1 PM", event: "Building starts" },
          { time: "Day 2", event: "Build day — mentors available" },
          { time: "Day 3 AM", event: "Submissions due" },
          { time: "Day 3 PM", event: "Demos & judging" },
        ].map((item, i) => (
          <div key={i} className="flex gap-4 py-2.5 border-b border-border-tertiary last:border-0">
            <span className="text-[12px] font-mono text-text-tertiary w-[100px] shrink-0 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.time}
            </span>
            <span className="text-[13px] text-text-secondary">{item.event}</span>
          </div>
        ))}
      </motion.div>

      {/* ── Demo Grid (Apple-style) ── */}
      {antathonProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-10"
        >
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-mono text-text-tertiary block mb-1">submissions</span>
              <h2 className="font-display text-[18px] text-text-primary">
                {antathonProjects.length} projects built
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {antathonProjects.map((p, i) => (
              <DemoCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── CTA ── */}
      {h.status !== "completed" ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="pt-8 border-t border-border-tertiary"
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-text-primary text-background-primary rounded-xl text-[14px] font-medium hover:opacity-85 transition-opacity"
          >
            {h.status === "active" ? "Submit project" : "Register"}{" "}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-[12px] text-text-tertiary mt-3">
            {h.status === "active"
              ? `${h.submissionCount} submitted so far`
              : "Free entry. Solo or team of ants."}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="pt-8 border-t border-border-tertiary text-center"
        >
          <p className="text-[13px] text-text-tertiary">
            {h.submissionCount} projects by {h.participantCount} ants.
          </p>
          <Link
            href="/discover"
            className="text-[13px] text-accent mt-2 inline-flex items-center gap-1"
          >
            Browse all projects <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
