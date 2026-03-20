"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// ── Project schemas ──────────────────────────────────────

const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  tagline: z.string().min(5, "Tagline must be at least 5 characters").max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(["ai-agents", "web-apps", "tools", "design", "data-ml", "mobile"]),
  tech_stack: z.string().optional(), // comma-separated
  demo_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  source_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  build_time: z.string().max(50).optional(),
});

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

// ── Create project ──────────────────────────────────────

export async function createProject(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/submit");
  }

  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    category: formData.get("category"),
    tech_stack: formData.get("tech_stack"),
    demo_url: formData.get("demo_url"),
    source_url: formData.get("source_url"),
    build_time: formData.get("build_time"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const techStack = parsed.data.tech_stack
    ? parsed.data.tech_stack.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const gradients = [
    "linear-gradient(135deg, #111827 0%, #374151 100%)",
    "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
    "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    "linear-gradient(135deg, #171717 0%, #262626 100%)",
    "linear-gradient(135deg, #27272a 0%, #404040 100%)",
  ];

  const { error } = await supabase.from("projects").insert({
    builder_id: user.id,
    title: parsed.data.title,
    tagline: parsed.data.tagline,
    description: parsed.data.description || "",
    category: parsed.data.category,
    tech_stack: techStack,
    demo_url: parsed.data.demo_url || null,
    source_url: parsed.data.source_url || null,
    build_time: parsed.data.build_time || "",
    gradient: gradients[Math.floor(Math.random() * gradients.length)],
  });

  if (error) {
    return { error: "Failed to create project. Try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/discover");
  redirect("/dashboard");
}

// ── Update project ──────────────────────────────────────

export async function updateProject(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const projectId = formData.get("project_id") as string;
  if (!projectId) {
    return { error: "Missing project ID." };
  }

  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    category: formData.get("category"),
    tech_stack: formData.get("tech_stack"),
    demo_url: formData.get("demo_url"),
    source_url: formData.get("source_url"),
    build_time: formData.get("build_time"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const techStack = parsed.data.tech_stack
    ? parsed.data.tech_stack.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const { error } = await supabase
    .from("projects")
    .update({
      title: parsed.data.title,
      tagline: parsed.data.tagline,
      description: parsed.data.description || "",
      category: parsed.data.category,
      tech_stack: techStack,
      demo_url: parsed.data.demo_url || null,
      source_url: parsed.data.source_url || null,
      build_time: parsed.data.build_time || "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .eq("builder_id", user.id); // RLS double-check

  if (error) {
    return { error: "Failed to update project." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
  redirect("/dashboard");
}

// ── Delete project ──────────────────────────────────────

export async function deleteProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const projectId = formData.get("project_id") as string;
  if (!projectId) return;

  await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("builder_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/discover");
  redirect("/dashboard");
}

// ── Profile schemas ──────────────────────────────────────

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  bio: z.string().max(500).optional(),
  skills: z.string().optional(), // comma-separated
  github_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitter_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  website_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// ── Update profile ──────────────────────────────────────

export async function updateProfile(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/settings");
  }

  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    username: formData.get("username"),
    bio: formData.get("bio"),
    skills: formData.get("skills"),
    github_url: formData.get("github_url"),
    twitter_url: formData.get("twitter_url"),
    website_url: formData.get("website_url"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const skills = parsed.data.skills
    ? parsed.data.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Check username uniqueness
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", parsed.data.username)
    .neq("id", user.id)
    .single();

  if (existing) {
    return { fieldErrors: { username: ["This username is taken."] } };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      username: parsed.data.username,
      bio: parsed.data.bio || "",
      skills,
      github_url: parsed.data.github_url || null,
      twitter_url: parsed.data.twitter_url || null,
      website_url: parsed.data.website_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Failed to update profile." };
  }

  revalidatePath("/settings");
  revalidatePath(`/builders/${parsed.data.username}`);
  return { success: true };
}

// ── Delete account ──────────────────────────────────────

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Delete profile (cascades to projects, likes, etc.)
  await supabase.from("profiles").delete().eq("id", user.id);

  // Sign out
  await supabase.auth.signOut();
  redirect("/");
}

// ── Like/unlike project ─────────────────────────────────

export async function toggleLike(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const projectId = formData.get("project_id") as string;
  if (!projectId) return;

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("project_likes")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("project_id", projectId)
    .single();

  if (existingLike) {
    await supabase
      .from("project_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("project_id", projectId);
  } else {
    await supabase
      .from("project_likes")
      .insert({ user_id: user.id, project_id: projectId });
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/discover");
}
