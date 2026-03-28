"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Layers,
  Trophy,
  Users,
  BarChart3,
  Shield,
  Zap,
  Sparkles,
  Search,
} from "lucide-react";
import { AgentHome } from "@/components/AgentHome";
import { Nav } from "@/components/Nav";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SocialProofBar } from "@/components/SocialProofBar";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const heroStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const heroChild = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

/* ── Stagger variants for How It Works cards ─────────────── */
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const staggerCard = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

/* ── Stagger variants for Features grid ──────────────────── */
const featureStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const featureCard = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const steps = [
  {
    num: "01",
    title: "Create your profile",
    desc: "Connect GitHub, ship projects, and let your work speak. No resumes, no fluff.",
    bg: "bg-bg-sage",
  },
  {
    num: "02",
    title: "Build & compete",
    desc: "Join hackathons, form teams, and create proof of work that recruiters actually care about.",
    bg: "bg-bg-lavender",
  },
  {
    num: "03",
    title: "Get discovered",
    desc: "Our AI scout matches you with opportunities based on what you've built, not what you claim.",
    bg: "bg-bg-sky",
  },
];

const features = [
  {
    icon: Users,
    title: "Builder Profiles",
    desc: "Your real identity isn't a PDF. It's a live stream of shipped work and tech stack decisions.",
    bg: "bg-bg-cream",
  },
  {
    icon: Trophy,
    title: "Hackathons",
    desc: "Events that create teams and proof, not just weekend graveyard repos.",
    bg: "bg-bg-sage",
  },
  {
    icon: Bot,
    title: "AI Scout",
    desc: "Natural language search for recruiters to find talent by output, taste, and build history.",
    bg: "bg-bg-lavender",
  },
  {
    icon: Layers,
    title: "Stack Decisions",
    desc: "Track every technology choice. Show depth and reasoning behind your architecture.",
    bg: "bg-bg-sky",
  },
];

const stats = [
  { value: "1,200+", label: "Stack decisions tracked", icon: BarChart3 },
  { value: "540+", label: "Verified builders", icon: Shield },
  { value: "24", label: "Agent hackathons", icon: Zap },
];

/* ── Animated Counter Component ────────────────────────────── */
function AnimatedNumber({ value, inView }: { value: string; inView: boolean }) {
  const numericPart = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const suffix = value.replace(/[0-9,]/g, "");
  const hasComma = value.includes(",");
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let startTime: number;
    const duration = 1800;

    function animate(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * numericPart));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [inView, numericPart]);

  const formatted = hasComma ? display.toLocaleString() : display.toString();

  return (
    <span>
      {formatted}
      {suffix}
    </span>
  );
}

/* ── Step Number Counter ───────────────────────────────────── */
function StepNumber({ num, inView }: { num: string; inView: boolean }) {
  const target = parseInt(num, 10);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let startTime: number;
    const duration = 800;

    function animate(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    const timer = setTimeout(() => requestAnimationFrame(animate), 200);
    return () => clearTimeout(timer);
  }, [inView, target]);

  return <span>{display.toString().padStart(2, "0")}</span>;
}

/* ── Floating Decorative Dot ──────────────────────────────── */
function FloatingDot({
  size,
  color,
  top,
  left,
  delay,
  duration,
}: {
  size: number;
  color: string;
  top: string;
  left: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        top,
        left,
        filter: "blur(1px)",
      }}
      animate={{
        y: [0, -18, 0, 12, 0],
        x: [0, 8, -6, 4, 0],
        opacity: [0.3, 0.6, 0.3, 0.5, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function Home() {
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);

  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-80px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });

  return (
    <>
      <Nav />
      <main>
        {/* ── Hero ───────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ background: "#111111" }}>
          {/* Lime glow */}
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(198,241,53,0.12) 0%, transparent 60%)" }} />
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 50% at 80% 80%, rgba(198,241,53,0.06) 0%, transparent 50%)" }} />

          <div className="relative z-10 mx-auto max-w-[1240px] px-5 pt-20 pb-14 sm:px-10 sm:pt-24 sm:pb-20">
            <motion.div initial="hidden" animate="visible" variants={heroStagger}>
              {/* Two-column: text left, live terminal right */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-10 lg:gap-12 items-start">
                {/* Left: copy */}
                <div>
                  <motion.div variants={heroChild} className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4" style={{ background: "rgba(198,241,53,0.12)", border: "1px solid rgba(198,241,53,0.2)" }}>
                    <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: "#C6F135" }} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <span className="text-[12px] font-semibold tracking-wide" style={{ color: "#C6F135" }}>Now open for builders</span>
                  </motion.div>

                  <motion.h1 variants={heroChild} className="font-display text-[clamp(2rem,4.5vw,3.2rem)] font-bold leading-[1.15] tracking-[-0.03em]">
                    <span className="text-white">Solo AI builders </span>
                    <span style={{ color: "#C6F135" }}>deserve a stage.</span>
                  </motion.h1>

                  <motion.p variants={heroChild} className="mt-5 max-w-[420px] text-[16px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Ship projects, build your proof of work, and get discovered by companies that hire on output — not resumes.
                  </motion.p>

                  <motion.div variants={heroChild} className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
                    <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 sm:py-3 text-[15px] font-semibold transition-all duration-200 hover:scale-[1.02] min-h-[48px]" style={{ background: "#C6F135", color: "#111" }}>
                      Start building <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/discover" className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 sm:py-3 text-[15px] font-semibold transition-all duration-200 hover:scale-[1.02] min-h-[48px]" style={{ color: "#fff", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)" }}>
                      Explore projects
                    </Link>
                  </motion.div>

                  {/* Stats row */}
                  <motion.div variants={heroChild} className="mt-8 sm:mt-10 flex gap-6 sm:gap-8">
                    {[
                      { value: "540+", label: "Builders" },
                      { value: "12", label: "Projects shipped" },
                      { value: "3", label: "Hackathons" },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p className="text-[18px] sm:text-[22px] font-bold text-white tracking-tight">{stat.value}</p>
                        <p className="text-[11px] sm:text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{stat.label}</p>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Right: mock terminal showing Scout in action */}
                <motion.div variants={heroChild} className="hidden lg:block">
                  <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
                    {/* Terminal bar */}
                    <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
                      </div>
                      <span className="text-[11px] font-mono ml-2" style={{ color: "rgba(255,255,255,0.3)" }}>scout — antry network</span>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Query */}
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 shrink-0" style={{ color: "#C6F135" }} />
                        <span className="text-[14px] font-medium text-white">Find AI builders who ship fast</span>
                      </div>

                      {/* Results */}
                      <div className="space-y-2.5 pt-2">
                        {[
                          { name: "Mara Chen", role: "AI Engineer", match: "97%", skills: ["Python", "LangChain", "RAG"] },
                          { name: "Sofia Rivera", role: "ML Engineer", match: "91%", skills: ["PyTorch", "FastAPI"] },
                          { name: "Jake Torres", role: "Full-stack", match: "85%", skills: ["React", "Next.js", "Node"] },
                        ].map((b, i) => (
                          <motion.div
                            key={b.name}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2 + i * 0.2, duration: 0.4 }}
                            className="flex items-center gap-3 rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: "rgba(198,241,53,0.15)", color: "#C6F135" }}>
                              {b.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-white">{b.name}</span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(198,241,53,0.15)", color: "#C6F135" }}>{b.match}</span>
                              </div>
                              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{b.role}</span>
                            </div>
                            <div className="flex gap-1">
                              {b.skills.map(s => (
                                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>{s}</span>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Suggestion chips */}
                      <div className="flex gap-2 pt-1">
                        {["Compare profiles", "Build a team", "Show projects"].map((s, i) => (
                          <motion.span
                            key={s}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 + i * 0.15 }}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                          >
                            {s}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Trust Bar ──────────────────────────────────── */}
        <SocialProofBar />

        {/* ── Divider: after trust bar ───────────────────── */}
        <div className="relative h-[1px] w-full" style={{ background: "#ffffff" }}>
          <div
            className="absolute inset-y-0"
            style={{
              left: "10%",
              right: "10%",
              background: "linear-gradient(90deg, transparent, #EBEBEB 30%, #EBEBEB 70%, transparent)",
            }}
          />
        </div>

        {/* ── How It Works ───────────────────────────────── */}
        <section className="section-white" ref={howItWorksRef}>
          <div className="mx-auto max-w-[1240px] px-6 py-24 sm:px-10 sm:py-32">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
              className="text-center mb-16"
            >
              <p className="eyebrow mb-4">How it works</p>
              <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-[-0.03em] text-black">
                Three steps to visibility
              </h2>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainer}
            >
              {steps.map((step) => (
                <motion.div
                  key={step.num}
                  variants={staggerCard}
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                  }}
                  className={`${step.bg} rounded-[20px] p-8 sm:p-10 cursor-default`}
                  style={{
                    transition: "box-shadow 0.3s cubic-bezier(0.16,1,0.3,1)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 12px 32px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <span
                    className="text-[56px] font-bold tracking-tighter leading-none font-display"
                    style={{ color: "rgba(17,17,17,0.10)" }}
                  >
                    <StepNumber num={step.num} inView={howItWorksInView} />
                  </span>
                  <h3
                    className="text-xl font-bold mt-4 mb-3 tracking-tight"
                    style={{ color: "#111111" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-[15px] leading-relaxed"
                    style={{ color: "#525252" }}
                  >
                    {step.desc}
                  </p>
                  {/* Subtle accent line */}
                  <motion.div
                    className="mt-6 h-[2px] rounded-full origin-left"
                    style={{ background: "#C6F135", scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Product Demo: Builder Profile ─────────────── */}
        <section style={{ background: "#FAFAF7" }}>
          <div className="mx-auto max-w-[1240px] px-6 py-24 sm:px-10 sm:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Text */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.12 } },
                }}
              >
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                  className="eyebrow mb-4"
                >
                  Builder Profiles
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                  className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-[-0.03em] leading-[1.08]"
                  style={{ color: "#111111" }}
                >
                  Your work, visible
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                  className="mt-5 text-[17px] leading-relaxed max-w-[440px]"
                  style={{ color: "#525252" }}
                >
                  Your profile is a live portfolio of shipped work. No resumes,
                  no self-reported skills. Just real projects, real decisions,
                  real signal.
                </motion.p>
                <motion.div variants={fadeUp} transition={{ duration: 0.6, ease }}>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 mt-7 text-[15px] font-semibold"
                    style={{ color: "#111111" }}
                  >
                    Create your profile <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right: Builder Profile Mockup */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease }}
                className="flex justify-center lg:justify-end"
              >
                <div
                  className="sm:[transform:perspective(1200px)_rotateY(-5deg)] sm:[transform-style:preserve-3d]"
                >
                  <div
                    className="w-full max-w-[340px] sm:max-w-[380px]"
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1px solid #EBEBEB",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Profile Header */}
                    <div
                      className="relative h-20"
                      style={{
                        background: "linear-gradient(135deg, #C6F135 0%, #A8D82E 50%, #8BC34A 100%)",
                      }}
                    />
                    <div className="px-6 pb-6">
                      {/* Avatar */}
                      <div
                        className="-mt-10 relative inline-block"
                      >
                        <div
                          className="h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                          style={{
                            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                            border: "4px solid #ffffff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          SC
                        </div>
                      </div>
                      <h4
                        className="mt-3 text-lg font-bold tracking-tight"
                        style={{ color: "#111111" }}
                      >
                        Sarah Chen
                      </h4>
                      <p className="text-[14px]" style={{ color: "#737373" }}>
                        Full-stack AI builder
                      </p>

                      {/* Skills pills */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {["React", "Python", "LangChain", "Next.js"].map((skill) => (
                          <span
                            key={skill}
                            className="text-[12px] font-medium px-3 py-1 rounded-full"
                            style={{
                              background: "#F5F5F5",
                              color: "#525252",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Stats row */}
                      <div
                        className="mt-5 flex items-center gap-6 pt-4"
                        style={{ borderTop: "1px solid #EBEBEB" }}
                      >
                        {[
                          { value: "5", label: "projects" },
                          { value: "234", label: "signal" },
                          { value: "3", label: "hackathons" },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center">
                            <p
                              className="text-[16px] font-bold"
                              style={{ color: "#111111" }}
                            >
                              {stat.value}
                            </p>
                            <p
                              className="text-[11px]"
                              style={{ color: "#A3A3A3" }}
                            >
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Mini project card */}
                      <div
                        className="mt-5 p-3 rounded-[12px]"
                        style={{
                          background: "#FAFAF7",
                          border: "1px solid #EBEBEB",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-[8px] flex items-center justify-center"
                            style={{ background: "#111111" }}
                          >
                            <Layers className="h-4 w-4" style={{ color: "#C6F135" }} />
                          </div>
                          <div>
                            <p
                              className="text-[13px] font-semibold"
                              style={{ color: "#111111" }}
                            >
                              AI Code Review Agent
                            </p>
                            <p className="text-[11px]" style={{ color: "#A3A3A3" }}>
                              React + LangChain &middot; 2 weeks ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────── */}
        <div className="relative h-[1px] w-full" style={{ background: "#FAFAF7" }}>
          <div
            className="absolute inset-y-0"
            style={{
              left: "10%",
              right: "10%",
              background: "linear-gradient(90deg, transparent, #EBEBEB 30%, #EBEBEB 70%, transparent)",
            }}
          />
        </div>

        {/* ── Product Demo: Scout AI ──────────────────────── */}
        <section style={{ background: "#ffffff" }}>
          <div className="mx-auto max-w-[1240px] px-6 py-24 sm:px-10 sm:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Scout AI Terminal Mockup */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease }}
                className="flex justify-center lg:justify-start order-2 lg:order-1"
              >
                <div
                  className="sm:[transform:perspective(1200px)_rotateY(5deg)] sm:[transform-style:preserve-3d]"
                >
                  <div
                    className="w-full max-w-[340px] sm:max-w-[400px]"
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1px solid #EBEBEB",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Terminal header */}
                    <div
                      className="flex items-center gap-2 px-4 py-3"
                      style={{ borderBottom: "1px solid #EBEBEB" }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full" style={{ background: "#FF5F57" }} />
                        <div className="h-3 w-3 rounded-full" style={{ background: "#FEBC2E" }} />
                        <div className="h-3 w-3 rounded-full" style={{ background: "#28C840" }} />
                      </div>
                      <p
                        className="text-[12px] font-medium ml-2"
                        style={{ color: "#A3A3A3" }}
                      >
                        AI Scout
                      </p>
                    </div>

                    <div className="p-5">
                      {/* Search input */}
                      <div
                        className="flex items-center gap-3 px-4 py-3 rounded-[12px]"
                        style={{
                          background: "#FAFAF7",
                          border: "1px solid #EBEBEB",
                        }}
                      >
                        <Search className="h-4 w-4 flex-shrink-0" style={{ color: "#A3A3A3" }} />
                        <p className="text-[14px]" style={{ color: "#111111" }}>
                          Find React builders experienced with AI
                          <motion.span
                            className="inline-block w-[2px] h-[16px] ml-0.5 align-middle"
                            style={{ background: "#C6F135" }}
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                          />
                        </p>
                      </div>

                      {/* Result cards */}
                      <div className="mt-4 space-y-3">
                        {[
                          {
                            name: "Alex Rivera",
                            skills: ["React", "GPT-4", "TypeScript"],
                            match: 95,
                            gradient: "linear-gradient(135deg, #F59E0B, #EF4444)",
                            initials: "AR",
                          },
                          {
                            name: "Priya Patel",
                            skills: ["React", "LangChain", "Python"],
                            match: 91,
                            gradient: "linear-gradient(135deg, #06B6D4, #3B82F6)",
                            initials: "PP",
                          },
                          {
                            name: "Jordan Kim",
                            skills: ["Next.js", "OpenAI", "Vercel"],
                            match: 87,
                            gradient: "linear-gradient(135deg, #10B981, #059669)",
                            initials: "JK",
                          },
                        ].map((result, i) => (
                          <motion.div
                            key={result.name}
                            initial={{ opacity: 0, x: -12 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.15, duration: 0.5, ease }}
                            className="flex items-center gap-3 p-3 rounded-[12px]"
                            style={{
                              border: "1px solid #EBEBEB",
                            }}
                          >
                            <div
                              className="h-9 w-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                              style={{ background: result.gradient }}
                            >
                              {result.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-[13px] font-semibold"
                                style={{ color: "#111111" }}
                              >
                                {result.name}
                              </p>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {result.skills.map((s) => (
                                  <span
                                    key={s}
                                    className="text-[10px] px-2 py-0.5 rounded-full"
                                    style={{
                                      background: "#F5F5F5",
                                      color: "#737373",
                                    }}
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div
                              className="text-[13px] font-bold px-2 py-1 rounded-[8px]"
                              style={{
                                background: "rgba(198,241,53,0.15)",
                                color: "#111111",
                              }}
                            >
                              {result.match}%
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Text */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.12 } },
                }}
                className="order-1 lg:order-2"
              >
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                  className="eyebrow mb-4"
                >
                  AI Scout
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                  className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-[-0.03em] leading-[1.08]"
                  style={{ color: "#111111" }}
                >
                  Find anyone. Instantly.
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                  className="mt-5 text-[17px] leading-relaxed max-w-[440px]"
                  style={{ color: "#525252" }}
                >
                  AI-powered talent search that actually works. Describe who you
                  need in plain English and get ranked matches based on real
                  shipped work, not keyword-stuffed profiles.
                </motion.p>
                <motion.div variants={fadeUp} transition={{ duration: 0.6, ease }}>
                  <Link
                    href="/builders"
                    className="inline-flex items-center gap-2 mt-7 text-[15px] font-semibold"
                    style={{ color: "#111111" }}
                  >
                    Try AI Scout <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────── */}
        <div className="relative h-[1px] w-full" style={{ background: "#ffffff" }}>
          <div
            className="absolute inset-y-0"
            style={{
              left: "10%",
              right: "10%",
              background: "linear-gradient(90deg, transparent, #EBEBEB 30%, #EBEBEB 70%, transparent)",
            }}
          />
        </div>

        {/* ── Product Demo: Hackathons ────────────────────── */}
        <section style={{ background: "#FAFAF7" }}>
          <div className="mx-auto max-w-[1240px] px-6 py-24 sm:px-10 sm:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Text */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.12 } },
                }}
              >
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                  className="eyebrow mb-4"
                >
                  Hackathons
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                  className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-[-0.03em] leading-[1.08]"
                  style={{ color: "#111111" }}
                >
                  Ship together. Get noticed.
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                  className="mt-5 text-[17px] leading-relaxed max-w-[440px]"
                  style={{ color: "#525252" }}
                >
                  Join AI hackathons that build your portfolio and your network.
                  Form teams, ship under pressure, and create proof of work that
                  companies actually care about.
                </motion.p>
                <motion.div variants={fadeUp} transition={{ duration: 0.6, ease }}>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 mt-7 text-[15px] font-semibold"
                    style={{ color: "#111111" }}
                  >
                    Browse hackathons <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right: Hackathon Card Mockup */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease }}
                className="flex justify-center lg:justify-end"
              >
                <div
                  className="sm:[transform:perspective(1200px)_rotateY(-5deg)] sm:[transform-style:preserve-3d]"
                >
                  <div
                    className="w-full max-w-[340px] sm:max-w-[380px]"
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1px solid #EBEBEB",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <div className="p-6">
                      {/* Live badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                          style={{
                            background: "rgba(239,68,68,0.08)",
                          }}
                        >
                          <motion.div
                            className="h-2 w-2 rounded-full"
                            style={{ background: "#EF4444" }}
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <span
                            className="text-[12px] font-bold tracking-wide"
                            style={{ color: "#EF4444" }}
                          >
                            LIVE NOW
                          </span>
                        </div>
                        <Trophy className="h-5 w-5" style={{ color: "#F59E0B" }} />
                      </div>

                      {/* Title */}
                      <h4
                        className="text-xl font-bold tracking-tight"
                        style={{ color: "#111111" }}
                      >
                        AI Agents Challenge
                      </h4>
                      <p className="text-[14px] mt-1" style={{ color: "#737373" }}>
                        Build autonomous agents that solve real problems
                      </p>

                      {/* Countdown timer */}
                      <div
                        className="mt-5 flex items-center gap-3 justify-center py-4 rounded-[12px]"
                        style={{ background: "#FAFAF7" }}
                      >
                        {[
                          { value: "23", label: "hrs" },
                          { value: "14", label: "min" },
                          { value: "52", label: "sec" },
                        ].map((unit, i) => (
                          <div key={unit.label} className="flex items-center gap-3">
                            <div className="text-center">
                              <p
                                className="text-[28px] font-bold font-display tracking-tight leading-none"
                                style={{ color: "#111111" }}
                              >
                                {unit.value}
                              </p>
                              <p
                                className="text-[10px] uppercase tracking-wider mt-1"
                                style={{ color: "#A3A3A3" }}
                              >
                                {unit.label}
                              </p>
                            </div>
                            {i < 2 && (
                              <span
                                className="text-[24px] font-light -mt-3"
                                style={{ color: "#D4D4D4" }}
                              >
                                :
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Participants */}
                      <div
                        className="mt-5 flex items-center justify-between pt-4"
                        style={{ borderTop: "1px solid #EBEBEB" }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {[
                              "linear-gradient(135deg, #6366F1, #8B5CF6)",
                              "linear-gradient(135deg, #F59E0B, #EF4444)",
                              "linear-gradient(135deg, #06B6D4, #3B82F6)",
                              "linear-gradient(135deg, #10B981, #059669)",
                            ].map((bg, i) => (
                              <div
                                key={i}
                                className="h-7 w-7 rounded-full"
                                style={{
                                  background: bg,
                                  border: "2px solid #ffffff",
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-[13px]" style={{ color: "#737373" }}>
                            <span className="font-semibold" style={{ color: "#111111" }}>47</span> builders
                          </span>
                        </div>
                      </div>

                      {/* Mini leaderboard */}
                      <div className="mt-4 space-y-2">
                        {[
                          { rank: 1, team: "NeuralForge", score: 2840 },
                          { rank: 2, team: "ByteCraft", score: 2710 },
                          { rank: 3, team: "AgentLab", score: 2530 },
                        ].map((entry) => (
                          <div
                            key={entry.rank}
                            className="flex items-center justify-between py-2 px-3 rounded-[8px]"
                            style={{
                              background: entry.rank === 1 ? "rgba(198,241,53,0.1)" : "transparent",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[12px] font-bold w-5 text-center"
                                style={{ color: entry.rank === 1 ? "#111111" : "#A3A3A3" }}
                              >
                                #{entry.rank}
                              </span>
                              <span
                                className="text-[13px] font-medium"
                                style={{ color: "#111111" }}
                              >
                                {entry.team}
                              </span>
                            </div>
                            <span
                              className="text-[12px] font-semibold"
                              style={{ color: "#737373" }}
                            >
                              {entry.score.toLocaleString()} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────── */}
        <div className="relative h-[1px] w-full" style={{ background: "#FAFAF7" }}>
          <div
            className="absolute inset-y-0"
            style={{
              left: "10%",
              right: "10%",
              background: "linear-gradient(90deg, transparent, #EBEBEB 30%, #EBEBEB 70%, transparent)",
            }}
          />
        </div>

        {/* ── Product Demo: Agentic Search ────────────────── */}
        <section style={{ background: "#ffffff" }}>
          <div className="mx-auto max-w-[1240px] px-6 py-24 sm:px-10 sm:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Conversation Mockup */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease }}
                className="flex justify-center lg:justify-start order-2 lg:order-1"
              >
                <div
                  className="sm:[transform:perspective(1200px)_rotateY(5deg)] sm:[transform-style:preserve-3d]"
                >
                  <div
                    className="w-full max-w-[340px] sm:max-w-[400px]"
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1px solid #EBEBEB",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Header */}
                    <div
                      className="flex items-center gap-2 px-5 py-3"
                      style={{ borderBottom: "1px solid #EBEBEB" }}
                    >
                      <div
                        className="h-6 w-6 rounded-[6px] flex items-center justify-center"
                        style={{ background: "#111111" }}
                      >
                        <Bot className="h-3.5 w-3.5" style={{ color: "#C6F135" }} />
                      </div>
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: "#111111" }}
                      >
                        Team Builder Agent
                      </p>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* User message */}
                      <div className="flex justify-end">
                        <div
                          className="px-4 py-2.5 rounded-[14px] rounded-br-[4px] max-w-[260px]"
                          style={{
                            background: "#111111",
                            color: "#ffffff",
                          }}
                        >
                          <p className="text-[13px] leading-relaxed">
                            Build me a team for the AI hackathon
                          </p>
                        </div>
                      </div>

                      {/* Agent response */}
                      <div className="flex items-start gap-2">
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: "rgba(198,241,53,0.15)" }}
                        >
                          <Sparkles className="h-3 w-3" style={{ color: "#111111" }} />
                        </div>
                        <div>
                          <p
                            className="text-[13px] leading-relaxed mb-3"
                            style={{ color: "#525252" }}
                          >
                            Here&apos;s your ideal 3-person team with complementary skills:
                          </p>

                          {/* Team member cards */}
                          <div className="space-y-2.5">
                            {[
                              {
                                role: "ML Engineer",
                                name: "Maya Singh",
                                skills: ["PyTorch", "RAG", "Fine-tuning"],
                                gradient: "linear-gradient(135deg, #8B5CF6, #6366F1)",
                                initials: "MS",
                                highlight: "PyTorch",
                              },
                              {
                                role: "Frontend",
                                name: "Tom Nakamura",
                                skills: ["React", "Three.js", "Design"],
                                gradient: "linear-gradient(135deg, #06B6D4, #0EA5E9)",
                                initials: "TN",
                                highlight: "React",
                              },
                              {
                                role: "Backend",
                                name: "Lena Petrova",
                                skills: ["FastAPI", "PostgreSQL", "DevOps"],
                                gradient: "linear-gradient(135deg, #10B981, #14B8A6)",
                                initials: "LP",
                                highlight: "FastAPI",
                              },
                            ].map((member, i) => (
                              <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 + i * 0.12, duration: 0.5, ease }}
                                className="p-3 rounded-[10px]"
                                style={{
                                  border: "1px solid #EBEBEB",
                                }}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                                    style={{ background: member.gradient }}
                                  >
                                    {member.initials}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p
                                        className="text-[12px] font-semibold"
                                        style={{ color: "#111111" }}
                                      >
                                        {member.name}
                                      </p>
                                      <span
                                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                        style={{
                                          background: "#F5F5F5",
                                          color: "#737373",
                                        }}
                                      >
                                        {member.role}
                                      </span>
                                    </div>
                                    <div className="flex gap-1 mt-1.5">
                                      {member.skills.map((s) => (
                                        <span
                                          key={s}
                                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                                          style={{
                                            background:
                                              s === member.highlight
                                                ? "rgba(198,241,53,0.2)"
                                                : "#F5F5F5",
                                            color:
                                              s === member.highlight
                                                ? "#111111"
                                                : "#A3A3A3",
                                            fontWeight:
                                              s === member.highlight ? 600 : 400,
                                          }}
                                        >
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Text */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.12 } },
                }}
                className="order-1 lg:order-2"
              >
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                  className="eyebrow mb-4"
                >
                  Agentic Search
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                  className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-[-0.03em] leading-[1.08]"
                  style={{ color: "#111111" }}
                >
                  Let AI find your perfect&nbsp;match
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                  className="mt-5 text-[17px] leading-relaxed max-w-[440px]"
                  style={{ color: "#525252" }}
                >
                  Our agent doesn&apos;t just search &mdash; it thinks. Describe your
                  goal and it assembles a dream team with complementary skills,
                  proven track records, and the right chemistry.
                </motion.p>
                <motion.div variants={fadeUp} transition={{ duration: 0.6, ease }}>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 mt-7 text-[15px] font-semibold"
                    style={{ color: "#111111" }}
                  >
                    Meet the agent <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Divider: white to warm ─────────────────────── */}
        <div className="relative h-16 overflow-hidden" style={{ background: "#ffffff" }}>
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, #ffffff 0%, #FAFAF7 100%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-[1px]"
            style={{
              background:
                "linear-gradient(90deg, transparent 5%, #EBEBEB 30%, #EBEBEB 70%, transparent 95%)",
              opacity: 0.6,
            }}
          />
        </div>

        {/* ── Features Grid ──────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ background: "#FAFAF7" }}
          ref={featuresRef}
        >
          {/* Subtle dot pattern background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #111111 0.5px, transparent 0.5px)",
              backgroundSize: "32px 32px",
              opacity: 0.03,
            }}
          />
          <div className="relative mx-auto max-w-[1240px] px-6 py-24 sm:px-10 sm:py-32">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
              className="text-center mb-16"
            >
              <p className="eyebrow mb-4">Platform</p>
              <h2
                className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-[-0.03em] max-w-[560px] mx-auto"
                style={{ color: "#111111" }}
              >
                Everything a builder needs to get noticed
              </h2>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={featureStagger}
            >
              {features.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  variants={featureCard}
                  whileHover={{
                    y: -4,
                    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                  }}
                  className={`${feat.bg} rounded-[20px] p-8 sm:p-10`}
                  style={{
                    transition: "box-shadow 0.3s cubic-bezier(0.16,1,0.3,1)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 12px 32px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <motion.div
                    className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-6"
                    style={{ background: "#111111" }}
                    animate={
                      featuresInView
                        ? { y: [0, -3, 0] }
                        : {}
                    }
                    transition={{
                      duration: 2.5,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <feat.icon className="h-5 w-5" style={{ color: "#C6F135" }} />
                  </motion.div>
                  <h3
                    className="text-xl font-bold mb-3 tracking-tight"
                    style={{ color: "#111111" }}
                  >
                    {feat.title}
                  </h3>
                  <p
                    className="text-[15px] leading-relaxed max-w-[380px]"
                    style={{ color: "#525252" }}
                  >
                    {feat.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Divider: warm to stats ──────────────────────── */}
        <div className="relative h-16 overflow-hidden" style={{ background: "#FAFAF7" }}>
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, #FAFAF7 0%, #F5F5F5 100%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-[1px]"
            style={{
              background:
                "linear-gradient(90deg, transparent 5%, #EBEBEB 30%, #EBEBEB 70%, transparent 95%)",
              opacity: 0.6,
            }}
          />
        </div>

        {/* ── Stats ──────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ background: "#F5F5F5" }}
          ref={statsRef}
        >
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(17,17,17,0.03) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative mx-auto max-w-[1240px] px-6 sm:px-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-20 sm:py-28">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.15,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="text-center"
                >
                  <p
                    className="text-[48px] sm:text-[56px] font-bold tracking-tight leading-none font-display"
                    style={{ color: "#C6F135" }}
                  >
                    <AnimatedNumber value={stat.value} inView={statsInView} />
                  </p>
                  <p className="eyebrow mt-3" style={{ color: "#111111" }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Divider: stats to white ─────────────────────── */}
        <div className="relative h-16 overflow-hidden" style={{ background: "#F5F5F5" }}>
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, #F5F5F5 0%, #ffffff 100%)",
            }}
          />
        </div>

        {/* ── Agent Search ───────────────────────────────── */}
        <section className="section-white">
          <div className="mx-auto max-w-[1240px] px-6 py-24 sm:px-10 sm:py-32">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
              className="text-center mb-14"
            >
              <p className="eyebrow mb-4">AI-powered</p>
              <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-[-0.03em] text-black">
                Search the network
              </h2>
              <p className="text-text-secondary text-[17px] mt-4 max-w-[480px] mx-auto">
                No more complex filters. Find specific builders by asking
                natural questions.
              </p>
            </motion.div>

            <div className="card overflow-hidden p-1 sm:p-2">
              <AgentHome />
            </div>
          </div>
        </section>

        {/* ── Divider: white to warm (with lime accent) ──── */}
        <div className="relative h-16 overflow-hidden" style={{ background: "#ffffff" }}>
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, #ffffff 0%, #FAFAF7 100%)",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1px]"
            style={{
              width: "60%",
              background:
                "linear-gradient(90deg, transparent, rgba(198,241,53,0.3), transparent)",
            }}
          />
        </div>

        {/* ── Final CTA ──────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ background: "#FAFAF7" }}
        >
          {/* Floating decorative dots */}
          <FloatingDot size={6} color="rgba(198,241,53,0.4)" top="15%" left="8%" delay={0} duration={6} />
          <FloatingDot size={4} color="rgba(198,241,53,0.3)" top="25%" left="85%" delay={1} duration={7} />
          <FloatingDot size={8} color="rgba(198,241,53,0.25)" top="60%" left="5%" delay={0.5} duration={5.5} />
          <FloatingDot size={5} color="rgba(198,241,53,0.35)" top="70%" left="92%" delay={2} duration={6.5} />
          <FloatingDot size={3} color="rgba(17,17,17,0.08)" top="20%" left="15%" delay={1.5} duration={8} />
          <FloatingDot size={4} color="rgba(17,17,17,0.06)" top="80%" left="80%" delay={0.8} duration={7.5} />
          <FloatingDot size={6} color="rgba(198,241,53,0.2)" top="45%" left="3%" delay={3} duration={5} />
          <FloatingDot size={5} color="rgba(198,241,53,0.2)" top="35%" left="95%" delay={1.2} duration={6} />

          {/* Large ambient glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: "700px",
              height: "500px",
              background:
                "radial-gradient(ellipse, rgba(198,241,53,0.06) 0%, transparent 65%)",
            }}
          />

          <div className="relative mx-auto max-w-[800px] px-6 py-28 sm:py-40 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.7, ease }}
            >
              {/* Urgency badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
                style={{
                  background: "rgba(198,241,53,0.12)",
                  border: "1px solid rgba(198,241,53,0.2)",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" style={{ color: "#111111" }} />
                <span
                  className="text-xs font-semibold uppercase tracking-[0.06em]"
                  style={{ color: "#111111" }}
                >
                  Join 537+ builders
                </span>
              </motion.div>

              <h2
                className="text-[clamp(2.5rem,6vw,4.2rem)] font-bold tracking-[-0.04em] leading-[1.05]"
                style={{ color: "#111111" }}
              >
                Ready to let your
                <br />
                <span className="relative inline-block">
                  work speak?
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="8"
                    viewBox="0 0 200 8"
                    fill="none"
                  >
                    <motion.path
                      d="M1 5.5C40 2 80 1 100 3C120 5 160 6 199 2.5"
                      stroke="#C6F135"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1.2,
                        delay: 0.6,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  </motion.svg>
                </span>
              </h2>

              {/* CTA with pulsing glow */}
              <div className="mt-10 mx-auto max-w-[460px] relative">
                <motion.div
                  className="absolute -inset-4 rounded-[28px] pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse, rgba(198,241,53,0.15) 0%, transparent 70%)",
                  }}
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    scale: [0.98, 1.02, 0.98],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="relative">
                  <WaitlistForm initialCount={537} />
                </div>
              </div>
              <p className="mt-5 text-sm" style={{ color: "#737373" }}>
                No credit card required
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="section-dark">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 sm:gap-16 mb-16">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-9 w-9 bg-black rounded-[10px] border border-white/10 flex items-center justify-center">
                    <span className="text-lime font-bold text-[15px] font-display">
                      A
                    </span>
                  </div>
                  <span className="text-lg font-bold text-white tracking-tight font-display">
                    Antry
                  </span>
                </div>
                <p className="text-[15px] sm:text-[17px] text-white/50 max-w-[380px] leading-relaxed">
                  The proof-of-work network for AI builders. Ship projects, join
                  hackathons, get discovered.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 sm:gap-8 lg:pt-2">
                {[
                  {
                    title: "Product",
                    links: ["Builders", "Hackathons", "AI Scout", "Pricing"],
                  },
                  {
                    title: "Company",
                    links: ["About", "Blog", "Careers", "Contact"],
                  },
                  {
                    title: "Legal",
                    links: ["Privacy", "Terms", "Security"],
                  },
                ].map((col) => (
                  <div key={col.title}>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30 mb-4">
                      {col.title}
                    </p>
                    <ul className="space-y-1 sm:space-y-2.5">
                      {col.links.map((link) => (
                        <li key={link}>
                          <Link
                            href="#"
                            className="text-[14px] sm:text-[15px] text-white/55 hover:text-white transition-colors inline-block py-1.5 sm:py-0"
                          >
                            {link}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />
            <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[13px] text-white/35">
                &copy; 2026 Antry. Built for the builders of tomorrow.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
