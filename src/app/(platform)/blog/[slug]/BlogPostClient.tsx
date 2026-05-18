"use client";

import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  User,
  Twitter,
  Linkedin,
  Link2,
  Check,
} from "lucide-react";
import { useEffect, useState, useRef, useSyncExternalStore } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

interface BlogPostData {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string | null;
  published_at: string | null;
  author?: string;
  authorAvatar?: string;
}

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

function extractToc(html: string): TocEntry[] {
  const regex = /<h([23])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi;
  const entries: TocEntry[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    entries.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ""),
    });
  }

  // If no id-based headings found, also try headings without IDs and generate slugs
  if (entries.length === 0) {
    const fallbackRegex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
    let fallbackMatch;
    while ((fallbackMatch = fallbackRegex.exec(html)) !== null) {
      const text = fallbackMatch[2].replace(/<[^>]*>/g, "");
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      entries.push({
        level: parseInt(fallbackMatch[1]),
        id,
        text,
      });
    }
  }

  return entries;
}

function subscribeToLocation(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);
  window.addEventListener("hashchange", onStoreChange);
  window.addEventListener("popstate", onStoreChange);
  return () => {
    window.removeEventListener("hashchange", onStoreChange);
    window.removeEventListener("popstate", onStoreChange);
  };
}

export default function BlogPostClient({ post }: { post: BlogPostData }) {
  const articleRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start start", "end end"],
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const shareUrl = useSyncExternalStore(
    subscribeToLocation,
    () => window.location.href,
    () => ""
  );
  const toc = extractToc(post.content);

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Inject ids into headings for scroll-to
  const contentWithIds = post.content.replace(
    /<h([23])([^>]*)>(.*?)<\/h[23]>/gi,
    (_match, level, attrs, text) => {
      const plainText = text.replace(/<[^>]*>/g, "");
      const id = plainText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      if (attrs.includes("id=")) {
        return `<h${level}${attrs}>${text}</h${level}>`;
      }
      return `<h${level} id="${id}"${attrs}>${text}</h${level}>`;
    }
  );

  // Track active section
  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    for (const item of toc) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [toc]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div ref={articleRef} style={{ background: "#F7F8FA" }} className="min-h-screen">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left"
        style={{
          scaleX,
          background: "#0A0A0A",
        }}
      />

      <div className="max-w-[960px] mx-auto px-6 pt-28 pb-24">
        <div className="flex gap-10">
          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-[720px]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
            >
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest transition-colors mb-10"
                style={{ color: "#9CA3AF" }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to blog
              </Link>
            </motion.div>

            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-[11px] font-bold uppercase tracking-widest px-3 py-1"
                  style={{
                    background: "#F3F4F6",
                    color: "#111111",
                    borderRadius: "9999px",
                  }}
                >
                  {post.category}
                </span>
                {post.read_time && (
                  <span
                    className="text-[12px] flex items-center gap-1"
                    style={{ color: "#9CA3AF" }}
                  >
                    <Clock className="w-3 h-3" />
                    {post.read_time} read
                  </span>
                )}
              </div>

              <h1
                className="font-display text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.02em] leading-[1.1] mb-4"
                style={{ color: "#111111" }}
              >
                {post.title}
              </h1>

              <p
                className="text-[16px] leading-relaxed mb-6"
                style={{ color: "#6B7280" }}
              >
                {post.excerpt}
              </p>

              {/* Author + Date row */}
              <div className="flex items-center gap-4 pt-6 border-t" style={{ borderColor: "#E5E7EB" }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 flex items-center justify-center"
                    style={{
                      borderRadius: "9999px",
                      background: "rgba(32,245,160,0.15)",
                    }}
                  >
                    {post.authorAvatar ? (
                      <img
                        src={post.authorAvatar}
                        alt={`${post.author || "Antry Team"} avatar`}
                        className="w-9 h-9 object-cover"
                        style={{ borderRadius: "9999px" }}
                      />
                    ) : (
                      <User className="w-4 h-4" style={{ color: "#6B7280" }} aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <span
                      className="text-[13px] font-semibold block"
                      style={{ color: "#111111" }}
                    >
                      {post.author || "Antry Team"}
                    </span>
                    {publishedDate && (
                      <span className="text-[12px]" style={{ color: "#9CA3AF" }}>
                        {publishedDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.header>

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease }}
              className="prose prose-neutral max-w-none text-[15px] leading-relaxed [&_h2]:font-display [&_h2]:text-[22px] [&_h2]:tracking-[-0.02em] [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-[18px] [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-5 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:pl-5 [&_blockquote]:italic [&_code]:text-[13px] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto"
              style={{
                color: "#4B5563",
              }}
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            {/* Share Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease }}
              className="mt-12 pt-8 border-t"
              style={{ borderColor: "#E5E7EB" }}
            >
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: "#9CA3AF" }}
              >
                Share this article
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 transition-all duration-200"
                  style={{
                    borderRadius: "12px",
                    background: "#F3F4F6",
                    color: "#6B7280",
                  }}
                  title="Share on Twitter"
                  aria-label="Share this article on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 transition-all duration-200"
                  style={{
                    borderRadius: "12px",
                    background: "#F3F4F6",
                    color: "#6B7280",
                  }}
                  title="Share on LinkedIn"
                  aria-label="Share this article on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center w-10 h-10 transition-all duration-200"
                  style={{
                    borderRadius: "12px",
                    background: copied ? "#0A0A0A" : "#F3F4F6",
                    color: copied ? "#ffffff" : "#6B7280",
                  }}
                  title="Copy link"
                  aria-label={copied ? "Link copied to clipboard" : "Copy link to this article"}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar: Table of Contents */}
          {toc.length > 0 && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease }}
              className="hidden lg:block w-[220px] shrink-0"
            >
              <div className="sticky top-28">
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-4"
                  style={{ color: "#9CA3AF" }}
                >
                  On this page
                </p>
                <nav className="flex flex-col gap-1.5">
                  {toc.map((entry) => (
                    <a
                      key={entry.id}
                      href={`#${entry.id}`}
                      className="block text-[13px] leading-snug transition-all duration-200"
                      style={{
                        paddingLeft: entry.level === 3 ? "12px" : "0px",
                        color:
                          activeSection === entry.id
                            ? "#111111"
                            : "#9CA3AF",
                        fontWeight:
                          activeSection === entry.id ? 600 : 400,
                        borderLeft:
                          activeSection === entry.id
                            ? "2px solid #0A0A0A"
                            : "2px solid transparent",
                        paddingTop: "4px",
                        paddingBottom: "4px",
                      }}
                    >
                      {entry.text}
                    </a>
                  ))}
                </nav>
              </div>
            </motion.aside>
          )}
        </div>
      </div>
    </div>
  );
}
