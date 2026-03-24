"use client";

import { useActionState, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { joinWaitlist } from "@/app/(platform)/actions";
import type { FormState } from "@/app/(platform)/actions";

interface WaitlistFormProps {
  initialCount?: number;
  className?: string;
  dark?: boolean;
}

export function WaitlistForm({ initialCount = 247, className }: WaitlistFormProps) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(joinWaitlist, null);
  const [localError, setLocalError] = useState(false);

  const submitted = state?.success === true;
  const count = submitted ? initialCount + 1 : initialCount;

  return (
    <div className={cn("flex flex-col items-center w-full", className)}>
      <div className="w-full max-w-[520px]">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              action={formAction}
              className="relative flex w-full items-center p-1.5 rounded-full border border-border-primary bg-surface shadow-sm focus-within:border-accent/40 focus-within:shadow-[0_0_20px_rgba(0,209,255,0.08)] transition-all duration-500"
            >
              <input
                type="email"
                name="email"
                required
                onChange={() => { if (localError) setLocalError(false); }}
                placeholder="Enter your email"
                className={cn(
                  "flex-1 bg-transparent px-6 py-3 text-[15px] font-medium outline-none text-text-primary placeholder:text-text-tertiary",
                  (localError || state?.error) && "placeholder:text-red-400"
                )}
              />
              <Button type="submit" variant="default" size="lg" className="rounded-full h-12 px-8" disabled={isPending}>
                {isPending ? "Sending..." : "Apply"} {!isPending && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-accent px-8 py-4 text-[15px] font-bold text-[#0a0b0d]"
            >
              <Check className="w-5 h-5" />
              Application received
            </motion.div>
          )}
        </AnimatePresence>

        {state?.error && !submitted && (
          <p className="text-red-500 text-[13px] text-center mt-2">{state.error}</p>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-6 rounded-full border-2 border-surface bg-background-secondary" />
          ))}
        </div>
        <p className="text-[13px] font-medium text-text-tertiary">
          <span className="text-text-primary font-bold">{count.toLocaleString()}</span> builders in queue
        </p>
      </div>
    </div>
  );
}
