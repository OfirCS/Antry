"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Trophy, Users } from "lucide-react";
import { Nav } from "@/components/Nav";
import { AgentHome } from "@/components/AgentHome";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SocialProofBar } from "@/components/SocialProofBar";
import { ComparisonSection } from "@/components/ComparisonSection";
import { Testimonials } from "@/components/Testimonials";
import { projects, antathons, builders, getInitials } from "@/lib/mock-data";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export default function Home() {
  const featured = [projects[3], projects[0], projects[7]];
  const nextAntathon =
    antathons.find((h) => h.status === "active") || antathons[0];

  const prizeTotal = nextAntathon?.prizes
    .map((p) => parseInt(p.reward.replace(/[^0-9]/g, ""), 10) || 0)
    .reduce((a, b) => a + b, 0);

  return (
    <>
      <Nav />
      <main className="bg-background-primary min-h-screen pt-[72px]">
        {/* ─── AGENT HERO ─── */}
        <AgentHome />

        {/* ─── SOCIAL PROOF BAR ─── */}
        <SocialProofBar />

        {/* ─── COMPARISON / DIFFERENTIATION ─── */}
        <ComparisonSection />

        {/* ─── DIRECTORY PREVIEW ─── */}
        <section className="py-32 px-8 bg-background-secondary radial-spotlight overflow-hidden dot-grid">
          <div className="max-w-[1100px] mx-auto relative z-10">
            <div className="flex items-end justify-between mb-16">
              <div>
                <motion.h2
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease }}
                  className="font-display text-[clamp(2rem,5vw,3.5rem)] text-text-primary tracking-[-0.03em] leading-none"
                >
                  Top builders.
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1, ease }}
                  className="text-[14px] text-text-tertiary mt-2"
                >
                  Showing 3 of {builders.length}+ builders
                </motion.p>
              </div>
              <Link
                href="/builders"
                className="hidden md:flex items-center gap-2 text-[14px] font-semibold text-text-primary hover:text-accent transition-colors group"
              >
                View all
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((project, i) => {
                const ant = builders.find(
                  (b) => b.username === project.builder.username
                );
                if (!ant) return null;
                return (
                  <motion.div
                    key={project.id}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.12, ease }}
                  >
                    <Link
                      href={`/builders/${ant.username}`}
                      className="group block p-8 rounded-3xl glass-card glow-border bg-surface/80 hover:-translate-y-1 hover:shadow-[0_16px_48px_-12px_var(--glow-orange)] transition-all duration-300 ease-out relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent/0 before:to-transparent hover:before:via-accent/40 before:transition-all"
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-[13px] font-bold text-white mb-8"
                        style={{ background: ant.gradient }}
                      >
                        {getInitials(ant.name)}
                      </div>
                      <h3 className="text-[17px] font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors">
                        {ant.name}
                      </h3>
                      <p className="text-[14px] text-text-secondary leading-relaxed mb-4 line-clamp-2">
                        {ant.tagline}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-8">
                        {ant.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[11px] font-medium text-text-tertiary bg-background-secondary rounded-full px-2.5 py-0.5"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                        <span className="text-[12px] font-medium text-text-tertiary tracking-wide uppercase">
                          {project.title}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <Link
              href="/builders"
              className="md:hidden flex items-center justify-center gap-2 mt-10 text-[14px] font-semibold text-text-primary hover:text-accent transition-colors group"
            >
              View all builders
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <Testimonials />

        {/* ─── ORIGIN STORY ─── */}
        <section className="py-32 px-8 radial-spotlight relative overflow-hidden">
          <div className="max-w-[680px] mx-auto relative z-10">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
            >
              <span className="text-[12px] font-semibold text-accent uppercase tracking-widest">
                Our Story
              </span>
              <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] text-text-primary tracking-[-0.03em] mt-4 mb-8 leading-[1.05]">
                <span className="gradient-text">Born from building.</span>
              </h2>
              <div className="space-y-5 text-[16px] text-text-secondary leading-relaxed">
                <p>
                  Antry started during the{" "}
                  <span className="text-text-primary font-medium">
                    AI Builder Program with Wealthsimple
                  </span>{" "}
                  — where we learned that the best way to prove yourself is to
                  ship fast, iterate in public, and let your work speak. We
                  realized there was no single place where builders could
                  showcase what they ship, and where recruiters could see cool{" "}
                  <span className="text-text-primary font-medium">
                    3-minute demos
                  </span>{" "}
                  instead of reading resumes.
                </p>
                <p>
                  That&apos;s what Antry is:{" "}
                  <span className="text-text-primary font-medium">
                    a home for builders who prove their work
                  </span>
                  . A place where you iterate fast, showcase what you build, and
                  grow with a community that values shipping over talking.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── ACTIVE HACKATHON ─── */}
        {nextAntathon && (
          <section className="py-32 px-8">
            <div className="max-w-[1100px] mx-auto">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease }}
              >
                <Link
                  href={`/hackathons/${nextAntathon.id}`}
                  className="group block relative overflow-hidden rounded-3xl bg-[#0a0a0a] text-white hover:bg-[#111] transition-all duration-300 border border-white/10 hover:shadow-[0_0_40px_var(--glow-orange)] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent/0 before:to-transparent hover:before:via-accent/40 before:transition-all"
                >
                  <div className="relative z-10 p-12 md:p-20 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">
                    <div className="max-w-xl">
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/10 backdrop-blur-sm rounded-full text-[11px] font-semibold uppercase tracking-wider mb-8 text-white/80">
                        Active hackathon
                      </span>
                      <h2 className="font-display text-[clamp(2rem,6vw,4rem)] leading-[0.9] tracking-[-0.03em] mb-6">
                        {nextAntathon.title}
                      </h2>
                      <p className="text-[16px] text-white/50 font-medium leading-relaxed mb-6">
                        {nextAntathon.theme}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[13px] text-white/60">
                        {prizeTotal > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="font-semibold text-white/80">
                              ${prizeTotal.toLocaleString()} in prizes
                            </span>
                          </span>
                        )}
                        {nextAntathon.participantCount > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {nextAntathon.participantCount} builders competing
                          </span>
                        )}
                      </div>
                      {nextAntathon.sponsors.length > 0 && (
                        <div className="flex items-center gap-3 mt-6">
                          <span className="text-[11px] text-white/30 uppercase tracking-wider">
                            Sponsors
                          </span>
                          {nextAntathon.sponsors.map((s) => (
                            <span key={s.name} className="text-[12px] font-semibold text-white/50">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 px-8 py-4 bg-white text-[#111] rounded-full font-semibold text-[14px] group-hover:bg-accent group-hover:text-white group-hover:shadow-[0_0_20px_var(--glow-orange-strong)] transition-all duration-300 shrink-0">
                      View details
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* ─── FINAL CTA ─── */}
        <section className="py-36 px-8 bg-[#060606] text-white relative overflow-hidden">
          {/* Spotlight blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/[0.06] rounded-full blur-[120px] pointer-events-none" />
          <div className="dot-grid absolute inset-0 pointer-events-none" />
          <div className="max-w-[560px] mx-auto text-center relative z-10">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
            >
              <p className="text-[14px] font-medium text-white/40 mb-6">
                Join 500+ builders already on the waitlist
              </p>
              <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] tracking-[-0.03em] mb-6 leading-[0.9]">
                Ready to <span className="gradient-text">prove</span>
                <br />
                your work?
              </h2>
              <p className="text-[16px] text-white/40 mb-14 leading-relaxed">
                Stop telling companies what you can do. Show them.
                <br />
                Join the next wave of builders who ship in public.
              </p>
              <WaitlistForm dark />
              <Link
                href="/builders"
                className="inline-flex items-center gap-1.5 mt-6 text-[14px] font-medium text-white/40 hover:text-white/70 transition-colors"
              >
                Or browse the directory
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="py-20 border-t border-black/5 dark:border-white/5 bg-background-primary relative overflow-hidden">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-accent/[0.03] rounded-full blur-[80px] pointer-events-none" />
          <div className="max-w-[1100px] mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src="/logo.png"
                    alt="Antry"
                    width={24}
                    height={24}
                    className="dark:invert object-contain opacity-90 mix-blend-multiply dark:mix-blend-screen brightness-0"
                  />
                  <span className="text-[16px] font-bold tracking-[-0.04em] text-text-primary">
                    Antry
                  </span>
                </div>
                <p className="text-[13px] text-text-tertiary leading-relaxed">
                  Built by builders,
                  <br />
                  for builders.
                </p>
              </div>
              <div>
                <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
                  For Builders
                </h4>
                <div className="flex flex-col gap-3 text-[13px] font-medium text-text-secondary">
                  <Link href="/builders" className="hover:text-text-primary transition-colors">Builders</Link>
                  <Link href="/hackathons" className="hover:text-text-primary transition-colors">Hackathons</Link>
                  <Link href="/submit" className="hover:text-text-primary transition-colors">Submit a project</Link>
                  <Link href="/signup" className="hover:text-text-primary transition-colors">Create profile</Link>
                </div>
              </div>
              <div>
                <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
                  For Companies
                </h4>
                <div className="flex flex-col gap-3 text-[13px] font-medium text-text-secondary">
                  <Link href="/builders" className="hover:text-text-primary transition-colors">Browse builders</Link>
                  <Link href="/hackathons" className="hover:text-text-primary transition-colors">Sponsor a hackathon</Link>
                </div>
              </div>
              <div>
                <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
                  Connect
                </h4>
                <div className="flex flex-col gap-3 text-[13px] font-medium text-text-secondary">
                  <Link href="/login" className="hover:text-text-primary transition-colors">Log in</Link>
                  <span className="text-text-tertiary cursor-default">Twitter / X</span>
                  <span className="text-text-tertiary cursor-default">GitHub</span>
                  <span className="text-text-tertiary cursor-default">Discord</span>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-[13px] text-text-tertiary">&copy; 2026 Antry. All rights reserved.</div>
              <div className="text-[12px] gradient-text opacity-60">Where builders are discovered.</div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
