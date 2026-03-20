"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { createProject, type FormState } from "../actions";

const categories = [
  { value: "ai-agents", label: "AI Agents" },
  { value: "web-apps", label: "Web Apps" },
  { value: "tools", label: "Tools" },
  { value: "design", label: "Design" },
  { value: "data-ml", label: "Data / ML" },
  { value: "mobile", label: "Mobile" },
];

export default function SubmitPage() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createProject,
    null
  );

  const hasFieldError = (field: string) =>
    (state?.fieldErrors?.[field]?.length ?? 0) > 0;

  const fieldError = (field: string) => state?.fieldErrors?.[field]?.[0];

  const inputCls = (field: string) =>
    cn(
      "w-full px-5 py-3.5 bg-background-secondary border border-border-primary shadow-sm rounded-lg text-[14px] font-medium outline-none transition-all duration-300",
      hasFieldError(field)
        ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
        : "focus:border-accent/40 focus:ring-2 focus:ring-accent/20 text-text-primary placeholder:text-text-tertiary"
    );

  return (
    <div className="max-w-[600px] mx-auto px-8 py-10 md:py-16">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-primary transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      <h1 className="font-display text-[28px] text-text-primary mb-2 tracking-[-0.02em]">
        Submit a project
      </h1>
      <p className="text-[14px] text-text-secondary mb-10">
        Share what you&apos;ve built. Live demos, source code, and the story behind it.
      </p>

      {state?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600 dark:bg-red-900/10 dark:border-red-800">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Project name *
          </label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Sentinel"
            className={inputCls("title")}
          />
          {fieldError("title") && (
            <p className="text-[11px] text-red-500 mt-1">{fieldError("title")}</p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Tagline *
          </label>
          <input
            type="text"
            name="tagline"
            placeholder="One-liner describing your project"
            className={inputCls("tagline")}
          />
          {fieldError("tagline") && (
            <p className="text-[11px] text-red-500 mt-1">{fieldError("tagline")}</p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="What does it do? Why did you build it?"
            className={cn(inputCls("description"), "resize-none")}
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Category *
          </label>
          <select
            name="category"
            defaultValue=""
            className={cn(inputCls("category"), "appearance-none cursor-pointer")}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {fieldError("category") && (
            <p className="text-[11px] text-red-500 mt-1">{fieldError("category")}</p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Tech stack
          </label>
          <input
            type="text"
            name="tech_stack"
            placeholder="React, TypeScript, Supabase (comma-separated)"
            className={inputCls("tech_stack")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
              Live demo URL
            </label>
            <input
              type="url"
              name="demo_url"
              placeholder="https://..."
              className={inputCls("demo_url")}
            />
            {fieldError("demo_url") && (
              <p className="text-[11px] text-red-500 mt-1">{fieldError("demo_url")}</p>
            )}
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
              Source code URL
            </label>
            <input
              type="url"
              name="source_url"
              placeholder="https://github.com/..."
              className={inputCls("source_url")}
            />
            {fieldError("source_url") && (
              <p className="text-[11px] text-red-500 mt-1">{fieldError("source_url")}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Build time
          </label>
          <input
            type="text"
            name="build_time"
            placeholder="e.g. 2 weeks, 48 hours"
            className={inputCls("build_time")}
          />
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button
            type="submit"
            className="px-6 py-3.5 bg-accent text-white rounded-lg text-[14px] font-semibold  dark: hover:opacity-90 transition-all duration-300 ease-out disabled:opacity-50"
          >
            {pending ? "Submitting..." : "Submit project"}
          </button>
          <Link
            href="/dashboard"
            className="text-[14px] text-text-tertiary hover:text-text-primary transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
