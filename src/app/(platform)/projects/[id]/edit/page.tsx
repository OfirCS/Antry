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

type EditableProject = {
  title?: string | null;
  tagline?: string | null;
  description?: string | null;
  category?: string | null;
  tech_stack?: string[] | null;
  demo_url?: string | null;
  source_url?: string | null;
  build_time?: string | null;
};

export default function EditProjectPage() {
  const { id } = useParams() as { id: string };
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<EditableProject | null>(null);
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
      <div className="max-w-[700px] mx-auto px-6 py-24">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-border-secondary rounded-lg w-48" />
          <div className="h-14 bg-border-secondary rounded-md w-full mt-10" />
          <div className="h-14 bg-border-secondary rounded-md w-full" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-[700px] mx-auto px-6 py-24 text-center">
        <p className="text-[15px] text-text-tertiary">Project not found or you do not have permission to edit it.</p>
        <Link href="/dashboard" className="text-[14px] font-bold text-accent mt-4 inline-block hover:underline">
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
      "w-full px-5 py-3.5 bg-background-secondary border border-border-primary shadow-sm rounded-md text-[14px] font-medium outline-none transition-all duration-300",
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
          Edit Project
        </h1>
        <p className="text-[16px] text-text-secondary leading-relaxed">
          Update the details, repository, and demo links for your shipped project.
        </p>
      </div>

      {state?.error && (
        <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-md text-[14px] font-medium text-red-500">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-8 card-premium p-8 sm:p-10">
        <input type="hidden" name="project_id" value={id} />

        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
            Project name *
          </label>
          <input
            type="text"
            name="title"
            defaultValue={project?.title || ""}
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
            defaultValue={project?.tagline || ""}
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
            defaultValue={project?.description || ""}
            className={cn(inputCls("description"), "resize-none")}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
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
          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
            Tech stack
          </label>
          <input
            type="text"
            name="tech_stack"
            defaultValue={project?.tech_stack?.join(", ") || ""}
            placeholder="Next.js, Python (comma-separated)"
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
              defaultValue={project?.demo_url || ""}
              className={inputCls("demo_url")}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
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
          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
            Build time
          </label>
          <input
            type="text"
            name="build_time"
            defaultValue={project?.build_time || ""}
            className={inputCls("build_time")}
          />
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center gap-4 border-t border-border-tertiary mt-8">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-4 bg-text-primary text-background-primary rounded-full text-[14px] font-bold hover:opacity-90 transition-all duration-300 ease-out disabled:opacity-50 shadow-md"
            disabled={pending}
          >
            {pending ? "Saving..." : "Save Changes"}
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
