"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Github, Twitter, Globe, Calendar } from "lucide-react";
import { getBuilder, getBuilderProjects, getInitials, formatDate } from "@/lib/mock-data";
import { ProjectCard } from "@/components/ProjectCard";

export default function BuilderProfilePage() {
  const { username } = useParams() as { username: string };
  const builder = getBuilder(username);
  const builderProjects = getBuilderProjects(username);

  if (!builder) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
        <p className="text-text-tertiary text-[14px]">Builder not found.</p>
        <Link href="/discover" className="text-[13px] text-accent mt-3 inline-block">Back to discover</Link>
      </div>
    );
  }

  const totalLikes = builderProjects.reduce((s, p) => s + p.likes, 0);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10 md:py-16">
      <Link href="/discover" className="inline-flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors mb-10">
        <ArrowLeft className="w-3 h-3" /> Discover
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-6 mb-12"
      >
        <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0" style={{ background: builder.gradient }}>
          <span className="text-xl font-medium text-white">{getInitials(builder.name)}</span>
        </div>
        <div>
          <h1 className="font-display text-[26px] md:text-[32px] text-text-primary leading-snug">{builder.name}</h1>
          <p className="text-[14px] text-text-secondary mt-2 max-w-[460px] leading-relaxed">{builder.bio}</p>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {builder.skills.map((s) => (
              <span key={s} className="text-[10px] font-mono text-text-tertiary bg-background-secondary rounded px-1.5 py-0.5">{s}</span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-[12px] text-text-tertiary">
            {builder.social.github && (
              <a href={`https://github.com/${builder.social.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent transition-colors">
                <Github className="w-3.5 h-3.5" />{builder.social.github}
              </a>
            )}
            {builder.social.twitter && (
              <a href={`https://x.com/${builder.social.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent transition-colors">
                <Twitter className="w-3.5 h-3.5" />@{builder.social.twitter}
              </a>
            )}
            {builder.social.website && (
              <a href={`https://${builder.social.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent transition-colors">
                <Globe className="w-3.5 h-3.5" />{builder.social.website}
              </a>
            )}
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Joined {formatDate(builder.joinedAt)}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="flex gap-8 mb-10 pb-8 border-b border-border-tertiary text-center">
        <div>
          <div className="text-[20px] font-mono text-text-primary">{builderProjects.length}</div>
          <div className="text-[11px] text-text-tertiary mt-0.5">projects</div>
        </div>
        <div>
          <div className="text-[20px] font-mono text-text-primary">{totalLikes}</div>
          <div className="text-[11px] text-text-tertiary mt-0.5">likes</div>
        </div>
      </div>

      {/* Projects */}
      {builderProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {builderProjects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>
      ) : (
        <p className="text-[13px] text-text-tertiary py-10 text-center">No projects yet.</p>
      )}
    </div>
  );
}
