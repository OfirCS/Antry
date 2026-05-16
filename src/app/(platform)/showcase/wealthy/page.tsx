"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowLeft,
  Play,
  Brain,
  LineChart,
  Shield,
  Zap,
  Layers,
  Database,
  Palette,
  Globe,
  Code2,
  Sparkles,
  TrendingUp,
  Wallet,
  Bot,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const techStack = [
  { name: "React", icon: Code2, color: "#61DAFB" },
  { name: "Next.js", icon: Globe, color: "#111111" },
  { name: "AI / LLM", icon: Brain, color: "#20F5A0" },
  { name: "Supabase", icon: Database, color: "#3ECF8E" },
  { name: "Tailwind CSS", icon: Palette, color: "#38BDF8" },
  { name: "TypeScript", icon: Layers, color: "#3178C6" },
];

const features = [
  {
    icon: Brain,
    title: "AI Financial Advisor",
    description:
      "Natural language conversations about your finances, powered by advanced LLMs that understand context and nuance.",
  },
  {
    icon: TrendingUp,
    title: "Smart Portfolio Insights",
    description:
      "Real-time analysis of investment performance with AI-driven recommendations and risk assessment.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description:
      "Bank-grade security with row-level policies, encrypted data storage, and zero-knowledge architecture.",
  },
  {
    icon: Zap,
    title: "Instant Intelligence",
    description:
      "Sub-second responses and real-time data processing. No waiting around for your financial insights.",
  },
  {
    icon: Wallet,
    title: "Unified Dashboard",
    description:
      "All your accounts, investments, and financial goals in one clean, intuitive interface.",
  },
  {
    icon: Bot,
    title: "Automated Actions",
    description:
      "Set up AI-powered rules for savings, investing, and budgeting that work while you sleep.",
  },
];

const techDeepDive = [
  {
    name: "React + Next.js",
    reason:
      "Server-side rendering for blazing fast initial loads, with client-side interactivity for a smooth financial dashboard experience.",
    icon: Globe,
  },
  {
    name: "AI / LLM Integration",
    reason:
      "Advanced language models fine-tuned for financial reasoning, enabling natural conversations about complex money topics.",
    icon: Brain,
  },
  {
    name: "Supabase",
    reason:
      "Real-time database with row-level security, auth, and edge functions. Perfect for sensitive financial data with instant sync.",
    icon: Database,
  },
  {
    name: "Tailwind CSS",
    reason:
      "Rapid UI iteration with a utility-first approach. Enables the clean, Wealthsimple-inspired minimal aesthetic.",
    icon: Palette,
  },
];

export default function WealthyShowcasePage() {
  return (
    <div style={{ background: "#F7F8FA" }} className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background - warm light */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #F7F8FA 0%, #F5F5F0 100%)",
          }}
        />
        {/* Subtle lime accent glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 70% 20%, rgba(32,245,160,0.1) 0%, transparent 70%)",
          }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative mx-auto max-w-[1240px] px-6 sm:px-10 pt-12 pb-20">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors mb-10"
              style={{ color: "#6B7280" }}
            >
              <ArrowLeft size={14} />
              Back to Showcase
            </Link>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Text content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-1.5">
                  <Sparkles size={14} style={{ color: "#9AB308" }} />
                  <span
                    className="text-[12px] font-semibold uppercase tracking-wider"
                    style={{ color: "#6B7F06" }}
                  >
                    Featured Project
                  </span>
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease }}
                className="text-[56px] sm:text-[72px] font-bold tracking-tight leading-[0.95] mb-5 font-display"
                style={{ color: "#111111" }}
              >
                Wealthy
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25, ease }}
                className="text-[20px] sm:text-[22px] leading-relaxed mb-8 max-w-lg"
                style={{ color: "#4B5563" }}
              >
                AI-powered financial intelligence, reimagined. A next-gen
                Wealthsimple-inspired platform for smarter money management.
              </motion.p>

              {/* Builder badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35, ease }}
                className="flex items-center gap-3 mb-8"
              >
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-[14px] font-bold font-display"
                  style={{ background: "#20F5A0", color: "#111111" }}
                >
                  OS
                </div>
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: "#111111" }}>
                    Ofir Sela
                  </p>
                  <p className="text-[12px]" style={{ color: "#6B7280" }}>Builder</p>
                </div>
              </motion.div>

              {/* Tech stack pills */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4, ease }}
                className="flex flex-wrap gap-2 mb-10"
              >
                {techStack.map((tech) => (
                  <span
                    key={tech.name}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-medium"
                    style={{ color: "#4B5563" }}
                  >
                    <tech.icon size={14} style={{ color: tech.color }} />
                    {tech.name}
                  </span>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45, ease }}
                className="flex flex-wrap gap-4"
              >
                <a
                  href="https://cap.so/s/9evpv4n3m2vpcgg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[14px] font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                  style={{ background: "#111111", color: "#ffffff" }}
                >
                  <Play size={16} fill="#ffffff" />
                  Watch Demo
                </a>
                <a
                  href="https://cap.so/s/9evpv4n3m2vpcgg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] bg-white px-7 py-3.5 text-[14px] font-semibold transition-all duration-200 hover:bg-[#F3F4F6] hover:border-[#BEBEBE]"
                  style={{ color: "#111111" }}
                >
                  View Source
                  <ArrowUpRight size={16} />
                </a>
              </motion.div>
            </div>

            {/* Right: Visual / mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease }}
              className="relative hidden lg:block"
            >
              <div
                className="relative overflow-hidden rounded-[24px] border p-8 backdrop-blur-sm"
                style={{
                  borderColor: "rgba(17,17,17,0.08)",
                  background:
                    "linear-gradient(180deg, rgba(24,24,24,0.98) 0%, rgba(17,17,17,0.96) 100%)",
                  boxShadow:
                    "0 24px 60px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                {/* Decorative elements */}
                <div
                  className="absolute top-6 right-6 h-24 w-24 rounded-full opacity-35 blur-2xl"
                  style={{ background: "#20F5A0" }}
                />
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
                  }}
                />
                <div className="space-y-4">
                  {/* Mock dashboard header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-md flex items-center justify-center text-[12px] font-bold font-display"
                        style={{ background: "#20F5A0", color: "#111111" }}
                      >
                        W
                      </div>
                      <span className="text-[15px] font-semibold text-white/90 font-display">
                        Wealthy
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div
                        className="h-7 w-16 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.12)" }}
                      />
                      <div
                        className="h-7 w-7 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.12)" }}
                      />
                    </div>
                  </div>

                  {/* Mock portfolio value */}
                  <div
                    className="mt-4 rounded-lg p-6"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.09)",
                    }}
                  >
                    <p className="mb-1 text-[12px] font-medium uppercase tracking-wider text-white/60">
                      Total Portfolio
                    </p>
                    <p className="text-[32px] font-bold text-white font-display tracking-tight">
                      $124,847
                      <span className="ml-2 text-[14px] font-medium" style={{ color: "#20F5A0" }}>
                        +12.4%
                      </span>
                    </p>
                  </div>

                  {/* Mock chart area */}
                  <div
                    className="rounded-lg p-5"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.09)",
                    }}
                  >
                    <div className="flex items-end gap-1.5 h-24">
                      {[40, 55, 45, 60, 52, 70, 65, 80, 75, 90, 85, 95].map(
                        (h, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 rounded-t-sm"
                            style={{
                              background:
                                i === 11
                                  ? "#20F5A0"
                                  : `rgba(32,245,160,${0.28 + i * 0.035})`,
                              height: `${h}%`,
                            }}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{
                              duration: 0.6,
                              delay: 0.8 + i * 0.05,
                              ease,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Mock AI chat bubble */}
                  <div
                    className="rounded-lg p-4"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.09)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#20F5A0" }}
                      >
                        <Brain size={14} color="#111111" />
                      </div>
                      <div>
                        <p className="text-[12px] leading-relaxed text-white/78">
                          Based on your spending patterns, I recommend
                          increasing your monthly TFSA contribution by $200 to
                          maximize tax-free growth.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video/Demo Embed Section */}
      <section className="mx-auto max-w-[1240px] px-6 sm:px-10 -mt-4 relative z-10 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease }}
        >
          <div className="rounded-[24px] border border-[#E5E7EB] bg-white overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
            {/* Video embed */}
            <div className="relative aspect-video bg-[#111111]">
              <iframe
                src="https://cap.so/embed/s/9evpv4n3m2vpcgg"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Wealthy Demo Video"
                style={{ border: "none" }}
              />
              {/* Fallback overlay in case embed doesn't load immediately */}
              <noscript>
                <div className="absolute inset-0 flex items-center justify-center bg-[#111111]">
                  <a
                    href="https://cap.so/s/9evpv4n3m2vpcgg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-[16px] font-semibold"
                    style={{ background: "#20F5A0", color: "#111111" }}
                  >
                    <Play size={20} fill="#111111" />
                    Play Demo
                  </a>
                </div>
              </noscript>
            </div>
            {/* Caption */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB]">
              <p className="text-[13px] text-[#6B7280]">
                Full product walkthrough of the Wealthy platform
              </p>
              <a
                href="https://cap.so/s/9evpv4n3m2vpcgg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#111111] hover:text-[#4B5563] transition-colors"
              >
                Open in Cap
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Project Overview */}
      <section className="mx-auto max-w-[1240px] px-6 sm:px-10 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease }}
          className="mb-16"
        >
          <h2
            className="text-[36px] sm:text-[42px] font-bold tracking-tight leading-tight mb-4 font-display"
            style={{ color: "#111111" }}
          >
            What is Wealthy?
          </h2>
          <p
            className="text-[17px] leading-relaxed max-w-2xl"
            style={{ color: "#4B5563" }}
          >
            Wealthy is an AI-powered financial intelligence platform inspired by
            Wealthsimple. It combines the clean, minimal design language of
            modern fintech with advanced AI capabilities to help users make
            smarter financial decisions through natural conversation.
          </p>
          <p
            className="text-[17px] leading-relaxed max-w-2xl mt-4"
            style={{ color: "#4B5563" }}
          >
            Think of it as having a brilliant financial advisor available 24/7 -
            one that understands your entire financial picture and can explain
            complex concepts in simple terms.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.08, ease }}
              className="group rounded-lg border border-[#E5E7EB] bg-white p-7 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#20F5A0]/30"
            >
              <div
                className="h-11 w-11 rounded-lg flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                style={{
                  background: "rgba(32,245,160,0.12)",
                }}
              >
                <feature.icon size={20} style={{ color: "#111111" }} />
              </div>
              <h3 className="text-[16px] font-semibold text-[#111111] mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-[14px] text-[#4B5563] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Screenshots / Mockup Section */}
      <section className="mx-auto max-w-[1240px] px-6 sm:px-10 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease }}
          className="mb-12"
        >
          <h2
            className="text-[36px] sm:text-[42px] font-bold tracking-tight leading-tight mb-4 font-display"
            style={{ color: "#111111" }}
          >
            Built with craft
          </h2>
          <p className="text-[17px] leading-relaxed max-w-xl" style={{ color: "#4B5563" }}>
            Every screen designed with intention. Clean interfaces that let your
            finances breathe.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Mockup card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease }}
            className="rounded-lg overflow-hidden border border-[#E5E7EB]"
          >
            <div
              className="h-72 sm:h-80 flex items-center justify-center relative"
              style={{
                background:
                  "linear-gradient(135deg, #111111 0%, #1a1a1a 100%)",
              }}
            >
              <div className="text-center px-8">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-4"
                  style={{ background: "rgba(32,245,160,0.15)" }}
                >
                  <LineChart size={16} style={{ color: "#20F5A0" }} />
                  <span
                    className="text-[13px] font-medium"
                    style={{ color: "#20F5A0" }}
                  >
                    Dashboard
                  </span>
                </div>
                <p className="text-white/50 text-[14px]">
                  Portfolio overview with real-time AI insights
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mockup card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
            className="rounded-lg overflow-hidden border border-[#E5E7EB]"
          >
            <div
              className="h-72 sm:h-80 flex items-center justify-center relative"
              style={{
                background:
                  "linear-gradient(135deg, #1a1a1a 0%, #2A2A2A 100%)",
              }}
            >
              <div className="text-center px-8">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-4"
                  style={{ background: "rgba(32,245,160,0.15)" }}
                >
                  <Brain size={16} style={{ color: "#20F5A0" }} />
                  <span
                    className="text-[13px] font-medium"
                    style={{ color: "#20F5A0" }}
                  >
                    AI Chat
                  </span>
                </div>
                <p className="text-white/50 text-[14px]">
                  Natural language financial conversations
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mockup card 3 - full width */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.15, ease }}
            className="sm:col-span-2 rounded-lg overflow-hidden border border-[#E5E7EB]"
          >
            <div
              className="h-56 sm:h-64 flex items-center justify-center relative"
              style={{
                background:
                  "linear-gradient(135deg, #111111 0%, #1a1a1a 50%, #2A2A2A 100%)",
              }}
            >
              <div className="text-center px-8">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-4"
                  style={{ background: "rgba(32,245,160,0.15)" }}
                >
                  <Wallet size={16} style={{ color: "#20F5A0" }} />
                  <span
                    className="text-[13px] font-medium"
                    style={{ color: "#20F5A0" }}
                  >
                    Smart Transfers
                  </span>
                </div>
                <p className="text-white/50 text-[14px]">
                  AI-optimized money movement between accounts
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Deep Dive */}
      <section
        className="py-24 mb-24"
        style={{
          background:
            "linear-gradient(180deg, #F7F8FA 0%, #ffffff 50%, #F7F8FA 100%)",
        }}
      >
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease }}
            className="mb-16"
          >
            <h2
              className="text-[36px] sm:text-[42px] font-bold tracking-tight leading-tight mb-4 font-display"
              style={{ color: "#111111" }}
            >
              Tech stack deep dive
            </h2>
            <p
              className="text-[17px] leading-relaxed max-w-xl"
              style={{ color: "#4B5563" }}
            >
              Every technology was chosen with purpose. Here is the reasoning
              behind each decision.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {techDeepDive.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.1, ease }}
                className="group rounded-lg border border-[#E5E7EB] bg-white p-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#20F5A0]/30"
              >
                <div className="flex items-start gap-5">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "#111111" }}
                  >
                    <tech.icon size={22} style={{ color: "#20F5A0" }} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#111111] mb-2 tracking-tight">
                      {tech.name}
                    </h3>
                    <p className="text-[14px] text-[#4B5563] leading-relaxed">
                      {tech.reason}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Builder Info */}
      <section className="mx-auto max-w-[1240px] px-6 sm:px-10 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease }}
        >
          <h2
            className="text-[36px] sm:text-[42px] font-bold tracking-tight leading-tight mb-12 font-display"
            style={{ color: "#111111" }}
          >
            Meet the builder
          </h2>

          <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-8 sm:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div
                className="h-20 w-20 rounded-lg flex items-center justify-center text-[24px] font-bold font-display shrink-0"
                style={{ background: "#20F5A0", color: "#111111" }}
              >
                OS
              </div>

              <div className="flex-1">
                <h3 className="text-[22px] font-bold text-[#111111] tracking-tight font-display mb-1">
                  Ofir Sela
                </h3>
                <p className="text-[14px] text-[#6B7280] mb-4">
                  Full-stack builder, AI enthusiast, and fintech explorer
                </p>
                <p className="text-[15px] text-[#4B5563] leading-relaxed mb-6 max-w-2xl">
                  Passionate about building products at the intersection of AI
                  and finance. Wealthy represents a vision for what personal
                  finance tools should look like in the AI era - intelligent,
                  accessible, and beautifully designed.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/builders/ofir-sela"
                    className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-[#2A2A2A]"
                  >
                    View Profile
                    <ArrowUpRight size={14} />
                  </Link>
                  <Link
                    href="/showcase"
                    className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#111111] transition-all duration-200 hover:border-[#D1D5DB] hover:bg-[#F3F4F6]"
                  >
                    More projects by Ofir
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-[1240px] px-6 sm:px-10 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease }}
        >
          <div
            className="rounded-[28px] relative overflow-hidden px-8 py-16 sm:px-16 sm:py-20 text-center"
            style={{ background: "#111111" }}
          >
            {/* Background accents */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 50% 60% at 50% 100%, rgba(32,245,160,0.1) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease }}
              >
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-6"
                >
                  <Sparkles size={14} style={{ color: "#20F5A0" }} />
                  <span
                    className="text-[12px] font-semibold uppercase tracking-wider"
                    style={{ color: "#20F5A0" }}
                  >
                    Start building
                  </span>
                </div>
              </motion.div>

              <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight leading-tight mb-4 font-display text-white">
                Inspired? Start building
                <br />
                on Antry
              </h2>
              <p className="text-[16px] text-white/50 mb-8 max-w-md mx-auto leading-relaxed">
                Join a community of builders shipping real products. Your
                showcase project could be next.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[14px] font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                  style={{ background: "#20F5A0", color: "#111111" }}
                >
                  Get started free
                  <ArrowUpRight size={16} />
                </Link>
                <Link
                  href="/showcase"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-white/10 hover:border-white/30"
                >
                  Browse showcase
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
