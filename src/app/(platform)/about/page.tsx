"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Trophy,
  Users,
  Sparkles,
  Globe,
  Heart,
  Rocket,
  Target,
  GitBranch,
  Star,
  CheckCircle2,
  Eye,
  Search,
  TrendingUp,
  Shield,
  Linkedin,
} from "lucide-react";
import { builders, projects, antathons, getInitials } from "@/lib/mock-data";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};

/* ── Animated counter ─────────────────────────── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (inView) {
      animate(motionVal, value, { duration: 2, ease: [0.22, 1, 0.36, 1] });
    }
  }, [inView, motionVal, value]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export default function AboutPage() {
  const totalLikes = projects.reduce((a, p) => a + p.likes, 0);

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
      {/* ═══════════════════════════════════════════════════════
          1. HERO — We believe the best builders should be found
          ═══════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-28 px-6 overflow-hidden">
        {/* Gradient orbs */}
        <div
          className="absolute top-[-160px] left-[-120px] w-[800px] h-[800px] rounded-full opacity-35 blur-[160px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(198,241,53,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-120px] right-[-100px] w-[600px] h-[600px] rounded-full opacity-20 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(198,241,53,0.10) 0%, transparent 70%)" }}
        />

        <div className="max-w-[860px] mx-auto text-center relative z-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, ease }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-bold uppercase tracking-wider mb-8"
              style={{
                background: "rgba(198,241,53,0.12)",
                border: "1px solid rgba(198,241,53,0.20)",
                color: "#111111",
              }}
            >
              <Heart className="w-3.5 h-3.5" />
              Our Story
            </div>

            <h1
              className="font-display leading-[0.92] tracking-[-0.04em] mb-6"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                color: "#111111",
              }}
            >
              We believe the best builders
              <br />
              <span style={{ color: "#C6F135" }}>should be found.</span>
            </h1>

            <p
              className="max-w-[640px] mx-auto leading-relaxed font-medium"
              style={{ fontSize: "18px", color: "#525252" }}
            >
              Not by their resume. Not by their school. Not by who they know.
              <br />
              By what they build, ship, and share with the world.
            </p>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-14"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 rounded-full mx-auto flex items-start justify-center pt-2"
              style={{ border: "2px solid #D4D4D4" }}
            >
              <div
                className="w-1.5 h-3 rounded-full"
                style={{ background: "#C6F135" }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. THE STORY — Why Antry exists
          ═══════════════════════════════════════════════════════ */}
      <section
        className="py-28 px-6"
        style={{ background: "#F5F5F5", borderTop: "1px solid #EBEBEB", borderBottom: "1px solid #EBEBEB" }}
      >
        <div className="max-w-[760px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-12"
          >
            <span
              className="text-[12px] font-bold uppercase tracking-widest"
              style={{ color: "#C6F135" }}
            >
              The Why
            </span>
            <h2
              className="font-display mt-3 tracking-[-0.03em]"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                color: "#111111",
              }}
            >
              Resumes lie. Shipped work doesn&apos;t.
            </h2>
          </motion.div>

          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="p-10 sm:p-14 rounded-2xl"
            style={{
              background: "#ffffff",
              border: "1px solid #EBEBEB",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div
              className="space-y-6 text-[16px] leading-[1.75]"
              style={{ color: "#525252" }}
            >
              <p>
                Antry started from a simple frustration:{" "}
                <span className="font-bold" style={{ color: "#111111" }}>
                  the most talented builders we knew were invisible.
                </span>
              </p>
              <p>
                They could ship a product in a weekend, deploy an AI agent that
                actually worked, design interfaces that made people stop scrolling
                -- but when it came to getting hired or getting noticed? They were
                behind people with fancier degrees and better LinkedIn profiles.
              </p>
              <p>
                The idea crystallized during the{" "}
                <span className="font-bold" style={{ color: "#111111" }}>
                  AI Builder Program with Wealthsimple
                </span>
                . We watched incredible builders ship real products in days, and realized:
                there&apos;s no place where this work lives, gets seen, and gets rewarded.
              </p>
              <p>
                So we built one. Antry is a community where your{" "}
                <span
                  className="font-bold px-1.5 py-0.5 rounded-md"
                  style={{ color: "#111111", background: "rgba(198,241,53,0.15)" }}
                >
                  shipped projects are your resume
                </span>
                , hackathons create proof of ability, and an AI agent helps the right
                people find you based on what you&apos;ve actually built.
              </p>
              <p style={{ color: "#111111", fontWeight: 600 }}>
                The name comes from the ant -- a tiny creature that collaborates
                with others to build something massive, quickly. That&apos;s our
                builders. They work fast, ship real products, and grow together.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3. HOW IT WORKS — Ship -> Get Scored -> Get Found
          ═══════════════════════════════════════════════════════ */}
      <section className="py-32 px-6" style={{ background: "#FAFAF7" }}>
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
              How It Works
            </span>
            <h2
              className="font-display mt-3 tracking-[-0.03em]"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                color: "#111111",
              }}
            >
              Three steps to being seen.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting lines (desktop only) */}
            <div
              className="hidden md:block absolute top-[72px] left-[calc(33.33%+16px)] right-[calc(33.33%+16px)] h-[2px]"
              style={{ background: "linear-gradient(90deg, #C6F135, rgba(198,241,53,0.3), #C6F135)" }}
            />

            {[
              {
                step: "01",
                icon: Rocket,
                title: "Ship",
                desc: "Build something real and showcase it on your Antry profile. Live demos, source code, 3-minute walkthroughs. Show what you made, not what you claim.",
                color: "#C6F135",
              },
              {
                step: "02",
                icon: Star,
                title: "Get Scored",
                desc: "Compete in Antathons, earn community upvotes, and build a track record of shipping under pressure. Your work gets validated by peers and the platform.",
                color: "#C6F135",
              },
              {
                step: "03",
                icon: Eye,
                title: "Get Found",
                desc: "Our AI Scout surfaces you to companies looking for your exact skills. No applications needed -- the right people find you through your work.",
                color: "#C6F135",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15, ease }}
                className="text-center relative"
              >
                {/* Step circle */}
                <div
                  className="w-[88px] h-[88px] rounded-3xl mx-auto mb-7 flex items-center justify-center relative"
                  style={{
                    background: "#111111",
                    boxShadow: "0 8px 24px rgba(17,17,17,0.15)",
                  }}
                >
                  <item.icon className="w-8 h-8" style={{ color: "#C6F135" }} />
                  {/* Step number badge */}
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
                    style={{
                      background: "#C6F135",
                      color: "#111111",
                    }}
                  >
                    {item.step}
                  </div>
                </div>

                <h3
                  className="text-[22px] font-bold mb-3 tracking-tight"
                  style={{ color: "#111111" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-[15px] leading-relaxed max-w-[300px] mx-auto"
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
          4. THE PLATFORM — Three pillars
          ═══════════════════════════════════════════════════════ */}
      <section
        className="py-32 px-6"
        style={{ background: "#F5F5F5", borderTop: "1px solid #EBEBEB", borderBottom: "1px solid #EBEBEB" }}
      >
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mb-16 text-center"
          >
            <span
              className="text-[12px] font-bold uppercase tracking-widest"
              style={{ color: "#C6F135" }}
            >
              The Platform
            </span>
            <h2
              className="font-display mt-3 tracking-[-0.03em]"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                color: "#111111",
              }}
            >
              Three pillars. One ecosystem.
            </h2>
            <p
              className="mt-3 max-w-[520px] mx-auto"
              style={{ fontSize: "16px", color: "#525252" }}
            >
              Each layer reinforces the others. Together they create the most
              honest talent platform ever built.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                label: "Builder Profiles",
                title: "Your live portfolio",
                desc: "Every builder gets a visual showcase of their shipped projects, demos, skills, and hackathon results. Your profile is your proof -- a living portfolio that updates as you build.",
                features: ["Live demo links & walkthroughs", "Skill verification through work", "Complete build history & timeline"],
              },
              {
                icon: Trophy,
                label: "Antathons",
                title: "Hackathons that prove ability",
                desc: "Timed hackathons where builders compete, ship fast, and prove they can perform under pressure. Companies sponsor and recruit directly from results.",
                features: ["Community recognition & exposure", "Company-sponsored challenges", "Pressure-tested talent pipeline"],
              },
              {
                icon: Sparkles,
                label: "Scout AI",
                title: "Intelligent talent search",
                desc: "An AI agent that knows every builder, project, and hackathon result. Search by skill, build teams, compare profiles -- all through natural language conversation.",
                features: ["Natural language talent queries", "Smart skill matching & ranking", "Automated team composition"],
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12, ease }}
                className="p-8 rounded-2xl flex flex-col"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EBEBEB",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {/* Icon + label */}
                <div
                  className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center"
                  style={{ background: "rgba(198,241,53,0.12)" }}
                >
                  <item.icon className="w-5 h-5" style={{ color: "#C6F135" }} />
                </div>

                <span
                  className="text-[11px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: "#C6F135" }}
                >
                  {item.label}
                </span>

                <h3
                  className="text-[20px] font-bold mb-4 tracking-tight"
                  style={{ color: "#111111" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-[14px] leading-relaxed mb-6"
                  style={{ color: "#525252" }}
                >
                  {item.desc}
                </p>

                {/* Features */}
                <div className="mt-auto pt-5" style={{ borderTop: "1px solid #EBEBEB" }}>
                  {item.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2.5 text-[13px] py-1.5"
                      style={{ color: "#525252" }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "#C6F135" }} />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Visual flow connector */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="mt-14 text-center"
          >
            <div
              className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl"
              style={{
                background: "rgba(198,241,53,0.08)",
                border: "1px solid rgba(198,241,53,0.15)",
              }}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: "#C6F135" }} />
                <span className="text-[13px] font-bold" style={{ color: "#111111" }}>Build</span>
              </div>
              <div className="w-8 h-[2px]" style={{ background: "#C6F135" }} />
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" style={{ color: "#C6F135" }} />
                <span className="text-[13px] font-bold" style={{ color: "#111111" }}>Compete</span>
              </div>
              <div className="w-8 h-[2px]" style={{ background: "#C6F135" }} />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: "#C6F135" }} />
                <span className="text-[13px] font-bold" style={{ color: "#111111" }}>Get Discovered</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          5. FOR BUILDERS — What builders get
          ═══════════════════════════════════════════════════════ */}
      <section className="py-32 px-6" style={{ background: "#FAFAF7" }}>
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
            >
              <span
                className="text-[12px] font-bold uppercase tracking-widest"
                style={{ color: "#C6F135" }}
              >
                For Builders
              </span>
              <h2
                className="font-display mt-3 mb-6 tracking-[-0.03em]"
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  color: "#111111",
                }}
              >
                Build together. Ship together.
                <br />
                <span style={{ color: "#C6F135" }}>Get discovered.</span>
              </h2>
              <p
                className="text-[16px] leading-relaxed mb-8"
                style={{ color: "#525252" }}
              >
                Whether you want to build the next unicorn, just get hired, or
                simply get recognition for what you create -- Antry is where your
                work finally speaks for itself.
              </p>

              <div className="space-y-5">
                {[
                  {
                    icon: Globe,
                    title: "Visibility that compounds",
                    desc: "Every project you ship adds to your profile. Over time, your body of work becomes undeniable proof of what you can do.",
                  },
                  {
                    icon: Users,
                    title: "A community that ships",
                    desc: "Surround yourself with other builders who move fast. Collaborate, get feedback, and push each other to build better.",
                  },
                  {
                    icon: Target,
                    title: "Opportunities that find you",
                    desc: "Companies use Scout AI to find builders. The right role finds you based on your actual work -- no applications required.",
                  },
                  {
                    icon: Trophy,
                    title: "Proof under pressure",
                    desc: "Antathon results show you can ship on a deadline. Hackathon wins and participation become permanent proof of ability.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08, ease }}
                    className="flex gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: "rgba(198,241,53,0.12)",
                        border: "1px solid rgba(198,241,53,0.15)",
                      }}
                    >
                      <item.icon className="w-4.5 h-4.5" style={{ color: "#111111" }} />
                    </div>
                    <div>
                      <h3
                        className="text-[16px] font-bold tracking-tight mb-1"
                        style={{ color: "#111111" }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: "#737373" }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: visual card */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
            >
              <div
                className="p-8 rounded-2xl"
                style={{
                  background: "#ffffff",
                  border: "1px solid #EBEBEB",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.07)",
                }}
              >
                {/* Mini profile preview */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-[16px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #262626 0%, #171717 100%)" }}
                  >
                    MC
                  </div>
                  <div>
                    <p className="text-[16px] font-bold" style={{ color: "#111111" }}>
                      Mara Chen
                    </p>
                    <p className="text-[13px]" style={{ color: "#737373" }}>
                      AI engineer building things that think
                    </p>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {["Python", "LangChain", "TypeScript", "RAG"].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg text-[12px] font-medium"
                      style={{
                        background: "rgba(198,241,53,0.10)",
                        color: "#525252",
                        border: "1px solid rgba(198,241,53,0.15)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div
                  className="grid grid-cols-3 gap-4 pt-5"
                  style={{ borderTop: "1px solid #EBEBEB" }}
                >
                  {[
                    { value: "3", label: "Projects" },
                    { value: "2", label: "Antathons" },
                    { value: "443", label: "Upvotes" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-[22px] font-bold" style={{ color: "#111111" }}>
                        {stat.value}
                      </p>
                      <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "#A3A3A3" }}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          6. FOR COMPANIES — What recruiters get
          ═══════════════════════════════════════════════════════ */}
      <section
        className="py-32 px-6"
        style={{ background: "#F5F5F5", borderTop: "1px solid #EBEBEB", borderBottom: "1px solid #EBEBEB" }}
      >
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: visual card (reversed layout) */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="order-2 lg:order-1"
            >
              <div
                className="p-8 rounded-2xl"
                style={{
                  background: "#111111",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                }}
              >
                {/* Scout AI preview */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(198,241,53,0.15)" }}
                  >
                    <Sparkles className="w-4 h-4" style={{ color: "#C6F135" }} />
                  </div>
                  <span className="text-[14px] font-bold" style={{ color: "#C6F135" }}>
                    Scout AI
                  </span>
                </div>

                {/* Fake search */}
                <div
                  className="px-4 py-3 rounded-xl mb-5 text-[14px]"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  &ldquo;Find me a full-stack builder who ships fast and has AI agent experience&rdquo;
                </div>

                {/* Results */}
                <div className="space-y-3">
                  {[
                    { name: "Mara Chen", match: "97%", skill: "AI Agents" },
                    { name: "Jake Torres", match: "91%", skill: "Full-Stack" },
                    { name: "Ofir Sela", match: "88%", skill: "AI + Product" },
                  ].map((result, i) => (
                    <div
                      key={result.name}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{
                        background: i === 0 ? "rgba(198,241,53,0.08)" : "rgba(255,255,255,0.03)",
                        border: i === 0 ? "1px solid rgba(198,241,53,0.15)" : "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold"
                          style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff" }}
                        >
                          {getInitials(result.name)}
                        </div>
                        <span className="text-[13px] font-medium" style={{ color: "#ffffff" }}>
                          {result.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {result.skill}
                        </span>
                        <span
                          className="text-[12px] font-bold px-2 py-0.5 rounded-md"
                          style={{
                            color: "#C6F135",
                            background: "rgba(198,241,53,0.10)",
                          }}
                        >
                          {result.match}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: text */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="order-1 lg:order-2"
            >
              <span
                className="text-[12px] font-bold uppercase tracking-widest"
                style={{ color: "#C6F135" }}
              >
                For Companies
              </span>
              <h2
                className="font-display mt-3 mb-6 tracking-[-0.03em]"
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  color: "#111111",
                }}
              >
                Hire builders who&apos;ve
                <br />
                <span style={{ color: "#C6F135" }}>already proven it.</span>
              </h2>
              <p
                className="text-[16px] leading-relaxed mb-8"
                style={{ color: "#525252" }}
              >
                Stop guessing from resumes. See 3-minute demos, shipped products,
                and hackathon results. Our AI Scout finds the exact talent you need
                in seconds.
              </p>

              <div className="space-y-5">
                {[
                  {
                    icon: Shield,
                    title: "Verified through work",
                    desc: "Every builder on Antry has shipped real projects. You see live demos, source code, and build timelines -- not bullet points.",
                  },
                  {
                    icon: Search,
                    title: "AI-powered search",
                    desc: "Tell Scout what you need in plain English. It searches across every builder, project, skill, and hackathon result to find your match.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Hackathon-tested talent",
                    desc: "Antathon results show who can ship under pressure. Filter by hackathon participation and wins to find proven performers.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08, ease }}
                    className="flex gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: "#111111",
                      }}
                    >
                      <item.icon className="w-4.5 h-4.5" style={{ color: "#C6F135" }} />
                    </div>
                    <div>
                      <h3
                        className="text-[16px] font-bold tracking-tight mb-1"
                        style={{ color: "#111111" }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: "#737373" }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          7. ANIMATED NETWORK STATS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#F5F5F5", borderTop: "1px solid #EBEBEB", borderBottom: "1px solid #EBEBEB" }}>
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
              The Network
            </span>
            <h2
              className="font-display mt-3 tracking-[-0.03em]"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#111111",
              }}
            >
              Growing every day.
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { value: builders.length, suffix: "+", label: "Verified Builders", icon: Users },
              { value: projects.length, suffix: "", label: "Projects Shipped", icon: Rocket },
              { value: antathons.length, suffix: "", label: "Antathons Run", icon: Trophy },
              { value: totalLikes, suffix: "+", label: "Total Upvotes", icon: Heart },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease }}
                className="text-center p-8 rounded-2xl"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EBEBEB",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "rgba(198,241,53,0.12)" }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: "#C6F135" }} />
                </div>
                <div
                  className="font-display font-bold tracking-tight mb-1"
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                    color: "#C6F135",
                  }}
                >
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div
                  className="text-[12px] font-bold uppercase tracking-widest"
                  style={{ color: "#111111" }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          8. TEAM / FOUNDER — Ofir Sela
          ═══════════════════════════════════════════════════════ */}
      <section className="py-32 px-6" style={{ background: "#FAFAF7" }}>
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
              style={{ color: "#C6F135" }}
            >
              The Founder
            </span>
            <h2
              className="font-display mt-3 tracking-[-0.03em]"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                color: "#111111",
              }}
            >
              Built by a builder.
            </h2>
          </motion.div>

          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="max-w-[680px] mx-auto"
          >
            <div
              className="p-10 md:p-12 rounded-2xl"
              style={{
                background: "#ffffff",
                border: "1px solid #EBEBEB",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-7">
                {/* Avatar */}
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-[26px] font-bold text-white shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #262626 0%, #171717 100%)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  OS
                </div>
                <div>
                  <h3
                    className="text-[24px] font-bold tracking-tight mb-1"
                    style={{ color: "#111111" }}
                  >
                    Ofir Sela
                  </h3>
                  <p
                    className="text-[14px] font-semibold mb-5"
                    style={{ color: "#C6F135" }}
                  >
                    Founder & Builder
                  </p>
                  <div
                    className="space-y-4 text-[15px] leading-relaxed"
                    style={{ color: "#525252" }}
                  >
                    <p>
                      Obsessed with one idea: the world should discover talent based
                      on what people build, not what they say. Came from the{" "}
                      <span className="font-semibold" style={{ color: "#111111" }}>
                        Wealthsimple AI Builder Program
                      </span>{" "}
                      where the idea for Antry was born.
                    </p>
                    <p>
                      Believes that the future of hiring is live demos and shipped
                      products, not PDF resumes and cover letters. Building the
                      community where every builder can be seen for their work.
                    </p>
                  </div>

                  {/* Social links */}
                  <div className="flex items-center gap-4 mt-6 pt-6" style={{ borderTop: "1px solid #EBEBEB" }}>
                    <a
                      href="https://github.com/OfirCS"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 hover:-translate-y-[1px]"
                      style={{
                        color: "#111111",
                        background: "#F5F5F5",
                        border: "1px solid #EBEBEB",
                      }}
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                    <a
                      href="https://twitter.com/ofirsela"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 hover:-translate-y-[1px]"
                      style={{
                        color: "#111111",
                        background: "#F5F5F5",
                        border: "1px solid #EBEBEB",
                      }}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Twitter
                    </a>
                    <a
                      href="https://linkedin.com/in/ofirsela"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 hover:-translate-y-[1px]"
                      style={{
                        color: "#111111",
                        background: "#F5F5F5",
                        border: "1px solid #EBEBEB",
                      }}
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          9. CTA — Join the community
          ═══════════════════════════════════════════════════════ */}
      <section className="py-32 px-6" style={{ background: "#FAFAF7" }}>
        <div className="max-w-[640px] mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-8 flex items-center justify-center"
              style={{ background: "rgba(198,241,53,0.15)" }}
            >
              <Rocket className="w-7 h-7" style={{ color: "#C6F135" }} />
            </div>
            <h2
              className="font-display tracking-[-0.025em] mb-4 leading-[1.05]"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                color: "#111111",
              }}
            >
              Ready to let your work
              <br />
              <span style={{ color: "#C6F135" }}>speak for itself?</span>
            </h2>
            <p
              className="text-[16px] leading-relaxed mb-10 font-medium max-w-[480px] mx-auto"
              style={{ color: "#525252" }}
            >
              Join the community of builders who are getting discovered
              for what they ship, not what they claim.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-2xl text-[15px] font-bold transition-all duration-200 hover:-translate-y-[1px]"
                style={{
                  background: "#111111",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 14px rgba(17,17,17,0.15)",
                }}
              >
                Create Your Profile
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/builders"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-2xl text-[15px] font-bold transition-all duration-200 hover:-translate-y-[1px]"
                style={{
                  background: "#FFFFFF",
                  color: "#111111",
                  border: "1px solid #EBEBEB",
                }}
              >
                Browse Builders
              </Link>
            </div>

            {/* Trust note */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 text-[13px]"
              style={{ color: "#737373" }}
            >
              Free to join. Your work is your application.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
