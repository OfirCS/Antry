"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users } from "lucide-react";
import { Nav } from "@/components/Nav";
import { WaitlistForm } from "@/components/WaitlistForm";
import { LayerCards } from "@/components/LayerCards";
import { ProjectCard } from "@/components/ProjectCard";
import { projects, antathons, builders, getInitials } from "@/lib/mock-data";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Home() {
  const featured = [projects[3], projects[0], projects[7]]; // Palette, Sentinel, Terraform Studio
  const nextAntathon = antathons.find((h) => h.status === "active") || antathons[0];

  return (
    <>
      <Nav />
      <main className="overflow-x-hidden">

        {/* ─── HERO ─── */}
        <section className="min-h-screen flex flex-col justify-center items-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
              className="mb-12"
            >
              <Image src="/logo.png" alt="Antry" width={64} height={64} className="dark:invert" priority />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-gray-900 mb-8"
            >
              Show. <span className="text-blue-600">Don&apos;t tell.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease }}
              className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-xl mb-12"
            >
              The platform for developers who prefer shipping projects over writing resumes. Build, demo, and prove your technical depth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease }}
              className="w-full max-w-md"
            >
              <WaitlistForm />
            </motion.div>
          </motion.div>
        </section>

        {/* ─── THE CONCEPT ─── */}
        <section className="py-32 px-6 border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
                  Your work is your identity.
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                  Antry focuses on the finished product. No bullet points or job descriptions — just live demos and project walkthroughs that show exactly what you can build.
                </p>
                <div className="flex items-center gap-4 text-sm font-bold">
                  <Link href="/login" className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-blue-600 transition-all">Join the platform</Link>
                </div>
              </div>
              <div className="aspect-square bg-gray-50 rounded-[3rem] border border-gray-100 flex items-center justify-center p-12 overflow-hidden group">
                <div className="w-full aspect-video bg-white rounded-2xl shadow-xl transition-transform duration-700 group-hover:scale-105 border border-gray-100" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── THE LAYERS ─── */}
        <section className="py-24 px-6 bg-gray-50/50 border-y border-gray-100">
          <div className="max-w-4xl mx-auto">
            <header className="mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Platform Features</h2>
            </header>
            <LayerCards />
          </div>
        </section>

        {/* ─── FEATURED ANTS ─── */}
        <section className="py-32 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end justify-between mb-16">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">Featured Developers</h2>
              </div>
              <Link href="/discover" className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-all">
                Explore all profiles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {featured.map((project, i) => {
                const ant = builders.find(b => b.username === project.builder.username);
                if (!ant) return null;
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Link 
                      href={`/builders/${ant.username}`}
                      className="flex flex-col md:flex-row items-center gap-8 p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all border border-transparent hover:border-blue-50"
                    >
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md shrink-0"
                        style={{ background: ant.gradient }}
                      >
                        {getInitials(ant.name)}
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{ant.name}</h3>
                        <p className="text-gray-500 font-medium mt-1 line-clamp-1">{ant.tagline}</p>
                      </div>
                      <div className="flex items-center gap-4 pl-6 border-l border-gray-200 hidden md:flex">
                         <div className="text-right">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Latest Project</div>
                            <div className="text-sm font-bold text-gray-900">{project.title}</div>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors">
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                         </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── LIVE ANTATHON ─── */}
        {nextAntathon && (
          <section className="pb-32 px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto p-12 md:p-16 bg-gray-900 rounded-[2.5rem] text-white relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600 opacity-5 blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Next Build Event</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                  {nextAntathon.title}
                </h3>
                <p className="text-white/40 text-lg leading-relaxed mb-10 max-w-lg">
                  {nextAntathon.theme}
                </p>
                <div className="flex flex-wrap gap-8 text-xs font-bold text-white/60 uppercase tracking-widest mb-10">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-blue-500" /> ${nextAntathon.prizes.reduce((s, p) => s + (parseInt(p.reward.replace(/[^0-9]/g, "")) || 0), 0).toLocaleString()} Pool
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" /> {nextAntathon.participantCount} Joined
                    </div>
                </div>
                <Link href={`/hackathons/${nextAntathon.id}`} className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </section>
        )}

        {/* ─── FINAL CTA ─── */}
        <section className="py-40 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-10">
              Build your technical identity.
            </h2>
            <div className="max-w-md mx-auto">
              <WaitlistForm />
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="py-20 px-6 border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-start mb-16">
              <div className="col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <Image src="/logo.png" alt="Antry" width={32} height={32} className="dark:invert" />
                  <span className="text-xl font-bold tracking-tight text-gray-900">Antry</span>
                </div>
                <p className="text-gray-400 font-medium max-w-sm">
                  The platform for developers who ship. No resumes, just proof of work.
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Navigate</h4>
                <div className="flex flex-col gap-3 text-xs font-bold text-gray-900">
                  <Link href="/discover" className="hover:text-blue-600 transition-colors">Developers</Link>
                  <Link href="/hackathons" className="hover:text-blue-600 transition-colors">Events</Link>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Account</h4>
                <div className="flex flex-col gap-3 text-xs font-bold text-gray-900">
                  <Link href="/login" className="hover:text-blue-600 transition-colors">Sign in</Link>
                  <Link href="/signup" className="hover:text-blue-600 transition-colors">Join Antry</Link>
                </div>
              </div>
            </div>
            <div className="pt-10 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>&copy; 2026 Antry</span>
              <div className="flex gap-8 text-gray-300">
                <span>Vaughan, ON</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
