/**
 * Posts store — DB-first with in-memory fallback.
 *
 * Same pattern as src/lib/mcp/store.ts and src/lib/hackathons/store.ts.
 * The feed reads from getPosts(); compose + auto-post-from-Receipt
 * write through createPost().
 */

import { createAdminClient } from "@/lib/supabase/server";
import type { Post } from "@/components/feed/FeedCard";

export type CreatePostInput = {
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorGradient: string;
  kind: Post["kind"];
  verb: string;
  headline: string;
  subtext?: string;
  href?: string;
  badges?: string[];
  metric?: { label: string; value: string };
  receiptId?: string;
  briefId?: string;
  hackathonId?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __antryPosts: Map<string, Post & { authorId: string; createdAt: number }>
    | undefined;
}
const memStore =
  globalThis.__antryPosts ??
  (globalThis.__antryPosts = new Map<
    string,
    Post & { authorId: string; createdAt: number }
  >());

function dbAvailable(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("127.0.0.1")
  );
}

function cryptoRandomId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return `pst_${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const now = new Date().toISOString();
  const id = cryptoRandomId();

  const post: Post = {
    id,
    kind: input.kind,
    author: {
      username: input.authorUsername,
      name: input.authorName,
      gradient: input.authorGradient,
    },
    verb: input.verb,
    headline: input.headline,
    subtext: input.subtext,
    href: input.href ?? "",
    badges: input.badges ?? [],
    at: now,
    metric: input.metric,
    reactions: { likes: 0, comments: 0 },
  };

  if (!dbAvailable()) {
    memStore.set(id, {
      ...post,
      authorId: input.authorId,
      createdAt: Date.now(),
    });
    return post;
  }

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("posts")
    .insert({
      author_id: input.authorId,
      author_username: input.authorUsername,
      author_name: input.authorName,
      author_gradient: input.authorGradient,
      kind: input.kind,
      verb: input.verb,
      headline: input.headline,
      subtext: input.subtext ?? "",
      href: input.href ?? "",
      badges: input.badges ?? [],
      metric_label: input.metric?.label,
      metric_value: input.metric?.value,
      receipt_id: input.receiptId,
      brief_id: input.briefId,
      hackathon_id: input.hackathonId,
    })
    .select("id, created_at")
    .single();

  if (error || !data) {
    // DB write failed — fall back to memory so the user isn't blocked.
    console.error("[posts/store] insert failed, falling back:", error);
    memStore.set(id, {
      ...post,
      authorId: input.authorId,
      createdAt: Date.now(),
    });
    return post;
  }

  return { ...post, id: data.id, at: data.created_at };
}

export async function getPosts(options?: {
  limit?: number;
  authorUsername?: string;
}): Promise<Post[]> {
  const limit = options?.limit ?? 50;

  if (!dbAvailable()) {
    let arr = Array.from(memStore.values());
    if (options?.authorUsername) {
      arr = arr.filter((p) => p.author.username === options.authorUsername);
    }
    return arr
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map(({ authorId, createdAt, ...post }) => post);
  }

  const sb = createAdminClient();
  let q = sb
    .from("posts")
    .select(
      "id, author_username, author_name, author_gradient, kind, verb, headline, subtext, href, badges, metric_label, metric_value, likes_count, comments_count, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (options?.authorUsername) {
    q = q.eq("author_username", options.authorUsername);
  }
  const { data, error } = await q;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    kind: row.kind as Post["kind"],
    author: {
      username: row.author_username,
      name: row.author_name,
      gradient: row.author_gradient,
    },
    verb: row.verb,
    headline: row.headline,
    subtext: row.subtext ?? undefined,
    href: row.href ?? "",
    badges: row.badges ?? [],
    at: row.created_at,
    metric:
      row.metric_label && row.metric_value
        ? { label: row.metric_label, value: row.metric_value }
        : undefined,
    reactions: {
      likes: row.likes_count ?? 0,
      comments: row.comments_count ?? 0,
    },
  }));
}
