"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { signup, type AuthState } from "../actions";
import { Field } from "../_components/Field";
import { FormError } from "../_components/FormError";
import { OAuthButtons } from "../_components/OAuthButtons";
import { Divider } from "../_components/Divider";
import { SubmitButton } from "../_components/SubmitButton";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signup,
    null
  );

  const hasFieldError = (field: string) =>
    (state?.fieldErrors?.[field]?.length ?? 0) > 0;

  const fieldErrorMessages =
    state?.fieldErrors && Object.values(state.fieldErrors).flat();

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#0A0A0A]">
          Mint your first Receipt.
        </h1>
        <p className="mt-1.5 text-[13.5px] text-[#737373]">
          Free. No credit card.
        </p>
      </div>

      {/* Inline social proof */}
      <div className="mb-6 flex items-center gap-2 text-[12.5px] text-[#525252]">
        <Sparkles className="h-3.5 w-3.5 text-[#A3A3A3]" strokeWidth={1.75} aria-hidden="true" />
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#C6F135]"
            aria-hidden="true"
          />
          <span>
            <span className="font-medium text-[#0A0A0A]">47 builders</span>{" "}
            shipped this week
          </span>
        </span>
      </div>

      {/* OAuth-first */}
      <OAuthButtons />

      <div className="my-6">
        <Divider label="or continue with email" />
      </div>

      {/* Email form */}
      <form action={formAction} className="space-y-4" noValidate>
        <Field
          label="Name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Alex Rivera"
          error={hasFieldError("name")}
        />

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          error={hasFieldError("email")}
        />

        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          error={hasFieldError("password")}
        />

        <Field
          label={
            <>
              Invite code{" "}
              <span className="font-normal text-[#A3A3A3]">(optional)</span>
            </>
          }
          name="invite"
          type="text"
          placeholder="ANTRY-2026"
        />

        {/* Errors */}
        {state?.error && <FormError message={state.error} />}
        {fieldErrorMessages?.map((msg) => (
          <p key={msg} className="text-[12.5px] font-medium text-[#C42127]">
            {msg}
          </p>
        ))}

        <div className="pt-1">
          <SubmitButton pending={pending} pendingLabel="Creating account…">
            Create account
          </SubmitButton>
        </div>
      </form>

      {/* Footer link */}
      <p className="mt-8 text-center text-[13.5px] text-[#737373]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#0A0A0A] transition-colors duration-150 hover:underline hover:underline-offset-2"
        >
          Sign in <span aria-hidden="true">→</span>
        </Link>
      </p>
    </div>
  );
}
