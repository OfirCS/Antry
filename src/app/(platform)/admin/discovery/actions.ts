"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/discovery/admin";
import { runGitHubScan } from "@/lib/discovery/github-scanner";
import { scoreRepo } from "@/lib/discovery/scorer";
import { parseGitHubUrl, extractGitHubUrls } from "@/lib/discovery/twitter-parser";
import { importDiscoveredProject } from "@/lib/discovery/importer";
import type { DiscoveredProject, ScanResult } from "@/lib/discovery/types";

async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.id)) {
    throw new Error("Unauthorized");
  }
  return user.id;
}

// ── Trigger scan ─────────────────────────────────────────

export async function triggerScan(): Promise<ScanResult> {
  await requireAdmin();
  return runGitHubScan();
}

// ── Approve project ──────────────────────────────────────

export async function approveProject(projectId: string) {
  const userId = await requireAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("discovered_projects")
    .update({
      status: "approved",
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/discovery");
}

// ── Reject project ───────────────────────────────────────

export async function rejectProject(projectId: string) {
  const userId = await requireAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("discovered_projects")
    .update({
      status: "rejected",
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/discovery");
}

// ── Generate claim link ──────────────────────────────────

export async function generateClaimToken(
  projectId: string
): Promise<string> {
  await requireAdmin();
  const adminClient = createAdminClient();

  const token = crypto.randomUUID();

  const { error } = await adminClient
    .from("discovered_projects")
    .update({
      claim_token: token,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${siteUrl}/claim/${token}`;
}

// ── Import from URL ──────────────────────────────────────

export async function importFromUrl(
  url: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  // Extract GitHub URL (direct or from tweet text)
  let repoUrl = url;
  const ghUrls = extractGitHubUrls(url);
  if (ghUrls.length > 0) {
    repoUrl = ghUrls[0];
  }

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return { success: false, error: "Could not parse a GitHub repo URL" };
  }

  // Check if already discovered
  const adminClient = createAdminClient();
  const { data: existing } = await adminClient
    .from("discovered_projects")
    .select("id")
    .eq("source_url", repoUrl)
    .single();

  if (existing) {
    return { success: false, error: "This repo has already been discovered" };
  }

  // Fetch repo details from GitHub
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const repoRes = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
    { headers }
  );
  if (!repoRes.ok) {
    return { success: false, error: "Could not fetch repo from GitHub" };
  }
  const repo = await repoRes.json();

  // Fetch README
  let readme = "";
  try {
    const readmeRes = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/readme`,
      { headers }
    );
    if (readmeRes.ok) {
      const readmeData = await readmeRes.json();
      readme = Buffer.from(readmeData.content, "base64")
        .toString("utf-8")
        .slice(0, 500);
    }
  } catch {
    // README fetch failed, continue without it
  }

  // Fetch languages
  let languages: string[] = [];
  try {
    const langRes = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/languages`,
      { headers }
    );
    if (langRes.ok) {
      languages = Object.keys(await langRes.json());
    }
  } catch {
    // Languages fetch failed, continue
  }

  const { score, breakdown } = scoreRepo(repo, readme, languages);

  const techStack =
    languages.length > 0
      ? languages
      : repo.language
        ? [repo.language]
        : [];

  const { error } = await adminClient.from("discovered_projects").insert({
    source: url.includes("twitter.com") || url.includes("x.com") ? "twitter" : "manual",
    source_url: repoUrl,
    title: repo.name
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase()),
    tagline: (repo.description || "").slice(0, 200),
    description: readme,
    category: "web-apps",
    tech_stack: techStack,
    demo_url: repo.homepage || null,
    repo_url: repo.html_url,
    github_stars: repo.stargazers_count,
    github_language: repo.language,
    github_owner_login: repo.owner.login,
    github_last_pushed_at: repo.pushed_at,
    github_repo_size_kb: repo.size,
    quality_score: score,
    score_breakdown: breakdown,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/discovery");
  return { success: true };
}

// ── Claim project (called from claim page) ───────────────

export async function claimProject(
  token: string
): Promise<{ success: boolean; error?: string; projectId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to claim a project" };
  }

  const adminClient = createAdminClient();

  // Find the discovered project by claim token
  const { data: discovered, error: fetchError } = await adminClient
    .from("discovered_projects")
    .select("*")
    .eq("claim_token", token)
    .single();

  if (fetchError || !discovered) {
    return { success: false, error: "Invalid or expired claim link" };
  }

  if (discovered.status === "claimed") {
    return { success: false, error: "This project has already been claimed" };
  }

  if (discovered.status !== "approved") {
    return { success: false, error: "This project has not been approved yet" };
  }

  // Import into projects table
  const { projectId, error: importError } = await importDiscoveredProject(
    discovered as DiscoveredProject,
    user.id
  );

  if (importError || !projectId) {
    return { success: false, error: importError || "Failed to import project" };
  }

  revalidatePath("/discover");
  revalidatePath("/dashboard");
  return { success: true, projectId };
}
