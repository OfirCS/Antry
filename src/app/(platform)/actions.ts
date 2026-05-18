"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { projectSchema, profileSchema } from "@/lib/schemas";
import {
  sendEmail,
  welcomeEmailHtml,
  welcomeEmailText,
  sendAccountWelcomeEmail,
} from "@/lib/email/resend";

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

  // Fully remove the auth user using admin privileges
  const adminClient = createAdminClient();
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

  if (deleteError) {
    throw new Error("Failed to delete account. Please try again.");
  }

  // Sign out and redirect
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

// ── Join waitlist ───────────────────────────────────────

export async function joinWaitlist(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("waitlist").insert({ email });

  let isNewSignup = true;
  if (error) {
    if (error.code === "23505") {
      // unique_violation — already on waitlist; don't re-send the welcome.
      isNewSignup = false;
    } else {
      return { error: "Something went wrong. Please try again." };
    }
  }

  // Fire-and-forget welcome email. Inert without RESEND_API_KEY,
  // never blocks the user even on transient send failure.
  if (isNewSignup) {
    void sendEmail({
      to: email,
      subject: "Welcome to Antry — what are you building?",
      html: welcomeEmailHtml(),
      text: welcomeEmailText(),
      tags: [{ name: "category", value: "waitlist_welcome" }],
    }).catch(() => {
      // Swallow — signup succeeded; email is best-effort.
    });
  }

  return { success: true };
}

// ── New-user welcome email ──────────────────────────────

/**
 * Send the account-welcome email to the currently logged-in user, exactly
 * once. Idempotent: it stamps `welcome_email_sent_at` into the auth user's
 * metadata so repeat calls (e.g. on every dashboard load) are no-ops.
 *
 * Wire this from a first-session entry point (the auth callback or the
 * onboarding flow). Safe to call unconditionally — it self-gates, never
 * throws, and is inert without RESEND_API_KEY.
 */
export async function welcomeNewUser(): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return;

    // Already welcomed — nothing to do.
    if (user.user_metadata?.welcome_email_sent_at) return;

    const name =
      (user.user_metadata?.full_name as string | undefined) ||
      user.email.split("@")[0];

    await sendAccountWelcomeEmail(user.email, name);

    // Stamp so we never send twice. Best-effort; if this fails the worst
    // case is a duplicate email on the next call.
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        welcome_email_sent_at: new Date().toISOString(),
      },
    });
  } catch {
    // Best-effort — never block the caller.
  }
}

// ── Join hackathon ──────────────────────────────────────

export async function joinHackathon(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const hackathonId = formData.get("hackathon_id") as string;
  if (!hackathonId) return;

  // Check if already joined
  const { data: existing } = await supabase
    .from("hackathon_participants")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("hackathon_id", hackathonId)
    .single();

  if (existing) return; // Already joined

  await supabase.from("hackathon_participants").insert({
    user_id: user.id,
    hackathon_id: hackathonId,
  });

  revalidatePath(`/hackathons/${hackathonId}`);
}

// ── Leave hackathon ─────────────────────────────────────

export async function leaveHackathon(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const hackathonId = formData.get("hackathon_id") as string;
  if (!hackathonId) return;

  await supabase
    .from("hackathon_participants")
    .delete()
    .eq("user_id", user.id)
    .eq("hackathon_id", hackathonId);

  revalidatePath(`/hackathons/${hackathonId}`);
}

// ── Submit project to hackathon ─────────────────────────

export async function submitToHackathon(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const hackathonId = formData.get("hackathon_id") as string;
  const projectId = formData.get("project_id") as string;

  if (!hackathonId || !projectId) {
    return { error: "Missing hackathon or project." };
  }

  // Verify user is a participant
  const { data: participation } = await supabase
    .from("hackathon_participants")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("hackathon_id", hackathonId)
    .single();

  if (!participation) {
    return { error: "You must join the hackathon before submitting." };
  }

  // Verify project belongs to user
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("builder_id", user.id)
    .single();

  if (!project) {
    return { error: "You can only submit your own projects." };
  }

  // Check for duplicate submission
  const { data: existingSub } = await supabase
    .from("hackathon_submissions")
    .select("id")
    .eq("hackathon_id", hackathonId)
    .eq("project_id", projectId)
    .single();

  if (existingSub) {
    return { error: "This project has already been submitted." };
  }

  const { error } = await supabase.from("hackathon_submissions").insert({
    hackathon_id: hackathonId,
    project_id: projectId,
    submitted_by: user.id,
  });

  if (error) {
    return { error: "Failed to submit project. Try again." };
  }

  revalidatePath(`/hackathons/${hackathonId}`);
  return { success: true };
}
