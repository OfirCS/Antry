"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/mock-data";

interface ProjectCardProps {
  project: Project;
  index?: number;
  className?: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function ProjectCard({ project, index = 0, className }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease }}
      className={cn("group", className)}
    >
      <Link
        href={`/projects/${project.id}`}
        className="block rounded-xl border border-border-primary bg-surface p-6 hover:border-text-tertiary/40 hover:shadow-sm transition-all"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold text-text-primary mb-1 group-hover:text-accent-bright transition-colors">
              {project.title}
            </h3>
            <p className="text-[13px] text-text-tertiary line-clamp-1">
              {project.tagline}
            </p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-background-secondary flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="h-4 w-4 text-text-secondary" />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-6 w-6 rounded-full bg-background-secondary flex items-center justify-center text-[11px] font-semibold text-text-secondary">
            {project.title.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-[13px] font-medium text-text-secondary">
            {project.builder.name}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border-secondary">
          <div className="flex gap-2">
            {project.techStack.slice(0, 2).map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-medium text-text-tertiary bg-background-secondary px-2 py-0.5 rounded"
              >
                {tech}
              </span>
            ))}
          </div>
          <span className="text-[12px] font-medium text-text-tertiary">
            {project.likes} signals
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
