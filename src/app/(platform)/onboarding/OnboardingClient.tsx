"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getOnboardingState,
  markOnboardingCompleted,
  setOnboardingStep,
} from "@/lib/onboarding/state";
import { StepIndicator } from "./_components/StepIndicator";
import { StepWelcome } from "./_components/StepWelcome";
import { StepUsername } from "./_components/StepUsername";
import { StepConnect } from "./_components/StepConnect";
import { StepBrief } from "./_components/StepBrief";

const TOTAL_STEPS = 4;

/**
 * Onboarding flow controller.
 *
 * We render step 1 on the initial server-side pass (and on first
 * client paint) so there's no flash; once we mount on the client we
 * sync to the last persisted step. This means a refresh mid-flow
 * resumes where the user left off, but a server-rendered preview
 * doesn't reveal someone else's progress.
 *
 * Transitions use a single opacity class toggle (200ms) so we don't
 * pull in framer-motion just to fade between steps.
 */
export function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Hydrate from localStorage on mount. We deliberately ignore
  // `completed === true` here: a returning completed user who lands
  // on /onboarding directly probably *wants* the flow (they followed
  // the link), so we just put them back at the last step.
  useEffect(() => {
    const s = getOnboardingState();
    const clamped = Math.min(Math.max(s.step, 1), TOTAL_STEPS);
    setStep(clamped);
    setUsername(s.username);
    setMounted(true);
  }, []);

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), TOTAL_STEPS);
    if (clamped === step) return;
    setTransitioning(true);
    // Persist immediately — even if the fade is interrupted (refresh
    // mid-transition), the next visit lands on the right step.
    setOnboardingStep(clamped);
    // Short fade-out, then swap content, then fade back in. CSS only.
    window.setTimeout(() => {
      setStep(clamped);
      setTransitioning(false);
    }, 180);
  };

  const handleFinish = () => {
    markOnboardingCompleted();
    router.push("/");
  };

  // Per-step skip behavior. Step 1 has no skip (the user just got
  // here); steps 2 and 3 jump to step 4; step 4 finishes.
  const skipTarget: number | "finish" | null =
    step === 2 || step === 3 ? 4 : step === 4 ? "finish" : null;

  return (
    <div className="w-full max-w-[560px]">
      {/* Top bar — back left, skip right, step indicator centered. */}
      <div className="relative mb-6 flex items-center justify-center min-h-[28px]">
        {step > 1 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="absolute left-0 inline-flex items-center gap-1 text-[12px] font-semibold text-gray-500 hover:text-[#0A0A0A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        )}

        <StepIndicator current={step} total={TOTAL_STEPS} />

        {skipTarget !== null && (
          <button
            type="button"
            onClick={() =>
              skipTarget === "finish" ? handleFinish() : goTo(skipTarget)
            }
            className="absolute right-0 text-[12px] font-semibold text-gray-500 hover:text-[#0A0A0A] transition-colors"
          >
            {skipTarget === "finish" ? "Skip" : "I'll do this later"}
          </button>
        )}
      </div>

      {/* Card */}
      <div
        className="rounded-[20px] p-6 sm:p-8"
        style={{
          background: "#FFFFFF",
          border: "1px solid #EBEBEB",
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div
          aria-live="polite"
          className="transition-opacity duration-200"
          style={{ opacity: transitioning || !mounted ? 0 : 1 }}
        >
          {step === 1 && <StepWelcome onNext={() => goTo(2)} />}
          {step === 2 && (
            <StepUsername initial={username} onNext={() => goTo(3)} />
          )}
          {step === 3 && <StepConnect onNext={() => goTo(4)} />}
          {step === 4 && <StepBrief onFinish={handleFinish} />}
        </div>
      </div>

      {/* Subtle footer affordance — reassurance, not noise. */}
      <p className="mt-5 text-center text-[11px] text-gray-400">
        Your progress is saved on this device.
      </p>
    </div>
  );
}
