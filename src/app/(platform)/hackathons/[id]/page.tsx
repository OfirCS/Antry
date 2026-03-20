"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Users, Zap } from "lucide-react";
import { getAntathon, getAntathonProjects, getInitials } from "@/lib/mock-data";

const ease = [0.16, 1, 0.3, 1] as const;

export default function AntathonDetailPage() {
  const { id } = useParams() as { id: string };
  const event = getAntathon(id);
  const submissions = getAntathonProjects(id);
  const prizePool =
    event?.prizes.reduce(
      (s, p) => s + (parseInt(p.reward.replace(/[^0-9]/g, "")) || 0),
      0
    ) || 0;

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary px-8">
        <div className="text-center">
          <p className="text-text-tertiary text-[15px] mb-4 font-medium">
            This hackathon doesn&apos;t exist yet.
          </p>
          <Link
            href="/hackathons"
            className="text-accent font-semibold hover:underline text-[14px]"
          >
            All hackathons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-primary min-h-screen">
      {/* ── Hero ── */}
      <section className="relative pt-40 pb-24 px-8 bg-[#111] text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: event.gradient }}
        />
        <div className="absolute inset-0 bg-[#111]/80" />

        <div className="max-w-[900px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <Link
              href="/hackathons"
              className="inline-flex items-center gap-2 text-[12px] font-medium text-white/40 hover:text-white/70 transition-colors mb-12 uppercase tracking-widest"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All hackathons
            </Link>

            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/8 border border-white/10 rounded-full text-[11px] font-semibold uppercase tracking-wider text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {event.status}
              </span>
            </div>

            <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] tracking-[-0.03em] mb-6">
              {event.title}
            </h1>

            <p className="text-[17px] text-white/40 max-w-lg leading-relaxed">
              {event.theme}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b border-border-primary">
        <div className="max-w-[900px] mx-auto px-8 py-6 flex items-center justify-between flex-wrap gap-6">
          {[
            { icon: Trophy, label: "Prize pool", value: `$${prizePool.toLocaleString()}` },
            { icon: Users, label: "Builders", value: event.participantCount.toString() },
            { icon: Zap, label: "Submissions", value: event.submissionCount.toString() },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <stat.icon className="w-4 h-4 text-text-tertiary" />
              <span className="text-[13px] text-text-tertiary font-medium">
                {stat.label}
              </span>
              <span className="text-[15px] font-semibold text-text-primary">
                {stat.value}
              </span>
            </div>
          ))}
          <button className="ml-auto px-6 py-2.5 bg-accent text-white rounded-full font-semibold text-[13px] hover:opacity-90 transition-opacity active:scale-[0.97]">
            Join hackathon
          </button>
        </div>
      </section>

      {/* ── Submissions ── */}
      <section className="py-20 px-8">
        <div className="max-w-[900px] mx-auto">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-text-primary tracking-[-0.02em]">
              Submissions
            </h2>
            <span className="text-[12px] font-medium text-text-tertiary tracking-wide">
              {submissions.length} project{submissions.length !== 1 && "s"}
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-tertiary text-[14px]">
                No submissions yet. Be the first to submit.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {submissions.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease }}
                  className="group relative rounded-2xl overflow-hidden border border-border-primary/60 hover:border-border-primary bg-surface cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]"
                >
                  {/* Gradient top band */}
                  <div
                    className="h-28 w-full"
                    style={{ background: p.gradient }}
                  />

                  <div className="p-5">
                    {/* Builder */}
                    <div className="flex items-center gap-2.5 mb-4">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                        style={{ background: p.builder.gradient }}
                      >
                        {getInitials(p.builder.name)}
                      </div>
                      <span className="text-[12px] font-medium text-text-secondary truncate">
                        {p.builder.name}
                      </span>
                    </div>

                    {/* Project info */}
                    <h3 className="text-[16px] font-semibold text-text-primary mb-1.5 group-hover:text-accent transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-2">
                      {p.tagline}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Sponsors ── */}
      {event.sponsors.length > 0 && (
        <section className="pb-10 px-8">
          <div className="max-w-[900px] mx-auto">
            <div className="flex items-center gap-8 flex-wrap">
              <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
                Sponsors
              </span>
              <div className="h-4 w-px bg-border-primary" />
              {event.sponsors.map((s, i) => (
                <span
                  key={i}
                  className="text-[14px] font-medium text-text-secondary"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Sponsor CTA ── */}
      <section className="py-20 px-8 border-t border-border-primary">
        <div className="max-w-[900px] mx-auto flex items-center justify-between flex-wrap gap-6">
          <div>
            <h3 className="font-display text-[clamp(1.25rem,3vw,1.75rem)] text-text-primary tracking-[-0.02em] mb-1">
              Sponsor the next hackathon
            </h3>
            <p className="text-[14px] text-text-tertiary">
              Put your tools in the hands of top builders.
            </p>
          </div>
          <Link
            href="#"
            className="px-6 py-2.5 border border-border-primary rounded-full text-[13px] font-semibold text-text-primary hover:bg-surface transition-colors"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
