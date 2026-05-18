"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Hammer,
  Rocket,
  MessageCircle,
  Receipt as ReceiptIcon,
  X,
} from "lucide-react";
import { POST_COLORS, POST_LABEL, type PostKind } from "@/components/feed/FeedCard";
import { createPost } from "./actions";

const KIND_OPTIONS: { kind: PostKind; icon: React.ReactNode; placeholder: string }[] = [
  {
    kind: "build",
    icon: <Hammer className="w-3.5 h-3.5" />,
    placeholder: "Working on…",
  },
  {
    kind: "ship",
    icon: <Rocket className="w-3.5 h-3.5" />,
    placeholder: "Just shipped…",
  },
  {
    kind: "discuss",
    icon: <MessageCircle className="w-3.5 h-3.5" />,
    placeholder: "Question for the room…",
  },
  {
    kind: "receipt",
    icon: <ReceiptIcon className="w-3.5 h-3.5" />,
    placeholder: "Paste a Receipt URL or ID…",
  },
];

export function ComposeClient() {
  const router = useRouter();
  const [kind, setKind] = useState<PostKind>("build");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeholder = KIND_OPTIONS.find((o) => o.kind === kind)?.placeholder ?? "";

  const onSubmit = async () => {
    if (text.trim().length < 3) return;
    setError(null);
    setPosting(true);
    try {
      const result = await createPost(kind, text);
      if (!result.ok) {
        setError(
          result.reason === "not_authenticated"
            ? "Sign in to post."
            : result.error
        );
        setPosting(false);
        return;
      }
      // Persisted (or accepted pending the posts-table migration) — the
      // home feed is the canonical destination either way.
      router.push("/");
    } catch {
      setError("Couldn't post — try again.");
      setPosting(false);
    }
  };

  return (
    <div style={{ background: "#FAFAF7" }} className="min-h-screen">
      <div className="mx-auto max-w-[640px] px-4 sm:px-6 pt-12 sm:pt-16 pb-12">
        <div className="flex items-center justify-between mb-5">
          <h1
            className="font-display font-bold tracking-[-0.02em] text-black"
            style={{ fontSize: "clamp(1.4rem, 3.5vw, 1.8rem)" }}
          >
            Compose
          </h1>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-500 hover:text-black hover:bg-white transition-colors"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Kind selector */}
        <div
          className="rounded-[14px] p-1 inline-flex flex-wrap gap-1 mb-3"
          style={{ background: "#EFEFEC", border: "1px solid #EBEBEB" }}
          role="tablist"
        >
          {KIND_OPTIONS.map((o) => {
            const c = POST_COLORS[o.kind];
            const on = kind === o.kind;
            return (
              <button
                key={o.kind}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setKind(o.kind)}
                className="inline-flex items-center gap-1.5 px-3 h-8 rounded-[10px] text-[12px] font-bold transition-colors"
                style={{
                  background: on ? c.bg : "transparent",
                  color: on ? c.fg : "#525252",
                }}
              >
                {o.icon}
                {POST_LABEL[o.kind]}
              </button>
            );
          })}
        </div>

        {/* Composer */}
        <div
          className="rounded-[14px] overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            maxLength={400}
            rows={6}
            className="w-full px-4 py-4 text-[15px] leading-[1.5] outline-none resize-none placeholder:text-gray-400"
            style={{ background: "transparent", color: "#0A0A0A" }}
          />
          <div
            className="flex items-center justify-between gap-3 px-3 py-2"
            style={{ background: "#FAFAF7", borderTop: "1px solid #EBEBEB" }}
          >
            <span className="text-[11px] text-gray-500">
              {text.length}/400
            </span>
            <button
              type="button"
              onClick={onSubmit}
              disabled={posting || text.trim().length < 3}
              className="inline-flex items-center justify-center rounded-[10px] px-4 h-9 text-[13px] font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#0A0A0A", color: "#FFFFFF" }}
            >
              {posting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-[12px] font-medium text-red-600">{error}</p>
        )}

        <p className="mt-3 text-[11px] text-gray-500">
          Posts are saved once the feed&apos;s <code>posts</code> table ships;
          until then your post is accepted and you&apos;re returned to the feed.
        </p>
      </div>
    </div>
  );
}
