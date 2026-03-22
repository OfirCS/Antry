"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Database,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Button } from "@/components/ui/button";
import { antathons, builders, projects, getInitials } from "@/lib/mock-data";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function uniqueSponsors() {
  return Array.from(new Set(antathons.flatMap((a) => a.sponsors.map((s) => s.name))));
}

/* ── Animated data visualization for hero ─── */
function HeroVisual() {
  const topBuilders = [...builders].sort((a, b) => b.projectCount - a.projectCount).slice(0, 4);

  return (
    <div className="relative w-full max-w-[560px] mx-auto" style={{ perspective: "1200px" }}>
      {/* Glow behind the card */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-accent/[0.06] blur-[80px] scale-110" />

      <motion.div
        initial={{ rotateY: -8, rotateX: 4, opacity: 0, scale: 0.95 }}
        animate={{ rotateY: 0, rotateX: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="rounded-2xl border border-border-primary glass-card overflow-hidden shadow-2xl shadow-accent/5"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border-primary px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-accent/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-accent/30" />
            <div className="h-2.5 w-2.5 rounded-full bg-accent/15" />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-accent font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Search bar mock */}
        <div className="border-b border-border-primary px-5 py-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 text-[13px]">
              <Search className="h-3.5 w-3.5 text-accent shrink-0" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-text-secondary whitespace-nowrap"
              >
                Find AI builders with agent experience...
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Results grid */}
        <div className="divide-y divide-border-secondary">
          {topBuilders.map((builder, index) => (
            <motion.div
              key={builder.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 + index * 0.15, duration: 0.5, ease }}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-accent-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                  style={{ background: builder.gradient }}
                >
                  {getInitials(builder.name)}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-text-primary">{builder.name}</p>
                  <p className="text-[11px] text-text-tertiary">{builder.skills.slice(0, 2).join(" / ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[11px] text-text-tertiary">
                  <Zap className="h-3 w-3 text-accent" />
                  {builder.projectCount} ships
                </div>
                <div className="h-1.5 w-16 rounded-full bg-border-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-bright"
                    initial={{ width: 0 }}
                    animate={{ width: `${95 - index * 8}%` }}
                    transition={{ duration: 0.8, delay: 2 + index * 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border-primary px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
            <Database className="h-3 w-3 text-accent/60" />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ delay: 2.5, duration: 1.5 }}
            >
              Indexed {builders.length} builders, {projects.length} projects
            </motion.span>
          </div>
          <span className="text-[10px] text-accent/60 font-mono">142ms</span>
        </div>
      </motion.div>

      {/* Floating stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 20, x: -20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 2.2, duration: 0.6, ease }}
        className="absolute -bottom-4 -left-4 z-10 hidden lg:block"
      >
        <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Verified</p>
            <p className="text-[15px] font-bold text-text-primary">{builders.length}+ Builders</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 2.5, duration: 0.6, ease }}
        className="absolute -top-3 -right-3 z-10 hidden lg:block"
      >
        <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">AI Match</p>
            <p className="text-[15px] font-bold text-text-primary">99.4%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Trust logos ───────────────────────────── */
function TrustBar() {
  const sponsors = uniqueSponsors();
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-16 px-6"
    >
      <div className="mx-auto max-w-[1100px] text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-text-tertiary mb-8">
          Trusted by builders from
        </p>
        <div
          className="relative overflow-hidden py-4 fade-edges"
        >
          <div className="marquee-track">
            {[...sponsors, ...sponsors, ...sponsors].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="shrink-0 px-10 text-[16px] font-bold tracking-tight text-text-tertiary/50"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ── Feature card component ───────────────── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease }}
      className="group relative rounded-2xl border border-border-primary bg-surface/50 p-8 transition-all duration-300 hover:border-accent/20 hover:bg-surface"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-accent/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-[17px] font-bold tracking-tight text-text-primary mb-3">{title}</h3>
        <p className="text-[14px] leading-relaxed text-text-secondary">{description}</p>
      </div>
    </motion.div>
  );
}

/* ── Step card ────────────────────────────── */
function StepCard({ number, title, detail, delay }: { number: number; title: string; detail: string; delay: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease }}
      className="relative text-center px-6"
    >
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent font-display text-[20px] font-bold">
        {number}
      </div>
      <h3 className="text-[17px] font-bold text-text-primary mb-3">{title}</h3>
      <p className="text-[14px] leading-relaxed text-text-secondary max-w-[280px] mx-auto">{detail}</p>
    </motion.div>
  );
}

/* ── Metric card ──────────────────────────── */
function MetricCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease }}
      className="text-center"
    >
      <p className="font-display text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight gradient-text">{value}</p>
      <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">{label}</p>
    </motion.div>
  );
}

/* ── Main page ────────────────────────────── */
export default function Home() {
  const featuredBuilders = [...builders].sort((a, b) => b.projectCount - a.projectCount).slice(0, 6);
  const featuredProjects = [...projects].sort((a, b) => b.likes - a.likes).slice(0, 6);

  const nextAntathon = antathons.find((a) => a.status === "active") ?? antathons[0];
  const prizeTotal =
    nextAntathon?.prizes
      .map((p) => parseInt(p.reward.replace(/[^0-9]/g, ""), 10) || 0)
      .reduce((a, b) => a + b, 0) ?? 0;

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-background-primary pt-16 text-text-primary">

        {/* ════════ HERO ════════ */}
        <section className="relative overflow-hidden pb-8 pt-20 sm:pb-16 sm:pt-32">
          {/* Background orbs */}
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="spotlight" />

          <div className="relative z-10 mx-auto max-w-[1200px] px-6 sm:px-8">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              {/* Left: Copy */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent mb-8"
                >
                  <Sparkles className="h-3 w-3" />
                  AI-Powered Discovery
                </motion.div>

                <h1 className="font-display text-[clamp(2.6rem,5.5vw,4.8rem)] leading-[0.92] tracking-[-0.04em]">
                  <span className="text-text-primary">The hiring layer</span>
                  <br />
                  <span className="gradient-text-accent">for builders.</span>
                </h1>

                <p className="mt-6 max-w-[440px] text-[17px] leading-relaxed text-text-secondary">
                  Discover technical talent through verified shipping history. No resumes, just real signal.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Button variant="default" size="lg" asChild>
                    <Link href="/signup">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/discover">
                      Explore Projects
                    </Link>
                  </Button>
                </div>

                <div className="mt-10 flex items-center gap-6">
                  <div className="flex -space-x-2">
                    {featuredBuilders.slice(0, 4).map((b) => (
                      <div
                        key={b.id}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background-primary text-[9px] font-bold text-white"
                        style={{ background: b.gradient }}
                      >
                        {getInitials(b.name)}
                      </div>
                    ))}
                  </div>
                  <p className="text-[13px] text-text-tertiary">
                    <span className="text-text-secondary font-semibold">{builders.length}+ builders</span> already verified
                  </p>
                </div>
              </motion.div>

              {/* Right: Animated Visual */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <HeroVisual />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════════ TRUST BAR ════════ */}
        <TrustBar />

        {/* ════════ METRICS ════════ */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-[900px]">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <MetricCard value={`${builders.length}+`} label="Verified Builders" delay={0} />
              <MetricCard value={`${projects.length}+`} label="Shipped Projects" delay={0.08} />
              <MetricCard value={`${antathons.length}`} label="Hackathons" delay={0.16} />
              <MetricCard value="2.7x" label="Faster Hiring" delay={0.24} />
            </div>
          </div>
        </section>

        {/* ════════ FEATURES ════════ */}
        <section className="relative px-6 py-24 sm:px-8">
          <div className="spotlight" />
          <div className="relative z-10 mx-auto max-w-[1100px]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="text-center mb-16"
            >
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">Platform</span>
              <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.95] tracking-[-0.03em] text-text-primary">
                Built for precision discovery
              </h2>
              <p className="mt-4 mx-auto max-w-[500px] text-[16px] text-text-secondary">
                Every feature designed to surface genuine builder signal from noise.
              </p>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Database}
                title="Data Grounded"
                description="The agent uses only your production dataset. No hallucinations, no random internet context."
                delay={0}
              />
              <FeatureCard
                icon={Bot}
                title="AI Decision Assist"
                description="Natural-language search returns structured builder and project cards with clear fit signals."
                delay={0.08}
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Production Guardrails"
                description="Rate limits and strict query scope protect resources while maintaining response quality."
                delay={0.16}
              />
              <FeatureCard
                icon={Search}
                title="Verified Signal"
                description="Every builder profile is backed by live demos and real shipping history, not resume claims."
                delay={0.24}
              />
              <FeatureCard
                icon={Layers}
                title="Rich Entity Cards"
                description="Structured results with skills, projects, and hackathon performance in one glanceable view."
                delay={0.32}
              />
              <FeatureCard
                icon={Zap}
                title="142ms Latency"
                description="Optimized retrieval pipeline delivers answers in milliseconds, not seconds."
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* ════════ HOW IT WORKS ════════ */}
        <section className="px-6 py-24 sm:px-8">
          <div className="mx-auto max-w-[1000px]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="text-center mb-20"
            >
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">How it works</span>
              <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.95] tracking-[-0.03em] text-text-primary">
                Three steps to your next hire
              </h2>
            </motion.div>

            <div className="grid gap-12 sm:grid-cols-3">
              <StepCard
                number={1}
                title="Search naturally"
                detail="Describe the builder you need in plain English. The AI routes your intent to the right data."
                delay={0}
              />
              <StepCard
                number={2}
                title="Review signal"
                detail="Get structured profiles with shipped projects, hackathon wins, and verified skills."
                delay={0.1}
              />
              <StepCard
                number={3}
                title="Take action"
                detail="Connect with matched builders directly. No middlemen, no resume screening."
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* ════════ BUILDER SHOWCASE ════════ */}
        <section className="relative px-6 py-24 sm:px-8 overflow-hidden">
          <div className="spotlight" />
          <div className="relative z-10 mx-auto max-w-[1100px]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="flex items-end justify-between gap-4 mb-12"
            >
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">Builders</span>
                <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.95] tracking-[-0.03em] text-text-primary">
                  Explore shipped work
                </h2>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/builders">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {featuredProjects.slice(0, 6).map((project) => (
                <motion.div key={project.id} variants={fadeUp} transition={{ duration: 0.5, ease }}>
                  <Link
                    href={`/projects/${project.id}`}
                    className="group block rounded-2xl border border-border-primary bg-surface/50 p-6 transition-all duration-300 hover:border-accent/20 hover:bg-surface hover:shadow-[0_8px_30px_rgba(59,91,219,0.08)]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-[13px] font-bold text-white"
                        style={{ background: project.gradient }}
                      >
                        {project.title.slice(0, 1)}
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-[16px] font-bold text-text-primary mb-1">{project.title}</h3>
                    <p className="text-[13px] text-text-secondary line-clamp-2 mb-6">{project.tagline}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border-secondary">
                      <span className="text-[11px] font-semibold text-text-tertiary">{project.builder.name}</span>
                      <div className="flex items-center gap-1 text-[11px] text-accent font-semibold">
                        <Zap className="h-3 w-3" />
                        {project.likes}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ════════ FEATURED HACKATHON ════════ */}
        {nextAntathon && (
          <section className="px-6 py-12 sm:px-8">
            <div className="mx-auto max-w-[1100px]">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease }}
              >
                <Link
                  href={`/hackathons/${nextAntathon.id}`}
                  className="group relative block overflow-hidden rounded-3xl border border-border-primary bg-surface/30 transition-all duration-300 hover:border-accent/20 hover:shadow-[0_12px_40px_rgba(59,91,219,0.08)]"
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.06] via-transparent to-purple-500/[0.04]" />
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />

                  <div className="relative z-10 p-10 sm:p-14 lg:p-20">
                    <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent mb-6">
                          <Trophy className="h-3 w-3" />
                          Featured Hackathon
                        </div>
                        <h3 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[0.94] tracking-[-0.03em] text-text-primary">
                          {nextAntathon.title}
                        </h3>
                        <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-text-secondary">{nextAntathon.theme}</p>
                        <div className="mt-6 flex flex-wrap gap-4 text-[12px] font-semibold text-text-tertiary">
                          {prizeTotal > 0 && (
                            <span className="inline-flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                              ${prizeTotal.toLocaleString()} prize pool
                            </span>
                          )}
                          {nextAntathon.participantCount > 0 && (
                            <span className="inline-flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                              {nextAntathon.participantCount} builders
                            </span>
                          )}
                        </div>
                      </div>

                      <Button variant="default" size="lg" className="self-end">
                        View hackathon
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* ════════ CTA ════════ */}
        <section className="px-6 py-24 sm:px-8">
          <div className="mx-auto max-w-[800px]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="relative overflow-hidden rounded-3xl border border-border-primary bg-surface/50 px-8 py-20 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] to-transparent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-accent/5 blur-[100px]" />

              <div className="relative z-10">
                <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">Join the colony</span>
                <h2 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.93] tracking-[-0.03em] text-text-primary">
                  Start building your
                  <br />
                  verified reputation.
                </h2>
                <p className="mx-auto mt-5 max-w-[420px] text-[16px] leading-relaxed text-text-secondary">
                  Let your shipped work speak louder than any resume ever could.
                </p>
                <div className="mt-10">
                  <WaitlistForm initialCount={537} />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════════ FOOTER ════════ */}
        <footer className="border-t border-border-primary px-6 pb-12 pt-16 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <Image src="/logo.png" alt="Antry" width={20} height={20} className="object-contain brightness-0 dark:invert" />
                  <span className="text-[17px] font-bold tracking-tight text-text-primary">Antry</span>
                </div>
                <p className="mt-4 max-w-[280px] text-[13px] leading-relaxed text-text-tertiary">
                  Discover builders by what they ship, not what they claim.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[13px] font-medium text-text-tertiary">
                <Link href="/discover" className="transition-colors hover:text-text-primary">Discover</Link>
                <Link href="/builders" className="transition-colors hover:text-text-primary">Builders</Link>
                <Link href="/hackathons" className="transition-colors hover:text-text-primary">Hackathons</Link>
                <Link href="/companies" className="transition-colors hover:text-text-primary">Companies</Link>
              </div>
            </div>
            <div className="mt-12 flex flex-col gap-4 border-t border-border-secondary pt-8 text-[11px] text-text-tertiary sm:flex-row sm:items-center sm:justify-between">
              <span>&copy; 2026 Antry Platform</span>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
