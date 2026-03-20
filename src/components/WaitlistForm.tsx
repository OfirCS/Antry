"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WaitlistFormProps {
  initialCount?: number;
  className?: string;
  dark?: boolean;
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
      <div className="w-full max-w-[480px]">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isError) setIsError(false);
                }}
                placeholder="Enter your email"
                className={cn(
                  "flex-1 rounded-xl border px-5 py-3.5 text-[14px] font-medium outline-none transition-all duration-200",
                  "border-border-primary bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/20",
                  isError && "border-red-400 placeholder:text-red-300"
                )}
              />
              <Button type="submit" variant="default" size="lg">
                Apply <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-accent px-5 py-3.5 text-[14px] font-semibold text-white"
            >
              <Check className="w-4 h-4" />
              Application received
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-4 text-[12px] font-medium tracking-wide text-text-tertiary">
        <span className="text-text-secondary">{count.toLocaleString()}</span>{" "}
        builders in queue
      </p>
    </div>
  );
}
