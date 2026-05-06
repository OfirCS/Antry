"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { buildBuilderCard, type BuilderCardPreview } from "@/lib/discovery/profile-card";

export type PreviewResult =
  | { ok: true; card: BuilderCardPreview }
  | { ok: false; error: string };

export async function previewBuilderCard(rawUsername: string): Promise<PreviewResult> {
  if (!rawUsername || rawUsername.trim().length < 1) {
    return { ok: false, error: "Enter a GitHub username." };
  }
  return buildBuilderCard(rawUsername);
}

const gradients = [
  "linear-gradient(135deg, #111827 0%, #374151 100%)",
  "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
  "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  "linear-gradient(135deg, #171717 0%, #262626 100%)",
  "linear-gradient(135deg, #27272a 0%, #404040 100%)",
];

export type ClaimCardResult =
  | { ok: true; profileUsername: string; createdProjects: number }
  | { ok: false; reason: "not_authenticated" | "username_taken" | "claim_failed"; error?: string };

/**
 * Claim a builder card: import top scored projects from a GitHub user
 * into the logged-in user's Antry profile. Caller must already be authenticated.
 *
 * No external verification of GitHub ownership — the user is asserting
 * that the projects are theirs. Future: verify via OAuth identity match.
 */
export async function claimBuilderCard(
  rawUsername: string
): Promise<ClaimCardResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "not_authenticated" };

  const result = await buildBuilderCard(rawUsername);
  if (!result.ok) return { ok: false, reason: "claim_failed", error: result.error };
  const card = result.card;

  const admin = createAdminClient();

  // Ensure a profile row exists. If not, bootstrap one with the GitHub data.
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .single();

  if (!existingProfile) {
    // Find a non-conflicting username. Try card.username, then suffixed variants.
    const candidates = [
      card.username,
      `${card.username}-antry`,
      `${card.username}-${Math.floor(Math.random() * 1000)}`,
    ];
    let chosenUsername: string | null = null;
    for (const candidate of candidates) {
      const { data: clash } = await admin
        .from("profiles")
        .select("id")
        .eq("username", candidate)
        .maybeSingle();
      if (!clash) {
        chosenUsername = candidate;
        break;
      }
    }
    if (!chosenUsername) {
      return { ok: false, reason: "username_taken" };
    }
    const { error: insertProfileError } = await admin.from("profiles").insert({
      id: user.id,
      username: chosenUsername,
      full_name: card.name,
      bio: card.bio || "",
      avatar_url: card.avatar_url,
      skills: card.inferred_skills,
      github_url: `https://github.com/${card.username}`,
      twitter_url: card.twitter_handle ? `https://x.com/${card.twitter_handle}` : null,
      website_url: card.blog || null,
    });
    if (insertProfileError) {
      return { ok: false, reason: "claim_failed", error: insertProfileError.message };
    }
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { ok: false, reason: "claim_failed", error: "Profile not found after creation." };
  }

  // Skip projects already imported under this user (by source_url match).
  const sourceUrls = card.projects.map((p) => p.repo_url);
  const { data: existing } = await admin
    .from("projects")
    .select("source_url")
    .eq("builder_id", user.id)
    .in("source_url", sourceUrls);
  const alreadyImported = new Set((existing || []).map((p) => p.source_url));

  const inserts = card.projects
    .filter((p) => !alreadyImported.has(p.repo_url))
    .map((p, i) => ({
      builder_id: user.id,
      title: p.title,
      tagline: p.tagline || `Built by ${card.name}`,
      description: p.description || "",
      category: p.category,
      tech_stack: p.tech_stack,
      demo_url: p.demo_url,
      source_url: p.repo_url,
      gradient: gradients[i % gradients.length],
      build_time: "",
    }));

  let createdProjects = 0;
  if (inserts.length > 0) {
    const { error: insertError, count } = await admin
      .from("projects")
      .insert(inserts, { count: "exact" });
    if (insertError) {
      return { ok: false, reason: "claim_failed", error: insertError.message };
    }
    createdProjects = count ?? inserts.length;
  }

  revalidatePath(`/builders/${profile.username}`);
  revalidatePath("/discover");
  revalidatePath("/dashboard");

  return { ok: true, profileUsername: profile.username, createdProjects };
}
