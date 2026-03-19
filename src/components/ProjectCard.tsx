"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/mock-data";
import { getInitials } from "@/lib/mock-data";

interface ProjectCardProps {
  project: Project;
  index?: number;
  className?: string;
}

const patterns = [
  "radial-gradient(circle at 25% 75%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)",
  "radial-gradient(circle at 70% 80%, rgba(255,255,255,0.14) 0%, transparent 45%), radial-gradient(circle at 15% 30%, rgba(255,255,255,0.06) 0%, transparent 50%)",
  "radial-gradient(circle at 50% 10%, rgba(255,255,255,0.1) 0%, transparent 55%), radial-gradient(circle at 30% 90%, rgba(255,255,255,0.08) 0%, transparent 35%)",
  "radial-gradient(circle at 10% 50%, rgba(255,255,255,0.12) 0%, transparent 45%), radial-gradient(circle at 90% 60%, rgba(255,255,255,0.07) 0%, transparent 40%)",
  "radial-gradient(circle at 60% 30%, rgba(255,255,255,0.09) 0%, transparent 50%), radial-gradient(circle at 20% 70%, rgba(255,255,255,0.11) 0%, transparent 40%)",
];

export function ProjectCard({ project, index = 0, className }: ProjectCardProps) {
  const pattern = patterns[index % patterns.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] as const }}
      className={cn("group", className)}
    >
      <Link href={`/projects/${project.id}`} className="block">
        {/* Thumbnail */}
        <div className="aspect-[16/10] rounded-xl mb-4 relative overflow-hidden" style={{ background: project.gradient }}>
          {/* Pattern overlay */}
          <div className="absolute inset-0" style={{ backgroundImage: pattern }} />
          {/* Noise grain */}
          <div className="absolute inset-0 opacity-[0.18] mix-blend-soft-light" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }} />
          {/* Initial — bottom left, small */}
          <span className="absolute bottom-3 left-4 text-white/20 text-[32px] font-mono font-bold select-none">
            {project.title.slice(0, 2).toLowerCase()}
          </span>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.06] transition-colors duration-300" />
        </div>

        {/* Content */}
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className="text-[15px] font-medium text-text-primary group-hover:text-accent transition-colors leading-snug">
            {project.title}
          </h3>
          <span className="flex items-center gap-1 text-text-tertiary text-[12px] shrink-0 mt-0.5">
            <Heart className="w-3 h-3" />
            {project.likes}
          </span>
        </div>

        <p className="text-[13px] text-text-tertiary leading-relaxed line-clamp-2 mb-3">
          {project.tagline}
        </p>

        {/* Builder */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ background: project.builder.gradient }}
          >
            <span className="text-[8px] font-bold text-white leading-none">{getInitials(project.builder.name)}</span>
          </div>
          <span className="text-[12px] text-text-tertiary">{project.builder.name}</span>
          <span className="text-text-tertiary text-[10px]">&middot;</span>
          <span className="text-[11px] text-text-tertiary font-mono">{project.buildTime}</span>
        </div>

        {/* Tech */}
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 3).map((tech) => (
            <span key={tech} className="text-[10px] font-mono text-text-tertiary bg-background-secondary rounded px-1.5 py-0.5">
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 && (
            <span className="text-[10px] font-mono text-text-tertiary">+{project.techStack.length - 3}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
