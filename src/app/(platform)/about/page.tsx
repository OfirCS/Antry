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

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutPage() {
  return (
    <div className="bg-background-primary min-h-screen">
      {/* ─── HERO ─── */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/[0.03] via-background-primary to-background-primary -z-10" />
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, ease }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-muted border border-accent/10 rounded-full text-[11px] font-bold text-accent uppercase tracking-widest mb-8">
              The Vision
            </span>
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] text-text-primary tracking-[-0.03em] mb-6 leading-[0.95] font-bold">
              Where verified builders
              <br />
              <span className="text-text-secondary">are discovered.</span>
            </h1>
            <p className="text-[18px] text-text-secondary leading-relaxed max-w-[640px] mx-auto font-medium">
              Antry is a platform where developers, designers, and engineers
              showcase what they build — not what they say. Live demos, real
              projects, hackathon results. Work that speaks for itself.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── ORIGIN STORY ─── */}
      <section className="py-24 px-6 bg-background-secondary/50 border-y border-border-tertiary">
        <div className="max-w-[760px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="card-premium p-10 sm:p-14"
          >
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] text-text-primary tracking-[-0.03em] mb-8 leading-[1.1] font-bold">
              Born from building.
            </h2>
            <div className="space-y-6 text-[16px] text-text-secondary leading-relaxed">
              <p>
                Antry started during the{" "}
                <span className="text-text-primary font-bold">
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
      <section className="py-32 px-6">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mb-16 text-center"
          >
            <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] text-text-primary tracking-[-0.03em] mb-4 font-bold">
              How Antry works.
            </h2>
            <p className="text-[16px] text-text-tertiary">Three layers, one ecosystem.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                title: "Antathons",
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
                transition={{ duration: 0.5, delay: i * 0.1, ease }}
                className="card-premium p-10 flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-2 mb-6 bg-background-secondary px-4 py-2 rounded-full border border-border-primary shadow-sm">
                  <item.icon className="w-4 h-4 text-accent" />
                  <span className="text-[11px] font-bold text-text-primary uppercase tracking-widest">
                    {item.label}
                  </span>
                </div>
                <h3 className="text-[20px] font-bold text-text-primary mb-4 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NUMBERS ─── */}
      <section className="py-24 px-6 bg-[#0a0b0d] text-white">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { num: `${builders.length}+`, label: "Verified Builders" },
              { num: `${projects.length}`, label: "Shipped Projects" },
              { num: `${antathons.length}`, label: "Live Hackathons" },
              { num: `${projects.reduce((a, p) => a + p.likes, 0).toLocaleString()}`, label: "Total Signal" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1, ease }}
                className="text-center"
              >
                <div className="font-display text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-[-0.03em] mb-2 text-white shadow-sm">
                  {stat.num}
                </div>
                <div className="text-[12px] text-white/50 uppercase tracking-widest font-bold">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="py-32 px-6">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mb-16 text-center"
          >
            <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] text-text-primary tracking-[-0.03em] font-bold">
              What we believe.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="card-premium p-8 flex gap-6"
              >
                <div className="w-1.5 bg-accent/30 rounded-full shrink-0" />
                <div>
                  <h3 className="text-[18px] font-bold text-text-primary mb-3 tracking-tight">
                    {value.title}
                  </h3>
                  <p className="text-[15px] text-text-secondary leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 px-6 bg-background-secondary/50 border-t border-border-tertiary">
        <div className="max-w-[600px] mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="card-premium p-12 bg-surface shadow-xl"
          >
            <h2 className="font-display text-[clamp(2rem,4vw,2.75rem)] tracking-[-0.03em] mb-4 font-bold text-text-primary">
              Ready to join?
            </h2>
            <p className="text-[16px] text-text-secondary mb-10 leading-relaxed font-medium">
              Create your builder profile and start showcasing your work to the network.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-text-primary text-background-primary rounded-full text-[14px] font-bold hover:opacity-90 transition-all shadow-md"
              >
                Create Profile
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/builders"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 border border-border-primary bg-background-secondary text-text-primary rounded-full text-[14px] font-bold hover:bg-surface transition-all"
              >
                Browse Builders
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
