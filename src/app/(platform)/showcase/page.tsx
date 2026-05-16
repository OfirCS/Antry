"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, GalleryHorizontalEnd } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const showcaseProjects = [
  {
    slug: "wealthy",
    title: "Wealthy",
    subtitle: "Financial planning interface for faster portfolio review",
    builder: "Ofir Sela",
    techStack: ["React", "Next.js", "Supabase"],
    featured: true,
  },
];

export default function ShowcasePage() {
  return (
    <div style={{ background: "#F7F8FA" }} className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-1.5 mb-6">
              <GalleryHorizontalEnd size={14} className="text-[#6B7280]" />
              <span className="text-[13px] font-medium text-[#4B5563]">
                Featured builds
              </span>
            </div>
            <h1
              className="text-[48px] sm:text-[56px] font-bold tracking-tight leading-[1.05] mb-4 font-display"
              style={{ color: "#111111" }}
            >
              Showcase
            </h1>
            <p
              className="text-[18px] leading-relaxed max-w-lg"
              style={{ color: "#4B5563" }}
            >
              Explore standout projects built by the Antry community. Real
              builders, real products, real impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="mx-auto max-w-[1240px] px-6 sm:px-10 pb-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {showcaseProjects.map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease }}
              className="group"
            >
              <Link
                href={`/showcase/${project.slug}`}
                className="relative block rounded-md border border-[#E5E7EB] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)] hover:border-[#D1D5DB] hover:-translate-y-0.5"
              >
                {/* Featured badge */}
                {project.featured && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#111111] px-3 py-1 text-[11px] font-semibold text-white uppercase tracking-wider">
                      Featured
                    </span>
                  </div>
                )}

                <div className="h-48 w-full relative border-b border-[#E5E7EB] bg-[#F7F8FA]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[64px] font-bold font-display" style={{ color: "rgba(17,17,17,0.10)" }}>
                      {project.title.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-[20px] font-bold text-[#111111] tracking-tight font-display">
                        {project.title}
                      </h3>
                      <p className="text-[14px] text-[#4B5563] mt-1 leading-relaxed">
                        {project.subtitle}
                      </p>
                    </div>
                    <div className="h-9 w-9 rounded-md bg-[#F3F4F6] flex items-center justify-center shrink-0 group-hover:bg-[#111111] transition-all duration-300">
                      <ArrowUpRight className="h-4 w-4 text-[#6B7280] group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-6 rounded-md bg-[#111111] flex items-center justify-center text-[11px] font-bold text-white">
                      O
                    </div>
                    <span className="text-[13px] font-medium text-[#111111]">
                      {project.builder}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center rounded-full bg-[#F3F4F6] px-3 py-1 text-[12px] font-medium text-[#4B5563]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Placeholder card for future projects */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
          >
            <div className="relative flex h-full min-h-[380px] items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] bg-white/50">
              <div className="text-center px-6">
                <div className="mx-auto mb-4 h-12 w-12 rounded-md bg-[#F3F4F6] flex items-center justify-center">
                  <GalleryHorizontalEnd size={20} className="text-[#9CA3AF]" />
                </div>
                <p className="text-[15px] font-semibold text-[#111111] mb-1">
                  Your project here
                </p>
                <p className="text-[13px] text-[#6B7280] mb-4">
                  Ship something amazing and get featured
                </p>
                <Link
                  href="/submit"
                  className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-[#2A2A2A]"
                >
                  Submit project
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
