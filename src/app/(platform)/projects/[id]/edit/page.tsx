"use client";

import { useActionState, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/client";
import { updateProject, type FormState } from "../../../actions";

const categories = [
  { value: "ai-agents", label: "AI Agents" },
  { value: "web-apps", label: "Web Apps" },
  { value: "tools", label: "Tools" },
  { value: "design", label: "Design" },
  { value: "data-ml", label: "Data / ML" },
  { value: "mobile", label: "Mobile" },
];

export default function EditProjectPage() {
  const { id } = useParams() as { id: string };
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateProject,
    null
  );

  useEffect(() => {
    if (!user) return;

    const fetchProject = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("builder_id", user.id)
        .single();

      if (!data) {
        setNotFound(true);
      } else {
        setProject(data);
      }
      setLoading(false);
    };

    fetchProject();
  }, [user, id]);

  if (authLoading || loading) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-48" />
          <div className="h-12 bg-gray-100 rounded w-full mt-8" />
          <div className="h-12 bg-gray-100 rounded w-full" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-20 text-center">
        <p className="text-[14px] text-text-tertiary">Project not found or you don't have permission to edit it.</p>
        <Link href="/dashboard" className="text-[13px] text-accent mt-3 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const hasFieldError = (field: string) =>
    (state?.fieldErrors?.[field]?.length ?? 0) > 0;

  const fieldError = (field: string) =>
    state?.fieldErrors?.[field]?.[0];

  const inputCls = (field: string) =>
    cn(
      "w-full px-5 py-3.5 bg-background-secondary border border-black/5 dark:border-white/5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] rounded-2xl text-[14px] font-medium outline-none transition-all duration-300",
      hasFieldError(field)
        ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
        : "focus:border-accent/40 focus:ring-2 focus:ring-accent/20 text-text-primary placeholder:text-text-tertiary"
    );

  return (
    <div className="max-w-[600px] mx-auto px-6 py-10 md:py-16">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-primary transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      <h1 className="font-display text-[28px] text-text-primary mb-2 tracking-[-0.02em]">Edit project</h1>
      <p className="text-[14px] text-text-secondary mb-10">
        Update your project details.
      </p>

      {state?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="project_id" value={id} />

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Project name *
          </label>
          <input
            type="text"
            name="title"
            defaultValue={project?.title || ""}
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
            defaultValue={project?.tagline || ""}
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
            defaultValue={project?.description || ""}
            className={cn(inputCls("description"), "resize-none")}
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Category *
          </label>
          <select
            name="category"
            defaultValue={project?.category || ""}
            className={cn(inputCls("category"), "appearance-none cursor-pointer")}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Tech stack
          </label>
          <input
            type="text"
            name="tech_stack"
            defaultValue={project?.tech_stack?.join(", ") || ""}
            placeholder="Comma-separated"
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
              defaultValue={project?.demo_url || ""}
              className={inputCls("demo_url")}
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
              Source code URL
            </label>
            <input
              type="url"
              name="source_url"
              defaultValue={project?.source_url || ""}
              className={inputCls("source_url")}
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Build time
          </label>
          <input
            type="text"
            name="build_time"
            defaultValue={project?.build_time || ""}
            className={inputCls("build_time")}
          />
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button
            type="submit"
            className="px-6 py-3.5 bg-accent text-white rounded-full text-[14px] font-semibold hover:shadow-[0_4px_14px_0_rgba(232,89,12,0.2)] dark:hover:shadow-[0_4px_14px_0_rgba(249,115,22,0.2)] hover:opacity-90 transition-all duration-300 ease-out disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save changes"}
          </button>
          <Link
            href="/dashboard"
            className="text-[14px] text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
