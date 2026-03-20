"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WaitlistFormProps {
  initialCount?: number;
  className?: string;
  dark?: boolean;
}

export function WaitlistForm({ initialCount = 247, className, dark }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setIsError(true);
      return;
    }
    setIsError(false);
    setSubmitted(true);
    setCount((prev) => prev + 1);
    setEmail("");
  };

  return (
    <div className={cn("flex flex-col items-center w-full", className)}>
      <div className="w-full max-w-[480px]">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2 w-full"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isError) setIsError(false);
                }}
                placeholder="Email address"
                className={cn(
                  "flex-1 px-5 py-3.5 border rounded-full text-[14px] font-medium outline-none transition-all duration-300",
                  dark
                    ? "bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/50 focus:shadow-[0_0_20px_var(--glow-orange),0_0_40px_var(--glow-orange)] focus:outline-none"
                    : "glass-card text-text-primary placeholder:text-text-tertiary focus:border-accent/40 focus:shadow-[0_0_20px_var(--glow-orange),0_0_40px_var(--glow-orange)] focus:outline-none",
                  isError && "border-red-400 placeholder:text-red-300"
                )}
              />
              <button
                type="submit"
                className={cn(
                  "flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-semibold whitespace-nowrap transition-all active:scale-[0.97]",
                  dark
                    ? "bg-white text-[#111] hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    : "bg-text-primary text-background-primary hover:opacity-80 hover:shadow-[0_0_20px_var(--glow-orange)]"
                )}
              >
                Apply <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "flex items-center justify-center gap-2.5 w-full px-5 py-3.5 rounded-full text-[14px] font-semibold",
                dark ? "bg-white text-[#111]" : "bg-text-primary text-background-primary"
              )}
            >
              <Check className="w-4 h-4" />
              Application received
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className={cn(
        "mt-4 text-[12px] font-medium tracking-wide",
        dark ? "text-white/40" : "text-text-tertiary"
      )}>
        <span className={dark ? "text-white/70" : "text-text-secondary"}>{count.toLocaleString()}</span>{" "}
        builders in queue
      </p>
    </div>
  );
}
