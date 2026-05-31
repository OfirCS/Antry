"use client";

import { useActionState, useEffect, useState } from "react";
import { updateProfile, type FormState } from "../actions";

type Profile = {
  full_name: string | null;
  username: string | null;
  bio: string | null;
  skills: string[] | null;
  github_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
};

/**
 * Profile form — terse labels, inline errors, lime save pill.
 *
 * Server action: updateProfile. Skills are kept (server validates them)
 * but rendered as a single hidden field built from the parent profile;
 * editing skills lives in the Profile tab here as a comma-separated
 * row to stay within scope.
 */
export function ProfileForm({ initial }: { initial: Profile | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateProfile,
    null
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (state?.success) {
      const show = window.setTimeout(() => setSaved(true), 0);
      const hide = window.setTimeout(() => setSaved(false), 2500);
      return () => {
        window.clearTimeout(show);
        window.clearTimeout(hide);
      };
    }
  }, [state]);

  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="p-7 sm:p-8 space-y-7">
      {state?.error && (
        <p
          className="rounded-[12px] px-4 py-3 text-[13px] font-semibold"
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.20)",
            color: "#dc2626",
          }}
        >
          {state.error}
        </p>
      )}

      <Field label="Full name" name="full_name" error={fieldError("full_name")}>
        <input
          type="text"
          name="full_name"
          defaultValue={initial?.full_name ?? ""}
          placeholder="Your name"
          required
          className={inputCls}
        />
      </Field>

      <Field label="Username" name="username" error={fieldError("username")}>
        <input
          type="text"
          name="username"
          defaultValue={initial?.username ?? ""}
          placeholder="your-handle"
          required
          className={inputCls}
        />
      </Field>

      <Field label="Bio" name="bio" error={fieldError("bio")}>
        <textarea
          name="bio"
          rows={3}
          defaultValue={initial?.bio ?? ""}
          placeholder="What do you build?"
          className={`${inputCls} resize-none`}
        />
      </Field>

      {/* Skills are part of the schema — keep them but render compact. */}
      <Field label="Skills" name="skills" error={fieldError("skills")}>
        <input
          type="text"
          name="skills"
          defaultValue={(initial?.skills ?? []).join(", ")}
          placeholder="react, postgres, design"
          className={inputCls}
        />
      </Field>

      <Field label="GitHub" name="github_url" error={fieldError("github_url")}>
        <input
          type="url"
          name="github_url"
          defaultValue={initial?.github_url ?? ""}
          placeholder="https://github.com/…"
          className={inputCls}
        />
      </Field>

      <Field
        label="Twitter / X"
        name="twitter_url"
        error={fieldError("twitter_url")}
      >
        <input
          type="url"
          name="twitter_url"
          defaultValue={initial?.twitter_url ?? ""}
          placeholder="https://twitter.com/…"
          className={inputCls}
        />
      </Field>

      <Field
        label="Website"
        name="website_url"
        error={fieldError("website_url")}
      >
        <input
          type="url"
          name="website_url"
          defaultValue={initial?.website_url ?? ""}
          placeholder="https://…"
          className={inputCls}
        />
      </Field>

      <div
        className="flex items-center justify-between gap-4 pt-2 border-t"
        style={{ borderColor: "#EBEBEB" }}
      >
        <p
          className="text-[12px] font-medium"
          style={{ color: saved ? "#0A0A0A" : "#A3A3A3" }}
        >
          {saved ? "Saved." : "Changes save to your public profile."}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-full px-6 h-[40px] text-[13px] font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "#C6F135", color: "#0A0A0A" }}
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-[10px] border bg-white px-4 py-2.5 text-[14px] font-medium outline-none transition-colors focus:border-[#0A0A0A]";

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em]"
        style={{ color: "#737373" }}
      >
        {label}
      </label>
      <div
        style={
          {
            // pass border color via CSS var so the shared input class can stay generic
            ["--border" as string]: error ? "#dc2626" : "#EBEBEB",
          } as React.CSSProperties
        }
        className="[&_input]:border-[var(--border)] [&_textarea]:border-[var(--border)]"
      >
        {children}
      </div>
      {error && (
        <p className="mt-1.5 text-[12px] font-medium" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}
    </div>
  );
}
