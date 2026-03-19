"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Github, Twitter, Globe, Calendar, ExternalLink, Play, Lock } from "lucide-react";
import { getBuilder, getBuilderProjects, getInitials, formatDate, getAntathon } from "@/lib/mock-data";
import { useAuth } from "@/lib/supabase/auth-context";

export default function AntProfilePage() {
  const { username } = useParams() as { username: string };
  const { user } = useAuth();
  const builder = getBuilder(username);
  const builderProjects = getBuilderProjects(username);

  // Check if current user is the owner of this profile
  const isOwner = user?.user_metadata?.username === username || user?.email?.split('@')[0] === username;

  if (!builder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4 font-medium">This ant hasn&apos;t joined the colony yet.</p>
          <Link href="/discover" className="text-blue-600 font-bold hover:underline">Back to the colony</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ─── IDENTITY SECTION ─── */}
      <section className="pt-32 pb-16 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10 md:text-left text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] flex items-center justify-center text-4xl font-bold text-white shadow-2xl shrink-0"
            style={{ background: builder.gradient }}
          >
            {getInitials(builder.name)}
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4"
            >
              {builder.name}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-500 font-medium leading-relaxed max-w-2xl mb-6"
            >
              {builder.tagline}
            </motion.p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {builder.social.github && (
                <a href={`https://github.com/${builder.social.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 flex items-center gap-2 transition-colors">
                  <Github className="w-3.5 h-3.5" /> Github
                </a>
              )}
              {builder.social.twitter && (
                <a href={`https://x.com/${builder.social.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 flex items-center gap-2 transition-colors">
                  <Twitter className="w-3.5 h-3.5" /> Twitter
                </a>
              )}
              {builder.social.website && (
                <a href={`https://${builder.social.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 flex items-center gap-2 transition-colors">
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
            </div>
          </div>

          {isOwner && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-xs font-bold shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2 shrink-0"
            >
              Edit Page
            </motion.button>
          )}
        </div>
      </section>

      {/* ─── MEASUREMENTS BAR ─── */}
      <section className="bg-gray-50/50 border-b border-gray-100 py-8 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-around text-center">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Projects</div>
            <div className="text-2xl font-bold text-gray-900">{builderProjects.length}</div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Total Likes</div>
            <div className="text-2xl font-bold text-gray-900">{builderProjects.reduce((s, p) => s + p.likes, 0)}</div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Antathons</div>
            <div className="text-2xl font-bold text-gray-900">{builder.antathonIds.length}</div>
          </div>
        </div>
      </section>

      {/* ─── LIVE DEMOS ─── */}
      <section className="py-24 px-6 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Live Demos</h2>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{builderProjects.length} projects</span>
          </div>

          <div className="space-y-12">
            {builderProjects.map((project, i) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 flex flex-col lg:flex-row"
              >
                <div className="lg:w-1/2 aspect-video relative group cursor-pointer" style={{ background: project.gradient }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-blue-600 fill-blue-600 ml-1.5" />
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 p-10 lg:p-14 flex flex-col justify-center">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack.map(t => (
                      <span key={t} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">{t}</span>
                    ))}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h3>
                  <p className="text-gray-500 text-lg leading-relaxed mb-8">{project.tagline}</p>
                  <div className="flex gap-4">
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                      Run Demo
                    </a>
                    {project.sourceUrl && (
                      <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-gray-100 text-gray-900 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                        Source
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ANT TRAIL (Antathons) ─── */}
      <section className="py-24 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-12">The Ant Trail</h2>
          <div className="space-y-6">
            {builder.antathonIds.map(id => {
              const event = getAntathon(id);
              if (!event) return null;
              return (
                <Link key={id} href={`/hackathons/${id}`} className="block group">
                  <div className="flex items-center justify-between p-8 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: event.gradient }}>
                        {event.title[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{event.title}</h4>
                        <p className="text-sm text-gray-400">{event.theme}</p>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-blue-600 rotate-180 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── THE STORAGE (Outside Projects) ─── */}
      <section className="py-24 px-6 bg-gray-900 text-white rounded-t-[3rem]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-12">The Storage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {builder.outsideProjects.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="group p-8 border border-white/10 rounded-3xl hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-xl group-hover:text-blue-400 transition-colors">{p.title}</h4>
                  <ExternalLink className="w-4 h-4 text-white/30" />
                </div>
                <p className="text-white/50 text-sm leading-relaxed">{p.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
