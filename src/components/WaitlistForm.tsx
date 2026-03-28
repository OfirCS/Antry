"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { joinWaitlist } from "@/app/(platform)/actions";
import type { FormState } from "@/app/(platform)/actions";

interface WaitlistFormProps {
  initialCount?: number;
  className?: string;
  dark?: boolean;
}

const avatarData = [
  { bg: "bg-gradient-to-br from-[#8B5CF6] to-[#6366F1]", name: "Alex" },
  { bg: "bg-gradient-to-br from-[#F59E0B] to-[#F97316]", name: "Jordan" },
  { bg: "bg-gradient-to-br from-[#34D399] to-[#14B8A6]", name: "Sam" },
];

/* CSS-only sparkle/confetti burst */
function CelebrationBurst() {
  return (
    <div className="sparkle-container" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="sparkle-particle"
          style={{
            ["--angle" as string]: `${i * 30}deg`,
            ["--delay" as string]: `${i * 0.04}s`,
            ["--distance" as string]: `${50 + (i % 3) * 20}px`,
            ["--size" as string]: `${3 + (i % 3) * 2}px`,
            ["--color" as string]: i % 3 === 0 ? "#C6F135" : i % 3 === 1 ? "#111111" : "#D4F85A",
          }}
        />
      ))}
    </div>
  );
}

export function WaitlistForm({ initialCount = 247, className }: WaitlistFormProps) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(joinWaitlist, null);
  const [localError, setLocalError] = useState(false);
  const [hoveredAvatar, setHoveredAvatar] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevSuccessRef = useRef(false);

  const submitted = state?.success === true;
  const count = submitted ? initialCount + 1 : initialCount;

  /* Trigger celebration on first success */
  useEffect(() => {
    if (submitted && !prevSuccessRef.current) {
      setShowCelebration(true);
      prevSuccessRef.current = true;
      const timer = setTimeout(() => setShowCelebration(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  return (
    <div className={cn("flex flex-col items-center w-full", className)}>
      <div className="w-full max-w-[480px]">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              action={formAction}
              className="relative flex w-full items-center gap-2 rounded-2xl border border-[#EBEBEB] bg-[#FFFFFF] p-1.5 shadow-sm transition-all duration-200 focus-within:border-[#111111] focus-within:shadow-md"
            >
              {/* Input with shine effect */}
              <div className="relative flex-1 overflow-hidden">
                <input
                  type="email"
                  name="email"
                  required
                  onChange={() => { if (localError) setLocalError(false); }}
                  placeholder="Enter your email"
                  className={cn(
                    "w-full bg-transparent px-4 py-2.5 text-[14px] font-medium outline-none text-[#111111] placeholder:text-[#A3A3A3] relative z-[1]",
                    (localError || state?.error) && "placeholder:text-[#EF4444]"
                  )}
                />
                {/* Subtle shine sweep */}
                <div className="input-shine-effect" />
              </div>

              {/* Button with breathing pulse */}
              <motion.button
                type="submit"
                disabled={isPending}
                className="waitlist-btn-pulse shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C6F135] px-5 py-2.5 text-[13px] font-semibold text-[#111111] transition-all duration-200 hover:bg-[#D4F85A] hover:shadow-[0_8px_24px_rgba(198,241,53,0.3)] hover:-translate-y-[1px] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                whileTap={{ scale: 0.97 }}
              >
                {isPending ? "Joining..." : "Join waitlist"}
                {!isPending && <ArrowRight className="w-3.5 h-3.5" />}
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#C6F135] px-6 py-4 text-[14px] font-semibold text-[#111111] overflow-hidden"
            >
              {showCelebration && <CelebrationBurst />}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Check className="w-4 h-4" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                You&apos;re on the list
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message with smooth transition */}
        <AnimatePresence>
          {state?.error && !submitted && (
            <motion.p
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-[#EF4444] text-[13px] text-center mt-2 overflow-hidden"
            >
              {state.error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Avatar stack with hover expansion */}
      <div className="mt-5 flex items-center gap-2.5">
        <div
          className="flex items-center"
          onMouseLeave={() => setHoveredAvatar(null)}
        >
          {avatarData.map((avatar, i) => (
            <motion.div
              key={i}
              className="relative"
              style={{ marginLeft: i === 0 ? 0 : -6, zIndex: hoveredAvatar === i ? 10 : 3 - i }}
              onMouseEnter={() => setHoveredAvatar(i)}
              animate={{
                scale: hoveredAvatar === i ? 1.2 : 1,
                marginLeft: i === 0 ? 0 : hoveredAvatar !== null ? -2 : -6,
              }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className={cn(
                  "h-7 w-7 rounded-full border-2 border-[#FFFFFF] cursor-pointer transition-shadow duration-200",
                  avatar.bg,
                  hoveredAvatar === i && "shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                )}
              />
              {/* Name tooltip */}
              <AnimatePresence>
                {hoveredAvatar === i && (
                  <motion.span
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111111] px-2 py-0.5 text-[11px] font-medium text-[#FFFFFF] shadow-sm pointer-events-none"
                  >
                    {avatar.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        <p className="text-[13px] text-[#737373]">
          <span className="text-[#111111] font-medium">{count.toLocaleString()}</span> builders ahead of you
        </p>
      </div>
    </div>
  );
}
