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
              className="flex flex-col sm:flex-row gap-3 w-full"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (isError) setIsError(false); }}
                placeholder="Enter your email"
                className={cn(
                  "flex-1 px-8 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm outline-none transition-all",
                  isError
                    ? "border-red-400 placeholder:text-red-300"
                    : "border-gray-100 focus:border-blue-600/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:shadow-2xl focus:shadow-blue-500/10"
                )}
              />
              <button
                type="submit"
                className="group flex items-center justify-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-full text-sm font-bold whitespace-nowrap hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-500/20 active:scale-[0.98] transition-all"
              >
                Join the Colony
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-50 rounded-full text-blue-700 text-sm font-semibold border border-blue-100"
            >
              <Check className="w-4 h-4" />
              You&apos;re on the list.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-4 text-[12px] text-text-tertiary">
        <span className="font-mono text-text-secondary">{count}</span> ants waiting
      </p>
    </div>
  );
}
