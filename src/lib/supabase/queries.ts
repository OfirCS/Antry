/**
 * @deprecated This module references a stale schema (profiles/projects/
 * hackathons/blog_posts) from a previous incarnation of the app. The
 * canonical schema is the Antry domain (briefs/receipts/builders);
 * use `src/lib/supabase/antry.ts` for new code.
 *
 * Kept temporarily so 10 unmigrated pages keep compiling. When all of
 *   /companies, /projects/[id], /builders, /builders/[username],
 *   /blog, /discover, /hackathons, /hackathons/[id], /sitemap
 * are migrated to the new query module, delete this file.
 *
 * Returns empty arrays in production — the underlying tables no longer
 * exist after migrations 004-007.
 */

import { createClient } from "./server";

// When Supabase isn't configured (e.g. the static GitHub Pages export or
// local dev without env), short-circuit before touching `cookies()` so
// these pages render statically against their mock-data fallback.
function hasSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// ── Types ──────────────────────────────────────────────

export interface BuilderRow {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string | null;
  gradient: string;
  skills: string[];
  github_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  created_at: string;
  project_count?: number;
  total_likes?: number;
}

export interface ProjectRow {
  id: string;
  builder_id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  tech_stack: string[];
  demo_url: string | null;
  source_url: string | null;
  gradient: string;
  build_time: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    full_name: string;
    gradient: string;
  };
}

export interface HackathonRow {
  id: string;
  title: string;
  theme: string;
  description: string;
  status: "active" | "upcoming" | "completed";
  start_date: string;
  end_date: string;
  prizes: { place: string; reward: string }[];
  sponsors: string[];
  participant_count: number;
  submission_count: number;
  created_at: string;
}

export interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

// ── Builders ───────────────────────────────────────────

/**
 * Get all builders with project counts and total likes.
 */
export async function getBuilders(options?: {
  search?: string;
  skill?: string;
}): Promise<BuilderRow[]> {
  if (!hasSupabase()) return [];
  const supabase = await createClient();

  // Fetch profiles
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: true });

  if (options?.search) {
    query = query.or(
      `full_name.ilike.%${options.search}%,username.ilike.%${options.search}%,bio.ilike.%${options.search}%`
    );
  }

  if (options?.skill) {
    query = query.contains("skills", [options.skill]);
  }

  const { data: profiles, error } = await query;

  if (error || !profiles) {
    console.error("Error fetching builders:", error);
    return [];
  }

  // Fetch project counts and total likes per builder
  const { data: projects } = await supabase
    .from("projects")
    .select("builder_id, likes_count");

  const projectStats = new Map<
    string,
    { count: number; totalLikes: number }
  >();

  if (projects) {
    for (const p of projects) {
      const existing = projectStats.get(p.builder_id) || {
        count: 0,
        totalLikes: 0,
      };
      existing.count += 1;
      existing.totalLikes += p.likes_count || 0;
      projectStats.set(p.builder_id, existing);
    }
  }

  return profiles.map((profile) => {
    const stats = projectStats.get(profile.id) || {
      count: 0,
      totalLikes: 0,
    };
    return {
      ...profile,
      project_count: stats.count,
      total_likes: stats.totalLikes,
    };
  });
}

/**
 * Get single builder by username with their projects and hackathon participations.
 */
export async function getBuilder(username: string) {
  if (!hasSupabase()) return null;
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    return null;
  }

  // Get builder's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("builder_id", profile.id)
    .order("created_at", { ascending: false });

  // Get hackathon participations
  const { data: participations } = await supabase
    .from("hackathon_participants")
    .select("hackathon_id")
    .eq("user_id", profile.id);

  let hackathons: HackathonRow[] = [];
  if (participations && participations.length > 0) {
    const hackathonIds = participations.map((p) => p.hackathon_id);
    const { data: hacks } = await supabase
      .from("hackathons")
      .select("*")
      .in("id", hackathonIds);
    hackathons = (hacks || []) as HackathonRow[];
  }

  return {
    profile: profile as BuilderRow,
    projects: (projects || []) as ProjectRow[],
    hackathons,
  };
}

// ── Projects ───────────────────────────────────────────

/**
 * Get projects with builder info.
 */
export async function getProjects(options?: {
  category?: string;
  search?: string;
}): Promise<ProjectRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select("*, profiles(username, full_name, gradient)")
    .order("created_at", { ascending: false });

  if (options?.category && options.category !== "all") {
    query = query.eq("category", options.category);
  }

  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,tagline.ilike.%${options.search}%`
    );
  }

  const { data, error } = await query;

  if (error || !data) {
    // Silently fall back to mock data - Supabase may not have projects table yet
    return [];
  }

  return data.map((row) => ({
    ...row,
    profiles: row.profiles ?? undefined,
  })) as ProjectRow[];
}

/**
 * Get single project with builder info.
 */
export async function getProject(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*, profiles(username, full_name, gradient)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as ProjectRow;
}

// ── Hackathons ─────────────────────────────────────────

/**
 * Get all hackathons.
 */
export async function getHackathons(options?: {
  status?: string;
  search?: string;
}): Promise<HackathonRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("hackathons")
    .select("*")
    .order("start_date", { ascending: false });

  if (options?.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }

  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,theme.ilike.%${options.search}%`
    );
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching hackathons:", error);
    return [];
  }

  return data as HackathonRow[];
}

/**
 * Get single hackathon with submissions and participants.
 */
export async function getHackathon(id: string) {
  const supabase = await createClient();

  const { data: hackathon, error } = await supabase
    .from("hackathons")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !hackathon) {
    return null;
  }

  // Get submissions with project and builder info
  const { data: submissions } = await supabase
    .from("hackathon_submissions")
    .select(
      "*, projects(*, profiles(username, full_name, gradient))"
    )
    .eq("hackathon_id", id);

  // Get participants
  const { data: participants } = await supabase
    .from("hackathon_participants")
    .select("*, profiles(*)")
    .eq("hackathon_id", id);

  return {
    hackathon: hackathon as HackathonRow,
    submissions: submissions || [],
    participants: participants || [],
  };
}

// ── Platform Stats ─────────────────────────────────────

/**
 * Get platform stats (counts).
 */
export async function getPlatformStats() {
  const supabase = await createClient();

  const [buildersResult, projectsResult, hackathonsResult] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("likes_count"),
    supabase.from("hackathons").select("id", { count: "exact", head: true }),
  ]);

  const builderCount = buildersResult.count || 0;
  const projectCount = projectsResult.data?.length || 0;
  const hackathonCount = hackathonsResult.count || 0;
  const totalLikes =
    projectsResult.data?.reduce((sum, p) => sum + (p.likes_count || 0), 0) || 0;

  return {
    builderCount,
    projectCount,
    hackathonCount,
    totalLikes,
  };
}

// ── Blog ───────────────────────────────────────────────

/**
 * Get published blog posts.
 */
export async function getBlogPosts(): Promise<BlogPostRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching blog posts:", error);
    return [];
  }

  return data as BlogPostRow[];
}

/**
 * Get single blog post by slug.
 */
export async function getBlogPost(slug: string): Promise<BlogPostRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as BlogPostRow;
}
