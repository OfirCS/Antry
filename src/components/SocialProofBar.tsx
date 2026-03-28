"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { antathons, builders } from "@/lib/mock-data";

const sponsors = Array.from(
  new Set(antathons.flatMap((antathon) => antathon.sponsors.map((sponsor) => sponsor.name)))
);

const ease = [0.22, 1, 0.36, 1] as const;

function CountUp({ target, duration = 1.8 }: { target: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [isInView, count, target, duration]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = `${v}+`;
    });
    return () => unsubscribe();
  }, [rounded]);

  return <span ref={ref}>0+</span>;
}

export function SocialProofBar() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section
      ref={sectionRef}
      className="border-b border-[#EBEBEB] bg-[#FAFAF7]"
    >
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
        >
          {/* Left label */}
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="text-[14px] font-medium text-[#737373] shrink-0 tracking-[-0.01em]"
          >
            Trusted by{" "}
            <span className="text-[#111111] font-semibold">
              <CountUp target={builders.length} />
            </span>{" "}
            builders
          </motion.p>

          {/* Marquee with pause-on-hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="overflow-hidden flex-1"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="flex animate-trustbar-marquee"
              style={{
                animationPlayState: isPaused ? "paused" : "running",
              }}
              aria-label="Sponsors"
            >
              {[...sponsors, ...sponsors].map((name, i) => (
                <motion.span
                  key={`${name}-${i}`}
                  className="shrink-0 px-7 text-[15px] font-semibold tracking-[-0.02em] text-[#A3A3A3] cursor-default select-none"
                  aria-hidden={i >= sponsors.length}
                  whileHover={{
                    scale: 1.08,
                    color: "#111111",
                    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  {name}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
