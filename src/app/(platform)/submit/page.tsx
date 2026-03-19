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

  const fieldError = (field: string) =>
    state?.fieldErrors?.[field]?.[0];

  const inputCls = (field: string) =>
    cn(
      "w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm outline-none transition-all",
      hasFieldError(field)
        ? "border-red-400"
        : "border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 text-gray-900 placeholder:text-gray-400"
    );

  return (
    <div className="max-w-[600px] mx-auto px-6 py-10 md:py-16">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit a project</h1>
      <p className="text-sm text-gray-500 mb-10">
        Share what you've built. Live demos, source code, and the story behind it.
      </p>

      {state?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
            disabled={pending}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {pending ? "Submitting..." : "Submit project"}
          </button>
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
