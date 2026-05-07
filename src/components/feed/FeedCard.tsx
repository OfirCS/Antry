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
 */

import Link from "next/link";
import { ArrowUpRight, MessageCircle, Heart, Share2 } from "lucide-react";

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
  /** Engagement counts for v0 these are static, real version hits `posts_reactions` */
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

export function FeedCard({ post }: { post: Post }) {
  const c = POST_COLORS[post.kind];
  return (
    <article
      className="group relative bg-white"
      style={{ borderTop: "1px solid #EBEBEB" }}
    >
      <Link
        href={post.href}
        className="block px-4 py-4 sm:py-5 sm:px-6 transition-colors hover:bg-[#FAFAF7]"
      >
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
            <div className="mt-3 flex items-center gap-4 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Heart className="w-3 h-3" /> {post.reactions.likes}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> {post.reactions.comments}
              </span>
              <span className="inline-flex items-center gap-1">
                <Share2 className="w-3 h-3" /> Share
              </span>
              <span className="ml-auto text-gray-400">
                {timeago(post.at)}
              </span>
              <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-black transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function timeago(iso: string): string {
  const t = new Date(iso).getTime();
  const ms = Date.now() - t;
  const m = Math.round(ms / 60000);
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
