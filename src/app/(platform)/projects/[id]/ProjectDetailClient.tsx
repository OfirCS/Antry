"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Heart,
  Github,
  Clock,
  Eye,
  Share2,
  Link2,
  Check,
  Calendar,
  Sparkles,
} from "lucide-react";
import { getInitials, formatDate } from "@/lib/mock-data";
import type { Project } from "@/lib/mock-data";
import { ProjectCard } from "@/components/ProjectCard";
import { toggleLike } from "../../actions";

/* ── Types ─────────────────────────────────────────── */

interface ProjectData {
  id: string;
  title: string;
  tagline: string;
  description: string;
  gradient: string;
  likes: number;
  demoUrl: string;
  sourceUrl?: string;
  techStack: string[];
  buildTime: string;
  category: string;
  createdAt: string;
  builder: {
    username: string;
    name: string;
    gradient: string;
  };
}

/* ── Helpers ───────────────────────────────────────── */

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const categoryLabels: Record<string, string> = {
  "ai-agents": "AI Agents",
  "web-apps": "Web Apps",
  tools: "Tools",
  design: "Design",
  "data-ml": "Data / ML",
  mobile: "Mobile",
};

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ── Like Button ───────────────────────────────────── */

function LikeButton({
  projectId,
  likes,
  hasLiked,
  isLoggedIn,
}: {
  projectId: string;
  likes: number;
  hasLiked: boolean;
  isLoggedIn: boolean;
}) {
  const [animating, setAnimating] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState(hasLiked);
  const [optimisticCount, setOptimisticCount] = useState(likes);

  const handleClick = useCallback(() => {
    if (!isLoggedIn) return;
    setAnimating(true);
    setOptimisticLiked((v) => !v);
    setOptimisticCount((c) => (optimisticLiked ? c - 1 : c + 1));
    setTimeout(() => setAnimating(false), 600);
  }, [isLoggedIn, optimisticLiked]);

  if (!isLoggedIn) {
    return (
      <Link
        href={`/login?redirect=/projects/${projectId}`}
        className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-[#EBEBEB] bg-white hover:border-[#D4D4D4] transition-all duration-300"
        title="Sign in to like"
      >
        <Heart className="w-[18px] h-[18px] text-[#A3A3A3] group-hover:text-red-400 transition-colors" />
        <span className="text-[14px] font-semibold text-[#525252]">{likes}</span>
      </Link>
    );
  }

  return (
    <form action={toggleLike}>
      <input type="hidden" name="project_id" value={projectId} />
      <button
        type="submit"
        onClick={handleClick}
        className="group relative flex items-center gap-2.5 px-5 py-2.5 rounded-full border transition-all duration-300 overflow-hidden"
        style={{
          borderColor: optimisticLiked ? "rgba(239,68,68,0.2)" : "#EBEBEB",
          background: optimisticLiked ? "rgba(239,68,68,0.04)" : "#ffffff",
        }}
        title={optimisticLiked ? "Unlike" : "Like"}
      >
        <motion.div
          animate={
            animating
              ? {
                  scale: [1, 1.4, 0.9, 1.15, 1],
                }
              : {}
          }
          transition={{ duration: 0.5, ease }}
        >
          <Heart
            className="w-[18px] h-[18px] transition-all duration-300"
            style={{
              fill: optimisticLiked ? "#ef4444" : "transparent",
              color: optimisticLiked ? "#ef4444" : "#A3A3A3",
            }}
          />
        </motion.div>

        {/* Burst particles on like */}
        <AnimatePresence>
          {animating && !hasLiked && (
            <>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 6) * 20,
                    y: Math.sin((i * Math.PI * 2) / 6) * 20,
                    opacity: [1, 1, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute left-[18px] top-[12px] w-1.5 h-1.5 rounded-full"
                  style={{
                    background: i % 2 === 0 ? "#ef4444" : "#C6F135",
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <span
          className="text-[14px] font-semibold transition-colors duration-300"
          style={{ color: optimisticLiked ? "#ef4444" : "#525252" }}
        >
          {optimisticCount}
        </span>
      </button>
    </form>
  );
}

/* ── Share Buttons ──────────────────────────────────── */

function ShareButtons({ projectTitle, projectId }: { projectTitle: string; projectId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/projects/${projectId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [projectId]);

  const handleShareTwitter = useCallback(() => {
    const url = `${window.location.origin}/projects/${projectId}`;
    const text = `Check out "${projectTitle}" on Antry`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  }, [projectId, projectTitle]);

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#EBEBEB] bg-white text-[13px] font-medium text-[#525252] hover:border-[#D4D4D4] hover:text-[#111111] transition-all duration-200"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="w-3.5 h-3.5 text-[#C6F135]" />
            </motion.span>
          ) : (
            <motion.span
              key="link"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Link2 className="w-3.5 h-3.5" />
            </motion.span>
          )}
        </AnimatePresence>
        {copied ? "Copied!" : "Copy link"}
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleShareTwitter}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#EBEBEB] bg-white text-[13px] font-medium text-[#525252] hover:border-[#D4D4D4] hover:text-[#111111] transition-all duration-200"
      >
        <XIcon className="w-3.5 h-3.5" />
        Share
      </motion.button>
    </div>
  );
}

/* ── Tech Stack Pill ───────────────────────────────── */

function TechPill({ tech, index }: { tech: string; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium cursor-default transition-all duration-300"
      style={{
        background: hovered ? "#111111" : "#F5F5F5",
        color: hovered ? "#C6F135" : "#525252",
        boxShadow: hovered
          ? "0 4px 16px rgba(17,17,17,0.15)"
          : "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <Sparkles
        className="w-3 h-3 transition-opacity duration-300"
        style={{ opacity: hovered ? 1 : 0.3 }}
      />
      {tech}
    </motion.span>
  );
}

/* ── Stat Pill ─────────────────────────────────────── */

function StatPill({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease }}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] bg-white border border-[#EBEBEB] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      <span className="text-[#A3A3A3]">{icon}</span>
      <div>
        <p className="text-[12px] text-[#A3A3A3] leading-none mb-0.5">{label}</p>
        <p className="text-[14px] font-semibold text-[#111111] leading-none">{value}</p>
      </div>
    </motion.div>
  );
}

/* ── Main Component ────────────────────────────────── */

export default function ProjectDetailClient({
  project,
  moreProjects,
  isLoggedIn,
  hasLiked,
}: {
  project: ProjectData | null;
  moreProjects: Project[];
  isLoggedIn: boolean;
  hasLiked: boolean;
}) {
  const [viewCount] = useState(() => Math.floor(Math.random() * 400) + 100);

  // Get similar projects (same category, different project)
  const similarProjects = moreProjects.slice(0, 4);

  if (!project) {
    return (
      <div className="max-w-[800px] mx-auto px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] bg-white border border-[#EBEBEB] p-12 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <p className="text-[#737373] text-[16px] mb-4">Project not found.</p>
          <Link
            href="/builders"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#111111] hover:text-[#C6F135] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to discover
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[860px] mx-auto px-6 sm:px-8 py-10 md:py-16">
      {/* Back nav */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/builders"
          className="inline-flex items-center gap-2 text-[13px] text-[#A3A3A3] hover:text-[#111111] transition-colors mb-8 font-medium group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />{" "}
          Builders
        </Link>
      </motion.div>

      {/* ── Premium Header ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="relative rounded-[20px] overflow-hidden mb-8"
      >
        {/* Gradient banner */}
        <div
          className="relative h-[200px] sm:h-[240px]"
          style={{ background: project.gradient }}
        >
          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-[0.12] mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
          {/* Lime accent gradient */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[60%]"
            style={{
              background:
                "linear-gradient(to top, rgba(198,241,53,0.08) 0%, transparent 100%)",
            }}
          />
          {/* Large initials watermark */}
          <span className="absolute bottom-6 right-8 text-white/[0.06] text-[120px] sm:text-[160px] font-display font-bold select-none leading-none tracking-tighter">
            {project.title.slice(0, 2)}
          </span>
        </div>

        {/* Content overlay below banner */}
        <div className="bg-white border border-[#EBEBEB] border-t-0 rounded-b-[20px] px-6 sm:px-8 pb-6 pt-6">
          {/* Category badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-4"
          >
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#111111] text-[#C6F135] text-[11px] font-bold uppercase tracking-[0.08em]">
              {categoryLabels[project.category] || project.category}
            </span>
          </motion.div>

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease }}
              className="font-display text-[clamp(1.75rem,5vw,2.5rem)] text-[#111111] tracking-[-0.03em] leading-[1.05]"
            >
              {project.title}
            </motion.h1>

            <div className="flex items-center gap-3 shrink-0">
              <LikeButton
                projectId={project.id}
                likes={project.likes}
                hasLiked={hasLiked}
                isLoggedIn={isLoggedIn}
              />
            </div>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-[17px] text-[#525252] leading-relaxed mb-6 max-w-[600px]"
          >
            {project.tagline}
          </motion.p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3">
            <StatPill
              icon={<Eye className="w-4 h-4" />}
              label="Views"
              value={viewCount.toLocaleString()}
              delay={0.3}
            />
            <StatPill
              icon={<Heart className="w-4 h-4" />}
              label="Likes"
              value={project.likes.toLocaleString()}
              delay={0.35}
            />
            <StatPill
              icon={<Calendar className="w-4 h-4" />}
              label="Posted"
              value={timeAgo(project.createdAt)}
              delay={0.4}
            />
            <StatPill
              icon={<Clock className="w-4 h-4" />}
              label="Build time"
              value={project.buildTime}
              delay={0.45}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Action Buttons ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4, ease }}
        className="flex flex-wrap items-center gap-3 mb-8"
      >
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold transition-all duration-300 hover:shadow-[0_4px_16px_rgba(198,241,53,0.3)] hover:-translate-y-[1px]"
            style={{ background: "#C6F135", color: "#111111" }}
          >
            Live demo <ArrowUpRight className="w-4 h-4" />
          </a>
        )}
        {project.sourceUrl && (
          <a
            href={project.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#EBEBEB] bg-white text-[14px] font-semibold text-[#111111] hover:border-[#D4D4D4] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-[1px]"
          >
            <Github className="w-4 h-4" /> Source code
          </a>
        )}
        <div className="ml-auto">
          <ShareButtons projectTitle={project.title} projectId={project.id} />
        </div>
      </motion.div>

      {/* ── Description ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease }}
        className="rounded-[20px] bg-white border border-[#EBEBEB] p-6 sm:p-8 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      >
        <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#A3A3A3] mb-4">
          About this project
        </h2>
        <p className="text-[15px] text-[#525252] leading-[1.85] whitespace-pre-line">
          {project.description}
        </p>
      </motion.div>

      {/* ── Tech Stack ────────────────────────────────── */}
      {project.techStack.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease }}
          className="rounded-[20px] bg-white border border-[#EBEBEB] p-6 sm:p-8 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#A3A3A3] mb-5">
            Tech stack
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {project.techStack.map((tech, i) => (
              <TechPill key={tech} tech={tech} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Built by section ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease }}
        className="rounded-[20px] bg-white border border-[#EBEBEB] p-6 sm:p-8 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      >
        <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#A3A3A3] mb-5">
          Built by
        </h2>
        <Link
          href={`/builders/${project.builder.username}`}
          className="group flex items-center gap-4 p-4 -m-4 rounded-[16px] hover:bg-[#FAFAFA] transition-colors duration-200"
        >
          <div
            className="w-14 h-14 rounded-[16px] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            style={{ background: project.builder.gradient }}
          >
            <span className="text-[16px] font-bold text-white font-display">
              {getInitials(project.builder.name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-semibold text-[#111111] group-hover:text-[#111111] transition-colors truncate">
                {project.builder.name}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-[#A3A3A3] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
            </div>
            <p className="text-[13px] text-[#737373]">
              @{project.builder.username}
            </p>
          </div>
          <div className="shrink-0 px-3.5 py-1.5 rounded-full bg-[#F5F5F5] text-[12px] font-medium text-[#525252] group-hover:bg-[#111111] group-hover:text-[#C6F135] transition-all duration-300">
            View profile
          </div>
        </Link>
      </motion.div>

      {/* ── Metadata ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="flex flex-wrap items-center gap-3 mb-10 text-[12px] text-[#A3A3A3] font-medium"
      >
        <span className="px-3 py-1.5 rounded-full bg-[#F5F5F5]">
          {categoryLabels[project.category] || project.category}
        </span>
        <span className="px-3 py-1.5 rounded-full bg-[#F5F5F5]">
          {formatDate(project.createdAt)}
        </span>
        <span className="px-3 py-1.5 rounded-full bg-[#F5F5F5]">
          {project.buildTime}
        </span>
      </motion.div>

      {/* ── Similar Projects / More from builder ─────── */}
      {similarProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease }}
          className="pt-10 border-t border-[#EBEBEB]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[18px] font-semibold text-[#111111] tracking-tight">
              More from {project.builder.name}
            </h3>
            <Link
              href={`/builders/${project.builder.username}`}
              className="text-[13px] font-medium text-[#A3A3A3] hover:text-[#111111] transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {similarProjects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
