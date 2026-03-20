"use client";

import { motion } from "framer-motion";
import { Code2, Heart, ArrowUpRight, Trophy, Users } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

function MockProfileCard() {
  return (
    <div className="rounded-2xl border border-border-primary/60 bg-surface p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)]">
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-[14px] font-bold text-white shrink-0"
          style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
        >
          MC
        </div>
        <div>
          <h4 className="text-[16px] font-semibold text-text-primary">Mara Chen</h4>
          <p className="text-[13px] text-text-secondary">AI engineer building things that think</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {["Python", "LangChain", "TypeScript", "RAG"].map((s) => (
          <span key={s} className="text-[11px] font-medium text-text-tertiary bg-background-secondary rounded-full px-2.5 py-0.5">
            {s}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border-secondary">
        <div className="text-center">
          <span className="text-[18px] font-semibold text-text-primary">3</span>
          <p className="text-[11px] text-text-tertiary">Projects</p>
        </div>
        <div className="text-center">
          <span className="text-[18px] font-semibold text-text-primary">2</span>
          <p className="text-[11px] text-text-tertiary">Antathons</p>
        </div>
        <div className="text-center">
          <span className="text-[18px] font-semibold text-text-primary">443</span>
          <p className="text-[11px] text-text-tertiary">Likes</p>
        </div>
      </div>
    </div>
  );
}

function MockProjectCard() {
  return (
    <div className="rounded-2xl border border-border-primary/60 bg-surface p-5 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="text-[15px] font-semibold text-text-primary">Sentinel</h4>
          <p className="text-[12px] text-text-secondary mt-0.5">AI code reviewer that catches what linters miss</p>
        </div>
        <span className="flex items-center gap-1 text-text-tertiary text-[12px] shrink-0">
          <Heart className="w-3 h-3" /> 142
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border-secondary">
        {["Python", "LangChain", "Claude API"].map((t) => (
          <span key={t} className="text-[10px] font-medium text-text-tertiary">{t}</span>
        ))}
      </div>
    </div>
  );
}

function MockDiscoverCard({ name, initials, gradient, tagline }: { name: string; initials: string; gradient: string; tagline: string }) {
  return (
    <div className="rounded-xl border border-border-primary/50 bg-surface p-4 flex items-start gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ background: gradient }}
      >
        {initials}
      </div>
      <div className="min-w-0">
        <h4 className="text-[13px] font-semibold text-text-primary">{name}</h4>
        <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1">{tagline}</p>
      </div>
    </div>
  );
}

export function PlatformPreview() {
  return (
    <section className="py-32 px-8 bg-background-secondary overflow-hidden">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-16"
        >
          <span className="text-[12px] font-semibold text-accent uppercase tracking-wider">
            Platform preview
          </span>
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-text-primary tracking-[-0.025em] mt-4">
            Your work, beautifully showcased.
          </h2>
          <p className="text-[16px] text-text-secondary mt-4 max-w-[480px] mx-auto leading-relaxed">
            Builder profiles, project portfolios, and hackathon results — all in one place.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 max-w-[960px] mx-auto"
        >
          {/* Profile card - large */}
          <div className="md:col-span-5">
            <MockProfileCard />
          </div>

          {/* Right column */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* Project cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MockProjectCard />
              <div className="rounded-2xl border border-border-primary/60 bg-surface p-5 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-[15px] font-semibold text-text-primary">Flowstate</h4>
                    <p className="text-[12px] text-text-secondary mt-0.5">Collaborative whiteboard that thinks with you</p>
                  </div>
                  <span className="flex items-center gap-1 text-text-tertiary text-[12px] shrink-0">
                    <Heart className="w-3 h-3" /> 98
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border-secondary">
                  {["Next.js", "WebSockets", "Canvas API"].map((t) => (
                    <span key={t} className="text-[10px] font-medium text-text-tertiary">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Discover preview */}
            <div className="rounded-2xl border border-border-primary/60 bg-surface p-4 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider">
                  Discover builders
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-text-tertiary" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <MockDiscoverCard name="Jake Torres" initials="JT" gradient="linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%)" tagline="Full-stack builder who ships fast" />
                <MockDiscoverCard name="Aisha Patel" initials="AP" gradient="linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)" tagline="Design engineer bridging art and code" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
