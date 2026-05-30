"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AtSign,
  Check,
  Hammer,
  Hash,
  MessageCircle,
  Receipt as ReceiptIcon,
  Rocket,
  X,
} from "lucide-react";
import {
  FeedCard,
  POST_COLORS,
  POST_LABEL,
  type Post,
  type PostKind,
} from "@/components/feed/FeedCard";

const KIND_OPTIONS: { kind: PostKind; icon: React.ReactNode; placeholder: string; verb: string }[] = [
  {
    kind: "build",
    icon: <Hammer className="w-3.5 h-3.5" />,
    placeholder: "Working on…",
    verb: "is building",
  },
  {
    kind: "ship",
    icon: <Rocket className="w-3.5 h-3.5" />,
    placeholder: "Just shipped…",
    verb: "shipped",
  },
  {
    kind: "discuss",
    icon: <MessageCircle className="w-3.5 h-3.5" />,
    placeholder: "Question for the room…",
    verb: "asked",
  },
  {
    kind: "receipt",
    icon: <ReceiptIcon className="w-3.5 h-3.5" />,
    placeholder: "Paste a Receipt URL or ID…",
    verb: "minted a Receipt",
  },
];

const MAX_LEN = 400;
const WARN_THRESHOLD = 350;

// A deterministic "You" identity so the preview avatar feels owned but
// doesn't require an auth round-trip. Once auth lands we swap this for the
// real profile.
const PLACEHOLDER_AUTHOR = {
  username: "you",
  name: "You",
  gradient: "linear-gradient(135deg, #C6F135 0%, #475569 100%)",
};

type ChipKey = "receipt" | "hackathon" | "mention";

export function ComposeClient() {
  const router = useRouter();
  const [kind, setKind] = useState<PostKind>("build");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chipHint, setChipHint] = useState<ChipKey | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const opt = KIND_OPTIONS.find((o) => o.kind === kind) ?? KIND_OPTIONS[0];
  const placeholder = opt.placeholder;

  // ── Keyboard shortcuts ──────────────────────────────
  // Cmd/Ctrl + Enter submits when valid. Escape is already handled by the
  // textarea/route; the explicit handler here makes sure Escape closes
  // even when focus is outside the textarea.
  const onSubmit = useCallback(async () => {
    if (text.trim().length < 3 || posting) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, headline: text.trim() }),
      });
      const j = (await res.json()) as { post?: unknown; error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?redirect=/compose");
          return;
        }
        setError(j.error ?? "Failed to post");
        setPosting(false);
        return;
      }
      // Brief success state on the button before navigating, so the user
      // feels the action landed (matches the 2026 bar — Twitter / Bluesky).
      setPosted(true);
      window.setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setPosting(false);
    }
  }, [text, kind, posting, router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        void onSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        router.back();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSubmit, router]);

  // Auto-dismiss the "coming soon" chip hint after a moment.
  useEffect(() => {
    if (!chipHint) return;
    const t = window.setTimeout(() => setChipHint(null), 1800);
    return () => window.clearTimeout(t);
  }, [chipHint]);

  // ── Preview post ────────────────────────────────────
  const previewPost: Post = useMemo(() => {
    const headline = text.trim().length > 0 ? text.trim() : placeholder;
    return {
      id: "preview",
      kind,
      author: PLACEHOLDER_AUTHOR,
      verb: opt.verb,
      headline,
      href: "",
      at: new Date().toISOString(),
      badges: [],
      reactions: { likes: 0, comments: 0 },
    };
  }, [text, kind, opt.verb, placeholder]);

  // ── Character-limit dot ─────────────────────────────
  const pct = Math.min(1, text.length / MAX_LEN);
  const remaining = MAX_LEN - text.length;
  // Color stops: gray → amber at 350+ → red at 400.
  const dotColor =
    text.length >= MAX_LEN
      ? "#DC2626"
      : text.length >= WARN_THRESHOLD
        ? "#F59E0B"
        : "#A3A3A3";
  // Conic stroke fakes a progress ring on a tiny dot.
  const dotBg = `conic-gradient(${dotColor} ${pct * 360}deg, #E5E5E5 0deg)`;

  const tooLongWarn = remaining <= MAX_LEN - WARN_THRESHOLD ? remaining : null;

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
                className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-[10px] text-[12px] font-bold transition-colors"
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
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            maxLength={MAX_LEN}
            rows={6}
            autoFocus
            className="w-full px-4 py-4 text-[15px] leading-[1.5] outline-none resize-none placeholder:text-gray-400"
            style={{ background: "transparent", color: "#0A0A0A" }}
          />

          {/* Quick-action chips. Stubs for now — tapping shows a
              "coming soon" inline badge so the affordance is clear
              without breaking compose focus. */}
          <div
            className="flex items-center gap-2 flex-wrap px-3 pb-2"
            aria-label="Quick actions"
          >
            <ChipStub
              icon={<ReceiptIcon className="w-3 h-3" />}
              label="Attach Receipt"
              active={chipHint === "receipt"}
              onClick={() => setChipHint("receipt")}
            />
            <ChipStub
              icon={<Hash className="w-3 h-3" />}
              label="Tag Hackathon"
              active={chipHint === "hackathon"}
              onClick={() => setChipHint("hackathon")}
            />
            <ChipStub
              icon={<AtSign className="w-3 h-3" />}
              label="@-mention"
              active={chipHint === "mention"}
              onClick={() => setChipHint("mention")}
            />
            {chipHint && (
              <span
                className="text-[10px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
                style={{ background: "#FAFAF7", color: "#A3A3A3", border: "1px solid #EBEBEB" }}
                role="status"
              >
                Coming soon
              </span>
            )}
          </div>

          <div
            className="flex items-center justify-between gap-3 px-3 py-2"
            style={{ background: "#FAFAF7", borderTop: "1px solid #EBEBEB" }}
          >
            <div className="flex items-center gap-2">
              {/* Progress dot — fills as you type, color shifts at thresholds */}
              <span
                aria-hidden
                className="inline-block w-3.5 h-3.5 rounded-full"
                style={{
                  background: dotBg,
                  // Inner hole to make it feel like a ring once filled.
                  boxShadow: "inset 0 0 0 3px #FAFAF7",
                  transition: "background 120ms linear",
                }}
              />
              <span
                className="text-[11px] tabular-nums"
                style={{
                  color:
                    text.length >= MAX_LEN
                      ? "#DC2626"
                      : text.length >= WARN_THRESHOLD
                        ? "#B45309"
                        : "#737373",
                }}
                aria-label={`${text.length} of ${MAX_LEN} characters used`}
              >
                {tooLongWarn !== null ? tooLongWarn : `${text.length}/${MAX_LEN}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 hidden sm:inline">
                <kbd
                  className="font-mono text-[10px] px-1 py-px rounded"
                  style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
                >
                  ⌘↵
                </kbd>{" "}
                to post
              </span>
              <button
                type="button"
                onClick={onSubmit}
                disabled={posting || posted || text.trim().length < 3}
                className="inline-flex items-center justify-center gap-1 rounded-[10px] px-4 h-11 sm:h-9 min-w-[88px] text-[13px] font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{
                  background: posted ? "#16A34A" : "#0A0A0A",
                  color: "#FFFFFF",
                }}
                aria-live="polite"
              >
                {posted ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Posted
                  </>
                ) : posting ? (
                  "Posting…"
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-[12px] text-red-600 font-semibold">{error}</p>
        )}

        {/* ── Live preview ───────────────────────────── */}
        <div className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-2">
            Preview
          </p>
          <div
            className="rounded-[14px] overflow-hidden"
            style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
          >
            <FeedCard post={previewPost} preview />
          </div>
        </div>

        {!text && (
          <div className="mt-6 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
              Try
            </p>
            <div className="flex flex-wrap gap-2">
              {(kind === "build"
                ? [
                    "Adding citation discipline to my RAG agent",
                    "Refactoring the multistep agent's retry logic",
                    "Wiring Cursor → my hosted MCP",
                  ]
                : kind === "ship"
                  ? [
                      "Shipped v0.3 — Receipts now stream live",
                      "Webhook idempotency under load: solved",
                      "First Receipt minted from Cursor",
                    ]
                  : kind === "discuss"
                    ? [
                        "What's the right Tool-Choice IQ target for senior IC?",
                        "How are folks tuning their grader prompts?",
                        "Best Brief for testing recovery skill?",
                      ]
                    : [
                        "Just minted — check the trace",
                        "First top-quartile Receipt for me",
                        "https://antry.com/receipts/...",
                      ]
              ).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setText(q);
                    textareaRef.current?.focus();
                  }}
                  className="text-left text-[12px] rounded-[10px] px-3 h-9 transition-colors hover:bg-[#FFFFFF]"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #EBEBEB",
                    color: "#0A0A0A",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChipStub({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 h-7 text-[11px] font-semibold transition-colors"
      style={{
        background: active ? "#0A0A0A" : "#FAFAF7",
        color: active ? "#FFFFFF" : "#525252",
        border: "1px solid #EBEBEB",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
