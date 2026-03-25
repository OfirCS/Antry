import { createAdminClient } from "@/lib/supabase/server";
import type { DiscoveredProject } from "./types";

const gradients = [
  "linear-gradient(135deg, #111827 0%, #374151 100%)",
  "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
  "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
  "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  "linear-gradient(135deg, #171717 0%, #262626 100%)",
  "linear-gradient(135deg, #27272a 0%, #404040 100%)",
];

/**
 * Import an approved discovered_project into the main projects table.
 * Links the project to the claiming user's profile.
 */
export async function importDiscoveredProject(
  discovered: DiscoveredProject,
  claimedByUserId: string
): Promise<{ projectId: string | null; error: string | null }> {
  const adminClient = createAdminClient();

  // Create the project in the main projects table
  const { data: project, error: insertError } = await adminClient
    .from("projects")
    .insert({
      builder_id: claimedByUserId,
      title: discovered.title,
      tagline: discovered.tagline,
      description: discovered.description,
      category: discovered.category,
      tech_stack: discovered.tech_stack,
      demo_url: discovered.demo_url,
      source_url: discovered.repo_url,
      gradient: gradients[Math.floor(Math.random() * gradients.length)],
    })
    .select("id")
    .single();

  if (insertError || !project) {
    return { projectId: null, error: insertError?.message || "Insert failed" };
  }

  // Update the discovered project to link to the imported project
  await adminClient
    .from("discovered_projects")
    .update({
      status: "claimed",
      claimed_by: claimedByUserId,
      imported_project_id: project.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", discovered.id);

  return { projectId: project.id, error: null };
}
