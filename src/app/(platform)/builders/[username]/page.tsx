"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Github,
  Twitter,
  Globe,
  ArrowUpRight,
  ExternalLink,
  Pencil,
  Heart,
  Trophy,
  Users,
  Code2,
  Play,
} from "lucide-react";
import {
  getBuilder,
  getBuilderProjects,
  getBuilderAntathons,
  getInitials,
} from "@/lib/mock-data";
import { useAuth } from "@/lib/supabase/auth-context";
import { cn } from "@/lib/utils";

const ease = [0.25, 1, 0.5, 1] as const;

const tileBase =
  "rounded-3xl border border-black/5 dark:border-white/5 bg-surface overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_12px_32px_-8px_rgba(255,255,255,0.04)]";

export default function BuilderProfilePage() {
  const { username } = useParams() as { username: string };
  const { user } = useAuth();
  const builder = getBuilder(username);
  const builderProjects = getBuilderProjects(username);
  const builderAntathons = getBuilderAntathons(username);

  const isOwner =
    user?.user_metadata?.username === username ||
    user?.email?.split("@")[0] === username;

  if (!builder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary px-8">
        <div className="text-center">
          <p className="text-text-tertiary text-[15px] mb-4">
            This builder hasn&apos;t joined yet.
          </p>
          <Link
            href="/builders"
            className="text-accent text-[14px] font-medium hover:underline"
          >
            Back to the directory
          </Link>
        </div>
      </div>
    );
  }

  const totalLikes = builderProjects.reduce((s, p) => s + p.likes, 0);
  const featuredProject = builderProjects[0];
  const otherProjects = builderProjects.slice(1);

  return (
    <div className="bg-background-primary min-h-screen">
      <div className="max-w-[1100px] mx-auto px-6 pt-28 pb-24">
        {/* Owner edit bar */}
        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end mb-4"
          >
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-text-tertiary border border-border-primary rounded-lg hover:text-text-primary hover:border-border-primary transition-colors">
              <Pencil className="w-3 h-3" />
              Edit profile
            </button>
          </motion.div>
        )}

        {/* ─── BENTO GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* ─── IDENTITY TILE (2x2) ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className={cn(tileBase, "md:col-span-2 md:row-span-2 p-8 flex flex-col justify-between")}
          >
            <div>
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-[28px] font-bold text-white mb-6 shadow-lg"
                style={{ background: builder.gradient }}
              >
                {getInitials(builder.name)}
              </div>

              <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-text-primary tracking-[-0.02em] leading-[1.1] mb-2">
                {builder.name}
              </h1>

              <p className="text-[15px] text-text-secondary leading-relaxed mb-3 max-w-sm">
                {builder.tagline}
              </p>

              <p className="text-[13px] text-text-tertiary leading-relaxed max-w-sm">
                {builder.bio}
              </p>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-8">
              {builder.social.github && (
                <a
                  href={`https://github.com/${builder.social.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-background-secondary flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-background-primary transition-all"
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
                  className="w-9 h-9 rounded-xl bg-background-secondary flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-background-primary transition-all"
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
                  className="w-9 h-9 rounded-xl bg-background-secondary flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-background-primary transition-all"
                  aria-label="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>

          {/* ─── FEATURED PROJECT TILE (2x2) ─── */}
          {featuredProject ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.06, ease }}
              className={cn("md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden relative group transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.2)]")}
            >
              <div
                className="absolute inset-0"
                style={{ background: featuredProject.gradient }}
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 p-8 flex flex-col justify-between h-full min-h-[320px]">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[11px] font-semibold text-white/90 uppercase tracking-wider mb-6">
                    Featured project
                  </span>
                  <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] text-white tracking-[-0.02em] leading-[1.1] mb-2">
                    {featuredProject.title}
                  </h2>
                  <p className="text-[14px] text-white/70 leading-relaxed max-w-md">
                    {featuredProject.tagline}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {featuredProject.techStack.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 bg-white/15 backdrop-blur-sm text-white/90 rounded-md text-[11px] font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={featuredProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#111] rounded-xl text-[13px] font-semibold hover:bg-white/90 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Live demo
                    </a>
                    {featuredProject.sourceUrl && (
                      <a
                        href={featuredProject.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-sm text-white rounded-xl text-[13px] font-medium hover:bg-white/25 transition-colors"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        Source
                      </a>
                    )}
                    <span className="flex items-center gap-1.5 ml-auto text-white/60 text-[13px]">
                      <Heart className="w-3.5 h-3.5" />
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
              transition={{ duration: 0.5, delay: 0.06, ease }}
              className={cn(tileBase, "md:col-span-2 md:row-span-2 p-8 flex items-center justify-center")}
            >
              <p className="text-text-tertiary text-[14px]">No projects yet</p>
            </motion.div>
          )}

          {/* ─── STATS TILE (1x1) ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12, ease }}
            className={cn(tileBase, "p-6")}
          >
            <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest mb-5">
              Stats
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-[28px] font-bold text-text-primary tracking-tight leading-none">
                  {builderProjects.length}
                </div>
                <div className="text-[12px] text-text-tertiary mt-1">
                  projects shipped
                </div>
              </div>
              <div>
                <div className="text-[28px] font-bold text-text-primary tracking-tight leading-none">
                  {totalLikes.toLocaleString()}
                </div>
                <div className="text-[12px] text-text-tertiary mt-1">
                  total likes
                </div>
              </div>
              <div>
                <div className="text-[28px] font-bold text-text-primary tracking-tight leading-none">
                  {builderAntathons.length}
                </div>
                <div className="text-[12px] text-text-tertiary mt-1">
                  hackathons joined
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── SKILLS TILE (1x1) ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18, ease }}
            className={cn(tileBase, "p-6")}
          >
            <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest mb-5">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {builder.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-background-secondary text-text-secondary rounded-lg text-[12px] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ─── OTHER PROJECT TILES (1x1 each) ─── */}
          {otherProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.24 + i * 0.06, ease }}
              className={cn(tileBase, "p-6 flex flex-col justify-between")}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: project.gradient }}
                  >
                    <span className="text-[10px] font-bold text-white">
                      {project.title.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-text-tertiary text-[11px]">
                    <Heart className="w-3 h-3" /> {project.likes}
                  </span>
                </div>
                <h4 className="text-[15px] font-semibold text-text-primary mb-1">
                  {project.title}
                </h4>
                <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2">
                  {project.tagline}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-text-primary text-background-primary rounded-lg text-[11px] font-semibold hover:opacity-80 transition-opacity"
                >
                  Demo <ArrowUpRight className="w-3 h-3" />
                </a>
                {project.sourceUrl && (
                  <a
                    href={project.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-primary text-text-secondary rounded-lg text-[11px] font-medium hover:text-text-primary transition-colors"
                  >
                    Source
                  </a>
                )}
              </div>
            </motion.div>
          ))}

          {/* ─── HACKATHON TILE(S) ─── */}
          {builderAntathons.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease }}
              className="rounded-3xl overflow-hidden relative group transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.2)]"
            >
              <div className="absolute inset-0 bg-[#111]" />
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "radial-gradient(ellipse at 30% 50%, #e8590c44 0%, transparent 60%)",
                }}
              />
              <Link
                href={`/hackathons/${event.id}`}
                className="relative z-10 p-6 block h-full"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                      event.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : event.status === "upcoming"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-white/10 text-white/50"
                    )}
                  >
                    {event.status === "active" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    )}
                    {event.status}
                  </span>
                </div>
                <h4 className="text-[15px] font-semibold text-white mb-1 group-hover:text-accent transition-colors">
                  {event.title}
                </h4>
                <p className="text-[12px] text-white/50 mb-4 line-clamp-1">
                  {event.theme}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-white/40">
                  {event.prizes.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-yellow-500" />
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
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.participantCount}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}

          {/* ─── DEMO EMBED TILE (2-col span) ─── */}
          {featuredProject && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.36, ease }}
              className={cn(tileBase, "md:col-span-2 p-6")}
            >
              <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest mb-4">
                Demo
              </h3>
              {featuredProject.demoUrl.includes("cap.so") ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-background-secondary">
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
                  className="group/demo flex items-center gap-4 p-5 rounded-xl bg-background-secondary hover:bg-background-primary border border-border-primary/30 hover:border-border-primary transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: featuredProject.gradient }}
                  >
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[14px] font-semibold text-text-primary group-hover/demo:text-accent transition-colors">
                      {featuredProject.title} — Live Demo
                    </h4>
                    <p className="text-[12px] text-text-tertiary mt-0.5 truncate">
                      {featuredProject.demoUrl}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-text-tertiary shrink-0 group-hover/demo:text-accent transition-colors" />
                </a>
              )}
            </motion.div>
          )}

          {/* ─── OPEN SOURCE TILE (2-col span or 1x1 each) ─── */}
          {builder.outsideProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.42, ease }}
              className={cn(
                tileBase,
                builder.outsideProjects.length > 1 ? "md:col-span-2" : "",
                "p-6"
              )}
            >
              <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest mb-4">
                Open Source
              </h3>
              <div className="space-y-3">
                {builder.outsideProjects.map((p, i) => (
                  <a
                    key={i}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/oss flex items-start justify-between gap-3 p-4 rounded-xl border border-border-primary/30 hover:border-border-primary bg-background-secondary/50 hover:bg-background-secondary transition-all"
                  >
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-semibold text-text-primary group-hover/oss:text-accent transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-text-tertiary shrink-0 mt-0.5 opacity-0 group-hover/oss:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
