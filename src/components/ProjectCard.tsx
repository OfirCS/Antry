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
        className="block card-premium p-8 h-full flex flex-col"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h3 className="text-[18px] font-bold text-text-primary group-hover:text-accent transition-colors truncate tracking-tight">
              {project.title}
            </h3>
            <p className="text-[14px] text-text-secondary line-clamp-1 mt-1 font-medium">
              {project.tagline}
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-accent text-[12px] font-bold shrink-0 mt-1 uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5" />
            <span>{project.likes}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
            style={{ background: project.builder.gradient }}
          >
            {getInitials(project.builder.name)}
          </div>
          <span className="text-[13px] font-bold text-text-primary">
            {project.builder.name}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-6 border-t border-border-tertiary mt-auto">
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-[11px] font-bold text-text-tertiary bg-background-secondary px-2.5 py-1 rounded-md tracking-tight"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 && (
            <span className="text-[11px] font-bold text-text-tertiary px-1 py-1">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
