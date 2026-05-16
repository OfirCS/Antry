"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Clock, User } from "lucide-react";
import { useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  externalUrl?: string;
  author?: string;
  authorAvatar?: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const ALL_CATEGORY = "All";

export default function BlogClient({ posts }: { posts: BlogPost[] }) {
  const categories = [
    ALL_CATEGORY,
    ...Array.from(new Set(posts.map((p) => p.category))),
  ];
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);

  const filtered =
    activeCategory === ALL_CATEGORY
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const [featuredPost, ...remainingPosts] = filtered;

  return (
    <div style={{ background: "#F7F8FA" }} className="min-h-screen">
      <div className="max-w-[960px] mx-auto px-6 pt-28 pb-24">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, ease }}
          className="mb-10"
        >
          <h1
            className="font-display text-[clamp(2rem,4vw,2.75rem)] tracking-[-0.03em] font-bold mb-3"
            style={{ color: "#111111" }}
          >
            Blog
          </h1>
          <p className="text-[16px] leading-relaxed" style={{ color: "#6B7280" }}>
            Thoughts on building, hiring, and the future of talent discovery.
          </p>
        </motion.div>

        {/* Category Filter Tabs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.1, ease }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="relative rounded-md px-4 py-2 text-[13px] font-semibold transition-all duration-300"
              style={{
                background:
                  activeCategory === cat ? "#111111" : "transparent",
                color: activeCategory === cat ? "#ffffff" : "#6B7280",
                border:
                  activeCategory === cat
                    ? "1px solid #111111"
                    : "1px solid #E5E7EB",
              }}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease }}
          >
            {/* Featured / Hero Post */}
            {featuredPost && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.15, ease }}
                className="mb-10"
              >
                <FeaturedCard post={featuredPost} />
              </motion.div>
            )}

            {/* Remaining Posts Grid */}
            {remainingPosts.length > 0 && (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                {remainingPosts.map((post) => (
                  <motion.div key={post.slug} variants={fadeUp}>
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-[15px]" style={{ color: "#6B7280" }}>
              No posts in this category yet. Check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Featured Hero Card ─────────────────────────────────────── */

function FeaturedCard({ post }: { post: BlogPost }) {
  const Wrapper = post.externalUrl ? "a" : Link;
  const wrapperProps = post.externalUrl
    ? {
        href: post.externalUrl,
        target: "_blank" as const,
        rel: "noopener noreferrer",
      }
    : { href: `/blog/${post.slug}` };

  return (
    <Wrapper
      {...(wrapperProps as React.ComponentProps<"a"> &
        React.ComponentProps<typeof Link>)}
      className="group block overflow-hidden"
      style={{
        background: "#111111",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="p-8 sm:p-10">
        {/* Top row: badge + meta */}
        <div className="flex items-center gap-3 mb-5">
          <span
            className="text-[11px] font-bold uppercase tracking-widest px-3 py-1"
            style={{
              background: "rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.82)",
              borderRadius: "6px",
            }}
          >
            {post.category}
          </span>
          <span
            className="text-[12px] flex items-center gap-1"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <Clock className="w-3 h-3" />
            {post.readTime} read
          </span>
          <span
            className="text-[12px]"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {formatDate(post.date)}
          </span>
        </div>

        {/* Title */}
        <h2
          className="font-display text-[clamp(1.5rem,3vw,2rem)] tracking-[-0.02em] leading-[1.15] mb-4 transition-colors duration-300 group-hover:text-white"
          style={{ color: "#ffffff" }}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        <p
          className="text-[15px] leading-relaxed mb-6 max-w-[600px]"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {post.excerpt}
        </p>

        {/* Author + CTA row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center"
              style={{
                borderRadius: "9999px",
                background: "rgba(255,255,255,0.10)",
              }}
            >
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.author || "Author"}
                  className="w-8 h-8 object-cover"
                  style={{ borderRadius: "9999px" }}
                />
              ) : (
                <User className="w-4 h-4" style={{ color: "rgba(255,255,255,0.72)" }} />
              )}
            </div>
            <span
              className="text-[13px] font-medium"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {post.author || "Antry Team"}
            </span>
          </div>

          <span
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all duration-300 group-hover:gap-2.5"
            style={{ color: "#ffffff" }}
          >
            Read article
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Wrapper>
  );
}

/* ── Regular Post Card ──────────────────────────────────────── */

function PostCard({ post }: { post: BlogPost }) {
  const Wrapper = post.externalUrl ? "a" : Link;
  const wrapperProps = post.externalUrl
    ? {
        href: post.externalUrl,
        target: "_blank" as const,
        rel: "noopener noreferrer",
      }
    : { href: `/blog/${post.slug}` };

  return (
    <Wrapper
      {...(wrapperProps as React.ComponentProps<"a"> &
        React.ComponentProps<typeof Link>)}
      className="group block h-full transition-all duration-300"
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #E5E7EB",
      }}
    >
      <div className="p-6 flex flex-col h-full">
        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5"
            style={{
              background: "#F3F4F6",
              color: "#4B5563",
              borderRadius: "6px",
            }}
          >
            {post.category}
          </span>
          <span
            className="text-[11px] flex items-center gap-1"
            style={{ color: "#9CA3AF" }}
          >
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-display text-[17px] font-semibold tracking-[-0.01em] leading-snug mb-2 transition-colors duration-300 group-hover:text-[#111111]"
          style={{ color: "#111111" }}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p
          className="text-[14px] leading-relaxed line-clamp-2 mb-4 flex-1"
          style={{ color: "#6B7280" }}
        >
          {post.excerpt}
        </p>

        {/* Bottom row: author + date */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "#F3F4F6" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 flex items-center justify-center"
              style={{
                borderRadius: "9999px",
                background: "#F3F4F6",
              }}
            >
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.author || "Author"}
                  className="w-6 h-6 object-cover"
                  style={{ borderRadius: "9999px" }}
                />
              ) : (
                <User className="w-3 h-3" style={{ color: "#9CA3AF" }} />
              )}
            </div>
            <span
              className="text-[12px] font-medium"
              style={{ color: "#6B7280" }}
            >
              {post.author || "Antry Team"}
            </span>
          </div>
          <span className="text-[12px]" style={{ color: "#9CA3AF" }}>
            {formatDate(post.date)}
          </span>
        </div>
      </div>
    </Wrapper>
  );
}
