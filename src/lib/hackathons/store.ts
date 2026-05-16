/**
 * Hackathon store — DB-first with in-memory fallback.
 * Same pattern as src/lib/mcp/store.ts.
 */

import { createAdminClient } from "@/lib/supabase/server";

export type HackathonRecord = {
  id: string;
  slug: string;
  name: string;
  vibe: "speedrun" | "build-night" | "weekend-mode" | "agent-cup";
  duration_hours: number;
  prize: string;
  brief_ids: string[];
  host_user_id: string | null;
  status: "draft" | "live" | "closed";
  created_at: string;
};

declare global {
  var __antryHackathons: Map<string, HackathonRecord> | undefined;
}
const memStore: Map<string, HackathonRecord> =
  globalThis.__antryHackathons ??
  (globalThis.__antryHackathons = new Map());

function dbAvailable(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("127.0.0.1")
  );
}

function uniqueSlug(base: string): string {
  // Append a short suffix when the base might collide (in DB mode the DB
  // unique constraint handles real collisions; this just keeps memory mode
  // tidy across rapid mints).
  const suffix = Math.random().toString(36).slice(2, 5);
  return `${base}-${suffix}`;
}

export async function createHackathon(input: {
  slug: string;
  name: string;
  vibe: HackathonRecord["vibe"];
  duration_hours: number;
  prize: string;
  brief_ids: string[];
  host_user_id: string | null;
}): Promise<HackathonRecord> {
  const now = new Date().toISOString();
  const record: HackathonRecord = {
    id: cryptoRandomId("hk"),
    slug: input.slug,
    name: input.name,
    vibe: input.vibe,
    duration_hours: input.duration_hours,
    prize: input.prize,
    brief_ids: input.brief_ids,
    host_user_id: input.host_user_id,
    status: "live",
    created_at: now,
  };

  if (!dbAvailable()) {
    // Memory mode: dedupe slug naively.
    if (Array.from(memStore.values()).some((h) => h.slug === record.slug)) {
      record.slug = uniqueSlug(record.slug);
    }
    memStore.set(record.slug, record);
    return record;
  }

  const sb = createAdminClient();
  let slug = record.slug;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await sb
      .from("hackathons")
      .insert({
        slug,
        name: record.name,
        vibe: record.vibe,
        duration_hours: record.duration_hours,
        prize: record.prize,
        brief_ids: record.brief_ids,
        host_user_id: record.host_user_id,
        status: "live",
      })
      .select("id, created_at")
      .single();

    if (data) {
      record.id = data.id;
      record.slug = slug;
      record.created_at = data.created_at;
      return record;
    }
    if (error?.code === "23505") {
      slug = uniqueSlug(record.slug);
      continue;
    }
    console.error("[hackathons/store] insert failed:", error);
    break;
  }

  // DB failed — fall through to memory so the user isn't blocked.
  memStore.set(record.slug, record);
  return record;
}

export async function getHackathonBySlug(
  slug: string
): Promise<HackathonRecord | null> {
  if (!dbAvailable()) {
    return memStore.get(slug) ?? null;
  }

  const sb = createAdminClient();
  const { data } = await sb
    .from("hackathons")
    .select(
      "id, slug, name, vibe, duration_hours, prize, brief_ids, host_user_id, status, created_at"
    )
    .eq("slug", slug)
    .single();
  if (!data) return memStore.get(slug) ?? null;
  return data as HackathonRecord;
}

function cryptoRandomId(prefix: string): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}_${hex}`;
}
