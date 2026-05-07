/**
 * Antry-domain queries.
 *
 * The OLD `queries.ts` references a stale schema (profiles/projects/
 * hackathons/blog_posts) from a previous incarnation of the project.
 * Migrations 004-007 dropped that domain in favor of the actual Antry
 * domain: companies, briefs, brief_attempts, gateway_calls, receipts,
 * api_keys. Migration 008 adds marketing tables (landing_stats,
 * testimonials, methodology_blocks).
 *
 * This module is the canonical query layer. New pages should import
 * from here; the old queries.ts is kept temporarily so unmigrated pages
 * (companies, projects, builders, blog, discover, hackathons) keep
 * compiling. Each of those pages is on the migration list — see
 * SETUP.md "Page migration backlog."
 */

import { createClient } from "./server";
import type {
  Brief,
  Receipt,
  Fingerprint,
} from "@/lib/receipts/types";

// ── Briefs ─────────────────────────────────────────────

export type BriefListOptions = {
  search?: string;
  category?: string;
  difficulty?: string;
  status?: "live" | "closed" | "draft";
  limit?: number;
};

/** List public Briefs. Empty array if Supabase isn't configured. */
export async function getBriefs(options?: BriefListOptions): Promise<Brief[]> {
  const supabase = await createClient();
  let q = supabase
    .from("briefs")
    .select("*, companies!inner(id, slug, name, logo_url, sponsor_color)")
    .eq("mode", "public")
    .in("status", ["live", "closed"])
    .order("created_at", { ascending: false });

  if (options?.search)
    q = q.or(
      `title.ilike.%${options.search}%,tagline.ilike.%${options.search}%`
    );
  if (options?.category && options.category !== "all")
    q = q.eq("category", options.category);
  if (options?.difficulty && options.difficulty !== "all")
    q = q.eq("difficulty", options.difficulty);
  if (options?.status) q = q.eq("status", options.status);
  if (options?.limit) q = q.limit(options.limit);

  const { data, error } = await q;
  if (error || !data) return [];
  return data.map(rowToBrief);
}

export async function getBrief(slug: string): Promise<Brief | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("briefs")
    .select("*, companies!inner(id, slug, name, logo_url, sponsor_color)")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return rowToBrief(data);
}

type BriefRow = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  prompt_md: string;
  difficulty: string;
  category: string;
  token_cap: number;
  time_cap_seconds: number;
  status: string;
  mode: string;
  sponsor_label: string;
  attempts_count: number;
  receipts_count: number;
  median_score: number | null;
  created_at: string;
  closed_at: string | null;
  allowed_tools: string[];
  rubric_json: Record<string, unknown>;
  ideal_fingerprint: Fingerprint | null;
  companies: {
    id: string;
    slug: string;
    name: string;
    logo_url: string | null;
    sponsor_color: string;
  };
};

function rowToBrief(row: BriefRow): Brief {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    prompt_md: row.prompt_md,
    difficulty: row.difficulty as Brief["difficulty"],
    category: row.category,
    token_cap: row.token_cap,
    time_cap_seconds: row.time_cap_seconds,
    status: row.status as Brief["status"],
    mode: row.mode as Brief["mode"],
    sponsor_label: row.sponsor_label,
    attempts_count: row.attempts_count,
    receipts_count: row.receipts_count,
    median_score: row.median_score,
    created_at: row.created_at,
    closed_at: row.closed_at,
    company: {
      id: row.companies.id,
      slug: row.companies.slug,
      name: row.companies.name,
      logo_url: row.companies.logo_url,
      sponsor_color: row.companies.sponsor_color,
    },
    ideal_fingerprint: row.ideal_fingerprint ?? undefined,
    allowed_tools: row.allowed_tools ?? [],
    rubric_json: row.rubric_json ?? {},
  };
}

// ── Receipts ───────────────────────────────────────────

export type ReceiptListOptions = {
  builderId?: string;
  briefId?: string;
  minScore?: number;
  limit?: number;
};

export async function getReceipts(
  options?: ReceiptListOptions
): Promise<Receipt[]> {
  const supabase = await createClient();
  let q = supabase
    .from("receipts")
    .select(
      `
      *,
      profiles!inner(username, full_name, gradient, avatar_url),
      briefs!inner(slug, title, company_id, companies!inner(slug, name, logo_url, sponsor_color))
    `
    )
    .eq("display_visibility", "public")
    .order("composite_score", { ascending: false });

  if (options?.builderId) q = q.eq("builder_id", options.builderId);
  if (options?.briefId) q = q.eq("brief_id", options.briefId);
  if (options?.minScore) q = q.gte("composite_score", options.minScore);
  if (options?.limit) q = q.limit(options.limit);

  const { data, error } = await q;
  if (error || !data) return [];
  return data.map(rowToReceipt);
}

export async function getReceipt(id: string): Promise<Receipt | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("receipts")
    .select(
      `
      *,
      profiles!inner(username, full_name, gradient, avatar_url),
      briefs!inner(slug, title, company_id, companies!inner(slug, name, logo_url, sponsor_color))
    `
    )
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return rowToReceipt(data);
}

type ReceiptRow = {
  id: string;
  brief_id: string;
  builder_id: string;
  attempt_id: string;
  fingerprint: Fingerprint;
  composite_score: number;
  trace_visibility: string;
  display_visibility: string;
  signature: string;
  content_hash: string;
  signed_at: string;
  profiles: {
    username: string;
    full_name: string;
    gradient: string;
    avatar_url: string | null;
  };
  briefs: {
    slug: string;
    title: string;
    company_id: string;
    companies: {
      slug: string;
      name: string;
      logo_url: string | null;
      sponsor_color: string;
    };
  };
};

function rowToReceipt(row: ReceiptRow): Receipt {
  return {
    id: row.id,
    brief_id: row.brief_id,
    brief_slug: row.briefs.slug,
    brief_title: row.briefs.title,
    builder: {
      username: row.profiles.username,
      name: row.profiles.full_name,
      gradient: row.profiles.gradient,
      avatar_url: row.profiles.avatar_url,
    },
    company: {
      slug: row.briefs.companies.slug,
      name: row.briefs.companies.name,
      logo_url: row.briefs.companies.logo_url,
      sponsor_color: row.briefs.companies.sponsor_color,
    },
    fingerprint: row.fingerprint,
    composite_score: row.composite_score,
    trace_visibility: row.trace_visibility as Receipt["trace_visibility"],
    display_visibility: row.display_visibility as Receipt["display_visibility"],
    signature: row.signature,
    content_hash: row.content_hash,
    signed_at: row.signed_at,
    tokens_spent: 0,
    cost_usd_cents: 0,
    attempt_duration_seconds: 0,
    highlights: [],
  };
}

// ── Builders (profiles) ────────────────────────────────

export type BuilderProfile = {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  gradient: string;
  github_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  receipts_count: number;
  median_composite: number | null;
};

export async function getBuilderByUsername(
  username: string
): Promise<BuilderProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
  if (error || !data) return null;

  const { data: receipts } = await supabase
    .from("receipts")
    .select("composite_score")
    .eq("builder_id", data.id)
    .eq("display_visibility", "public");

  const median =
    receipts && receipts.length
      ? Math.round(
          receipts
            .map((r) => r.composite_score)
            .sort((a, b) => a - b)[Math.floor(receipts.length / 2)]
        )
      : null;

  return {
    id: data.id,
    username: data.username,
    name: data.full_name,
    bio: data.bio ?? "",
    avatar_url: data.avatar_url,
    gradient: data.gradient ?? "",
    github_url: data.github_url,
    twitter_url: data.twitter_url,
    website_url: data.website_url,
    receipts_count: receipts?.length ?? 0,
    median_composite: median,
  };
}

// ── Marketing content ──────────────────────────────────

export type LandingStat = {
  key: string;
  value: string;
  label: string;
  sort_order: number;
};

export async function getLandingStats(): Promise<LandingStat[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("landing_stats")
    .select("key, value, label, sort_order")
    .eq("is_visible", true)
    .order("sort_order");
  if (error || !data) return [];
  return data;
}

export type Testimonial = {
  id: string;
  quote: string;
  author_name: string;
  author_role: string;
  author_company: string;
  gradient: string;
  surface: string;
  sort_order: number;
};

export async function getTestimonials(
  surface = "landing"
): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(
      "id, quote, author_name, author_role, author_company, gradient, surface, sort_order"
    )
    .eq("is_visible", true)
    .eq("surface", surface)
    .order("sort_order");
  if (error || !data) return [];
  return data;
}

export type MethodologyBlock = {
  id: string;
  slug: string;
  surface: string;
  eyebrow: string;
  title: string;
  body_md: string;
  sort_order: number;
};

export async function getMethodologyBlocks(
  surface = "methodology"
): Promise<MethodologyBlock[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("methodology_blocks")
    .select("id, slug, surface, eyebrow, title, body_md, sort_order")
    .eq("is_visible", true)
    .eq("surface", surface)
    .order("sort_order");
  if (error || !data) return [];
  return data;
}

// ── API key resolution (used by the MCP gateway) ──────

export type ResolvedApiKey = {
  id: string;
  builder_id: string | null;
  company_id: string | null;
  scope_kind: string;
};

/**
 * Resolve a raw `ant_<id>_<secret>` token to its api_keys row.
 * v0 implementation: looks up by ID prefix, no HMAC compare yet.
 * v0.2 will use the `keyHmac()` helper from src/lib/api-keys.
 */
export async function resolveApiKey(
  token: string
): Promise<ResolvedApiKey | null> {
  const m = /^ant_([A-Za-z0-9_-]{4,})/.exec(token);
  if (!m) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, owner_builder_id, owner_company_id, scope_kind")
    .eq("id", m[1].slice(0, 16))
    .is("revoked_at", null)
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    builder_id: data.owner_builder_id,
    company_id: data.owner_company_id,
    scope_kind: data.scope_kind,
  };
}
