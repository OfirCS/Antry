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

/* ── Animated data visualization for hero ─── */
function HeroVisual() {
  const topBuilders = [...builders].sort((a, b) => b.projectCount - a.projectCount).slice(0, 4);

  return (
    <div className="relative w-full max-w-[600px] mx-auto" style={{ perspective: "1500px" }}>
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-accent/[0.04] blur-[100px] scale-125" />

      <motion.div
        initial={{ rotateY: -10, rotateX: 5, opacity: 0, scale: 0.98 }}
        animate={{ rotateY: 0, rotateX: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl border border-border-primary bg-surface shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden"
      >
        {/* Top bar - Ultra Clean */}
        <div className="flex items-center justify-between border-b border-border-tertiary px-6 py-4 bg-background-secondary/30">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-border-primary" />
            <div className="h-2 w-2 rounded-full bg-border-primary" />
            <div className="h-2 w-2 rounded-full bg-border-primary" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent-muted px-2 py-0.5 rounded-md">
              Engine v2.4
            </span>
          </div>
        </div>

        {/* Search / Command Bar */}
        <div className="px-6 py-5 border-b border-border-tertiary">
          <div className="flex items-center gap-3 text-[14px] text-text-tertiary">
            <Search className="h-4 w-4 text-accent" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-1"
            >
              <span>Querying</span>
              <span className="text-text-primary font-medium">"top AI agents builders"</span>
              <span className="w-1 h-4 bg-accent animate-pulse ml-0.5" />
            </motion.div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-2">
          {topBuilders.map((builder, index) => (
            <motion.div
              key={builder.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-background-secondary transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
                  style={{ background: builder.gradient }}
                >
                  {getInitials(builder.name)}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-text-primary">{builder.name}</p>
                  <p className="text-[12px] text-text-tertiary tracking-tight">{builder.skills.slice(0, 2).join(" · ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">{builder.projectCount} ships</span>
                  <div className="h-1 w-20 rounded-full bg-border-tertiary mt-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${85 - index * 12}%` }}
                      transition={{ duration: 1, delay: 1.8 + index * 0.1 }}
                    />
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Status */}
        <div className="px-6 py-4 bg-background-secondary/30 border-t border-border-tertiary flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] font-medium text-text-tertiary uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Verified
            </span>
            <span className="opacity-40">/</span>
            <span>{builders.length} nodes</span>
          </div>
          <div className="text-[10px] font-mono text-text-tertiary bg-surface px-2 py-0.5 rounded border border-border-tertiary">
            LATENCY: 84MS
          </div>
        </div>
      </motion.div>

      {/* Floating Detail Elements */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="absolute -right-8 top-1/4 z-10 hidden xl:block"
      >
        <div className="bg-surface border border-border-primary p-4 rounded-xl shadow-xl backdrop-blur-md max-w-[180px]">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-4 w-4 text-accent" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">Agent Intel</span>
          </div>
          <p className="text-[12px] leading-relaxed text-text-secondary">
            Matches found across <span className="text-text-primary font-bold">12 frameworks</span>.
          </p>
        </div>
      </motion.div>
    </div>
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
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-xl border border-border-primary bg-surface p-8 transition-all duration-500 hover:border-accent/40 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]"
    >
      <div className="relative z-10">
        <div className="mb-8 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background-secondary text-text-primary group-hover:bg-accent group-hover:text-[#0a0b0d] transition-colors duration-500">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-[18px] font-bold tracking-tight text-text-primary mb-3">{title}</h3>
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
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative px-8"
    >
      <div className="mb-6 font-mono text-[11px] font-bold tracking-[0.2em] text-accent uppercase">
        Step {number}
      </div>
      <h3 className="text-[20px] font-bold text-text-primary mb-4 tracking-tight">{title}</h3>
      <p className="text-[15px] leading-relaxed text-text-secondary">{detail}</p>
    </motion.div>
  );
}

/* ── Trust bar ────────────────────────────── */
function SponsorItem({ name, tier }: { name: string; tier: "title" | "gold" | "partner" }) {
  const dotClass =
    tier === "title"
      ? "bg-accent shadow-[0_0_8px_var(--glow-accent-strong)]"
      : tier === "gold"
        ? "bg-text-tertiary/50"
        : "bg-text-tertiary/25";
  const textClass =
    tier === "title"
      ? "font-bold text-text-primary"
      : tier === "gold"
        ? "font-semibold text-text-secondary"
        : "font-medium text-text-tertiary";

  return (
    <span className={`inline-flex items-center gap-2.5 px-6 whitespace-nowrap ${textClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotClass}`} />
      <span className="text-[14px] tracking-tight">{name}</span>
    </span>
  );
}

function TrustBar() {
  const sponsors = uniqueSponsorsWithTier();
  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="border-y border-border-tertiary bg-background-secondary/30 py-10 overflow-hidden"
    >
      <p className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary">
        Backed by leading sponsors
      </p>
      <div className="marquee-mask">
        <div className="animate-marquee flex w-max">
          {/* Primary set */}
          <div className="flex items-center">
            {sponsors.map((s) => (
              <SponsorItem key={s.name} name={s.name} tier={s.tier} />
            ))}
          </div>
          {/* Duplicate for seamless loop */}
          <div className="flex items-center" aria-hidden="true">
            {sponsors.map((s) => (
              <SponsorItem key={`dup-${s.name}`} name={s.name} tier={s.tier} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
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
      <main className="min-h-screen bg-background-primary pt-20 text-text-primary">

        {/* ════════ HERO ════════ */}
        <section className="relative overflow-hidden pb-24 pt-24 sm:pb-32 sm:pt-40">
          <div className="spotlight" />

          <div className="relative z-10 mx-auto max-w-[1400px] px-6 sm:px-10">
            <div className="grid items-center gap-20 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Left: Copy */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 rounded-full border border-border-primary bg-surface px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-secondary mb-10 shadow-sm"
                >
                  <Sparkles className="h-3 w-3 text-accent" />
                  Proof of Work Protocol
                </motion.div>

                <h1 className="font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.9] tracking-[-0.04em] text-text-primary">
                  The <span className="text-accent">intelligent layer</span> for technical talent.
                </h1>

                <p className="mt-8 max-w-[480px] text-[18px] leading-relaxed text-text-secondary">
                  Replace resumes with live signal. Discover builders through verified shipping history and real-world performance.
                </p>

                <div className="mt-12 flex flex-wrap items-center gap-5">
                  <Button variant="default" size="lg" className="rounded-full px-10 h-14 text-base" asChild>
                    <Link href="/signup">
                      Get Started
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full px-10 h-14 text-base" asChild>
                    <Link href="/builders">
                      Explore Network
                    </Link>
                  </Button>
                </div>
              </motion.div>

              {/* Right: Animated Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <HeroVisual />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════════ TRUST BAR ════════ */}
        <TrustBar />

        {/* ════════ FEATURES ════════ */}
        <section className="section-padding relative">
          <div className="mx-auto max-w-[1200px] px-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-24"
            >
              <h2 className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-[0.9] tracking-[-0.03em] text-text-primary max-w-[700px]">
                Built for deep technical discovery.
              </h2>
              <p className="mt-8 max-w-[500px] text-[17px] text-text-secondary leading-relaxed">
                We've stripped away the noise of resumes and referrals to focus on what actually matters: verified output.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Database}
                title="Verified Dataset"
                description="Built on a protocol that verifies GitHub contributions, live deployments, and technical peer reviews."
                delay={0}
              />
              <FeatureCard
                icon={Bot}
                title="AI Context Matching"
                description="Our engine understands tech stacks and problem complexity, not just keyword matching."
                delay={0.1}
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Zero-Trust Hiring"
                description="Don't trust claims. Every builder profile is anchored to cryptographically signed proof of work."
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* ════════ HOW IT WORKS ════════ */}
        <section className="section-padding bg-background-secondary/30 border-y border-border-tertiary">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid gap-20 lg:grid-cols-[0.8fr_1.2fr]">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-accent uppercase mb-6 block">The Workflow</span>
                <h2 className="font-display text-[clamp(2.4rem,5vw,3.5rem)] leading-[0.95] tracking-[-0.03em] text-text-primary">
                  How builders move from signal to success.
                </h2>
              </motion.div>

              <div className="grid gap-12 sm:grid-cols-2">
                <StepCard
                  number={1}
                  title="Connect Source"
                  detail="Builders link their GitHub, Vercel, and technical logs. Our engine indexes every commit and ship."
                  delay={0.1}
                />
                <StepCard
                  number={2}
                  title="Prove Quality"
                  detail="Participate in Antathons or ship projects to earn reputation scores across specific technical verticals."
                  delay={0.2}
                />
                <StepCard
                  number={3}
                  title="Get Discovered"
                  detail="Companies use our AI explorer to find the exact technical fit based on real performance data."
                  delay={0.3}
                />
                <StepCard
                  number={4}
                  title="Direct Hire"
                  detail="Engage builders directly with high-intent offers. No recruiters, no screening loops."
                  delay={0.4}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ════════ BUILDER SHOWCASE ════════ */}
        <section className="section-padding relative overflow-hidden">
          <div className="mx-auto max-w-[1200px] px-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-end justify-between gap-10 mb-20"
            >
              <div className="max-w-[600px]">
                <h2 className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-[0.9] tracking-[-0.03em] text-text-primary">
                  Shipped on Antry.
                </h2>
                <p className="mt-6 text-[17px] text-text-secondary">
                  Recent projects from the network's top technical minds.
                </p>
              </div>
              <Button variant="outline" size="lg" className="rounded-full" asChild>
                <Link href="/builders">View all work <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                >
                  <Link
                    href={`/projects/${project.id}`}
                    className="group card-premium block p-8 h-full flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-[14px] font-bold text-white shadow-lg"
                        style={{ background: project.gradient }}
                      >
                        {project.title.slice(0, 1)}
                      </div>
                      <div className="h-8 w-8 rounded-full bg-background-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <ArrowUpRight className="h-4 w-4 text-text-primary" />
                      </div>
                    </div>
                    <h3 className="text-[20px] font-bold text-text-primary mb-3 tracking-tight group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-[14px] text-text-secondary leading-relaxed line-clamp-2 mb-8 flex-grow">
                      {project.tagline}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-border-tertiary">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-text-primary">{project.builder.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-accent uppercase tracking-wider">
                        <Zap className="h-3.5 w-3.5" />
                        {project.likes} signal
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ CTA ════════ */}
        <section className="section-padding">
          <div className="mx-auto max-w-[1200px] px-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-[40px] border border-border-primary bg-surface px-10 py-24 text-center sm:px-16"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] to-transparent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-accent/[0.05] blur-[120px]" />

              <div className="relative z-10 mx-auto max-w-[600px]">
                <h2 className="font-display text-[clamp(2.6rem,5vw,4.5rem)] leading-[0.9] tracking-[-0.04em] text-text-primary">
                  Ready to prove your work?
                </h2>
                <p className="mx-auto mt-8 text-[18px] leading-relaxed text-text-secondary">
                  Join 2,400+ builders already building their verified technical reputation on Antry.
                </p>
                <div className="mt-12 flex flex-col items-center gap-6">
                  <WaitlistForm initialCount={537} />
                  <p className="text-[12px] font-medium text-text-tertiary uppercase tracking-widest">
                    Free for builders · No credit card required
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════════ FOOTER ════════ */}
        <footer className="border-t border-border-tertiary bg-surface px-6 pb-16 pt-24 sm:px-10">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
              <div className="col-span-1">
                <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="Antry" width={28} height={28} className="object-contain brightness-0 dark:invert" />
                  <span className="text-[20px] font-bold tracking-tight text-text-primary">Antry</span>
                </div>
                <p className="mt-6 text-[15px] leading-relaxed text-text-tertiary max-w-[260px]">
                  The intelligent layer for technical talent. Verified output over resume claims.
                </p>
              </div>
              
              <div>
                <h4 className="text-[13px] font-bold uppercase tracking-widest text-text-primary mb-6">Network</h4>
                <ul className="space-y-4 text-[14px] text-text-tertiary">
                  <li><Link href="/builders" className="hover:text-accent transition-colors">Explorer</Link></li>
                  <li><Link href="/hackathons" className="hover:text-accent transition-colors">Antathons</Link></li>
                  <li><Link href="/projects" className="hover:text-accent transition-colors">Project Feed</Link></li>
                  <li><Link href="/leaderboard" className="hover:text-accent transition-colors">Leaderboard</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[13px] font-bold uppercase tracking-widest text-text-primary mb-6">Platform</h4>
                <ul className="space-y-4 text-[14px] text-text-tertiary">
                  <li><Link href="/companies" className="hover:text-accent transition-colors">For Companies</Link></li>
                  <li><Link href="/about" className="hover:text-accent transition-colors">Our Vision</Link></li>
                  <li><Link href="/blog" className="hover:text-accent transition-colors">Changelog</Link></li>
                  <li><Link href="/pricing" className="hover:text-accent transition-colors">Pricing</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[13px] font-bold uppercase tracking-widest text-text-primary mb-6">Legal</h4>
                <ul className="space-y-4 text-[14px] text-text-tertiary">
                  <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-accent transition-colors">Terms</Link></li>
                  <li><Link href="/security" className="hover:text-accent transition-colors">Security</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-24 pt-12 border-t border-border-tertiary flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[13px] text-text-tertiary font-medium">
                &copy; 2026 Antry Platform. All rights reserved.
              </span>
              <div className="flex gap-8">
                <Link href="#" className="text-text-tertiary hover:text-text-primary transition-colors">Twitter</Link>
                <Link href="#" className="text-text-tertiary hover:text-text-primary transition-colors">GitHub</Link>
                <Link href="#" className="text-text-tertiary hover:text-text-primary transition-colors">Discord</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
