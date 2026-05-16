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
        className="relative flex h-full flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
      >
        <div className="relative h-24 border-b border-gray-100 bg-[#F7F8FA]">
          {project.category && (
            <span className="absolute left-3 top-3 inline-flex items-center rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200">
              {project.category}
            </span>
          )}
          <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded border border-gray-200 bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <ArrowUpRight className="h-3.5 w-3.5 text-[#020617]" />
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
                  className="inline-flex items-center rounded bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-500"
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
