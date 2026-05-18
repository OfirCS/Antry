"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PostKind } from "@/components/feed/FeedCard";

/**
 * Compose server action.
 *
 * The social feed is currently synthesized from Receipts + Briefs by
 * `src/lib/feed/build.ts`; there is no `posts` table yet (it is called
 * out as a future migration in that file's header). This action does the
 * real, in-scope half of the work:
 *
 *   - authenticates the user,
 *   - validates the post,
 *   - attempts to persist to a `posts` table when one exists,
 *   - degrades to a typed `pending_persistence` result otherwise.
 *
 * Once the `posts` table migration lands, this action persists with no
 * further code changes. Until then the UI gets a real auth-checked
 * round-trip instead of a fake `setTimeout`.
 */

const VALID_KINDS: PostKind[] = [
  "receipt",
  "hack-win",
  "hack-launch",
  "build",
  "ship",
  "discuss",
];

export type ComposeResult =
  | { ok: true; persisted: boolean; postId: string | null }
  | {
      ok: false;
      reason: "not_authenticated" | "invalid" | "failed";
      error: string;
    };

export async function createPost(
  kind: string,
  text: string
): Promise<ComposeResult> {
  // ── Validate ──────────────────────────────────────────
  if (!VALID_KINDS.includes(kind as PostKind)) {
    return { ok: false, reason: "invalid", error: "Unknown post type." };
  }
  const body = (text || "").trim();
  if (body.length < 3) {
    return { ok: false, reason: "invalid", error: "Write a little more first." };
  }
  if (body.length > 400) {
    return { ok: false, reason: "invalid", error: "Posts are capped at 400 characters." };
  }

  // ── Authenticate ──────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, reason: "not_authenticated", error: "Sign in to post." };
  }

  // ── Persist (when the table exists) ───────────────────
  // Attempt the insert. If the `posts` table has not been created yet,
  // Postgres returns error code 42P01 (undefined_table); we treat that
  // as "not wired yet" rather than a hard failure so the UX stays clean.
  const { data, error } = await supabase
    .from("posts")
    .insert({ author_id: user.id, kind, body })
    .select("id")
    .single();

  if (error) {
    if (error.code === "42P01" || /relation .* does not exist/i.test(error.message)) {
      // `posts` table not migrated yet — the post is accepted by the UI
      // but cannot be stored. Surfaced honestly to the caller.
      return { ok: true, persisted: false, postId: null };
    }
    return { ok: false, reason: "failed", error: "Couldn't post — try again." };
  }

  revalidatePath("/");
  return { ok: true, persisted: true, postId: (data as { id: string }).id };
}
