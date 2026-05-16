"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Users, Trophy } from "lucide-react";
import { FingerprintGlyph } from "./BuilderFingerprint";
import type { Brief } from "@/lib/receipts/types";

const ease = [0.16, 1, 0.3, 1] as const;

const DIFFICULTY_BADGE: Record<
  Brief["difficulty"],
  { label: string; bg: string; color: string }
> = {
  intro: { label: "Intro", bg: "rgba(99,102,241,0.16)", color: "#3730A3" },
  mid: { label: "Mid", bg: "rgba(14,165,233,0.16)", color: "#075985" },
  senior: { label: "Senior", bg: "rgba(32,245,160,0.30)", color: "#0A0A0A" },
  staff: { label: "Staff", bg: "#0A0A0A", color: "#20F5A0" },
};

function formatTime(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${(m / 60).toFixed(0)}h`;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return n.toString();
}

export function BriefCard({ brief, index }: { brief: Brief; index: number }) {
  const diff = DIFFICULTY_BADGE[brief.difficulty];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.06, duration: 0.45, ease }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-md bg-white transition-all duration-200"
      style={{
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px -18px rgba(0,0,0,0.18)";
        e.currentTarget.style.borderColor = "#D1D5DB";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 0 rgba(0,0,0,0.03)";
        e.currentTarget.style.borderColor = "#E5E7EB";
      }}
    >
      <div className="h-px bg-[#E5E7EB]" />

      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded"
                style={{ background: diff.bg, color: diff.color }}
              >
                {diff.label}
              </span>
              {brief.sponsor_label && (
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: brief.company.sponsor_color }}
                >
                  {brief.sponsor_label}
                </span>
              )}
            </div>
            <Link href={`/briefs/${brief.slug}`}>
              <h3 className="text-[18px] sm:text-[19px] font-bold tracking-[-0.015em] text-black leading-[1.3] group-hover:text-black">
                {brief.title}
              </h3>
            </Link>
            <p className="mt-2 text-[14px] leading-[1.55] text-gray-600 line-clamp-2">
              {brief.tagline}
            </p>
          </div>

          {brief.ideal_fingerprint && (
            <div className="shrink-0 -mr-2 -mt-2 opacity-90">
              <FingerprintGlyph
                fingerprint={brief.ideal_fingerprint}
                size={96}
                primaryColor={brief.company.sponsor_color}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-gray-500 pt-4 border-t border-gray-100">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {formatTime(brief.time_cap_seconds)} cap
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="font-mono">≤{formatTokens(brief.token_cap)}</span> tokens
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            {brief.attempts_count} attempts
          </span>
          {brief.median_score !== null && (
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="w-3 h-3" />
              median {brief.median_score}
            </span>
          )}
          <Link
            href={`/briefs/${brief.slug}`}
            className="ml-auto inline-flex items-center gap-1 text-[13px] font-semibold text-black hover:gap-2 transition-all"
          >
            Open <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
