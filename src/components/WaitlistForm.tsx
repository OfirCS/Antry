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
      <div className="w-full max-w-[480px]">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              action={formAction}
              className="relative flex w-full items-center gap-2 p-1.5 rounded-xl border border-border-primary bg-surface shadow-sm focus-within:border-text-tertiary/40 transition-all"
            >
              <input
                type="email"
                name="email"
                required
                onChange={() => { if (localError) setLocalError(false); }}
                placeholder="you@company.com"
                className={cn(
                  "flex-1 bg-transparent px-4 py-2.5 text-[14px] outline-none text-text-primary placeholder:text-text-tertiary",
                  (localError || state?.error) && "placeholder:text-red-400"
                )}
              />
              <Button type="submit" size="default" className="rounded-lg h-10 px-5 shrink-0" disabled={isPending}>
                {isPending ? "Joining..." : "Join waitlist"}
                {!isPending && <ArrowRight className="ml-1.5 w-3.5 h-3.5" />}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-accent px-6 py-3.5 text-[14px] font-medium text-white"
            >
              <Check className="w-4 h-4" />
              You&apos;re on the list
            </motion.div>
          )}
        </AnimatePresence>

        {state?.error && !submitted && (
          <p className="text-red-500 text-[13px] text-center mt-2">{state.error}</p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        <div className="flex -space-x-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-5 rounded-full border-2 border-surface bg-background-secondary" />
          ))}
        </div>
        <p className="text-[13px] text-text-tertiary">
          <span className="text-text-secondary font-medium">{count.toLocaleString()}</span> builders ahead of you
        </p>
      </div>
    </div>
  );
}
