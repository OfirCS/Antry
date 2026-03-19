"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Trophy, Calendar, ExternalLink, Play, Globe, Shield, Zap } from "lucide-react";
import { getAntathon, getAntathonProjects, formatDate, getInitials } from "@/lib/mock-data";

export default function AntathonDetailPage() {
  const { id } = useParams() as { id: string };
  const event = getAntathon(id);
  const submissions = getAntathonProjects(id);
  const prizePool = event?.prizes.reduce((s, p) => s + (parseInt(p.reward.replace(/[^0-9]/g, "")) || 0), 0) || 0;

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4 font-medium">This Antathon hasn&apos;t started yet.</p>
          <Link href="/hackathons" className="text-blue-600 font-bold hover:underline">Back to Antathons</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/20 via-transparent to-transparent">
        <div className="max-w-6xl mx-auto relative">
          <Link href="/hackathons" className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors mb-16 uppercase tracking-[0.3em]">
            <ArrowLeft className="w-4 h-4" /> All Antathons
          </Link>

          <div className="flex flex-col lg:flex-row gap-16 items-end justify-between">
            <div className="max-w-3xl">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8 inline-block">
                {event.status} Antathon
              </span>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-gray-900 mb-8 leading-[0.95]">{event.title}</h1>
              <p className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed max-w-xl">{event.theme}</p>
            </div>
            <div className="flex gap-4">
              <button className="px-12 py-5 bg-gray-900 text-white rounded-full font-bold shadow-2xl hover:bg-blue-600 transition-all active:scale-95">
                Enter the Trail
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS & SPONSORS ─── */}
      <section className="py-24 px-6 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/5 transition-all group">
              <Trophy className="w-6 h-6 text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Total Prize Pool</div>
              <div className="text-4xl font-bold text-gray-900 tracking-tight">${prizePool.toLocaleString()}</div>
            </div>
            <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/5 transition-all group">
              <Users className="w-6 h-6 text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Active Ants</div>
              <div className="text-4xl font-bold text-gray-900 tracking-tight">{event.participantCount}</div>
            </div>
            <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/5 transition-all group">
              <Zap className="w-6 h-6 text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Days Remaining</div>
              <div className="text-4xl font-bold text-gray-900 tracking-tight">04</div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em] mb-10">Supporting the Colony</h3>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
               {event.sponsors.map((s, i) => (
                 <div key={i} className="flex flex-col items-center gap-2">
                   <div className="text-2xl font-bold text-gray-300 group-hover:text-gray-900 transition-colors uppercase tracking-tight">{s.name}</div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.tier}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE APPLE GRID (Submissions) ─── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900">The Colony Demos</h2>
            <div className="flex gap-2">
              <span className="px-4 py-1.5 bg-gray-50 text-gray-400 rounded-full text-xs font-bold uppercase tracking-widest">{submissions.length} Submissions</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[450px]">
            {submissions.map((p, i) => {
              // Create an "Apple Grid" pattern
              const isLarge = i === 0 || i === 5 || i === 8;
              const isWide = i === 2 || i === 7;
              
              const colSpan = isLarge ? "md:col-span-8" : isWide ? "md:col-span-6" : "md:col-span-4";
              const rowSpan = isLarge ? "md:row-span-2" : "md:row-span-1";

              return (
                <motion.div 
                  key={p.id}
                  whileHover={{ scale: 0.99 }}
                  className={`${colSpan} ${rowSpan} bg-gray-50 rounded-[2.5rem] overflow-hidden relative group border border-gray-100 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all`}
                >
                  <div className="absolute inset-0 opacity-20" style={{ background: p.gradient }} />
                  
                  <div className="absolute inset-0 p-10 flex flex-col justify-end">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: p.builder.gradient }}>
                        {getInitials(p.builder.name)}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{p.builder.name}</span>
                    </div>

                    <h3 className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors`}>{p.title}</h3>
                    <p className="text-gray-500 text-sm max-w-sm mb-6 line-clamp-2">{p.tagline}</p>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                      <button className="px-6 py-2 bg-white text-gray-900 rounded-full text-xs font-bold shadow-lg hover:bg-gray-50">
                        View Demo
                      </button>
                    </div>
                  </div>

                  <div className="absolute top-10 right-10">
                    <div className="w-12 h-12 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-xl">
                      <Play className="w-5 h-5 text-blue-600 fill-blue-600 ml-1" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-32 px-6 text-center bg-gray-900 text-white rounded-t-[4rem]">
        <div className="max-w-2xl mx-auto">
          <Shield className="w-12 h-12 text-blue-500 mx-auto mb-8" />
          <h2 className="text-4xl font-bold mb-6">Sponsor the Next Antathon</h2>
          <p className="text-white/50 text-lg mb-10 leading-relaxed">
            Support the most creative ants in the colony and get your tools in the hands of elite builders.
          </p>
          <button className="px-12 py-5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20">
            Contact for Sponsorship
          </button>
        </div>
      </section>
    </div>
  );
}
