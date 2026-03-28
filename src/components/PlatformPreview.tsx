"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Heart, ArrowUpRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

function MockProfileCard() {
  return (
    <div className="rounded-[20px] border border-[#EBEBEB] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center text-[14px] font-semibold text-[#C6F135] shrink-0">
          MC
        </div>
        <div>
          <h4 className="text-[16px] font-semibold text-[#111111] tracking-tight">Mara Chen</h4>
          <p className="text-[13px] text-[#525252] leading-snug mt-1">AI engineer building things that think.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {["Python", "LangChain", "TypeScript", "RAG"].map((s) => (
          <span
            key={s}
            className="inline-flex items-center rounded-full bg-[#F5F5F5] px-2.5 py-0.5 text-[10px] font-medium text-[#525252]"
          >
            {s}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#EBEBEB]">
        {[
          { val: "3", label: "Ships" },
          { val: "2", label: "Wins" },
          { val: "443", label: "Signal" },
        ].map((m, i) => (
          <div key={m.label}>
            <motion.span
              className="text-[20px] font-bold text-[#111111] inline-block"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
            >
              {m.val}
            </motion.span>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#737373] mt-1">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockProjectCard({ title, desc, likes }: { title: string; desc: string; likes: number }) {
  return (
    <div className="rounded-[20px] border border-[#EBEBEB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="text-[14px] font-semibold text-[#111111] tracking-tight">{title}</h4>
          <p className="text-[12px] text-[#525252] mt-1 leading-relaxed">{desc}</p>
        </div>
        <motion.span
          className="flex items-center gap-1.5 text-[#737373] text-[11px] font-medium shrink-0"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart className="w-3 h-3" /> {likes}
        </motion.span>
      </div>
    </div>
  );
}

function MockDiscoverCard({ name, initials, tagline }: { name: string; initials: string; tagline: string }) {
  return (
    <div className="group/discover cursor-pointer flex items-center gap-3 rounded-2xl border border-[#EBEBEB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] hover:-translate-y-[1px]">
      <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[10px] font-semibold text-[#525252] group-hover/discover:bg-[#111111] group-hover/discover:text-[#C6F135] transition-colors duration-200">
        {initials}
      </div>
      <div className="min-w-0">
        <h4 className="text-[12px] font-semibold text-[#111111] tracking-tight">{name}</h4>
        <p className="text-[11px] text-[#737373] mt-0.5 truncate">{tagline}</p>
      </div>
    </div>
  );
}

/* Floating decorative dot */
function FloatingDot({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute w-2 h-2 rounded-full bg-[#C6F135]/20 ${className ?? ""}`}
      animate={{
        y: [0, -8, 0],
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

/* Animated bento card wrapper with scroll-triggered entrance */
function BentoItem({
  children,
  className,
  index = 0,
  parallaxOffset = 0,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
  parallaxOffset?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [parallaxOffset, -parallaxOffset]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.97 }}
      transition={{ duration: 0.6, delay: index * 0.12, ease }}
      className={className}
    >
      <div ref={containerRef}>
        {children}
      </div>
    </motion.div>
  );
}

export function PlatformPreview() {
  return (
    <section className="bg-[#FAFAF7] overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-16"
        >
          <p className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.06em] uppercase text-[#737373] mb-4">
            System Interface
          </p>
          <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold text-[#111111] tracking-[-0.03em]">
            Work, beautifully indexed.
          </h2>
        </motion.div>

        {/* Bento grid with relative for floating elements */}
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* Floating decorative elements */}
          <FloatingDot className="hidden md:block top-[15%] left-[41%] z-10" delay={0} />
          <FloatingDot className="hidden md:block top-[55%] left-[40%] z-10" delay={1.2} />
          <FloatingDot className="hidden md:block top-[35%] right-[3%] z-10" delay={2.4} />
          <FloatingDot className="hidden md:block bottom-[10%] left-[20%] z-10" delay={0.6} />
          <motion.div
            className="hidden md:block absolute w-3 h-3 rounded-full border border-[#C6F135]/30 top-[8%] right-[15%] z-10"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="hidden md:block absolute w-1.5 h-1.5 rounded-sm bg-[#111111]/10 top-[70%] left-[42%] z-10"
            animate={{ rotate: [0, 90, 180, 270, 360], y: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Gradient overlay at left edge for depth */}
          <div className="pointer-events-none absolute inset-y-0 -left-1 w-12 z-20 bg-gradient-to-r from-[#FAFAF7] to-transparent" />
          {/* Gradient overlay at right edge for depth */}
          <div className="pointer-events-none absolute inset-y-0 -right-1 w-12 z-20 bg-gradient-to-l from-[#FAFAF7] to-transparent" />
          {/* Gradient overlay at bottom edge for depth */}
          <div className="pointer-events-none absolute -bottom-1 inset-x-0 h-12 z-20 bg-gradient-to-t from-[#FAFAF7] to-transparent" />

          {/* Profile column */}
          <BentoItem
            className="md:col-span-5"
            index={0}
            parallaxOffset={12}
          >
            <div className="rounded-[20px] bg-[#F5F0E8] p-8 flex flex-col justify-center h-full">
              <MockProfileCard />
              <p className="mt-8 text-[14px] leading-relaxed text-[#525252]">
                Builder profiles are normalized into a searchable retrieval layer, optimized for intent-based matching.
              </p>
            </div>
          </BentoItem>

          {/* Right column */}
          <div className="md:col-span-7 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <BentoItem index={1} parallaxOffset={8}>
                <div className="rounded-[20px] bg-[#EEF4EC] p-6">
                  <MockProjectCard title="Sentinel" desc="AI code reviewer that catches what linters miss." likes={142} />
                </div>
              </BentoItem>
              <BentoItem index={2} parallaxOffset={16}>
                <div className="rounded-[20px] bg-[#F0EDF8] p-6">
                  <MockProjectCard title="Flowstate" desc="Collaborative whiteboard that thinks with you." likes={98} />
                </div>
              </BentoItem>
            </div>

            <BentoItem index={3} parallaxOffset={6} className="flex-1">
              <div className="rounded-[20px] bg-[#EBF2FA] p-8 h-full">
                <div className="flex items-center justify-between mb-6">
                  <p className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.06em] uppercase text-[#737373]">
                    Discovery Feed
                  </p>
                  <motion.div
                    animate={{ x: [0, 2, 0], y: [0, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#737373]" />
                  </motion.div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MockDiscoverCard name="Jake Torres" initials="JT" tagline="Full-stack builder who ships fast" />
                  <MockDiscoverCard name="Aisha Patel" initials="AP" tagline="Design engineer bridging art and code" />
                  <MockDiscoverCard name="Sofia Rivera" initials="SR" tagline="Data scientist focusing on ML ops" />
                  <MockDiscoverCard name="Leo Kim" initials="LK" tagline="Backend expert specialized in Go" />
                </div>
              </div>
            </BentoItem>
          </div>
        </div>
      </div>
    </section>
  );
}
