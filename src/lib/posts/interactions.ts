/**
 * Post interactions store — likes + comments.
 *
 * DB-first with in-memory fallback (matches `src/lib/posts/store.ts` and
 * `src/lib/mcp/store.ts`). Identity is unified across authed and anonymous
 * paths so the API surface is identical in both modes.
 *
 *   Authed → userId = auth.uid(),       anonId = null
 *   Anon   → userId = null,             anonId = cookie("antry_anon_id")
 *
 * Uniqueness for likes is enforced on (postId, userId-or-anonId). Comments
 * carry both an anon handle ("@anon-42") and the underlying anon id so we
 * can render an author label without leaking the cookie value.
 */

import { createAdminClient } from "@/lib/supabase/server";

export type Identity = {
  userId: string | null;
  anonId: string | null;
};

export type LikeState = {
  liked: boolean;
  total: number;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string | null;
  authorAnonName: string | null;
  authorAnonId: string | null;
  text: string;
  createdAt: string;
};

// ── In-memory fallback (pinned to globalThis to survive HMR) ──
declare global {
  // eslint-disable-next-line no-var
  var __antryPostLikes:
    | Map<string, { postId: string; key: string; createdAt: number }>
    | undefined;
  // eslint-disable-next-line no-var
  var __antryPostComments: Map<string, Comment> | undefined;
  // eslint-disable-next-line no-var
  var __antryPostCountFallback:
    | Map<string, { likes: number; comments: number }>
    | undefined;
}
const likesMem =
  globalThis.__antryPostLikes ??
  (globalThis.__antryPostLikes = new Map());
const commentsMem =
  globalThis.__antryPostComments ??
  (globalThis.__antryPostComments = new Map());
const countsMem =
  globalThis.__antryPostCountFallback ??
  (globalThis.__antryPostCountFallback = new Map());

function dbAvailable(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("127.0.0.1")
  );
}

function identityKey(id: Identity): string {
  // Stable string key for the in-memory unique constraint. Prefer the userId
  // so anon → authed migrations don't double-count the same person.
  return id.userId ? `u:${id.userId}` : `a:${id.anonId ?? ""}`;
}

function randomId(prefix: string): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}_${hex}`;
}

function ensureCounts(postId: string) {
  if (!countsMem.has(postId)) {
    countsMem.set(postId, { likes: 0, comments: 0 });
  }
  return countsMem.get(postId)!;
}

// ── Likes ──────────────────────────────────────────────

export async function toggleLike(input: {
  postId: string;
  identity: Identity;
}): Promise<LikeState> {
  const { postId, identity } = input;
  if (!identity.userId && !identity.anonId) {
    throw new Error("identity_required");
  }

  if (!dbAvailable()) {
    const key = `${postId}:${identityKey(identity)}`;
    const counts = ensureCounts(postId);
    if (likesMem.has(key)) {
      likesMem.delete(key);
      counts.likes = Math.max(0, counts.likes - 1);
      return { liked: false, total: counts.likes };
    }
    likesMem.set(key, { postId, key, createdAt: Date.now() });
    counts.likes += 1;
    return { liked: true, total: counts.likes };
  }

  const sb = createAdminClient();

  // 1. Does a like already exist for this identity on this post?
  let existingQ = sb
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .limit(1);
  existingQ = identity.userId
    ? existingQ.eq("user_id", identity.userId)
    : existingQ.eq("anon_id", identity.anonId!);
  const { data: existing } = await existingQ.maybeSingle();

  if (existing?.id) {
    // Toggle off.
    await sb.from("post_likes").delete().eq("id", existing.id);
    const total = await fetchLikesCount(postId);
    return { liked: false, total };
  }

  // Insert new like. If a race produced a duplicate, fall back to the
  // existing state rather than 500.
  const { error } = await sb.from("post_likes").insert({
    post_id: postId,
    user_id: identity.userId,
    anon_id: identity.userId ? null : identity.anonId,
  });
  if (error) {
    console.error("[posts/interactions] like insert failed:", error);
  }
  const total = await fetchLikesCount(postId);
  return { liked: true, total };
}

async function fetchLikesCount(postId: string): Promise<number> {
  if (!dbAvailable()) {
    return ensureCounts(postId).likes;
  }
  const sb = createAdminClient();
  // Trigger denormalizes likes_count on posts, but the trigger is async-ish
  // (same tx, post-insert) so the safest read is the posts row.
  const { data } = await sb
    .from("posts")
    .select("likes_count")
    .eq("id", postId)
    .single();
  return data?.likes_count ?? 0;
}

export async function getLikeState(input: {
  postId: string;
  identity: Identity;
}): Promise<LikeState> {
  const { postId, identity } = input;
  if (!dbAvailable()) {
    const counts = ensureCounts(postId);
    const key = `${postId}:${identityKey(identity)}`;
    return { liked: likesMem.has(key), total: counts.likes };
  }
  const sb = createAdminClient();
  let q = sb
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .limit(1);
  q = identity.userId
    ? q.eq("user_id", identity.userId)
    : q.eq("anon_id", identity.anonId ?? "");
  const { data } = await q.maybeSingle();
  const total = await fetchLikesCount(postId);
  return { liked: Boolean(data?.id), total };
}

// ── Comments ──────────────────────────────────────────

export async function addComment(input: {
  postId: string;
  identity: Identity;
  anonName?: string | null;
  text: string;
}): Promise<Comment> {
  const text = input.text.trim();
  if (text.length < 1 || text.length > 1000) {
    throw new Error("invalid_text");
  }
  if (!input.identity.userId && !input.identity.anonId) {
    throw new Error("identity_required");
  }

  const now = new Date().toISOString();

  if (!dbAvailable()) {
    const c: Comment = {
      id: randomId("cmt"),
      postId: input.postId,
      authorId: input.identity.userId,
      authorAnonName: input.identity.userId ? null : input.anonName ?? null,
      authorAnonId: input.identity.userId ? null : input.identity.anonId,
      text,
      createdAt: now,
    };
    commentsMem.set(c.id, c);
    const counts = ensureCounts(input.postId);
    counts.comments += 1;
    return c;
  }

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("post_comments")
    .insert({
      post_id: input.postId,
      author_id: input.identity.userId,
      author_anon_name: input.identity.userId ? null : input.anonName,
      author_anon_id: input.identity.userId ? null : input.identity.anonId,
      text,
    })
    .select("id, post_id, author_id, author_anon_name, author_anon_id, text, created_at")
    .single();

  if (error || !data) {
    console.error("[posts/interactions] comment insert failed:", error);
    // Fall back to memory so the user isn't blocked.
    const c: Comment = {
      id: randomId("cmt"),
      postId: input.postId,
      authorId: input.identity.userId,
      authorAnonName: input.identity.userId ? null : input.anonName ?? null,
      authorAnonId: input.identity.userId ? null : input.identity.anonId,
      text,
      createdAt: now,
    };
    commentsMem.set(c.id, c);
    return c;
  }

  return {
    id: data.id,
    postId: data.post_id,
    authorId: data.author_id,
    authorAnonName: data.author_anon_name,
    authorAnonId: data.author_anon_id,
    text: data.text,
    createdAt: data.created_at,
  };
}

export async function listComments(input: {
  postId: string;
  limit?: number;
}): Promise<Comment[]> {
  const limit = Math.min(100, Math.max(1, input.limit ?? 50));

  if (!dbAvailable()) {
    return Array.from(commentsMem.values())
      .filter((c) => c.postId === input.postId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);
  }

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("post_comments")
    .select(
      "id, post_id, author_id, author_anon_name, author_anon_id, text, created_at"
    )
    .eq("post_id", input.postId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    authorAnonName: row.author_anon_name,
    authorAnonId: row.author_anon_id,
    text: row.text,
    createdAt: row.created_at,
  }));
}

// ── Anon handle helpers ───────────────────────────────

/** Returns a deterministic anon display name from a stable cookie id. */
export function anonNameFromId(anonId: string): string {
  // Take 4 hex chars worth (~16 bits) → 0..65535. Bluesky-style "@anon-1234".
  const hash = anonId.replace(/[^a-z0-9]/gi, "").slice(-4) || "0000";
  const n = parseInt(hash, 36) % 10000;
  return `anon-${n.toString().padStart(4, "0")}`;
}

/** Mints a new random anon id when none is present in cookies. */
export function newAnonId(): string {
  return randomId("anon");
}
