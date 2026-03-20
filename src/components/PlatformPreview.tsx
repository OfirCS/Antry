"use client";

import { motion } from "framer-motion";
import { Code2, Heart, ArrowUpRight, Trophy, Users } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

function MockProfileCard() {
  return (
    <div className="rounded-lg border border-border-primary bg-surface p-6 shadow-sm group hover:border-text-primary transition-colors duration-300">
      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-12 h-12 rounded bg-text-primary flex items-center justify-center text-[14px] font-bold text-background-primary shrink-0"
        >
          MC
        </div>
        <div>
          <h4 className="text-[16px] font-bold text-text-primary">Mara Chen</h4>
          <p className="text-[13px] text-text-secondary leading-snug mt-1">AI engineer building things that think.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {["Python", "LangChain", "TypeScript", "RAG"].map((s) => (
          <span key={s} className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary bg-background-secondary rounded px-2 py-1">
            {s}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border-primary">
        <div>
          <span className="text-[20px] font-bold text-text-primary">3</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mt-1">Ships</p>
        </div>
        <div>
          <span className="text-[20px] font-bold text-text-primary">2</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mt-1">Wins</p>
        </div>
        <div>
          <span className="text-[20px] font-bold text-text-primary">443</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mt-1">Signal</p>
        </div>
      </div>
    </div>
  );
}

function MockProjectCard({ title, desc, likes }: { title: string; desc: string; likes: number }) {
  return (
    <div className="rounded-lg border border-border-primary bg-surface p-5 shadow-sm hover:bg-background-tertiary transition-colors group">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="text-[14px] font-bold text-text-primary group-hover:text-text-primary">{title}</h4>
          <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">{desc}</p>
        </div>
        <span className="flex items-center gap-1.5 text-text-tertiary text-[11px] font-bold shrink-0">
          <Heart className="w-3 h-3" /> {likes}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 pt-4 border-t border-border-secondary">
        <span className="h-1 w-12 rounded-full bg-border-primary overflow-hidden">
          <span className="h-full bg-text-primary block" style={{ width: '70%' }} />
        </span>
      </div>
    </div>
  );
}

function MockDiscoverCard({ name, initials, tagline }: { name: string; initials: string; tagline: string }) {
  return (
    <div className="rounded-lg border border-border-primary bg-surface p-4 flex items-center gap-3 hover:border-text-primary transition-colors group cursor-pointer">
      <div
        className="w-8 h-8 rounded bg-background-secondary flex items-center justify-center text-[10px] font-bold text-text-primary group-hover:bg-text-primary group-hover:text-background-primary transition-colors"
      >
        {initials}
      </div>
      <div className="min-w-0">
        <h4 className="text-[12px] font-bold text-text-primary">{name}</h4>
        <p className="text-[11px] text-text-tertiary mt-0.5 truncate">{tagline}</p>
      </div>
    </div>
  );
}

export function PlatformPreview() {
  return (
    <section className="py-24 px-6 sm:px-8 border-y border-border-primary bg-background-secondary/30 overflow-hidden">
      <div className="max-w-[1240px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-20"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary">
            System Interface
          </span>
          <h2 className="font-display text-[clamp(2.3rem,5vw,4rem)] text-text-primary tracking-[-0.04em] leading-[0.95] mt-6">
            Work, beautifully indexed.
          </h2>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="grid grid-cols-1 md:grid-cols-12 gap-px bg-border-primary border border-border-primary overflow-hidden shadow-2xl shadow-black/5"
        >
          {/* Profile card - large */}
          <div className="md:col-span-5 bg-surface p-8 flex flex-col justify-center">
            <MockProfileCard />
            <p className="mt-8 text-[14px] leading-relaxed text-text-secondary">
              Builder profiles are normalized into a searchable retrieval layer, optimized for intent-based matching.
            </p>
          </div>

          {/* Right column */}
          <div className="md:col-span-7 bg-background-tertiary/20 flex flex-col gap-px">
            {/* Project cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-primary">
              <div className="bg-surface p-6">
                <MockProjectCard title="Sentinel" desc="AI code reviewer that catches what linters miss." likes={142} />
              </div>
              <div className="bg-surface p-6">
                <MockProjectCard title="Flowstate" desc="Collaborative whiteboard that thinks with you." likes={98} />
              </div>
            </div>

            {/* Discover preview */}
            <div className="bg-surface p-8 flex-1">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary">
                  Discovery Feed
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-text-tertiary" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MockDiscoverCard name="Jake Torres" initials="JT" tagline="Full-stack builder who ships fast" />
                <MockDiscoverCard name="Aisha Patel" initials="AP" tagline="Design engineer bridging art and code" />
                <MockDiscoverCard name="Sofia Rivera" initials="SR" tagline="Data scientist focusing on ML ops" />
                <MockDiscoverCard name="Leo Kim" initials="LK" tagline="Backend expert specialized in Go" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
