"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { resetPassword, type AuthState } from "../actions";
import { Field } from "../_components/Field";
import { FormError } from "../_components/FormError";
import { SubmitButton } from "../_components/SubmitButton";

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    resetPassword,
    null
  );

  const hasFieldError = (field: string) =>
    (state?.fieldErrors?.[field]?.length ?? 0) > 0;

  const fieldErrorMessages =
    state?.fieldErrors && Object.values(state.fieldErrors).flat();

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-7">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#0A0A0A]">
          Forgot your password?
        </h1>
        <p className="mt-1.5 text-[13.5px] text-[#737373]">
          We&apos;ll send a reset link.
        </p>
      </div>

      {state?.success ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-[#EBEBEB] bg-[#FAFAF7] px-3.5 py-3">
          <CheckCircle2
            className="mt-[1px] h-4 w-4 shrink-0 text-[#0A0A0A]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <p className="text-[13px] leading-[1.5] text-[#0A0A0A]">
            {state.success}
          </p>
        </div>
      ) : (
        <form action={formAction} className="space-y-4" noValidate>
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            required
            error={hasFieldError("email")}
          />

          {state?.error && <FormError message={state.error} />}
          {fieldErrorMessages?.map((msg) => (
            <p key={msg} className="text-[12.5px] font-medium text-[#C42127]">
              {msg}
            </p>
          ))}

          <div className="pt-1">
            <SubmitButton pending={pending} pendingLabel="Sending…">
              Send reset link
            </SubmitButton>
          </div>
        </form>
      )}

      {/* Footer link */}
      <p className="mt-8 text-center text-[13.5px] text-[#737373]">
        <Link
          href="/login"
          className="font-medium text-[#0A0A0A] transition-colors duration-150 hover:underline hover:underline-offset-2"
        >
          <span aria-hidden="true">←</span> Back to sign in
        </Link>
      </p>
    </div>
  );
}
