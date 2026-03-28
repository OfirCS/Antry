"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AntryLogoFull } from "@/components/AntryLogo";

/* ── Floating dots decoration ─────────────────────────────────────── */
const floatingDots = [
  { x: "12%", y: "18%", size: 6, delay: 0, duration: 6 },
  { x: "78%", y: "12%", size: 4, delay: 1.2, duration: 7 },
  { x: "25%", y: "72%", size: 5, delay: 0.6, duration: 5.5 },
  { x: "85%", y: "65%", size: 7, delay: 2, duration: 6.5 },
  { x: "55%", y: "35%", size: 3, delay: 0.3, duration: 8 },
  { x: "40%", y: "85%", size: 5, delay: 1.8, duration: 7.5 },
  { x: "68%", y: "48%", size: 4, delay: 0.9, duration: 6 },
  { x: "18%", y: "45%", size: 6, delay: 1.5, duration: 5 },
];

const geometricShapes = [
  { x: "30%", y: "22%", delay: 0.5, duration: 9, rotation: 45 },
  { x: "72%", y: "78%", delay: 1.0, duration: 8, rotation: 0 },
  { x: "50%", y: "55%", delay: 2.0, duration: 10, rotation: 30 },
];

function FloatingDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating dots */}
      {floatingDots.map((dot, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute rounded-full"
          style={{
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            background: `rgba(198, 241, 53, ${0.25 + (i % 3) * 0.1})`,
          }}
          animate={{
            y: [0, -12, 0, 8, 0],
            x: [0, 6, 0, -4, 0],
            opacity: [0.3, 0.6, 0.3, 0.5, 0.3],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Geometric shapes (subtle squares/diamonds) */}
      {geometricShapes.map((shape, i) => (
        <motion.div
          key={`shape-${i}`}
          className="absolute border"
          style={{
            left: shape.x,
            top: shape.y,
            width: 18 + i * 6,
            height: 18 + i * 6,
            borderColor: `rgba(198, 241, 53, ${0.12 + i * 0.04})`,
            borderRadius: i === 1 ? "50%" : "3px",
            transform: `rotate(${shape.rotation}deg)`,
          }}
          animate={{
            y: [0, -8, 0, 6, 0],
            rotate: [shape.rotation, shape.rotation + 15, shape.rotation, shape.rotation - 10, shape.rotation],
            opacity: [0.2, 0.4, 0.2, 0.35, 0.2],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Large soft gradient orb */}
      <motion.div
        className="absolute"
        style={{
          left: "60%",
          top: "30%",
          width: 120,
          height: 120,
          background: "radial-gradient(circle, rgba(198, 241, 53, 0.08) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
        animate={{
          x: [0, 20, 0, -15, 0],
          y: [0, -15, 0, 10, 0],
          scale: [1, 1.1, 1, 0.95, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/* ── Feature card data ────────────────────────────────────────────── */
const features = [
  { title: "Profiles", copy: "Built from shipped work", icon: "user" },
  { title: "Signal", copy: "Demos, velocity, hackathons", icon: "zap" },
  { title: "Scout", copy: "Natural-language discovery", icon: "search" },
] as const;

const featureIcons: Record<string, React.ReactNode> = {
  user: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  zap: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  search: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
};

function FeatureCard({ title, copy, icon, index }: { title: string; copy: string; icon: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -3,
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      }}
      className="p-4 rounded-2xl cursor-default group"
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        transition: "background 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center mb-3"
        style={{
          background: "rgba(198, 241, 53, 0.18)",
          color: "#C6F135",
          transition: "background 0.3s ease",
        }}
      >
        {featureIcons[icon]}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
        {title}
      </p>
      <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>{copy}</p>
    </motion.div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-gray-200/80">
        <div className="mx-auto flex max-w-[1400px] items-center px-6 sm:px-10 h-16">
          <Link href="/" className="flex items-center hover:opacity-70 transition-opacity">
            <AntryLogoFull size={28} />
          </Link>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="flex flex-1">
        {/* Left panel - premium warm panel */}
        <section
          className="hidden lg:flex flex-col justify-between w-[520px] xl:w-[560px] shrink-0 p-12 xl:p-16 relative overflow-hidden"
          style={{ background: "#111111" }}
        >
          {/* Floating decorations */}
          <FloatingDecoration />

          <div className="flex-1 flex flex-col justify-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-semibold uppercase tracking-wider mb-8 w-fit"
              style={{ background: "rgba(198, 241, 53, 0.12)", color: "#C6F135" }}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#C6F135" }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              Builder network
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[44px] xl:text-[48px] font-bold leading-[1.05] tracking-tight text-white font-display max-w-[440px]"
            >
              Show the work.
              <br />
              <span style={{ color: "#C6F135" }}>Get discovered.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-[380px] text-[16px] leading-relaxed"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Where solo AI builders prove their work, find teams, and get hired.
            </motion.p>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 p-5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                &ldquo;I shipped 3 projects on Antry and got contacted by 2 startups within a week. This is how hiring should work.&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: "#C6F135", color: "#111111" }}>
                  M
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">Mara Chen</p>
                  <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>AI Engineer &middot; 12 projects shipped</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-3 mt-10 relative z-10">
            {features.map(({ title, copy, icon }, index) => (
              <FeatureCard key={title} title={title} copy={copy} icon={icon} index={index} />
            ))}
          </div>
        </section>

        {/* Right panel - centered form area */}
        <section className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[460px]">{children}</div>
        </section>
      </div>
    </div>
  );
}
