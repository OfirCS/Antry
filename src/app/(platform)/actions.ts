"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/schemas";

/**
 * Settings-related server actions. The legacy project/submit actions
 * were removed in the social-feed pivot. Only profile management and
 * account deletion remain here.
 */

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

export async function updateProfile(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated." };
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

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: parsed.data.full_name,
        username: parsed.data.username,
        bio: parsed.data.bio ?? "",
        skills: (parsed.data.skills ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        github_url: parsed.data.github_url ?? null,
        twitter_url: parsed.data.twitter_url ?? null,
        website_url: parsed.data.website_url ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Delete the auth user with the admin client; cascades to profiles.
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(user.id);
  await supabase.auth.signOut();
  redirect("/");
}
