"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  Github,
  ExternalLink,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import { previewBuilderCard, claimBuilderCard } from "./actions";
import type { BuilderCardPreview } from "@/lib/discovery/profile-card";

const ease = [0.16, 1, 0.3, 1] as const;

const SAMPLES = ["vercel", "shadcn", "supabase", "anthropics"];

export function ClaimCardClient() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<BuilderCardPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewing, startPreview] = useTransition();
  const [isClaiming, startClaim] = useTransition();
  const [claimResult, setClaimResult] = useState<
    | { ok: true; username: string; created: number }
    | { ok: false; message: string }
    | null
  >(null);

  function runPreview(username: string) {
    setError(null);
    setClaimResult(null);
    setPreview(null);
    startPreview(async () => {
      const result = await previewBuilderCard(username);
      if (result.ok) {
        setPreview(result.card);
      } else {
        setError(result.error);
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runPreview(input);
  }

  function handleClaim() {
    if (!preview) return;
    setClaimResult(null);
    startClaim(async () => {
      const result = await claimBuilderCard(preview.username);
      if (result.ok) {
        setClaimResult({ ok: true, username: result.profileUsername, created: result.createdProjects });
      } else {
        const message =
          result.reason === "not_authenticated"
            ? "Sign in to claim this card."
            : result.reason === "username_taken"
              ? "Your GitHub username is taken on Antry. Edit it from /settings after claiming."
              : result.error || "Couldn't claim — try again.";
        setClaimResult({ ok: false, message });
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Search box */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="rounded-[20px] bg-white border border-gray-200 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.25)] p-3 sm:p-4 flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1 flex items-center gap-3 px-4 h-[56px] rounded-xl border border-gray-200 focus-within:border-black focus-within:shadow-[0_0_0_3px_rgba(198,241,53,0.25)] transition-all">
          <Github className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="github.com/username  or  @username"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
          />
        </div>
        <button
          type="submit"
          disabled={isPreviewing || input.trim().length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-6 h-[56px] text-[15px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "#C6F135", color: "#111" }}
        >
          {isPreviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Generate card
        </button>
      </motion.form>

      <div className="flex items-center gap-3 flex-wrap text-[13px] text-gray-500">
        <span>Try:</span>
        {SAMPLES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setInput(s);
              runPreview(s);
            }}
            className="px-3 py-1 rounded-full border border-gray-200 hover:border-black hover:text-black transition-colors text-[12px] font-medium"
          >
            {s}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {error && !preview && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[14px] text-red-700">{error}</p>
          </motion.div>
        )}

        {preview && (
          <motion.section
            key={preview.username}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="space-y-6"
          >
            {/* Builder header */}
            <div className="rounded-[24px] bg-white border border-gray-200 overflow-hidden">
              <div className="h-24" style={{ background: "linear-gradient(135deg, #C6F135 0%, #A8D82E 50%, #8BC34A 100%)" }} />
              <div className="px-6 pb-6 sm:px-8 sm:pb-8">
                <div className="-mt-12 flex items-end justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {preview.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview.avatar_url}
                        alt={preview.name}
                        width={88}
                        height={88}
                        className="h-[88px] w-[88px] rounded-full border-4 border-white shadow-md object-cover"
                      />
                    ) : (
                      <div className="h-[88px] w-[88px] rounded-full border-4 border-white shadow-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                        {preview.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="pb-2">
                      <h2 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-black font-display">
                        {preview.name}
                      </h2>
                      <p className="text-[14px] text-gray-500">@{preview.username}</p>
                    </div>
                  </div>

                  <a
                    href={`https://github.com/${preview.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-black transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    View on GitHub
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {preview.bio && (
                  <p className="mt-5 text-[14px] leading-relaxed text-gray-600 max-w-[640px]">{preview.bio}</p>
                )}

                {/* Scout summary */}
                <div className="mt-5 rounded-xl p-4 flex items-start gap-3" style={{ background: "rgba(198,241,53,0.10)", border: "1px solid rgba(198,241,53,0.25)" }}>
                  <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#0A0A0A" }} />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-700">Scout summary</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-black">{preview.scout_summary}</p>
                  </div>
                </div>

                {/* Skills */}
                {preview.inferred_skills.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {preview.inferred_skills.map((s) => (
                      <span
                        key={s}
                        className="text-[12px] font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats row */}
                <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 pt-5 border-t border-gray-100 text-[13px]">
                  <Stat label="Top projects" value={preview.projects.length.toString()} />
                  <Stat label="Public repos" value={preview.public_repos.toString()} />
                  <Stat label="Followers" value={preview.followers.toString()} />
                  {preview.location && <Stat label="Based in" value={preview.location} />}
                </div>
              </div>
            </div>

            {/* Top scored projects */}
            <div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-gray-500">Top scored projects</p>
                  <h3 className="mt-1 text-[20px] font-bold tracking-tight text-black">
                    The 6 projects we&apos;d pin to your Antry profile
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {preview.projects.length === 0 && (
                  <p className="col-span-full text-[14px] text-gray-500">
                    No public shipped projects detected yet. Push something this weekend.
                  </p>
                )}
                {preview.projects.map((p) => (
                  <div key={p.full_name} className="rounded-[16px] border border-gray-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[16px] font-bold tracking-tight text-black truncate">{p.title}</h4>
                        <p className="text-[12px] text-gray-500 truncate">{p.full_name}</p>
                      </div>
                      <span
                        className="text-[12px] font-bold px-2 py-1 rounded-md shrink-0"
                        style={{ background: "rgba(198,241,53,0.18)", color: "#0A0A0A" }}
                      >
                        {p.score}
                      </span>
                    </div>
                    {p.tagline && (
                      <p className="mt-3 text-[13px] leading-relaxed text-gray-600 line-clamp-3">{p.tagline}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tech_stack.slice(0, 4).map((t) => (
                        <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-3 text-[12px] text-gray-500">
                      <a href={p.repo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-black">
                        <Github className="w-3 h-3" /> Repo
                      </a>
                      {p.demo_url && (
                        <a href={p.demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-black">
                          <ExternalLink className="w-3 h-3" /> Demo
                        </a>
                      )}
                      {typeof p.stars === "number" && p.stars > 0 && (
                        <span>★ {p.stars.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Claim CTA */}
            <div className="rounded-[20px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between" style={{ background: "#0A0A0A", color: "#fff" }}>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C6F135" }}>
                  Looks like you?
                </p>
                <p className="mt-2 text-[18px] font-bold tracking-tight">
                  Claim this card and we&apos;ll import {preview.projects.length} projects to your Antry profile.
                </p>
                <p className="mt-1 text-[13px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                  You can edit, hide, or delete anything afterward — nothing is final.
                </p>
              </div>

              {!user ? (
                <Link
                  href={`/signup?redirect=${encodeURIComponent(`/claim-card?u=${preview.username}`)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 h-[48px] text-[14px] font-semibold whitespace-nowrap"
                  style={{ background: "#C6F135", color: "#111" }}
                >
                  <Github className="w-4 h-4" /> Sign up & claim
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 h-[48px] text-[14px] font-semibold whitespace-nowrap disabled:opacity-50"
                  style={{ background: "#C6F135", color: "#111" }}
                >
                  {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isClaiming ? "Claiming..." : "Claim this card"}
                </button>
              )}
            </div>

            {claimResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl px-4 py-3 flex items-start gap-3 text-[14px] ${
                  claimResult.ok
                    ? "bg-[rgba(198,241,53,0.15)] border border-[rgba(198,241,53,0.4)] text-black"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {claimResult.ok ? (
                  <>
                    <Check className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">
                        Claimed. {claimResult.created} project{claimResult.created === 1 ? "" : "s"} imported.
                      </p>
                      <Link href={`/builders/${claimResult.username}`} className="underline font-semibold">
                        See your profile →
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{claimResult.message}</p>
                  </>
                )}
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">{label}</p>
      <p className="mt-0.5 text-[15px] font-bold text-black">{value}</p>
    </div>
  );
}
