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
      "w-full px-5 py-3.5 bg-background-secondary border border-border-primary shadow-sm rounded-xl text-[14px] font-medium outline-none transition-all duration-300",
      hasFieldError(field)
        ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
        : "focus:bg-surface focus:border-accent/40 focus:ring-4 focus:ring-accent/10 text-text-primary placeholder:text-text-tertiary"
    );

  return (
    <div className="max-w-[700px] mx-auto px-6 py-16 md:py-24">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors mb-10"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <div className="mb-12">
        <h1 className="font-display text-[clamp(2rem,4vw,2.5rem)] text-text-primary mb-3 tracking-[-0.03em] font-bold">
          Submit a Project
        </h1>
        <p className="text-[16px] text-text-secondary leading-relaxed">
          Add your verified proof of work to the network. Include live demos, source code, and tech stack details.
        </p>
      </div>

      {state?.error && (
        <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-xl text-[14px] font-medium text-red-500">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-8 card-premium p-8 sm:p-10">
        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
            Project name *
          </label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Sentinel AI"
            className={inputCls("title")}
          />
          {fieldError("title") && (
            <p className="text-[12px] font-medium text-red-500 mt-2 pl-1">{fieldError("title")}</p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
            Tagline *
          </label>
          <input
            type="text"
            name="tagline"
            placeholder="One-liner describing what your project does"
            className={inputCls("tagline")}
          />
          {fieldError("tagline") && (
            <p className="text-[12px] font-medium text-red-500 mt-2 pl-1">{fieldError("tagline")}</p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
            Description
          </label>
          <textarea
            name="description"
            rows={5}
            placeholder="What problem does it solve? How did you build it?"
            className={cn(inputCls("description"), "resize-none")}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
            Category *
          </label>
          <select
            name="category"
            defaultValue=""
            className={cn(inputCls("category"), "appearance-none cursor-pointer")}
          >
            <option value="" disabled>
              Select the main category
            </option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {fieldError("category") && (
            <p className="text-[12px] font-medium text-red-500 mt-2 pl-1">{fieldError("category")}</p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
            Tech stack
          </label>
          <input
            type="text"
            name="tech_stack"
            placeholder="Next.js, Python, Supabase (comma-separated)"
            className={inputCls("tech_stack")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
              Live demo URL
            </label>
            <input
              type="url"
              name="demo_url"
              placeholder="https://..."
              className={inputCls("demo_url")}
            />
            {fieldError("demo_url") && (
              <p className="text-[12px] font-medium text-red-500 mt-2 pl-1">{fieldError("demo_url")}</p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
              Source code URL
            </label>
            <input
              type="url"
              name="source_url"
              placeholder="https://github.com/..."
              className={inputCls("source_url")}
            />
            {fieldError("source_url") && (
              <p className="text-[12px] font-medium text-red-500 mt-2 pl-1">{fieldError("source_url")}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
            Build time <span className="normal-case font-medium text-text-tertiary tracking-normal">(optional)</span>
          </label>
          <input
            type="text"
            name="build_time"
            placeholder="e.g. 2 weeks, 48 hours"
            className={inputCls("build_time")}
          />
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center gap-4 border-t border-border-tertiary mt-8">
          <button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto px-8 py-4 bg-text-primary text-background-primary rounded-full text-[14px] font-bold hover:opacity-90 transition-all duration-300 ease-out disabled:opacity-50 shadow-md"
          >
            {pending ? "Submitting..." : "Submit Project"}
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 text-center border border-border-primary bg-background-secondary rounded-full text-[14px] font-bold text-text-secondary hover:text-text-primary hover:bg-surface transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
