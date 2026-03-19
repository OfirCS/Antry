"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";
import { Nav } from "@/components/Nav";
import { WaitlistForm } from "@/components/WaitlistForm";
import { LayerCards } from "@/components/LayerCards";
import { ProjectCard } from "@/components/ProjectCard";
import { projects, antathons } from "@/lib/mock-data";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Home() {
  const featured = [projects[3], projects[0], projects[7]]; // Palette, Sentinel, Terraform Studio
  const nextAntathon = antathons.find((h) => h.status === "upcoming") || antathons[1];

  return (
    <>
      <Nav />
      <main className="pt-[60px]">

        {/* ─── HERO ─── */}
        <section className="max-w-4xl px-6 mx-auto pt-28 md:pt-40 pb-32 md:pb-48">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease }}
              className="flex flex-col items-center gap-4 mb-16"
            >
              <Image src="/logo.png" alt="Antry" width={64} height={64} className="dark:invert" priority />
              <span className="text-lg font-bold tracking-[0.3em] text-gray-400 uppercase">Antry</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease }}
              className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] text-gray-900 mb-10 tracking-tight"
            >
              Don&apos;t tell us what <br className="hidden md:block" />
              you&apos;ve done.{" "}
              <span className="text-blue-600 italic">Show us.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease }}
              className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl mb-16"
            >
              The colony where ants prove what they can build through
              shipped projects, live demos, and real code — not resumes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease }}
              className="w-full max-w-lg"
            >
              <WaitlistForm />
            </motion.div>
          </motion.div>
        </section>

        {/* ─── LAYERS ─── */}
        <section className="max-w-[940px] px-6 mx-auto pb-28">
          <LayerCards />
        </section>

        {/* ─── FEATURED PROJECTS ─── */}
        <section className="border-y border-border-tertiary bg-background-secondary/40">
          <div className="max-w-[1080px] px-6 mx-auto py-20 md:py-28">
            <div className="flex items-end justify-between gap-4 mb-12">
              <h2 className="font-display text-[22px] md:text-[28px] text-text-primary leading-snug">
                From the colony
              </h2>
              <Link href="/discover" className="group text-[13px] text-text-tertiary hover:text-accent transition-colors flex items-center gap-1.5 shrink-0">
                See all
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── MANIFESTO ─── */}
        <section className="max-w-[680px] px-6 mx-auto py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease }}
            className="border-l-2 border-accent pl-6 md:pl-8"
          >
            <p className="text-[17px] md:text-[20px] text-text-primary leading-[1.7] font-display">
              We&apos;re not another portfolio site. LinkedIn judges you by where you&apos;ve
              worked. GitHub is for code, not demos. Devpost dies after the hackathon
              ends.
            </p>
            <p className="text-[17px] md:text-[20px] text-text-secondary leading-[1.7] font-display mt-5">
              Antry is the colony for ants who want their work to speak — with live
              demos, project walkthroughs, and a community that actually gets it.
            </p>
          </motion.div>
        </section>

        {/* ─── ANTATHON ─── */}
        {nextAntathon && (
          <section className="max-w-[780px] px-6 mx-auto pb-28">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
            >
              <Link href={`/antathons/${nextAntathon.id}`} className="group block">
                <div className="border border-border-secondary rounded-2xl p-8 md:p-10 bg-accent-muted hover:border-accent/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-[11px] font-medium tracking-[0.1em] text-accent uppercase">
                      {nextAntathon.status === "active" ? "Live now" : "Next antathon"}
                    </span>
                  </div>
                  <h3 className="font-display text-[22px] md:text-[26px] text-text-primary leading-snug mb-2 group-hover:text-text-secondary transition-colors">
                    {nextAntathon.title}
                  </h3>
                  <p className="text-[15px] text-text-secondary mb-6">{nextAntathon.theme}</p>
                  <div className="flex flex-wrap items-center gap-5 text-[13px] text-text-tertiary">
                    <span className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-accent" />
                      ${nextAntathon.prizes.reduce((s, p) => s + (parseInt(p.reward.replace(/[^0-9]/g, "")) || 0), 0).toLocaleString()} in prizes
                    </span>
                    <span>{nextAntathon.sponsors.map((s) => s.name).join(", ")}</span>
                  </div>
                  <div className="mt-6 text-[14px] font-medium text-text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </section>
        )}

        {/* ─── FINAL CTA ─── */}
        <section className="border-t border-border-tertiary">
          <div className="max-w-[560px] px-6 mx-auto py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
            >
              <h2 className="font-display italic text-[24px] md:text-[30px] text-text-primary mb-4">
                Get early access
              </h2>
              <p className="text-[15px] text-text-secondary mb-10">
                We&apos;re opening the colony to the first ants soon.
              </p>
              <WaitlistForm />
            </motion.div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="border-t border-border-tertiary">
          <div className="max-w-[900px] px-6 mx-auto py-10 md:py-14">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Image src="/logo.png" alt="Antry" width={28} height={28} className="dark:invert opacity-90" />
                  <span className="text-sm font-bold tracking-[0.14em] text-text-secondary uppercase">Antry</span>
                </div>
                <p className="text-[13px] text-text-tertiary max-w-[220px] leading-relaxed">
                  The colony for ants who ship.
                </p>
              </div>
              <div className="flex gap-14">
                <div className="flex flex-col gap-2">
                  <Link href="/discover" className="text-[13px] text-text-secondary hover:text-accent transition-colors">Discover</Link>
                  <Link href="/antathons" className="text-[13px] text-text-secondary hover:text-accent transition-colors">Antathons</Link>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href="/login" className="text-[13px] text-text-secondary hover:text-accent transition-colors">Sign in</Link>
                  <Link href="/signup" className="text-[13px] text-text-secondary hover:text-accent transition-colors">Join the colony</Link>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-border-tertiary flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-text-tertiary">
              <span>&copy; 2026 Antry</span>
              <span>7 North Park Rd, Vaughan, ON L4J 0C9</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
