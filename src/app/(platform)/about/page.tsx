"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Layers,
  Trophy,
  Users,
  Sparkles,
  Zap,
  Globe,
} from "lucide-react";
import { builders, projects, antathons, getInitials } from "@/lib/mock-data";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutPage() {
  return (
    <div className="bg-background-primary min-h-screen">
      {/* ─── HERO ─── */}
      <section className="pt-24 pb-16 px-8">
        <div className="max-w-[720px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, ease }}
          >
            <span className="text-[12px] font-semibold text-accent uppercase tracking-widest">
              About Antry
            </span>
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-text-primary tracking-[-0.03em] mt-4 mb-6 leading-[0.95]">
              Where builders
              <br />
              are discovered.
            </h1>
            <p className="text-[17px] text-text-secondary leading-relaxed max-w-[560px]">
              Antry is a platform where developers, designers, and engineers
              showcase what they build — not what they say. Live demos, real
              projects, hackathon results. Work that speaks for itself.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── ORIGIN STORY ─── */}
      <section className="py-20 px-8 bg-background-secondary">
        <div className="max-w-[720px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <h2 className="font-display text-[clamp(1.5rem,3.5vw,2.25rem)] text-text-primary tracking-[-0.02em] mb-8 leading-[1.1]">
              Born from building.
            </h2>
            <div className="space-y-5 text-[16px] text-text-secondary leading-relaxed">
              <p>
                Antry started during the{" "}
                <span className="text-text-primary font-medium">
                  AI Builder Program with Wealthsimple
                </span>{" "}
                — where we learned that the best way to prove yourself is to
                ship fast, iterate in public, and let your work speak.
              </p>
              <p>
                We realized there was no single place where builders could
                showcase what they ship, and where recruiters could see cool
                3-minute demos instead of reading resumes.
              </p>
              <p>
                The name comes from the ant — a tiny creature that collaborates
                with others to build something massive, quickly. That&apos;s
                our builders. They work fast, they ship real products, and they
                grow together.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── THE THREE LAYERS ─── */}
      <section className="py-24 px-8">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mb-14"
          >
            <h2 className="font-display text-[clamp(1.5rem,3.5vw,2.25rem)] text-text-primary tracking-[-0.02em] mb-3">
              How Antry works.
            </h2>
            <p className="text-[14px] text-text-tertiary">Three layers, one ecosystem.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                label: "Layer 1",
                title: "Ants (Builders)",
                desc: "Every builder gets a bento-style profile page — a visual showcase of their projects, demos, skills, and hackathon results. Your profile is your portfolio.",
              },
              {
                icon: Trophy,
                label: "Layer 2",
                title: "Antathons (Hackathons)",
                desc: "Timed hackathons with real prizes. Builders compete, ship fast, and prove they can perform under pressure. Companies sponsor and recruit from the pool.",
              },
              {
                icon: Sparkles,
                label: "Layer 3",
                title: "Scout (AI Agent)",
                desc: "An AI agent that knows every builder, project, and hackathon. Search by skill, build teams, compare profiles, find demos — all through natural language.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="p-8 bg-surface rounded-3xl border border-black/5 dark:border-white/5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <item.icon className="w-4 h-4 text-accent" />
                  <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
                <h3 className="text-[17px] font-semibold text-text-primary mb-3">
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

      {/* ─── NUMBERS ─── */}
      <section className="py-20 px-8 bg-background-secondary">
        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: `${builders.length}+`, label: "Builders" },
              { num: `${projects.length}`, label: "Projects" },
              { num: `${antathons.length}`, label: "Hackathons" },
              { num: `${projects.reduce((a, p) => a + p.likes, 0).toLocaleString()}`, label: "Likes" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease }}
                className="text-center p-6"
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

      {/* ─── VALUES ─── */}
      <section className="py-24 px-8">
        <div className="max-w-[720px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mb-14"
          >
            <h2 className="font-display text-[clamp(1.5rem,3.5vw,2.25rem)] text-text-primary tracking-[-0.02em]">
              What we believe.
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              { title: "Ship over talk", desc: "A deployed product says more than a pitch deck. We value what you've built over what you plan to build." },
              { title: "Show the thinking", desc: "Great builders don't just code — they explain tradeoffs, architecture decisions, and why they chose what they chose." },
              { title: "Velocity is a skill", desc: "Going from idea to deployed product in days, not months, is a real and measurable ability. We make it visible." },
              { title: "Community compounds", desc: "When builders share openly, everyone gets better. The colony is stronger than any individual ant." },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease }}
                className="flex gap-6"
              >
                <div className="w-1 bg-accent/20 rounded-full shrink-0" />
                <div>
                  <h3 className="text-[16px] font-semibold text-text-primary mb-1">
                    {value.title}
                  </h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-8 bg-[#111] text-white">
        <div className="max-w-[480px] mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] tracking-[-0.025em] mb-6 leading-[0.95]">
              Ready to join?
            </h2>
            <p className="text-[15px] text-white/40 mb-10 leading-relaxed">
              Create your builder profile and start showcasing your work.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#111] rounded-full text-[14px] font-semibold hover:bg-white/90 transition-colors"
              >
                Create profile
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/builders"
                className="inline-flex items-center gap-2 text-[14px] font-medium text-white/40 hover:text-white/70 transition-colors"
              >
                Browse builders
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
