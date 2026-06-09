"use client";

/**
 * Outreach drawer — the conversion moment of the Scout funnel.
 *
 * Opens from the "Reach out" CTA on Scout results and Compare columns.
 * On open it asks /api/scout/outreach for a draft personalized to the
 * candidate's Receipt evidence (Claude Sonnet 4.6 when the key is set,
 * deterministic template otherwise — `drafter` tells us which). The
 * recruiter can add role context and re-draft, edit inline, then copy
 * or hand off to their mail client.
 *
 * Same design tokens as ScoutClient: white card, #EBEBEB hairline,
 * #3B82F6 accent, pure-CSS keyframes (no framer-motion).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  Copy,
  Mail,
  RefreshCw,
  Send,
  X,
} from "lucide-react";

export type OutreachTarget = {
  receipt_id: string;
  builder_username: string;
  builder_name: string;
  builder_gradient?: string;
  brief_title: string;
  composite_score: number;
};

type DraftResponse =
  | {
      subject: string;
      message: string;
      drafter: string;
      warning?: string;
    }
  | { error: string; message?: string };

export function OutreachDrawer({
  target,
  onClose,
}: {
  /** The candidate to draft for; null keeps the drawer closed. */
  target: OutreachTarget | null;
  onClose: () => void;
}) {
  const [context, setContext] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [drafter, setDrafter] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Tracks which receipt the current draft belongs to, so reopening on
  // a different candidate re-drafts instead of showing stale copy.
  const draftedFor = useRef<string | null>(null);

  const draft = useCallback(
    async (t: OutreachTarget, roleContext: string) => {
      setDrafting(true);
      setError(null);
      try {
        const res = await fetch("/api/scout/outreach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receipt_id: t.receipt_id,
            context: roleContext.trim() || undefined,
          }),
        });
        const j = (await res.json()) as DraftResponse;
        if ("error" in j) {
          setError(j.message ?? "Drafting failed. Try again.");
        } else {
          setSubject(j.subject);
          setMessage(j.message);
          setDrafter(j.drafter);
          draftedFor.current = t.receipt_id;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Network error");
      } finally {
        setDrafting(false);
      }
    },
    []
  );

  // Auto-draft when the drawer opens on a new candidate.
  useEffect(() => {
    if (target && draftedFor.current !== target.receipt_id) {
      setContext("");
      setSubject("");
      setMessage("");
      setDrafter("");
      setError(null);
      setCopied(false);
      void draft(target, "");
    }
  }, [target, draft]);

  // Escape closes — recruiters live on the keyboard.
  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, onClose]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `Subject: ${subject}\n\n${message}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (permissions/http) — the text is still
      // selectable in the editor, so fail quietly.
    }
  };

  const mailtoHref = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  const open = target !== null;

  return (
    <>
      <style jsx>{`
        @keyframes drawerIn {
          0% {
            opacity: 0;
            transform: translateX(24px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes sheetIn {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .outreach-overlay {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .outreach-panel {
          animation: drawerIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (max-width: 639px) {
          .outreach-panel {
            animation-name: sheetIn;
          }
        }
        @keyframes draftPulse {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .outreach-pulse {
          animation: draftPulse 1s ease-in-out infinite;
        }
      `}</style>

      {open && target && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`Reach out to ${target.builder_name}`}
        >
          {/* Scrim */}
          <button
            type="button"
            aria-label="Close outreach drawer"
            onClick={onClose}
            className="absolute inset-0 outreach-overlay cursor-default"
            style={{ background: "rgba(10,10,10,0.32)" }}
          />

          {/* Panel — right drawer on desktop, bottom sheet on mobile. */}
          <div
            className="outreach-panel relative w-full sm:w-[440px] sm:h-full max-h-[88vh] sm:max-h-none flex flex-col rounded-t-[14px] sm:rounded-none overflow-hidden"
            style={{
              background: "#FAFAF7",
              borderLeft: "1px solid #EBEBEB",
              boxShadow: "-12px 0 40px -12px rgba(10,10,10,0.18)",
            }}
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-[3px] z-10"
              style={{ background: "#3B82F6" }}
            />

            {/* Header */}
            <div
              className="flex items-start gap-3 px-5 pt-6 pb-4 shrink-0"
              style={{
                background: "#FFFFFF",
                borderBottom: "1px solid #EBEBEB",
              }}
            >
              <span
                aria-hidden
                className="inline-flex items-center justify-center rounded-full w-10 h-10 font-display font-bold text-[15px] shrink-0"
                style={{
                  background:
                    target.builder_gradient ??
                    "linear-gradient(135deg, #0A0A0A 0%, #525252 100%)",
                  color: "#FFFFFF",
                  boxShadow: "0 0 0 1px rgba(10,10,10,0.06)",
                }}
              >
                {target.builder_name.trim().charAt(0).toUpperCase() || "?"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
                  Reach out
                </p>
                <p className="text-[15px] font-bold text-black truncate">
                  {target.builder_name}
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  {target.brief_title} ·{" "}
                  <span className="font-mono text-black">
                    {target.composite_score}/100
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex items-center justify-center rounded-[10px] w-9 h-9 transition-colors hover:bg-[#FAFAF7] shrink-0"
                style={{ border: "1px solid #EBEBEB", color: "#0A0A0A" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Role context + re-draft */}
              <div
                className="rounded-[14px] p-3"
                style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
              >
                <label
                  htmlFor="outreach-context"
                  className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500"
                >
                  Role context · optional
                </label>
                <textarea
                  id="outreach-context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  maxLength={400}
                  rows={2}
                  placeholder="Senior agent engineer, prod RAG, ships fast — Scout weaves it into the draft"
                  className="mt-2 w-full resize-none text-[13px] leading-[1.5] outline-none bg-transparent text-black placeholder:text-gray-400"
                />
                <div className="mt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => target && draft(target, context)}
                    disabled={drafting}
                    className="inline-flex items-center gap-1.5 rounded-[10px] px-3 h-8 text-[12px] font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "#0A0A0A", color: "#FFFFFF" }}
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${drafting ? "animate-spin" : ""}`}
                    />
                    {drafting ? "Drafting…" : "Re-draft"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-[13px] text-red-600 font-semibold">
                  {error}
                </p>
              )}

              {/* Draft editor */}
              {drafting && !subject ? (
                <div className="space-y-3" aria-busy>
                  <p className="text-[11px] text-gray-500 inline-flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className="inline-block w-1.5 h-1.5 rounded-full outreach-pulse"
                      style={{ background: "#3B82F6" }}
                    />
                    Reading {target.builder_name.split(" ")[0]}&apos;s
                    Receipt…
                  </p>
                  <div
                    className="rounded-[14px]"
                    style={{
                      height: 220,
                      background: "#FFFFFF",
                      border: "1px solid #EBEBEB",
                    }}
                  />
                </div>
              ) : subject ? (
                <div
                  className="rounded-[14px] overflow-hidden"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #EBEBEB",
                  }}
                >
                  <div
                    className="px-3 py-2.5"
                    style={{ borderBottom: "1px solid #EBEBEB" }}
                  >
                    <label
                      htmlFor="outreach-subject"
                      className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500"
                    >
                      Subject
                    </label>
                    <input
                      id="outreach-subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1 w-full text-[13px] font-semibold outline-none bg-transparent text-black"
                    />
                  </div>
                  <div className="px-3 py-2.5">
                    <label
                      htmlFor="outreach-message"
                      className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500"
                    >
                      Message
                    </label>
                    <textarea
                      id="outreach-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={11}
                      className="mt-1 w-full resize-none text-[13px] leading-[1.6] outline-none bg-transparent text-black"
                    />
                  </div>
                </div>
              ) : null}

              {/* Drafter attribution — same pattern as the Scout
                  "Ranked by" line, so users always know which brain
                  produced what they're reading. */}
              {drafter && (
                <p className="text-[11px] text-gray-500 inline-flex items-center gap-1.5">
                  <Bot className="w-3 h-3" />
                  Drafted by{" "}
                  <span className="font-mono text-black">
                    {drafter === "template"
                      ? "template (set ANTHROPIC_API_KEY for personalized drafts)"
                      : drafter}
                  </span>
                </p>
              )}
            </div>

            {/* Footer actions */}
            <div
              className="flex items-center gap-2 px-5 py-4 shrink-0"
              style={{
                background: "#FFFFFF",
                borderTop: "1px solid #EBEBEB",
              }}
            >
              <button
                type="button"
                onClick={onCopy}
                disabled={!subject || drafting}
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-10 text-[12px] font-semibold transition-colors flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EBEBEB",
                  color: "#0A0A0A",
                }}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" style={{ color: "#3B82F6" }} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy draft
                  </>
                )}
              </button>
              <a
                href={subject && !drafting ? mailtoHref : undefined}
                aria-disabled={!subject || drafting}
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 h-10 text-[12px] font-bold transition-transform hover:-translate-y-0.5 flex-1 aria-disabled:opacity-40 aria-disabled:pointer-events-none"
                style={{ background: "#3B82F6", color: "#FFFFFF" }}
              >
                <Mail className="w-3.5 h-3.5" />
                Open in email
                <Send className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
