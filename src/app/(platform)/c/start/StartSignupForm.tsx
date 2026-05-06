"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import {
  startWorkspaceAction,
  type StartWorkspaceResult,
} from "./actions";

export function StartSignupForm({ planKey }: { planKey: string }) {
  const [state, formAction, isPending] = useActionState<
    StartWorkspaceResult | undefined,
    FormData
  >(startWorkspaceAction, undefined);

  const failed = state && !state.ok ? state : undefined;

  return (
    <form
      action={formAction}
      className="rounded-[24px] p-7 sm:p-8 bg-white"
      style={{
        border: "1px solid #EBEBEB",
        boxShadow: "0 32px 64px -32px rgba(0,0,0,0.12)",
      }}
      noValidate
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-2">
        Step 1 / 3
      </p>
      <h2 className="text-[20px] font-bold tracking-[-0.015em] text-black">
        Claim your workspace.
      </h2>
      <p className="mt-1.5 text-[13px] text-gray-600 leading-[1.55]">
        Lives at{" "}
        <code className="px-1.5 py-0.5 rounded bg-gray-100 text-[12px]">
          antry.com/c/your-slug
        </code>
        . You can change it later.
      </p>

      <div className="mt-6 space-y-4">
        <Field
          label="Company name"
          placeholder="Acme AI Labs"
          name="company_name"
          required
          minLength={2}
          autoComplete="organization"
          fieldError={failed?.field === "company_name" ? failed.error : undefined}
        />
        <Field
          label="Workspace slug"
          placeholder="acme"
          name="slug"
          prefix="antry.com/c/"
          pattern="^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$"
          required
          autoComplete="off"
          fieldError={failed?.field === "slug" ? failed.error : undefined}
          helper="Lowercase letters, numbers, hyphens. 1-32 chars."
        />
        <Field
          label="Your email"
          placeholder="[email protected]"
          name="email"
          type="email"
          required
          autoComplete="email"
          fieldError={failed?.field === "email" ? failed.error : undefined}
        />
      </div>

      <input type="hidden" name="plan" value={planKey} />

      {failed && !failed.field && (
        <p
          role="alert"
          className="mt-5 inline-flex items-center gap-2 text-[12px] font-medium text-red-600"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {failed.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-[14px] px-6 h-[52px] text-[14px] font-semibold w-full transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:translate-y-0 disabled:cursor-not-allowed"
        style={{
          background: "#C6F135",
          color: "#0A0A0A",
          boxShadow: "0 8px 24px rgba(198,241,53,0.35)",
        }}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Provisioning…
          </>
        ) : (
          <>
            Continue → post your first Brief
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="mt-4 text-[11px] text-gray-500 leading-[1.55]">
        By continuing you accept the{" "}
        <Link href="/terms" className="underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        . We send transactional email only — no marketing without explicit opt-in.
      </p>
    </form>
  );
}

function Field({
  label,
  placeholder,
  name,
  type = "text",
  prefix,
  required,
  minLength,
  pattern,
  autoComplete,
  fieldError,
  helper,
}: {
  label: string;
  placeholder: string;
  name: string;
  type?: string;
  prefix?: string;
  required?: boolean;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  fieldError?: string;
  helper?: string;
}) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[12px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2"
      >
        {label}
      </label>
      <span
        className="flex items-center rounded-[12px] overflow-hidden"
        style={{
          border: fieldError ? "1px solid #DC2626" : "1px solid #EBEBEB",
          background: "#FAFAF7",
        }}
      >
        {prefix && (
          <span
            className="text-[13px] font-mono pl-4 pr-1 text-gray-400 shrink-0"
            style={{ background: "#FAFAF7" }}
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          pattern={pattern}
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={
            fieldError ? errorId : helper ? helperId : undefined
          }
          className="flex-1 bg-transparent outline-none text-[14px] px-3 py-3 placeholder:text-gray-400"
        />
      </span>
      {fieldError ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-[11px] font-medium text-red-600 inline-flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {fieldError}
        </p>
      ) : helper ? (
        <p id={helperId} className="mt-1.5 text-[11px] text-gray-500">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
