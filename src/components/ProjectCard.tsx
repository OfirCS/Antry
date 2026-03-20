"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/mock-data";
import { getInitials } from "@/lib/mock-data";

interface ProjectCardProps {
  project: Project;
  index?: number;
  className?: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function ProjectCard({ project, index = 0, className }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease }}
      className={cn("group", className)}
    >
      <Link
        href={`/projects/${project.id}`}
        className="block p-7 rounded-2xl bg-surface border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_-12px_rgba(255,255,255,0.05)] transition-all duration-300 ease-out"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h3 className="text-[17px] font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
              {project.title}
            </h3>
            <p className="text-[13px] text-text-secondary line-clamp-1 mt-1">
              {project.tagline}
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-text-tertiary text-[12px] shrink-0 mt-1">
            <Heart className="w-3 h-3" />
            <span className="font-medium">{project.likes}</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 mb-6">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[7px] font-bold text-white"
            style={{ background: project.builder.gradient }}
          >
            {getInitials(project.builder.name)}
          </div>
          <span className="text-[12px] font-semibold text-text-primary">
            {project.builder.name}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-5 border-t border-border-secondary">
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-[11px] font-medium text-text-tertiary"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 && (
            <span className="text-[11px] text-text-tertiary">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
