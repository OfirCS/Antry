"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/mock-data";

interface ProjectCardProps {
  project: Project;
  index?: number;
  className?: string;
}

export function ProjectCard({ project, index = 0, className }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group h-full", className)}
    >
      <Link
        href={`/projects/${project.id}`}
        className="relative flex flex-col h-full rounded-2xl border border-gray-200/80 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.04] hover:-translate-y-1 hover:border-[#C6F135]/30"
      >
        {/* Gradient header */}
        <div
          className="h-24 relative"
          style={{ background: project.gradient || "linear-gradient(135deg, #667eea, #764ba2)" }}
        >
          {/* Category badge */}
          {project.category && (
            <span className="absolute top-3 left-3 inline-flex items-center rounded-md bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[11px] font-medium text-gray-700">
              {project.category}
            </span>
          )}
          <div className="absolute top-3 right-3 h-7 w-7 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ArrowUpRight className="h-3.5 w-3.5 text-gray-600" />
          </div>
        </div>

        <div className="flex flex-col flex-1 p-5">
          <h3 className="text-[16px] font-semibold text-[#111] tracking-tight line-clamp-1">
            {project.title}
          </h3>
          <p className="text-[13px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
            {project.tagline}
          </p>

          {/* Builder */}
          <div className="flex items-center gap-2 mt-4">
            <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
              {project.builder.name.charAt(0)}
            </div>
            <span className="text-[12px] font-medium text-gray-600">
              {project.builder.name}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <div className="flex gap-1.5">
              {project.techStack.slice(0, 2).map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 2 && (
                <span className="text-[11px] text-gray-400 self-center">
                  +{project.techStack.length - 2}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Heart className="h-3 w-3" />
              <span className="text-[12px] font-medium">{project.likes}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
