"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate, useSpring } from "framer-motion";
import {
  ArrowRight,
  Check,
  GitBranch,
  Shield,
  Search,
  Terminal,
  Layers,
  BarChart3,
  Building2,
  ChevronRight,
  Rocket,
  Users,
  Zap,
  Briefcase,
  TrendingUp,
  Trophy,
  Code2,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { Nav } from "@/components/Nav";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Button } from "@/components/ui/button";
import { antathons, projects } from "@/lib/mock-data";

/* ── Shared ───────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
};

const tierRank = { title: 0, gold: 1, partner: 2 } as const;

function uniqueSponsorsWithTier() {
  const map = new Map<string, "title" | "gold" | "partner">();
  for (const a of antathons) {
    for (const s of a.sponsors) {
      const existing = map.get(s.name);
      if (!existing || tierRank[s.tier] < tierRank[existing]) {
        map.set(s.name, s.tier);
      }
    }
  }
  return Array.from(map.entries())
    .map(([name, tier]) => ({ name, tier }))
    .sort((a, b) => tierRank[a.tier] - tierRank[b.tier]);
}

/* ── Animated Counter ─────────────────────── */
function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const display = useTransform(count, (v) =>
    value >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toLocaleString()
  );
  useEffect(() => {
    const controls = animate(count, value, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [count, value]);
  return <motion.span>{display}</motion.span>;
}

/* ── Floating Project Cards (Hero Visual) ── */

const cardColors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899"];

const cardPositions = [
  { x: 20, y: 40, rotate: -2, scale: 1, zIndex: 5, floatOffset: 0 },
  { x: 200, y: 0, rotate: 3, scale: 0.93, zIndex: 4, floatOffset: 1 },
  { x: 60, y: 200, rotate: -1.5, scale: 0.9, zIndex: 3, floatOffset: 2 },
  { x: 230, y: 160, rotate: 2, scale: 0.87, zIndex: 2, floatOffset: 0.5 },
  { x: 130, y: -10, rotate: -3, scale: 0.84, zIndex: 1, floatOffset: 1.5 },
];

function MiniProjectCard({
  project,
  color,
  pos,
  index,
}: {
  project: (typeof projects)[number];
  color: string;
  pos: (typeof cardPositions)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: pos.rotate * 2 }}
      animate={{
        opacity: 1,
        y: [0, -10, 0],
        rotate: pos.rotate,
      }}
      transition={{
        opacity: { delay: 0.3 + index * 0.12, duration: 0.5 },
        y: {
          delay: pos.floatOffset,
          repeat: Infinity,
          duration: 3.5 + index * 0.3,
          ease: "easeInOut",
        },
        rotate: { delay: 0.3 + index * 0.12, duration: 0.5 },
      }}
      whileHover={{
        scale: 1.08,
        zIndex: 20,
        rotate: 0,
        boxShadow: `0 20px 40px ${color}20`,
      }}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        zIndex: pos.zIndex,
        scale: pos.scale,
      }}
      className="w-[210px] rounded-xl border bg-white p-4 shadow-lg shadow-black/[0.04] cursor-pointer select-none"
    >
      {/* Color accent line */}
      <div className="h-0.5 w-8 rounded-full mb-3" style={{ backgroundColor: color }} />

      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-semibold text-white"
          style={{ background: project.builder.gradient }}
        >
          {project.builder.name.charAt(0)}
        </div>
        <span className="text-[11px] text-text-tertiary">{project.builder.name}</span>
      </div>

      <div className="text-[14px] font-semibold text-text-primary mb-0.5 leading-tight">
        {project.title}
      </div>
      <div className="text-[11px] text-text-tertiary line-clamp-1 mb-2.5">
        {project.tagline}
      </div>

      <div className="flex items-center gap-1.5">
        {project.techStack.slice(0, 2).map((t) => (
          <span
            key={t}
            className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor: `${color}10`, color: color }}
          >
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function HeroVisual() {
  const heroProjects = [
    projects[0],
    projects[1],
    projects[3],
    projects[4],
    projects[6],
  ];

  return (
    <div className="relative w-[460px] h-[380px] hidden lg:block">
      {heroProjects.map((project, i) => (
        <MiniProjectCard
          key={project.id}
          project={project}
          color={cardColors[i]}
          pos={cardPositions[i]}
          index={i}
        />
      ))}
    </div>
  );
}

/* ── Feature row item ─────────────────────── */
function Feature({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="group flex items-start gap-3.5 p-4 rounded-xl hover:bg-background-secondary/60 transition-colors"
    >
      <div
        className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}10` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <h3 className="text-[14px] font-semibold text-text-primary mb-0.5">{title}</h3>
        <p className="text-[13px] text-text-secondary leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

/* ── Trust bar ────────────────────────────── */
function TrustBar() {
  const sponsors = uniqueSponsorsWithTier();
  const items = sponsors.map((s) => (
    <span
      key={s.name}
      className="inline-flex items-center px-8 opacity-25 hover:opacity-60 transition-opacity cursor-default select-none"
    >
      <span className="text-[12px] font-semibold tracking-widest text-text-primary uppercase">
        {s.name}
      </span>
    </span>
  ));

  return (
    <div className="py-6 overflow-hidden border-y border-border-secondary/60">
      <div className="trustbar-mask">
        <div className="animate-trustbar-marquee flex w-max items-center">
          <div className="flex items-center">
            {items}
            {items}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Interactive Project Showcase ──────────── */
function ProjectShowcase() {
  const featured = [...projects].slice(0, 6);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none -mx-6 px-6"
      >
        {featured.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.4, ease }}
            className="snap-start shrink-0 w-[300px]"
          >
            <Link
              href={`/projects/${project.id}`}
              className="group block rounded-xl border border-border-primary bg-surface p-5 hover:border-text-tertiary/30 hover:shadow-md transition-all h-full relative overflow-hidden"
            >
              {/* Subtle color accent top */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: cardColors[i % cardColors.length] }}
              />

              <div className="flex items-center gap-2 mb-3 mt-1">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-semibold text-white"
                  style={{ background: project.builder.gradient }}
                >
                  {project.builder.name.charAt(0)}
                </div>
                <span className="text-[11px] font-medium text-text-tertiary">
                  {project.builder.name}
                </span>
                <div className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <Check className="h-2.5 w-2.5" /> Verified
                </div>
              </div>

              <h3 className="text-[16px] font-semibold text-text-primary mb-1 group-hover:text-accent-bright transition-colors">
                {project.title}
              </h3>
              <p className="text-[12px] text-text-tertiary line-clamp-2 mb-4 leading-relaxed">
                {project.tagline}
              </p>

              <div className="flex items-center gap-1.5 mt-auto">
                {project.techStack.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-medium text-text-tertiary bg-background-secondary px-1.5 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
                <span className="ml-auto text-[10px] text-text-tertiary">
                  {project.likes} signals
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────── */
export default function Home() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-background-primary pt-14">
        {/* ════════ HERO ════════ */}
        <section className="relative overflow-hidden py-16 sm:py-24 min-h-[calc(100vh-56px)] flex items-center">
          {/* Subtle gradient orbs */}
          <div className="absolute top-20 right-[10%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.03] blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-[5%] w-[400px] h-[400px] rounded-full bg-violet-500/[0.03] blur-3xl pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-[1200px] px-6 w-full">
            <div className="flex items-center justify-between gap-12">
              {/* Left */}
              <div className="max-w-[520px]">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-primary bg-background-secondary/80 text-[12px] font-medium text-text-secondary mb-5"
                >
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                  />
                  Now in early access
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease }}
                  className="text-[clamp(2.4rem,5.5vw,4rem)] leading-[1.05] tracking-[-0.035em] text-text-primary mb-5"
                >
                  Build. Hire.{" "}
                  <span className="text-text-tertiary">Hack.</span>
                  <br />
                  Invest. Ship.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-[16px] leading-relaxed text-text-secondary mb-8 max-w-[420px]"
                >
                  The AI coder platform where builders ship, companies hire, hackers compete, and investors discover the next big idea.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-wrap items-center gap-3"
                >
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      Get started <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/discover">Explore platform</Link>
                  </Button>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="flex items-center gap-8 mt-10 pt-6 border-t border-border-secondary"
                >
                  {[
                    { value: 12400, label: "Projects shipped" },
                    { value: 4200, label: "Builders" },
                    { value: 140, label: "Frameworks", suffix: "+" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-[22px] font-semibold tracking-tight text-text-primary tabular-nums">
                        <AnimatedNumber value={stat.value} />
                        {stat.suffix}
                      </div>
                      <div className="text-[11px] text-text-tertiary mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right: Floating cards */}
              <HeroVisual />
            </div>
          </div>
        </section>

        {/* ════════ TRUST BAR ════════ */}
        <TrustBar />

        {/* ════════ PLATFORM PILLARS ════════ */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-[1100px] px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-[clamp(1.5rem,3vw,2.4rem)] tracking-tight mb-2">
                One platform, every opportunity
              </h2>
              <p className="text-[15px] text-text-secondary max-w-[440px] mx-auto">
                Whether you build, hire, hack, or invest — Antry connects the entire AI builder ecosystem.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {[
                {
                  icon: Code2,
                  title: "Build",
                  description: "Ship projects, create your verified portfolio, and get discovered by your work.",
                  color: "#3B82F6",
                  href: "/discover",
                  cta: "Start building",
                },
                {
                  icon: Briefcase,
                  title: "Hire",
                  description: "Find proven engineers by their shipped projects, not resume keywords.",
                  color: "#8B5CF6",
                  href: "/hire",
                  cta: "Browse talent",
                },
                {
                  icon: Trophy,
                  title: "Hack",
                  description: "Compete in hackathons, win prizes, and earn verified credentials.",
                  color: "#F59E0B",
                  href: "/hackathons",
                  cta: "Join hackathons",
                },
                {
                  icon: TrendingUp,
                  title: "Invest",
                  description: "Discover promising startups from builders with proven track records.",
                  color: "#10B981",
                  href: "/invest",
                  cta: "Explore startups",
                },
              ].map(({ icon: Icon, title, description, color, href, cta }) => (
                <motion.div key={title} variants={fadeUp}>
                  <Link
                    href={href}
                    className="group block rounded-xl border border-border-primary bg-surface p-6 hover:border-text-tertiary/30 hover:shadow-lg transition-all h-full relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: color }}
                    />
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${color}10` }}
                    >
                      <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                    <h3 className="text-[18px] font-semibold text-text-primary mb-1.5">
                      {title}
                    </h3>
                    <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
                      {description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold group-hover:gap-2 transition-all" style={{ color }}>
                      {cta} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ════════ FEATURES GRID ════════ */}
        <section className="py-16 sm:py-20 bg-background-secondary/30">
          <div className="mx-auto max-w-[1000px] px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] tracking-tight mb-2">
                Built for builders who ship
              </h2>
              <p className="text-[14px] text-text-secondary">
                Your work speaks. We amplify it.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-1"
            >
              <Feature icon={Shield} title="Verified history" description="Every project indexed from GitHub, Vercel, and deployment logs." color="#10B981" />
              <Feature icon={Layers} title="Stack analysis" description="Your depth and patterns mapped across 140+ frameworks." color="#8B5CF6" />
              <Feature icon={Search} title="Get discovered" description="Companies find you by real skills, not resume keywords." color="#F59E0B" />
              <Feature icon={Terminal} title="Live demos" description="Attach working demos. Show what you built, not slides." color="#3B82F6" />
              <Feature icon={BarChart3} title="Signal metrics" description="Track your reputation with real-time community engagement." color="#EC4899" />
              <Feature icon={Users} title="Collaborate" description="Find co-builders for hackathons, projects, and startups." color="#06B6D4" />
            </motion.div>
          </div>
        </section>

        {/* ════════ PROJECTS ════════ */}
        <section className="py-14 sm:py-18">
          <div className="mx-auto max-w-[1200px] px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between gap-4 mb-6"
            >
              <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] tracking-tight">Recently shipped</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/builders" className="text-text-secondary">
                  View all <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Link>
              </Button>
            </motion.div>
            <ProjectShowcase />
          </div>
        </section>

        {/* ════════ CTA ════════ */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-[520px] px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] tracking-tight mb-2">
                Ready to ship?
              </h2>
              <p className="text-[14px] text-text-secondary mb-8">
                Join builders who prove their work, not just talk about it.
              </p>
              <WaitlistForm initialCount={537} />
            </motion.div>
          </div>
        </section>

        {/* ════════ FOOTER ════════ */}
        <footer className="bg-background-primary border-t border-border-primary px-6 py-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr]">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center">
                    <Image src="/logo.png" alt="Antry" width={16} height={16} className="object-contain invert" />
                  </div>
                  <span className="text-[16px] font-semibold tracking-tight">Antry</span>
                </div>
                <p className="text-[13px] text-text-tertiary max-w-[220px] leading-relaxed">
                  The AI coder platform — build, hire, hack, invest.
                </p>
              </div>

              {[
                { title: "Platform", links: [["Discover", "/discover"], ["Hire Talent", "/hire"], ["Hackathons", "/hackathons"], ["Invest", "/invest"]] },
                { title: "Company", links: [["For teams", "/companies"], ["About", "/about"], ["Blog", "/blog"]] },
                { title: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"]] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">{col.title}</h4>
                  <ul className="space-y-2 text-[13px] text-text-secondary">
                    {col.links.map(([label, href]) => (
                      <li key={label}>
                        <Link href={href} className="hover:text-text-primary transition-colors">{label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-border-secondary flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-[12px] text-text-tertiary">
              <span>&copy; 2026 Antry Inc.</span>
              <div className="flex gap-5">
                <Link href="#" className="hover:text-text-primary transition-colors">Twitter</Link>
                <Link href="#" className="hover:text-text-primary transition-colors">GitHub</Link>
                <Link href="#" className="hover:text-text-primary transition-colors">Discord</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
