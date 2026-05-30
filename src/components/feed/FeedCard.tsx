/**
 * Feed primitives — the social-network surface for Antry.
 *
 * One post type per content surface, each with a distinct accent color.
 * Different colors are how the feed reads at a glance — you don't need
 * to read the post to know it's a Receipt vs a Hackathon vs a Build update.
 *
 * Color system (intentionally not the lime-on-black monochrome):
 *   Receipt          → lime    (signed eval result)
 *   Hackathon win    → orange  (event win)
 *   Hackathon launch → amber   (event start)
 *   Build update     → blue    (in-progress work)
 *   Project ship     → violet  (something complete)
 *   Discussion       → slate   (talk, no artifact)
 *
 * Editorial/typographic feel — no gradients, no decorative motion,
 * tight horizontal rules, single accent stripe per post.
 *
 * Engagement model:
 *   • Heart  → POST /api/posts/[id]/like (optimistic; anon-friendly via
 *             the antry_anon_id cookie). "Liked by you" persists in
 *             localStorage so the icon fill survives page navigations.
 *   • Reply  → expands an inline comment thread (GET/POST /comments).
 *   • Share  → navigator.share if available, else copies URL to clipboard.
 *
 * The whole card is a client component — engagement is the feedback loop
 * that keeps the network alive, and that loop has to feel instant.
 */

"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Heart,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";

export type PostKind =
  | "receipt"
  | "hack-win"
  | "hack-launch"
  | "build"
  | "ship"
  | "discuss";

export type Post = {
  id: string;
  kind: PostKind;
  author: {
    username: string;
    name: string;
    gradient: string; // for avatar fallback
  };
  /** 1–3 word verb describing the action ("minted Receipt", "launched") */
  verb: string;
  /** 1 short line, max ~80 chars. The headline. */
  headline: string;
  /** Optional 1-line subtext, max ~120 chars */
  subtext?: string;
  /** Optional short list of tag-like badges, e.g. ["mid", "ai-agents"] */
  badges?: string[];
  /** Where clicking the card sends you */
  href: string;
  /** ISO timestamp */
  at: string;
  /** Optional metric — e.g. composite score for receipts */
  metric?: { label: string; value: string };
  /** Optional media slot — designed for future image attachments. */
  media?: { kind: "image"; url: string; alt?: string };
  /** Engagement counts; reads denormalize from posts.likes_count / comments_count. */
  reactions: { likes: number; comments: number };
};

export const POST_COLORS: Record<PostKind, { fg: string; bg: string; line: string }> = {
  receipt:      { fg: "#0A0A0A", bg: "#C6F135", line: "#C6F135" }, // lime
  "hack-win":   { fg: "#FFFFFF", bg: "#FF6B35", line: "#FF6B35" }, // orange
  "hack-launch":{ fg: "#0A0A0A", bg: "#FBBF24", line: "#FBBF24" }, // amber
  build:        { fg: "#FFFFFF", bg: "#3B82F6", line: "#3B82F6" }, // blue
  ship:         { fg: "#FFFFFF", bg: "#8B5CF6", line: "#8B5CF6" }, // violet
  discuss:      { fg: "#FFFFFF", bg: "#475569", line: "#475569" }, // slate
};

export const POST_LABEL: Record<PostKind, string> = {
  receipt:       "Receipt",
  "hack-win":    "Win",
  "hack-launch": "Launch",
  build:         "Build",
  ship:          "Ship",
  discuss:       "Talk",
};

const LIKED_KEY = "antry.liked_posts";

function readLikedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(LIKED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? new Set(arr.filter((x) => typeof x === "string")) : new Set();
  } catch {
    return new Set();
  }
}

function writeLikedSet(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LIKED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Quota or privacy mode — fine, we degrade to session-local state.
  }
}

type RemoteComment = { id: string; author: string; text: string; at: string };

/**
 * Renders a single feed item. Preview-only callers (compose preview) pass
 * `preview` to disable the link wrapper and engagement actions.
 */
export function FeedCard({
  post,
  preview = false,
}: {
  post: Post;
  preview?: boolean;
}) {
  const c = POST_COLORS[post.kind];
  const composerId = useId();

  // ── Like state ───────────────────────────────────────
  // Hydration-safe: start with server-known counts + a `liked=false`, then
  // upgrade after mount once we can read localStorage.
  const [likes, setLikes] = useState(post.reactions.likes);
  const [liked, setLiked] = useState(false);
  const [animLike, setAnimLike] = useState(false);

  useEffect(() => {
    if (preview) return;
    const set = readLikedSet();
    if (set.has(post.id)) setLiked(true);
  }, [post.id, preview]);

  const onLike = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (preview) return;

      // Optimistic flip.
      const prevLiked = liked;
      const prevTotal = likes;
      const nextLiked = !prevLiked;
      setLiked(nextLiked);
      setLikes((n) => Math.max(0, n + (nextLiked ? 1 : -1)));
      setAnimLike(true);
      window.setTimeout(() => setAnimLike(false), 280);

      // Persist "you liked it" client-side for repeat visits.
      const set = readLikedSet();
      if (nextLiked) set.add(post.id);
      else set.delete(post.id);
      writeLikedSet(set);

      try {
        const res = await fetch(`/api/posts/${post.id}/like`, {
          method: "POST",
        });
        if (res.ok) {
          const j = (await res.json()) as { liked?: boolean; total?: number };
          if (typeof j.total === "number") setLikes(j.total);
          if (typeof j.liked === "boolean") {
            setLiked(j.liked);
            const cur = readLikedSet();
            if (j.liked) cur.add(post.id);
            else cur.delete(post.id);
            writeLikedSet(cur);
          }
        } else {
          // Roll back optimistic state on failure.
          setLiked(prevLiked);
          setLikes(prevTotal);
          const cur = readLikedSet();
          if (prevLiked) cur.add(post.id);
          else cur.delete(post.id);
          writeLikedSet(cur);
        }
      } catch {
        // Network error — keep optimistic state, the user gets feedback.
      }
    },
    [post.id, liked, likes, preview]
  );

  // ── Comment thread state ────────────────────────────
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<RemoteComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.reactions.comments);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const onToggleComments = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (preview) return;
      const next = !open;
      setOpen(next);
      if (next && comments.length === 0 && !loadingComments) {
        setLoadingComments(true);
        try {
          const res = await fetch(`/api/posts/${post.id}/comments`);
          if (res.ok) {
            const j = (await res.json()) as { comments?: RemoteComment[] };
            setComments(j.comments ?? []);
          }
        } catch {
          // Silent — empty list is acceptable.
        } finally {
          setLoadingComments(false);
        }
        // Defer focus until the textarea mounts.
        window.setTimeout(() => textareaRef.current?.focus(), 30);
      }
    },
    [open, comments.length, loadingComments, post.id, preview]
  );

  const onSubmitComment = useCallback(async () => {
    const text = draft.trim();
    if (text.length < 1 || posting) return;
    setPosting(true);

    // Optimistic insert.
    const optimisticId = `tmp_${Math.random().toString(36).slice(2)}`;
    const optimistic: RemoteComment = {
      id: optimisticId,
      author: "@you",
      text,
      at: new Date().toISOString(),
    };
    setComments((prev) => [optimistic, ...prev]);
    setCommentCount((n) => n + 1);
    setDraft("");

    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const j = (await res.json()) as { comment?: RemoteComment };
        if (j.comment) {
          setComments((prev) =>
            prev.map((c) => (c.id === optimisticId ? j.comment! : c))
          );
        }
      } else {
        // Roll back optimistic comment.
        setComments((prev) => prev.filter((c) => c.id !== optimisticId));
        setCommentCount((n) => Math.max(0, n - 1));
        setDraft(text);
      }
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimisticId));
      setCommentCount((n) => Math.max(0, n - 1));
      setDraft(text);
    } finally {
      setPosting(false);
    }
  }, [draft, posting, post.id]);

  // ── Share ────────────────────────────────────────────
  const [shared, setShared] = useState(false);
  const onShare = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (preview) return;
      const shareUrl =
        typeof window !== "undefined"
          ? new URL(post.href || `/p/${post.id}`, window.location.origin).toString()
          : post.href;
      const data = {
        title: post.author.name,
        text: post.headline,
        url: shareUrl,
      };
      // navigator.share may exist but reject — wrap in try.
      const nav =
        typeof navigator !== "undefined"
          ? (navigator as Navigator & { share?: (d: ShareData) => Promise<void> })
          : null;
      if (nav?.share) {
        try {
          await nav.share(data);
          return;
        } catch {
          // user cancelled → fall through to clipboard
        }
      }
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShared(true);
        window.setTimeout(() => setShared(false), 1500);
      } catch {
        // ignore — no further fallback.
      }
    },
    [post.href, post.id, post.author.name, post.headline, preview]
  );

  // ── Body (shared by link + preview modes) ───────────
  const body = (
    <>
      {/* Left accent stripe */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: c.line }}
      />

      <div className="flex gap-3 sm:gap-4">
        {/* Avatar */}
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0 flex items-center justify-center text-[12px] font-bold text-white"
          style={{ background: post.author.gradient }}
        >
          {post.author.name.charAt(0)}
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          {/* Meta row: name · verb · time · pill */}
          <div className="flex items-center gap-2 text-[12px] sm:text-[13px] mb-1">
            <span className="font-bold text-black truncate">
              {post.author.name}
            </span>
            <span className="text-gray-500 truncate">{post.verb}</span>
            <span
              className="ml-auto text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded shrink-0"
              style={{ background: c.bg, color: c.fg }}
            >
              {POST_LABEL[post.kind]}
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-[15px] sm:text-[16px] font-bold tracking-[-0.005em] text-black leading-[1.3]">
            {post.headline}
          </h3>

          {/* Subtext */}
          {post.subtext && (
            <p className="mt-1 text-[13px] leading-[1.5] text-gray-600 line-clamp-2">
              {post.subtext}
            </p>
          )}

          {/* Optional inline media slot — designed for future image
              attachments. Renders a thin frame, never any padding on
              empty state, so it costs zero pixels until used. */}
          {post.media?.kind === "image" && post.media.url && (
            <div
              className="mt-3 overflow-hidden rounded-[10px]"
              style={{ border: "1px solid #EBEBEB", background: "#FAFAF7" }}
            >
              {/* Plain <img> on purpose — we don't want next/image's
                  layout shift overhead in the feed. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.media.url}
                alt={post.media.alt ?? ""}
                className="block w-full h-auto"
                loading="lazy"
              />
            </div>
          )}

          {/* Badges + metric */}
          {(post.badges?.length || post.metric) && (
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              {post.badges?.map((b) => (
                <span
                  key={b}
                  className="text-[10px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
                  style={{
                    background: "#F5F5F5",
                    color: "#525252",
                  }}
                >
                  {b}
                </span>
              ))}
              {post.metric && (
                <span
                  className="text-[11px] font-semibold inline-flex items-center gap-1 ml-auto"
                  style={{ color: c.line }}
                >
                  {post.metric.label}{" "}
                  <span
                    className="font-display text-[14px] font-bold"
                    style={{ color: "#0A0A0A" }}
                  >
                    {post.metric.value}
                  </span>
                </span>
              )}
            </div>
          )}

          {/* Action row */}
          <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-500">
            <button
              type="button"
              onClick={onLike}
              disabled={preview}
              aria-pressed={liked}
              aria-label={liked ? "Unlike" : "Like"}
              className="inline-flex items-center gap-1 px-1.5 py-1 rounded-md transition-colors hover:bg-[#F5F5F5] hover:text-black disabled:hover:bg-transparent disabled:cursor-default"
              style={{ color: liked ? "#FF3B6B" : undefined }}
            >
              <Heart
                className={`w-3 h-3 transition-transform ${
                  animLike ? "scale-[1.35]" : "scale-100"
                }`}
                strokeWidth={liked ? 0 : 1.75}
                fill={liked ? "#FF3B6B" : "none"}
              />
              <span className="tabular-nums">{likes}</span>
            </button>

            <button
              type="button"
              onClick={onToggleComments}
              disabled={preview}
              aria-expanded={open}
              aria-controls={composerId}
              aria-label="Comments"
              className="inline-flex items-center gap-1 px-1.5 py-1 rounded-md transition-colors hover:bg-[#F5F5F5] hover:text-black disabled:hover:bg-transparent disabled:cursor-default"
            >
              <MessageCircle className="w-3 h-3" />
              <span className="tabular-nums">{commentCount}</span>
            </button>

            <button
              type="button"
              onClick={onShare}
              disabled={preview}
              aria-label="Share"
              className="inline-flex items-center gap-1 px-1.5 py-1 rounded-md transition-colors hover:bg-[#F5F5F5] hover:text-black disabled:hover:bg-transparent disabled:cursor-default"
            >
              {shared ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied
                </>
              ) : (
                <>
                  <Share2 className="w-3 h-3" />
                  Share
                </>
              )}
            </button>

            <span className="ml-auto text-gray-400 pl-2">{timeago(post.at)}</span>
            {!preview && (
              <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-black transition-colors" />
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Preview mode: no link wrapper, no hover-affordance.
  if (preview) {
    return (
      <article
        className="group relative bg-white"
        style={{ borderTop: "1px solid #EBEBEB" }}
        aria-label="Post preview"
      >
        <div className="block px-4 py-4 sm:py-5 sm:px-6">{body}</div>
      </article>
    );
  }

  return (
    <article
      className="group relative bg-white transition-colors hover:bg-[#FAFAF7]"
      style={{ borderTop: "1px solid #EBEBEB" }}
    >
      {/* Background link covers the card so any non-button surface remains
          clickable; the interactive controls stop propagation. */}
      <Link
        href={post.href || `/p/${post.id}`}
        className="absolute inset-0 z-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 rounded-[2px]"
        aria-label={`${post.author.name}: ${post.headline}`}
      />

      <div className="relative z-10 block px-4 py-4 sm:py-5 sm:px-6 pointer-events-none">
        {/* Re-enable pointer events on interactive nodes inside */}
        <div className="pointer-events-auto">{body}</div>
      </div>

      {open && (
        <div
          id={composerId}
          className="relative z-10 px-4 sm:px-6 pb-4"
          style={{ borderTop: "1px solid #EBEBEB" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Composer */}
          <div
            className="mt-3 rounded-[10px] overflow-hidden"
            style={{ border: "1px solid #EBEBEB", background: "#FFFFFF" }}
          >
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (
                  (e.metaKey || e.ctrlKey) &&
                  e.key === "Enter" &&
                  draft.trim().length > 0
                ) {
                  e.preventDefault();
                  void onSubmitComment();
                }
              }}
              placeholder="Add a comment…"
              maxLength={1000}
              rows={2}
              className="w-full px-3 py-2 text-[13px] leading-[1.5] outline-none resize-none placeholder:text-gray-400"
              style={{ background: "transparent", color: "#0A0A0A" }}
            />
            <div
              className="flex items-center justify-between gap-2 px-2 py-1.5"
              style={{ background: "#FAFAF7", borderTop: "1px solid #EBEBEB" }}
            >
              <span className="text-[10px] text-gray-500">
                Anonymous reply — claim a handle to keep it.
              </span>
              <button
                type="button"
                onClick={() => void onSubmitComment()}
                disabled={posting || draft.trim().length < 1}
                className="inline-flex items-center gap-1 rounded-md px-2.5 h-7 text-[11px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#0A0A0A", color: "#FFFFFF" }}
              >
                <Send className="w-3 h-3" />
                {posting ? "Sending…" : "Reply"}
              </button>
            </div>
          </div>

          {/* Existing comments */}
          <div className="mt-3 space-y-2.5">
            {loadingComments && comments.length === 0 && (
              <p className="text-[11px] text-gray-400">Loading comments…</p>
            )}
            {!loadingComments && comments.length === 0 && (
              <p className="text-[11px] text-gray-400">No comments yet — be first.</p>
            )}
            {comments.map((cm) => (
              <div key={cm.id} className="flex items-start gap-2">
                <div
                  className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #C6F135 0%, #475569 100%)",
                  }}
                >
                  {cm.author.slice(1, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 text-[11px]">
                    <span className="font-bold text-black truncate">
                      {cm.author}
                    </span>
                    <span className="text-gray-400">{timeago(cm.at)}</span>
                  </div>
                  <p className="text-[13px] text-gray-800 leading-[1.45] mt-0.5 whitespace-pre-wrap break-words">
                    {cm.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function timeago(iso: string): string {
  const t = new Date(iso).getTime();
  const ms = Date.now() - t;
  const m = Math.round(ms / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.round(d / 7);
  if (w < 5) return `${w}w`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
