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
  Target,
  Play,
  Layers,
  CheckCircle2,
  Heart,
  Building2,
  Sparkles,
  Quote,
} from "lucide-react";
import { builders, projects, antathons, getInitials } from "@/lib/mock-data";
import { WaitlistForm } from "@/components/WaitlistForm";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const totalLikes = projects.reduce((a, p) => a + p.likes, 0);

export default function CompaniesPage() {
  return (
    <div className="bg-background-primary min-h-screen">
      {/* ─── HERO ─── */}
      <section className="pt-24 pb-20 px-8">
        <div className="max-w-[900px] mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, ease }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-muted border border-accent/15 rounded-lg text-[12px] font-semibold text-accent mb-8">
              <Building2 className="w-3.5 h-3.5" />
              For Companies &amp; Sponsors
            </div>

            <h1 className="font-display text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[0.92] tracking-[-0.035em] text-text-primary mb-6">
              Stop reading resumes.
              <br />
              <span className="italic text-accent">Watch people build.</span>
            </h1>

            <p className="text-[17px] md:text-[19px] text-text-secondary max-w-[620px] mx-auto leading-relaxed mb-10">
              The industry has changed. You&apos;re not hiring a &ldquo;React developer&rdquo; or a
              &ldquo;Python engineer&rdquo; anymore. You need people who can think across
              domains, ship fast, and explain their decisions. The best way to
              find them? <span className="text-text-primary font-medium">See what they build.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#sponsor"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-text-primary text-background-primary rounded-lg text-[14px] font-semibold hover:opacity-80 transition-opacity"
              >
                Become a sponsor
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://newsroom.wealthsimple.com/we-asked-canadians-to-build-something-instead-of-sending-a-resume-heres-what-happened"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-border-primary text-text-secondary rounded-lg text-[14px] font-medium hover:text-text-primary hover:border-text-tertiary transition-colors"
              >
                See how Wealthsimple did it
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── THE SHIFT (Problem) ─── */}
      <section className="py-24 px-8 bg-background-secondary">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mb-16"
          >
            <span className="text-[12px] font-semibold text-accent uppercase tracking-widest">
              The Problem
            </span>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] text-text-primary tracking-[-0.02em] mt-4 mb-6 leading-[1.1]">
              Hiring is broken.
              <br />
              Resumes don&apos;t tell you anything.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Target,
                title: "You're not hiring one skill anymore",
                desc: "Companies don't search for a specific niche developer. You need someone who can do frontend, backend, AI, design thinking — someone who ships entire products, not just tickets.",
              },
              {
                icon: Eye,
                title: "Resumes can't show thinking",
                desc: "A resume says \"built a dashboard.\" But you need to see how they approached it, what tradeoffs they made, how they explained their architecture. That's what separates good from great.",
              },
              {
                icon: Zap,
                title: "Speed matters more than credentials",
                desc: "In the AI era, the best builders ship in days, not quarters. You need to see their velocity — how fast they go from idea to deployed product with real users.",
              },
              {
                icon: Play,
                title: "3-minute demos beat 30-minute interviews",
                desc: "A live demo tells you more about a builder in 3 minutes than a technical interview does in 30. You see the product, the polish, the thinking — all at once.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="p-8 bg-surface rounded-lg border border-border-primary"
              >
                <item.icon className="w-5 h-5 text-accent mb-5" />
                <h3 className="text-[16px] font-semibold text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WEALTHSIMPLE PROOF POINT ─── */}
      <section className="py-24 px-8">
        <div className="max-w-[720px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="relative p-10 md:p-14 rounded-lg bg-text-primary text-white overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse at 20% 30%, #e8590c44 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, #7c3aed33 0%, transparent 50%)",
              }}
            />
            <div className="relative z-10">
              <Quote className="w-8 h-8 text-white/20 mb-6" />
              <p className="text-[18px] md:text-[22px] font-display leading-relaxed tracking-[-0.01em] mb-8">
                &ldquo;We asked Canadians to build something instead of sending a resume.
                Here&apos;s what happened.&rdquo;
              </p>
              <p className="text-[14px] text-white/50 leading-relaxed mb-8">
                Wealthsimple proved that when you let people show their work
                instead of listing their credentials, you find better talent faster.
                Antry is the permanent infrastructure for this approach —
                a platform where every builder has a living portfolio of shipped work.
              </p>
              <a
                href="https://newsroom.wealthsimple.com/we-asked-canadians-to-build-something-instead-of-sending-a-resume-heres-what-happened"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-text-primary rounded-lg text-[13px] font-semibold hover:bg-white/90 transition-colors"
              >
                Read the Wealthsimple story
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── WHY ANTRY (Solution) ─── */}
      <section className="py-24 px-8 bg-background-secondary">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mb-16"
          >
            <span className="text-[12px] font-semibold text-accent uppercase tracking-widest">
              The Solution
            </span>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] text-text-primary tracking-[-0.02em] mt-4 mb-6 leading-[1.1]">
              Antry: where builders prove their work.
            </h2>
            <p className="text-[16px] text-text-secondary leading-relaxed max-w-[600px]">
              Named after the ant — tiny creatures that collaborate to build
              something massive, and quick. That&apos;s our builders. They work fast,
              they ship real products, and they show the thinking behind every
              decision.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: "Bento profiles",
                desc: "Every builder has a visual showcase grid — live demos, hackathon wins, skills, stats. You see everything in seconds, not pages.",
              },
              {
                icon: Play,
                title: "Live demos, not screenshots",
                desc: "Every project links to a working demo. Click and see the product run. No guesswork about whether they can actually build.",
              },
              {
                icon: Sparkles,
                title: "AI Scout agent",
                desc: "\"Find me 3 builders who know AI and React.\" Our agent searches the entire platform and builds teams for you in seconds.",
              },
              {
                icon: Trophy,
                title: "Hackathon track records",
                desc: "Builders compete in Antathons — timed hackathons with real prizes. You see who performs under pressure.",
              },
              {
                icon: Users,
                title: "Team dynamics visible",
                desc: "See who builds well together, who has complementary skills, and who has shipped multiple projects with the same team.",
              },
              {
                icon: Zap,
                title: "Ship velocity",
                desc: "Every project shows build time. 3 weeks for a multi-agent framework? 10 days for a CLI tool? Speed is visible.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease }}
                className="p-6 bg-surface rounded-lg border border-border-primary"
              >
                <item.icon className="w-5 h-5 text-accent mb-4" />
                <h3 className="text-[15px] font-semibold text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORM NUMBERS ─── */}
      <section className="py-24 px-8">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] text-text-primary tracking-[-0.02em] mb-3">
              The platform right now.
            </h2>
            <p className="text-[14px] text-text-tertiary">Growing fast — and your brand could be part of it.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: `${builders.length}+`, label: "Builders" },
              { num: `${projects.length}`, label: "Projects shipped" },
              { num: `${antathons.length}`, label: "Hackathons" },
              { num: totalLikes.toLocaleString(), label: "Total likes" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease }}
                className="text-center p-8 rounded-lg bg-surface border border-border-primary shadow-sm "
              >
                <div className="text-[clamp(2rem,4vw,3rem)] font-bold text-text-primary tracking-tight">
                  {stat.num}
                </div>
                <div className="text-[13px] text-text-tertiary mt-1 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT SPONSORS GET ─── */}
      <section className="py-24 px-8 bg-background-secondary">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mb-16"
          >
            <span className="text-[12px] font-semibold text-accent uppercase tracking-widest">
              Sponsorship
            </span>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] text-text-primary tracking-[-0.02em] mt-4 leading-[1.1]">
              What you get as a sponsor.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tier 1 */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
              className="relative p-8 rounded-lg border-2 border-accent/20 bg-surface overflow-hidden"
            >
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-accent text-white text-[11px] font-semibold uppercase tracking-wider rounded-bl-xl">
                Title Sponsor
              </div>
              <h3 className="text-[20px] font-semibold text-text-primary mb-6 mt-2">
                Hackathon Title Sponsor
              </h3>
              <ul className="space-y-3">
                {[
                  "Your brand on the hackathon — name, logo, theme",
                  "Direct access to every builder who competes",
                  "Featured on the platform homepage during the event",
                  "Judge seat — you see the demos first",
                  "Recruit directly from the hackathon pool",
                  "Post-event report with builder profiles and project data",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Tier 2 */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08, ease }}
              className="p-8 rounded-lg border border-border-primary bg-surface"
            >
              <h3 className="text-[20px] font-semibold text-text-primary mb-6">
                Platform Partner
              </h3>
              <ul className="space-y-3">
                {[
                  "Logo on the Antry sponsors page and footer",
                  "Builder directory access — search and filter by skills",
                  "Featured in the AI Scout agent responses",
                  "Monthly digest of top builders and trending projects",
                  "Early access to new platform features",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED BUILDERS PREVIEW ─── */}
      <section className="py-24 px-8">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-text-primary tracking-[-0.02em] mb-3">
              Meet the builders.
            </h2>
            <p className="text-[14px] text-text-tertiary">
              This is who your brand gets in front of.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {builders.slice(0, 6).map((builder, i) => {
              const bp = projects.filter((p) => p.builder.username === builder.username);
              const likes = bp.reduce((s, p) => s + p.likes, 0);
              return (
                <motion.div
                  key={builder.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease }}
                >
                  <Link
                    href={`/builders/${builder.username}`}
                    className="group block p-6 rounded-lg border border-border-primary bg-surface hover:border-black/10 dark:hover:border-white/10 hover:-translate-y-1  dark: transition-all duration-300 ease-out"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                        style={{ background: builder.gradient }}
                      >
                        {getInitials(builder.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[14px] font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                          {builder.name}
                        </h4>
                        <p className="text-[12px] text-text-tertiary truncate">
                          {builder.tagline}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {builder.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-medium text-text-tertiary bg-background-secondary rounded-lg px-2 py-0.5"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                      <span>{bp.length} projects</span>
                      <span className="text-border-primary">·</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {likes}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── THE ANT PHILOSOPHY ─── */}
      <section className="py-24 px-8 bg-background-secondary">
        <div className="max-w-[680px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="text-[12px] font-semibold text-accent uppercase tracking-widest">
              Why &ldquo;Antry&rdquo;
            </span>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] text-text-primary tracking-[-0.02em] mt-4 mb-8 leading-[1.1]">
              Tiny builders. Massive impact.
            </h2>
            <div className="space-y-5 text-[16px] text-text-secondary leading-relaxed">
              <p>
                An ant is a tiny animal that does something extraordinary — it
                collaborates with other ants to build structures thousands of
                times its own size. And it does it{" "}
                <span className="text-text-primary font-medium">fast</span>.
              </p>
              <p>
                That&apos;s exactly what our builders do. They&apos;re individuals who come
                together — in hackathons, in teams, in open source — to build
                things bigger than any one person could. They ship in days, not
                months. They iterate publicly. They explain their thinking.
              </p>
              <p>
                <span className="text-text-primary font-medium">Antry</span>{" "}
                is the colony. It&apos;s where these builders live, showcase their
                work, and get discovered. When you sponsor Antry, you&apos;re not
                buying ad space — you&apos;re investing in the community that&apos;s
                changing how talent is discovered.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="sponsor" className="py-32 px-8 bg-text-primary text-white">
        <div className="max-w-[560px] mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] tracking-[-0.025em] mb-6 leading-[0.95]">
              Be part of
              <br />
              the change.
            </h2>
            <p className="text-[16px] text-white/40 mb-10 leading-relaxed">
              The industry is shifting from resumes to real work. Companies like
              Wealthsimple already proved it works. Antry makes it permanent.
              <br />
              <span className="text-white/60 font-medium">We need you to take part in this change.</span>
            </p>
            <WaitlistForm dark />
            <p className="text-[13px] text-white/30 mt-6">
              Or email us directly at{" "}
              <a href="mailto:sponsors@antry.dev" className="text-white/50 hover:text-white/70 underline transition-colors">
                sponsors@antry.dev
              </a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
