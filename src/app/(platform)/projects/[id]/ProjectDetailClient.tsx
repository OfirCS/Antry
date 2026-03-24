"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Heart, Github, Clock } from "lucide-react";
import { getInitials, formatDate } from "@/lib/mock-data";
import type { Project } from "@/lib/mock-data";
import { ProjectCard } from "@/components/ProjectCard";
import { toggleLike } from "../../actions";

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
  if (!project) {
    return (
      <div className="max-w-[800px] mx-auto px-8 py-20 text-center">
        <p className="text-text-tertiary text-[14px]">Project not found.</p>
        <Link href="/builders" className="text-[13px] text-accent mt-3 inline-block">
          Back to discover
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[740px] mx-auto px-8 py-10 md:py-16">
      <Link
        href="/builders"
        className="inline-flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-primary transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-3 h-3" /> Builders
      </Link>

      {/* Thumbnail */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="aspect-[2.2/1] rounded-lg overflow-hidden mb-8 relative shadow-sm"
        style={{ background: project.gradient }}
      >
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <span className="absolute bottom-4 left-5 text-white/10 text-[48px] font-mono font-bold select-none">
          {project.title.slice(0, 3).toLowerCase()}
        </span>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="font-display text-[clamp(1.5rem,4vw,2rem)] text-text-primary tracking-[-0.02em]">
            {project.title}
          </h1>
          {isLoggedIn ? (
            <form action={toggleLike}>
              <input type="hidden" name="project_id" value={project.id} />
              <button
                type="submit"
                className="flex items-center gap-1 text-[13px] shrink-0 mt-2 transition-colors group"
                title={hasLiked ? "Unlike" : "Like"}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    hasLiked
                      ? "fill-red-500 text-red-500"
                      : "text-text-tertiary group-hover:text-red-400"
                  }`}
                />
                <span className={hasLiked ? "text-red-500 font-semibold" : "text-text-tertiary"}>
                  {project.likes}
                </span>
              </button>
            </form>
          ) : (
            <Link
              href={`/login?redirect=/projects/${project.id}`}
              className="flex items-center gap-1 text-text-tertiary text-[13px] shrink-0 mt-2 hover:text-red-400 transition-colors"
              title="Sign in to like"
            >
              <Heart className="w-3.5 h-3.5" />
              {project.likes}
            </Link>
          )}
        </div>
        <p className="text-[16px] text-text-secondary leading-relaxed mb-6">
          {project.tagline}
        </p>

        {/* Builder */}
        <Link
          href={`/builders/${project.builder.username}`}
          className="inline-flex items-center gap-3 group mb-8"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: project.builder.gradient }}
          >
            <span className="text-[10px] font-bold text-white">
              {getInitials(project.builder.name)}
            </span>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-text-primary group-hover:text-accent transition-colors">
              {project.builder.name}
            </div>
            <div className="text-[11px] text-text-tertiary flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {project.buildTime}
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Description */}
      <div className="mb-8">
        <p className="text-[14px] text-text-secondary leading-[1.8]">
          {project.description}
        </p>
      </div>

      {/* Tech */}
      <div className="mb-8">
        <span className="text-[11px] font-mono text-text-tertiary block mb-3">
          stack
        </span>
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((t) => (
            <span
              key={t}
              className="text-[12px] font-mono text-text-secondary bg-background-secondary rounded-lg px-3 py-1"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-lg text-[13px] font-semibold hover:opacity-90 transition-all"
          >
            Live demo <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}
        {project.sourceUrl && (
          <a
            href={project.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-background-secondary text-text-primary rounded-lg text-[13px] font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Github className="w-3.5 h-3.5" /> Source
          </a>
        )}
      </div>

      {/* Meta */}
      <div className="py-5 border-t border-border-primary flex flex-wrap gap-5 text-[11px] font-mono text-text-tertiary">
        <span>{project.category.replace("-", " ")}</span>
        <span>{formatDate(project.createdAt)}</span>
        <span>{project.buildTime}</span>
      </div>

      {/* More */}
      {moreProjects.length > 0 && (
        <div className="mt-10 pt-8 border-t border-border-primary">
          <h3 className="text-[14px] text-text-secondary mb-6 font-medium">
            More from {project.builder.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {moreProjects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
