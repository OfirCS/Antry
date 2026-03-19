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
        <p className="text-gray-400 text-sm">Project not found or you don't have permission to edit it.</p>
        <Link href="/dashboard" className="text-sm text-blue-600 mt-3 inline-block">
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

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit project</h1>
      <p className="text-sm text-gray-500 mb-10">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
            disabled={pending}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save changes"}
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
