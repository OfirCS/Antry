"use client";

import { motion } from "framer-motion";
import { User, Rocket, Trophy, Eye } from "lucide-react";

const steps = [
  {
    icon: User,
    number: "01",
    title: "Create your profile",
    desc: "Build a living portfolio with your skills, projects, and shipping history.",
  },
  {
    icon: Rocket,
    number: "02",
    title: "Ship projects",
    desc: "Submit live demos with source code and technical write-ups that prove depth.",
  },
  {
    icon: Trophy,
    number: "03",
    title: "Compete in Antathons",
    desc: "Join sponsored hackathons with real prizes and top-tier visibility.",
  },
  {
    icon: Eye,
    number: "04",
    title: "Get discovered",
    desc: "Companies browse verified builders — not keywords, not resumes.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function HowItWorks() {
  return (
    <section className="py-32 px-8">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-20"
        >
          <span className="text-[12px] font-semibold text-accent uppercase tracking-wider">
            How it works
          </span>
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-text-primary tracking-[-0.025em] mt-4 max-w-[480px]">
            From signup to discovered in four steps.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connection line (desktop only) */}
          <div className="hidden md:block absolute top-[52px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-px bg-border-primary" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease }}
              className="relative flex flex-col items-start"
            >
              {/* Number circle */}
              <div className="relative z-10 w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center text-[13px] font-bold mb-6">
                {step.number}
              </div>

              <h3 className="text-[16px] font-semibold text-text-primary mb-2 tracking-[-0.01em]">
                {step.title}
              </h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
