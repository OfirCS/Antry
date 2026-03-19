"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Github,
  Twitter,
  Globe,
  Calendar,
  ArrowUpRight,
  Heart,
  Pencil,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getBuilder,
  getBuilderProjects,
  getBuilderAntathons,
  getInitials,
  formatDate,
} from "@/lib/mock-data";

const ease = [0.16, 1, 0.3, 1] as const;

const patterns = [
  "radial-gradient(circle at 25% 75%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)",
  "radial-gradient(circle at 70% 80%, rgba(255,255,255,0.14) 0%, transparent 45%), radial-gradient(circle at 15% 30%, rgba(255,255,255,0.06) 0%, transparent 50%)",
  "radial-gradient(circle at 50% 10%, rgba(255,255,255,0.1) 0%, transparent 55%), radial-gradient(circle at 30% 90%, rgba(255,255,255,0.08) 0%, transparent 35%)",
];

export default function AntProfilePage() {
  const { username } = useParams() as { username: string };
  const builder = getBuilder(username);
  const builderProjects = getBuilderProjects(username);
  const builderAntathons = builder ? getBuilderAntathons(username) : [];

  if (!builder) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
        <p className="text-text-tertiary text-[14px]">Ant not found.</p>
        <Link href="/discover" className="text-[13px] text-accent mt-3 inline-block">
          Back to colony
        </Link>
      </div>
    );
  }

  const totalLikes = builderProjects.reduce((s, p) => s + p.likes, 0);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10 md:py-16">
      <Link
        href="/discover"
        className="inline-flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors mb-6"
      >
        <ArrowLeft className="w-3 h-3" /> Colony
      </Link>

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl overflow-hidden mb-0 border border-border-tertiary"
      >
        {/* Gradient cover */}
        <div className="h-36 sm:h-48 relative overflow-hidden" style={{ background: builder.gradient }}>
          <div
            className="absolute inset-0 opacity-[0.15] mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
          <span className="absolute bottom-2 right-6 text-white/8 text-[100px] sm:text-[160px] font-mono font-bold leading-none select-none">
            {getInitials(builder.name)}
          </span>
        </div>

        {/* Profile info */}
        <div className="px-6 sm:px-8 pb-8 bg-background-primary">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-6">
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center border-4 border-background-primary shadow-sm shrink-0"
              style={{ background: builder.gradient }}
            >
              <span className="text-2xl font-medium text-white">{getInitials(builder.name)}</span>
            </div>
            <div className="flex-1 min-w-0 sm:pb-1">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-[26px] md:text-[32px] text-text-primary leading-snug">
                  {builder.name}
                </h1>
                {/* Edit indicator — visible only to owner (mocked) */}
                <button
                  className="hidden sm:flex items-center gap-1 text-[11px] text-text-tertiary border border-border-tertiary rounded-md px-2 py-0.5 hover:border-accent hover:text-accent transition-colors"
                  title="Only you can edit your page"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              </div>
              <p className="text-[14px] text-text-secondary mt-1.5 max-w-[460px] leading-relaxed">
                {builder.tagline}
              </p>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {builder.skills.map((s) => (
              <span
                key={s}
                className="text-[10px] font-mono text-text-tertiary bg-background-secondary rounded-md px-2 py-0.5"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Social links */}
          <div className="flex flex-wrap items-center gap-4 text-[12px] text-text-tertiary">
            {builder.social.github && (
              <a
                href={`https://github.com/${builder.social.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-accent transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                {builder.social.github}
              </a>
            )}
            {builder.social.twitter && (
              <a
                href={`https://x.com/${builder.social.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-accent transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />@{builder.social.twitter}
              </a>
            )}
            {builder.social.website && (
              <a
                href={`https://${builder.social.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-accent transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                {builder.social.website}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined {formatDate(builder.joinedAt)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex gap-8 py-6 mb-2 text-center"
      >
        <div>
          <div className="text-[22px] font-mono text-text-primary">{builderProjects.length}</div>
          <div className="text-[11px] text-text-tertiary mt-0.5">projects</div>
        </div>
        <div>
          <div className="text-[22px] font-mono text-text-primary">{totalLikes}</div>
          <div className="text-[11px] text-text-tertiary mt-0.5">likes</div>
        </div>
        <div>
          <div className="text-[22px] font-mono text-text-primary">{builderAntathons.length}</div>
          <div className="text-[11px] text-text-tertiary mt-0.5">antathons</div>
        </div>
      </motion.div>

      {/* ── About ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-10"
      >
        <span className="text-[11px] font-mono text-text-tertiary block mb-3">about</span>
        <p className="text-[14px] text-text-secondary leading-[1.8] max-w-[600px]">{builder.bio}</p>
      </motion.div>

      {/* ── Projects with Embedded Demos ── */}
      {builderProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-12"
        >
          <span className="text-[11px] font-mono text-text-tertiary block mb-5">shipped projects</span>
          <div className="space-y-6">
            {builderProjects.map((project, i) => (
              <div
                key={project.id}
                className="border border-border-tertiary rounded-xl overflow-hidden hover:border-border-secondary transition-colors"
              >
                {/* Demo embed area */}
                <div className="aspect-[2.4/1] relative overflow-hidden" style={{ background: project.gradient }}>
                  <div className="absolute inset-0" style={{ backgroundImage: patterns[i % patterns.length] }} />
                  <div
                    className="absolute inset-0 opacity-[0.15] mix-blend-soft-light"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    }}
                  />
                  {/* Demo badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white/90 text-[11px] font-mono px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    live demo
                  </div>
                  <span className="absolute bottom-3 left-5 text-white/15 text-[40px] font-mono font-bold select-none">
                    {project.title.slice(0, 3).toLowerCase()}
                  </span>
                </div>

                {/* Project info */}
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-[17px] font-medium text-text-primary hover:text-accent transition-colors"
                      >
                        {project.title}
                      </Link>
                      {project.antathonId && (
                        <span className="ml-2 text-[10px] font-mono text-accent bg-accent-muted px-1.5 py-0.5 rounded">
                          antathon project
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-text-tertiary text-[12px] shrink-0 mt-0.5">
                      <Heart className="w-3 h-3" />
                      {project.likes}
                    </span>
                  </div>
                  <p className="text-[13px] text-text-tertiary leading-relaxed mb-4">{project.tagline}</p>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {project.techStack.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono text-text-tertiary bg-background-secondary rounded px-1.5 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                    <span className="text-[11px] text-text-tertiary font-mono ml-auto">{project.buildTime}</span>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-text-primary text-background-primary rounded-lg text-[12px] font-medium hover:opacity-85 transition-opacity"
                    >
                      Try demo <ArrowUpRight className="w-3 h-3" />
                    </a>
                    {project.sourceUrl && (
                      <a
                        href={project.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-border-secondary rounded-lg text-[12px] text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <Github className="w-3 h-3" /> Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Antathons ── */}
      {builderAntathons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-12"
        >
          <span className="text-[11px] font-mono text-text-tertiary block mb-4">antathons</span>
          <div className="space-y-3">
            {builderAntathons.map((a) => {
              const dotColor =
                a.status === "active"
                  ? "bg-green-500"
                  : a.status === "upcoming"
                    ? "bg-accent"
                    : "bg-text-tertiary";
              return (
                <Link
                  key={a.id}
                  href={`/antathons/${a.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border-tertiary hover:border-accent/30 hover:bg-background-secondary/40 transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-lg shrink-0 relative overflow-hidden"
                    style={{ background: a.gradient }}
                  >
                    <Trophy className="w-4 h-4 text-white/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors">
                        {a.title}
                      </h4>
                      <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
                    </div>
                    <p className="text-[12px] text-text-tertiary line-clamp-1">{a.theme}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Outside Projects ── */}
      {builder.outsideProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mb-12"
        >
          <span className="text-[11px] font-mono text-text-tertiary block mb-4">outside the colony</span>
          <div className="space-y-3">
            {builder.outsideProjects.map((op) => (
              <a
                key={op.title}
                href={op.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-border-tertiary hover:border-border-secondary hover:bg-background-secondary/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-background-secondary flex items-center justify-center shrink-0">
                  <ExternalLink className="w-4 h-4 text-text-tertiary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors">
                    {op.title}
                  </h4>
                  <p className="text-[12px] text-text-tertiary line-clamp-1">{op.description}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {builderProjects.length === 0 && (
        <p className="text-[13px] text-text-tertiary py-10 text-center">No projects yet.</p>
      )}
    </div>
  );
}
