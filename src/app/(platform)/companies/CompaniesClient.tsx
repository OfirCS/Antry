"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Users,
  Trophy,
  Eye,
  Zap,
  Search,
  Sparkles,
  FileText,
  ShieldCheck,
  Copy,
  Layers,
  Heart,
  Code2,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import { WaitlistForm } from "@/components/WaitlistForm";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

interface BuilderPreview {
  id: string;
  username: string;
  name: string;
  tagline: string;
  skills: string[];
  gradient: string;
  projectCount: number;
  totalLikes: number;
}

interface PlatformStats {
  builderCount: number;
  projectCount: number;
  hackathonCount: number;
  totalLikes: number;
}

/* ── Mock builder profile card (used in "How Antry is Different") ─── */
function MockBuilderProfile() {
  return (
    <div
      className="rounded-2xl p-6 w-full max-w-[380px]"
      style={{
        background: "#FFFFFF",
        border: "1px solid #EBEBEB",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-[13px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}
        >
          MR
        </div>
        <div>
          <div className="text-[15px] font-bold" style={{ color: "#111111" }}>Maya Rodriguez</div>
          <div className="text-[12px]" style={{ color: "#737373" }}>Full-stack AI builder</div>
        </div>
      </div>
      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {["React", "Python", "LangChain", "Next.js"].map((s) => (
          <span
            key={s}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
            style={{ background: "#F5F5F5", color: "#525252" }}
          >
            {s}
          </span>
        ))}
      </div>
      {/* Project preview */}
      <div
        className="rounded-xl p-3 mb-3"
        style={{ background: "#FAFAF7", border: "1px solid #F5F5F5" }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "rgba(198,241,53,0.15)" }}
          >
            <Layers className="w-3.5 h-3.5" style={{ color: "#111111" }} />
          </div>
          <span className="text-[13px] font-semibold" style={{ color: "#111111" }}>AgentFlow</span>
          <span
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(198,241,53,0.15)", color: "#525252" }}
          >
            LIVE DEMO
          </span>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: "#737373" }}>
          Multi-agent orchestration framework. Built in 12 days.
        </p>
      </div>
      {/* Stats */}
      <div
        className="flex items-center gap-4 pt-3 text-[12px] font-medium"
        style={{ borderTop: "1px solid #F5F5F5", color: "#737373" }}
      >
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> 7 projects
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5" /> 142 likes
        </span>
        <span className="flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5" /> 2 wins
        </span>
      </div>
    </div>
  );
}

/* ── Mock Scout AI search card ─── */
function MockScoutSearch() {
  return (
    <div
      className="rounded-2xl p-6 w-full max-w-[380px]"
      style={{
        background: "#FFFFFF",
        border: "1px solid #EBEBEB",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      {/* Search bar */}
      <div
        className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4"
        style={{ background: "#FAFAF7", border: "1px solid #EBEBEB" }}
      >
        <Sparkles className="w-4 h-4" style={{ color: "#C6F135" }} />
        <span className="text-[13px]" style={{ color: "#525252" }}>
          &ldquo;React + AI builders who ship fast&rdquo;
        </span>
      </div>
      {/* Results */}
      <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#A3A3A3" }}>
        Scout found 3 matches
      </div>
      {[
        { name: "Maya R.", match: "97%", skills: "React, LangChain" },
        { name: "James K.", match: "94%", skills: "Next.js, GPT-4" },
        { name: "Priya S.", match: "91%", skills: "React, Python" },
      ].map((r, i) => (
        <div
          key={r.name}
          className="flex items-center gap-3 py-2.5"
          style={{ borderTop: i > 0 ? "1px solid #F5F5F5" : "none" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
            style={{
              background: i === 0
                ? "linear-gradient(135deg, #8B5CF6, #6366F1)"
                : i === 1
                ? "linear-gradient(135deg, #F59E0B, #F97316)"
                : "linear-gradient(135deg, #34D399, #14B8A6)",
            }}
          >
            {r.name.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold" style={{ color: "#111111" }}>{r.name}</div>
            <div className="text-[11px]" style={{ color: "#737373" }}>{r.skills}</div>
          </div>
          <div
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(198,241,53,0.15)", color: "#525252" }}
          >
            {r.match}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Mock hackathon card ─── */
function MockHackathonCard() {
  return (
    <div
      className="rounded-2xl p-6 w-full max-w-[380px]"
      style={{
        background: "#FFFFFF",
        border: "1px solid #EBEBEB",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(198,241,53,0.15)" }}
        >
          <Trophy className="w-4 h-4" style={{ color: "#111111" }} />
        </div>
        <div>
          <div className="text-[14px] font-bold" style={{ color: "#111111" }}>AI Agents Antathon</div>
          <div className="text-[11px]" style={{ color: "#737373" }}>48 hours &middot; 124 participants</div>
        </div>
      </div>
      {/* Winners */}
      <div
        className="text-[11px] font-bold uppercase tracking-wider mb-2"
        style={{ color: "#A3A3A3" }}
      >
        Top performers
      </div>
      {[
        { rank: "1st", name: "Maya R.", project: "AgentFlow", color: "#C6F135" },
        { rank: "2nd", name: "James K.", project: "ChatOps", color: "#E5E5E5" },
        { rank: "3rd", name: "Alex T.", project: "DevAssist", color: "#F5D0A9" },
      ].map((w, i) => (
        <div
          key={w.name}
          className="flex items-center gap-3 py-2"
          style={{ borderTop: i > 0 ? "1px solid #F5F5F5" : "none" }}
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
            style={{ background: w.color, color: "#111111" }}
          >
            {w.rank}
          </div>
          <div className="flex-1">
            <span className="text-[13px] font-semibold" style={{ color: "#111111" }}>{w.name}</span>
            <span className="text-[12px] ml-2" style={{ color: "#737373" }}>{w.project}</span>
          </div>
        </div>
      ))}
      {/* Footer */}
      <div
        className="mt-3 pt-3 text-[12px] flex items-center gap-2"
        style={{ borderTop: "1px solid #F5F5F5", color: "#737373" }}
      >
        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#C6F135" }} />
        <span>All projects have live demos</span>
      </div>
    </div>
  );
}

export default function CompaniesClient({
  stats,
}: {
  stats: PlatformStats;
  builders: BuilderPreview[];
}) {
  const heroSignals = [
    { icon: Users, value: stats.builderCount, suffix: "+", label: "builders" },
    { icon: Layers, value: stats.projectCount, suffix: "+", label: "live demos" },
    { icon: Trophy, value: stats.hackathonCount, suffix: "", label: "events tracked" },
  ];

  const heroProof = [
    { icon: CheckCircle2, label: "Live demos" },
    { icon: Code2, label: "Stack visible" },
    { icon: Sparkles, label: "Scout match" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
      {/* ═══════════════════════════════════════════════════════
          SECTION 1: HERO — Hire builders who actually ship
          ═══════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-24 px-6 overflow-hidden" style={{ background: "#FAFAF7" }}>
        {/* Soft background orbs */}
        <div
          className="absolute top-[-120px] left-[-80px] w-[600px] h-[600px] rounded-full opacity-40 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(198,241,53,0.15) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-80px] right-[-60px] w-[500px] h-[500px] rounded-full opacity-30 blur-[100px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(198,241,53,0.08) 0%, transparent 70%)" }}
        />

        <div className="max-w-[980px] mx-auto text-center relative z-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, ease }}
          >
            <h1
              className="font-display leading-[0.95] tracking-[-0.035em] mb-6"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                color: "#111111",
              }}
            >
              Hire builders who
              <br />
              actually{" "}
              <span
                className="relative inline-block"
              >
                <span className="relative z-10">ship</span>
                <span
                  className="absolute bottom-[0.08em] left-[-0.05em] right-[-0.05em] h-[0.32em] rounded-sm z-0"
                  style={{ background: "rgba(198,241,53,0.45)" }}
                />
              </span>
            </h1>

            <p
              className="max-w-[660px] mx-auto leading-relaxed mb-6"
              style={{ fontSize: "18px", color: "#525252" }}
            >
              Search live demos, inspect stack, and shortlist builders fast.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
              {heroProof.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-semibold"
                  style={{
                    borderColor: "rgba(17, 17, 17, 0.08)",
                    background: "rgba(255,255,255,0.85)",
                    color: "#525252",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  <item.icon className="w-3.5 h-3.5" style={{ color: "#111111" }} />
                  {item.label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <Link
                href="/builders"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-[15px] font-bold transition-all duration-200 hover:-translate-y-[1px]"
                style={{
                  background: "#C6F135",
                  color: "#111111",
                  boxShadow: "0 0 20px rgba(198,241,53,0.25), 0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                Browse builders
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/agent"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-[15px] font-semibold transition-all duration-200 hover:-translate-y-[1px]"
                style={{
                  background: "#FFFFFF",
                  color: "#111111",
                  border: "1.5px solid #D4D4D4",
                }}
              >
                Use Scout search
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              {heroSignals.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.3 + index * 0.08, ease }}
                  className="rounded-2xl p-5 text-left"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(17,17,17,0.06)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: "rgba(198,241,53,0.15)" }}
                  >
                    <item.icon className="w-4.5 h-4.5" style={{ color: "#111111" }} />
                  </div>
                  <div className="text-[24px] font-display font-bold tracking-[-0.03em]" style={{ color: "#111111" }}>
                    {item.value.toLocaleString()}
                    {item.suffix}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "#525252" }}>
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <p className="mt-5 text-[13px] font-medium" style={{ color: "#737373" }}>
              Hiring? Email{" "}
              <a href="mailto:sponsors@antry.dev" className="underline" style={{ color: "#111111" }}>
                sponsors@antry.dev
              </a>
              .
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: THE PROBLEM — Resumes don't tell the real story
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: "#FFFFFF" }}>
        <div className="max-w-[900px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-14"
          >
            <span
              className="text-[12px] font-bold uppercase tracking-widest"
              style={{ color: "#A3A3A3" }}
            >
              The Problem
            </span>
            <h2
              className="font-display mt-3 tracking-[-0.03em]"
              style={{
                fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)",
                color: "#111111",
              }}
            >
              Hiring hides the work
            </h2>
            <p
              className="mt-4 max-w-[520px] mx-auto"
              style={{ fontSize: "16px", color: "#737373" }}
            >
              Resumes and keyword scans miss real shipping signal.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Keyword-stuffed profiles",
                desc: "Tool lists look identical and proof stays hidden.",
              },
              {
                icon: ShieldCheck,
                title: "No way to verify skills",
                desc: "References are slow and stale links do not help.",
              },
              {
                icon: Copy,
                title: "Same candidates everywhere",
                desc: "The best builders are usually shipping, not refreshing LinkedIn.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease }}
                className="p-8 rounded-2xl text-center"
                style={{
                  background: "#FAFAF7",
                  border: "1px solid #EBEBEB",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-5"
                  style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
                >
                  <item.icon className="w-5 h-5" style={{ color: "#737373" }} />
                </div>
                <h3
                  className="text-[16px] font-bold mb-2"
                  style={{ color: "#111111" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "#525252" }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: HOW ANTRY IS DIFFERENT — Alternating mockups
          ═══════════════════════════════════════════════════════ */}
      <section className="py-22 px-6" style={{ background: "#FAFAF7" }}>
        <div className="max-w-[1000px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-20"
          >
            <span
              className="text-[12px] font-bold uppercase tracking-widest"
              style={{ color: "#C6F135" }}
            >
              How Antry is Different
            </span>
            <h2
              className="font-display mt-3 tracking-[-0.03em]"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                color: "#111111",
              }}
            >
              Open proof before the call
            </h2>
          </motion.div>

          {/* Row 1: Real portfolios */}
          <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
            <motion.div
              className="flex-1"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4"
                style={{ background: "rgba(198,241,53,0.12)", color: "#525252" }}
              >
                <Layers className="w-3 h-3" />
                Builder Profiles
              </div>
              <h3
                className="font-display text-[24px] md:text-[28px] tracking-[-0.02em] mb-4 leading-tight"
                style={{ color: "#111111" }}
              >
                Open the build, not a PDF
              </h3>
              <p
                className="text-[15px] leading-relaxed mb-4"
                style={{ color: "#525252" }}
              >
                Open demos, scan stack, and judge quality quickly.
              </p>
            </motion.div>
            <motion.div
              className="flex-shrink-0"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
            >
              <MockBuilderProfile />
            </motion.div>
          </div>

          {/* Row 2: AI-powered search (reversed) */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 mb-24">
            <motion.div
              className="flex-1"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4"
                style={{ background: "rgba(198,241,53,0.12)", color: "#525252" }}
              >
                <Sparkles className="w-3 h-3" />
                AI Scout
              </div>
              <h3
                className="font-display text-[24px] md:text-[28px] tracking-[-0.02em] mb-4 leading-tight"
                style={{ color: "#111111" }}
              >
                Describe the builder you need
              </h3>
              <p
                className="text-[15px] leading-relaxed mb-4"
                style={{ color: "#525252" }}
              >
                Use plain English and Scout returns the closest matches.
              </p>
            </motion.div>
            <motion.div
              className="flex-shrink-0"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
            >
              <MockScoutSearch />
            </motion.div>
          </div>

          {/* Row 3: Hackathon-tested */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              className="flex-1"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4"
                style={{ background: "rgba(198,241,53,0.12)", color: "#525252" }}
              >
                <Trophy className="w-3 h-3" />
                Antathons
              </div>
              <h3
                className="font-display text-[24px] md:text-[28px] tracking-[-0.02em] mb-4 leading-tight"
                style={{ color: "#111111" }}
              >
                Pressure-tested builders
              </h3>
              <p
                className="text-[15px] leading-relaxed mb-4"
                style={{ color: "#525252" }}
              >
                Hackathon results show who ships fast and lands polished work.
              </p>
            </motion.div>
            <motion.div
              className="flex-shrink-0"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
            >
              <MockHackathonCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4: FOR RECRUITERS — Value props
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: "#FFFFFF" }}>
        <div className="max-w-[1000px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-14"
          >
            <span
              className="text-[12px] font-bold uppercase tracking-widest"
              style={{ color: "#C6F135" }}
            >
              For Recruiters
            </span>
            <h2
              className="font-display mt-3 tracking-[-0.03em]"
              style={{
                fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)",
                color: "#111111",
              }}
            >
              What you can verify fast
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: CheckCircle2,
                title: "Verified shipped work",
                desc: "Open work instead of reading bullets.",
                accent: "#C6F135",
              },
              {
                icon: Sparkles,
                title: "AI Scout search",
                desc: "Describe the role and get ranked matches.",
                accent: "#C6F135",
              },
              {
                icon: Trophy,
                title: "Hackathon track records",
                desc: "See pressure-tested results with receipts.",
                accent: "#C6F135",
              },
              {
                icon: Wrench,
                title: "Stack decisions visible",
                desc: "Filter by stack and scan real strengths.",
                accent: "#C6F135",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="group p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "#FAFAF7",
                  border: "1px solid #EBEBEB",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "rgba(198,241,53,0.12)" }}
                >
                  <item.icon className="w-5 h-5" style={{ color: "#111111" }} />
                </div>
                <h3
                  className="text-[17px] font-bold mb-2 tracking-tight"
                  style={{ color: "#111111" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "#525252" }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5: HOW IT WORKS — 3 Steps
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: "#F5F5F5" }}>
        <div className="max-w-[900px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16"
          >
            <span
              className="text-[12px] font-bold uppercase tracking-widest"
              style={{ color: "#A3A3A3" }}
            >
              Workflow
            </span>
            <h2
              className="font-display mt-3 tracking-[-0.03em]"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 2.75rem)",
                color: "#111111",
              }}
            >
              Shortlist flow
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Search,
                title: "Search",
                desc: "Use Scout or filters to find the right slice.",
              },
              {
                step: "02",
                icon: Eye,
                title: "Review portfolios",
                desc: "Open demos and scan build history.",
              },
              {
                step: "03",
                icon: Zap,
                title: "Connect",
                desc: "Reach out or sponsor a hackathon.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease }}
                className="relative p-7 rounded-2xl"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EBEBEB",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                }}
              >
                {/* Step number watermark */}
                <div
                  className="absolute top-6 right-6 text-[52px] font-display font-bold leading-none"
                  style={{ color: "rgba(198,241,53,0.12)" }}
                >
                  {item.step}
                </div>

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(198,241,53,0.12)" }}
                >
                  <item.icon className="w-5 h-5" style={{ color: "#111111" }} />
                </div>
                <h3
                  className="text-[18px] font-bold mb-3 tracking-tight"
                  style={{ color: "#111111" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "#525252" }}
                >
                  {item.desc}
                </p>

                {/* Connector arrow for desktop */}
                {i < 2 && (
                  <div
                    className="hidden md:flex absolute top-1/2 -right-[18px] -translate-y-1/2 z-10 w-8 h-8 rounded-full items-center justify-center"
                    style={{ background: "#F5F5F5" }}
                  >
                    <ArrowRight className="w-4 h-4" style={{ color: "#A3A3A3" }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6: CTA — Start finding talent today
          ═══════════════════════════════════════════════════════ */}
      <section id="join" className="py-24 px-6" style={{ background: "#FAFAF7" }}>
        <div className="max-w-[580px] mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <h2
              className="font-display tracking-[-0.03em] mb-5 leading-[0.95]"
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: "#111111",
              }}
            >
              Open the directory
            </h2>
            <p
              className="text-[16px] leading-relaxed mb-10"
              style={{ color: "#525252" }}
            >
              Get early access to builders, Scout, and sponsorship.
            </p>

            <WaitlistForm />

            <p className="text-[13px] mt-6" style={{ color: "#737373" }}>
              Free for early companies. Email{" "}
              <a
                href="mailto:sponsors@antry.dev"
                className="underline transition-colors"
                style={{ color: "#111111" }}
              >
                sponsors@antry.dev
              </a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
