"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Github,
  Twitter,
  Globe,
  ArrowUpRight,
  Pencil,
  Trophy,
  Users,
  Code2,
  Play,
  Zap,
} from "lucide-react";
import { getInitials } from "@/lib/mock-data";
import { useAuth } from "@/lib/supabase/auth-context";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const tileBase =
  "card-premium p-8 transition-all duration-300 ease-out hover:-translate-y-1";

interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  gradient: string;
  likes: number;
  demoUrl: string;
  sourceUrl?: string;
  techStack: string[];
}

interface HackathonItem {
  id: string;
  title: string;
  theme: string;
  status: "active" | "upcoming" | "completed";
  gradient?: string;
  prizes: { place: string; reward: string }[];
  participantCount: number;
}

interface BuilderData {
  username: string;
  name: string;
  tagline: string;
  bio: string;
  skills: string[];
  gradient: string;
  social: { github?: string; twitter?: string; website?: string };
  projects: ProjectItem[];
  hackathons: HackathonItem[];
}

export default function BuilderProfileClient({ builder }: { builder: BuilderData | null }) {
  const { user } = useAuth();

  const isOwner = builder
    ? user?.user_metadata?.username === builder.username ||
      user?.email?.split("@")[0] === builder.username
    : false;

  if (!builder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary px-8">
        <div className="text-center">
          <p className="text-text-tertiary text-[15px] mb-4">
            This builder hasn&apos;t joined yet.
          </p>
          <Link
            href="/builders"
            className="text-accent text-[14px] font-bold hover:underline"
          >
            Back to the directory
          </Link>
        </div>
      </div>
    );
  }

  const totalLikes = builder.projects.reduce((s, p) => s + p.likes, 0);
  const featuredProject = builder.projects[0];
  const otherProjects = builder.projects.slice(1);

  return (
    <div className="bg-background-primary min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-32">
        {/* Owner edit bar */}
        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end mb-6"
          >
            <button className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-text-secondary border border-border-primary rounded-full hover:text-text-primary hover:bg-background-secondary transition-all">
              <Pencil className="w-3.5 h-3.5" />
              Edit profile
            </button>
          </motion.div>
        )}

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* IDENTITY TILE (2x2) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className={cn(tileBase, "md:col-span-2 md:row-span-2 flex flex-col justify-between")}
          >
            <div>
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-[32px] font-bold text-white mb-8 shadow-xl"
                style={{ background: builder.gradient }}
              >
                {getInitials(builder.name)}
              </div>

              <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-text-primary tracking-[-0.03em] leading-[0.95] mb-4">
                {builder.name}
              </h1>

              <p className="text-[18px] text-text-secondary leading-relaxed mb-4 max-w-sm">
                {builder.tagline}
              </p>

              <p className="text-[14px] text-text-tertiary leading-relaxed max-w-sm">
                {builder.bio}
              </p>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-10">
              {builder.social.github && (
                <a
                  href={`https://github.com/${builder.social.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-border-primary bg-background-secondary flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface transition-all shadow-sm"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {builder.social.twitter && (
                <a
                  href={`https://x.com/${builder.social.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-border-primary bg-background-secondary flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface transition-all shadow-sm"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {builder.social.website && (
                <a
                  href={`https://${builder.social.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-border-primary bg-background-secondary flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface transition-all shadow-sm"
                  aria-label="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>

          {/* FEATURED PROJECT TILE (2x2) */}
          {featuredProject ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className={cn("md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden relative group transition-all duration-500 ease-out hover:-translate-y-1 shadow-[0_12px_40px_rgba(0,0,0,0.08)]")}
            >
              <div
                className="absolute inset-0"
                style={{ background: featuredProject.gradient }}
              />
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-all duration-500 group-hover:bg-black/20" />
              <div className="relative z-10 p-8 sm:p-10 flex flex-col justify-between h-full min-h-[400px]">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest mb-6">
                    Featured project
                  </span>
                  <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-white tracking-[-0.03em] leading-[0.95] mb-3">
                    {featuredProject.title}
                  </h2>
                  <p className="text-[16px] text-white/80 leading-relaxed max-w-md font-medium">
                    {featuredProject.tagline}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredProject.techStack.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-md text-[11px] font-bold tracking-tight"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {featuredProject.demoUrl && (
                      <a
                        href={featuredProject.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0a0b0d] rounded-full text-[14px] font-bold hover:bg-white/90 transition-colors shadow-lg"
                      >
                        <Play className="w-4 h-4" />
                        Live demo
                      </a>
                    )}
                    {featuredProject.sourceUrl && (
                      <a
                        href={featuredProject.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-md text-white rounded-full text-[14px] font-bold hover:bg-white/30 transition-colors"
                      >
                        <Code2 className="w-4 h-4" />
                        Source
                      </a>
                    )}
                    <span className="flex items-center gap-1.5 ml-auto text-white text-[14px] font-bold">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      {featuredProject.likes}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className={cn(tileBase, "md:col-span-2 md:row-span-2 p-8 flex items-center justify-center")}
            >
              <p className="text-text-tertiary text-[15px] font-medium">No projects shipped yet.</p>
            </motion.div>
          )}

          {/* STATS TILE (1x1) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className={cn(tileBase, "p-8")}
          >
            <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-6">
              Verified Stats
            </h3>
            <div className="space-y-6">
              <div>
                <div className="font-display text-[36px] font-bold text-text-primary tracking-[-0.02em] leading-none mb-1">
                  {builder.projects.length}
                </div>
                <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">
                  Ships
                </div>
              </div>
              <div>
                <div className="font-display text-[36px] font-bold text-text-primary tracking-[-0.02em] leading-none mb-1">
                  {totalLikes.toLocaleString()}
                </div>
                <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">
                  Signal
                </div>
              </div>
              <div>
                <div className="font-display text-[36px] font-bold text-text-primary tracking-[-0.02em] leading-none mb-1">
                  {builder.hackathons.length}
                </div>
                <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">
                  Hackathons
                </div>
              </div>
            </div>
          </motion.div>

          {/* SKILLS TILE (1x1) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className={cn(tileBase, "p-8")}
          >
            <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-6">
              Skill Graph
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {builder.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-background-secondary border border-border-primary text-text-primary rounded-md text-[13px] font-bold tracking-tight shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* OTHER PROJECT TILES (1x1 each) */}
          {otherProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.1, ease }}
              className={cn(tileBase, "p-8 flex flex-col justify-between group/project")}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                    style={{ background: project.gradient }}
                  >
                    <span className="text-[12px] font-bold text-white">
                      {project.title.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-accent text-[12px] font-bold">
                    <Zap className="w-3.5 h-3.5" /> {project.likes}
                  </span>
                </div>
                <h4 className="text-[18px] font-bold text-text-primary mb-2 tracking-tight group-hover/project:text-accent transition-colors">
                  {project.title}
                </h4>
                <p className="text-[14px] text-text-secondary leading-relaxed line-clamp-2">
                  {project.tagline}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-text-primary text-background-primary rounded-full text-[12px] font-bold hover:opacity-80 transition-opacity"
                  >
                    Demo <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
                {project.sourceUrl && (
                  <a
                    href={project.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-border-primary text-text-secondary rounded-full text-[12px] font-bold hover:text-text-primary hover:bg-background-secondary transition-colors"
                  >
                    Source
                  </a>
                )}
              </div>
            </motion.div>
          ))}

          {/* HACKATHON TILE(S) */}
          {builder.hackathons.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.1, ease }}
              className="rounded-2xl overflow-hidden relative group transition-all duration-500 ease-out hover:-translate-y-1 shadow-md"
            >
              <div className="absolute inset-0 bg-[#0a0b0d]" />
              <div
                className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-60"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 0%, #00d1ff33 0%, transparent 70%)",
                }}
              />
              <Link
                href={`/hackathons/${event.id}`}
                className="relative z-10 p-8 block h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest",
                        event.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : event.status === "upcoming"
                          ? "bg-accent/20 text-accent"
                          : "bg-white/10 text-white/50"
                      )}
                    >
                      {event.status === "active" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      )}
                      {event.status}
                    </span>
                  </div>
                  <h4 className="text-[18px] font-bold text-white mb-2 tracking-tight group-hover:text-accent transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-[14px] text-white/60 mb-6 line-clamp-2">
                    {event.theme}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[12px] font-bold text-white/50 uppercase tracking-wider">
                  {event.prizes.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-accent" />
                      {event.prizes
                        .map((p) =>
                          parseInt(p.reward.replace(/[^0-9]/g, ""), 10) || 0
                        )
                        .reduce((a, b) => a + b, 0)
                        .toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                        })}
                    </span>
                  )}
                  {event.participantCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {event.participantCount}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}

          {/* DEMO EMBED TILE (2-col span) */}
          {featuredProject && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease }}
              className={cn(tileBase, "md:col-span-2 p-8")}
            >
              <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-6">
                Featured Demo
              </h3>
              {featuredProject.demoUrl && featuredProject.demoUrl.includes("cap.so") ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-background-secondary border border-border-primary shadow-sm">
                  <iframe
                    src={featuredProject.demoUrl}
                    className="w-full h-full border-0"
                    allow="autoplay"
                    title={`${featuredProject.title} demo`}
                  />
                </div>
              ) : (
                <a
                  href={featuredProject.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/demo flex items-center gap-5 p-6 rounded-xl bg-background-secondary hover:bg-surface border border-border-primary shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                    style={{ background: featuredProject.gradient }}
                  >
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[16px] font-bold text-text-primary group-hover/demo:text-accent transition-colors tracking-tight">
                      {featuredProject.title} — Live Demo
                    </h4>
                    <p className="text-[13px] text-text-tertiary mt-1.5 truncate">
                      {featuredProject.demoUrl}
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-text-tertiary shrink-0 group-hover/demo:text-accent transition-colors" />
                </a>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
