"use client";

import { useEffect, useId, useState } from "react";
import { ArrowRight, AtSign, Check } from "lucide-react";
import {
  USERNAME_MAX,
  setOnboardingUsername,
  validateUsername,
} from "@/lib/onboarding/state";

/**
 * Step 2 — Claim a username. Live validation runs on every keystroke
 * but is suppressed for empty/dirty-untouched inputs so the user
 * doesn't see a red error before they've typed anything.
 *
 * No DB write happens here — there's no auth yet. The value gets
 * persisted to localStorage so the user can refresh without losing
 * their pick, and we hand it off to the eventual signup form when
 * auth lands.
 */
export function StepUsername({
  initial,
  onNext,
}: {
  initial?: string;
  onNext: () => void;
}) {
  const inputId = useId();
  const [value, setValue] = useState(initial ?? "");
  const [touched, setTouched] = useState(Boolean(initial));

  // Persist as the user types — drop-out tolerant. Skip if invalid so
  // we don't store something we'd reject later.
  useEffect(() => {
    if (value.length === 0) return;
    const v = validateUsername(value);
    if (v.ok) setOnboardingUsername(value);
  }, [value]);

  const result = validateUsername(value);
  const showError = touched && !result.ok && value.length > 0;
  const canAdvance = result.ok;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdvance) {
      setTouched(true);
      return;
    }
    setOnboardingUsername(value);
    onNext();
  };

  return (
    <div>
      <h1
        className="font-display font-bold tracking-[-0.03em] text-[#0A0A0A] leading-[1.05]"
        style={{ fontSize: "clamp(1.6rem, 3.6vw, 2rem)" }}
      >
        Pick a username.
      </h1>
      <p className="mt-3 text-[14px] leading-[1.55] text-gray-600">
        Lowercase letters, numbers, and hyphens. 3–{USERNAME_MAX} characters.
      </p>

      <form className="mt-6" onSubmit={handleSubmit} noValidate>
        <label htmlFor={inputId} className="sr-only">
          Username
        </label>
        <div
          className="flex items-center rounded-[12px] transition-colors"
          style={{
            background: "#FFFFFF",
            border: `1px solid ${showError ? "#EF4444" : "#EBEBEB"}`,
            boxShadow: showError ? "0 0 0 3px rgba(239,68,68,0.08)" : "none",
          }}
        >
          <span
            aria-hidden
            className="pl-3.5 pr-1 text-gray-400 inline-flex items-center"
          >
            <AtSign className="w-4 h-4" />
          </span>
          <input
            id={inputId}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="your-handle"
            value={value}
            onChange={(e) => {
              // Soft normalization: strip whitespace, force lowercase.
              // The visible regex still rejects other invalid chars so the
              // user understands the rule.
              const next = e.target.value.replace(/\s+/g, "").toLowerCase();
              setValue(next);
            }}
            onBlur={() => setTouched(true)}
            maxLength={USERNAME_MAX}
            className="flex-1 bg-transparent py-3 pr-3 text-[15px] text-[#0A0A0A] placeholder:text-gray-400 outline-none"
            aria-invalid={showError || undefined}
            aria-describedby={`${inputId}-help`}
          />
          {canAdvance && (
            <span
              aria-hidden
              className="pr-3 inline-flex items-center text-[#0A0A0A]"
              style={{ color: "#16A34A" }}
            >
              <Check className="w-4 h-4" />
            </span>
          )}
        </div>

        <p
          id={`${inputId}-help`}
          className="mt-2 text-[12px] leading-[1.4]"
          style={{ color: showError ? "#DC2626" : "#737373" }}
        >
          {showError && !result.ok
            ? result.reason
            : `Your profile will be at antry.com/u/${value || "<username>"}.`}
        </p>

        <button
          type="submit"
          disabled={!canAdvance}
          className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-[10px] px-5 h-11 text-[14px] font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style={{ background: "#0A0A0A", color: "#FFFFFF" }}
        >
          Next <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
