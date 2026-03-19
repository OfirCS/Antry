"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Github, Twitter, Layers, Heart, Zap, Play } from "lucide-react";
import Link from "next/link";
import { builders, getBuilderProjects, getInitials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function ColonyFlowPage() {
  const [q, setQ] = useState("");

  const filteredAnts = builders.filter(
    (b) => !q || b.name.toLowerCase().includes(q.toLowerCase()) || b.skills.some((s) => s.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Sticky Search Header */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search 100+ Active Builders..."
              className="w-full pl-11 pr-6 py-3.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
            <Zap className="w-3 h-3 text-blue-600" />
            {builders.length} Developers
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-48 pb-24 px-6">
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredAnts.map((ant, index) => (
              <AntListCard key={ant.id} ant={ant} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {filteredAnts.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-gray-400 font-medium">No builders found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AntListCard({ ant, index }: { ant: any; index: number }) {
  const projects = getBuilderProjects(ant.username);
  const totalLikes = projects.reduce((s, p) => s + p.likes, 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link 
        href={`/builders/${ant.username}`}
        className="group flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-white border border-gray-100 rounded-2xl hover:border-blue-100 hover:shadow-xl hover:shadow-gray-200/30 transition-all"
      >
        {/* Identity & Measurements */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-sm"
            style={{ background: ant.gradient }}
          >
            {getInitials(ant.name)}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {ant.name}
            </h2>
            <p className="text-[13px] text-gray-500 line-clamp-1 mt-0.5 font-medium leading-relaxed">
              {ant.tagline}
            </p>
          </div>
        </div>

        {/* Simple Measurements */}
        <div className="flex items-center gap-8 px-4 py-2 md:py-0 border-t md:border-t-0 md:border-l border-gray-100 w-full md:w-auto">
          <div className="text-center">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 justify-center">
              Projects
            </div>
            <div className="text-base font-bold text-gray-900">{projects.length}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 justify-center">
              Likes
            </div>
            <div className="text-base font-bold text-gray-900">{totalLikes}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 justify-center">
              Events
            </div>
            <div className="text-base font-bold text-gray-900">{ant.antathonIds.length}</div>
          </div>
        </div>

        {/* Trail Preview (Quick Demo) */}
        {projects[0] && (
          <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-gray-100">
             <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
             </div>
          </div>
        )}

        <ArrowRight className="hidden md:block w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all ml-2" />
      </Link>
    </motion.div>
  );
}
