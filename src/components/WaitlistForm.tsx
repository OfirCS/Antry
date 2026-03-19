"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WaitlistFormProps {
  initialCount?: number;
  className?: string;
}

export function WaitlistForm({ initialCount = 247, className }: WaitlistFormProps) {
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
      <div className="w-full max-w-[440px]">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -6 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2 w-full"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (isError) setIsError(false); }}
                placeholder="your@email.com"
                className={cn(
                  "flex-1 px-4 py-2.5 bg-background-primary border rounded-lg text-[14px] outline-none transition-colors",
                  isError
                    ? "border-red-400 placeholder:text-red-300"
                    : "border-border-secondary focus:border-accent text-text-primary placeholder:text-text-tertiary"
                )}
              />
              <button
                type="submit"
                className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-text-primary text-background-primary rounded-lg text-[14px] font-medium whitespace-nowrap hover:opacity-85 active:scale-[0.98] transition-all"
              >
                Join waitlist
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-accent/30 bg-accent-muted rounded-lg text-accent text-[14px] font-medium"
            >
              <Check className="w-4 h-4" />
              You&apos;re on the list.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-4 text-[12px] text-text-tertiary">
        <span className="font-mono text-text-secondary">{count}</span> builders waiting
      </p>
    </div>
  );
}
