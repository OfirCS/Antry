"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, type AuthState } from "../actions";
import { Field } from "../_components/Field";
import { FormError } from "../_components/FormError";
import { OAuthButtons } from "../_components/OAuthButtons";
import { Divider } from "../_components/Divider";
import { SubmitButton } from "../_components/SubmitButton";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";
  const authError = searchParams.get("error");

  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    login,
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
          Welcome back.
        </h1>
      </div>

      {/* OAuth-first */}
      <OAuthButtons />

      <div className="my-6">
        <Divider label="or continue with email" />
      </div>

      {/* Email form */}
      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="redirect" value={redirectTo} />

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
          autoComplete="current-password"
          placeholder="Enter your password"
          error={hasFieldError("password")}
          trailing={
            <Link
              href="/reset-password"
              className="text-[12px] text-[#737373] transition-colors duration-150 hover:text-[#0A0A0A]"
            >
              Forgot?
            </Link>
          }
        />

        {/* Errors */}
        {authError === "auth" && (
          <FormError message="Authentication failed. Please try again." />
        )}
        {state?.error && <FormError message={state.error} />}
        {fieldErrorMessages?.map((msg) => (
          <p key={msg} className="text-[12.5px] font-medium text-[#C42127]">
            {msg}
          </p>
        ))}

        <div className="pt-1">
          <SubmitButton pending={pending} pendingLabel="Signing in…">
            Sign in
          </SubmitButton>
        </div>
      </form>

      {/* Footer link */}
      <p className="mt-8 text-center text-[13.5px] text-[#737373]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-[#0A0A0A] transition-colors duration-150 hover:underline hover:underline-offset-2"
        >
          Sign up <span aria-hidden="true">→</span>
        </Link>
      </p>
    </div>
  );
}
