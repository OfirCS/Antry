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
  TrendingUp,
  MapPin,
  Star,
} from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import { previewBuilderCard, claimBuilderCard } from "./actions";
import type { BuilderCardPreview } from "@/lib/discovery/profile-card";

const ease = [0.16, 1, 0.3, 1] as const;

const SAMPLES = ["demo", "vercel", "shadcn", "supabase"];

const PROJECT_GRADIENTS = [
  "linear-gradient(135deg, #C6F135 0%, #A8D82E 100%)",
  "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
  "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
  "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
  "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)",
  "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
];

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
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
      >
        <form
          onSubmit={handleSubmit}
          className="relative rounded-[24px] bg-white p-2.5 sm:p-3 flex flex-col sm:flex-row gap-2.5 sm:gap-3"
          style={{
            boxShadow:
              "0 1px 0 rgba(0,0,0,0.04), 0 24px 60px -28px rgba(0,0,0,0.35), 0 12px 24px -12px rgba(0,0,0,0.08)",
            border: "1px solid #EBEBEB",
          }}
        >
          <div
            className="flex-1 flex items-center gap-3 px-4 h-[58px] rounded-[16px] transition-all duration-200"
            style={{
              background: "#FAFAF7",
              border: "1px solid transparent",
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#FFFFFF";
              (e.currentTarget as HTMLElement).style.borderColor = "#0A0A0A";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 4px rgba(198,241,53,0.25)";
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#FAFAF7";
              (e.currentTarget as HTMLElement).style.borderColor = "transparent";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <Github className="w-[18px] h-[18px] text-gray-400 shrink-0" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="github.com/username  or  @username"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400 text-gray-900"
            />
          </div>
          <motion.button
            type="submit"
            disabled={isPreviewing || input.trim().length === 0}
            whileHover={isPreviewing || input.trim().length === 0 ? {} : { scale: 1.02 }}
            whileTap={isPreviewing || input.trim().length === 0 ? {} : { scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="relative inline-flex items-center justify-center gap-2 rounded-[16px] px-6 h-[58px] text-[15px] font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden"
            style={{
              background: "#C6F135",
              color: "#0A0A0A",
              boxShadow: "0 6px 18px rgba(198,241,53,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            <AnimatePresence mode="wait">
              {isPreviewing ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate card
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-2.5 flex-wrap text-[13px] text-gray-500"
      >
        <span className="font-medium">Try:</span>
        {SAMPLES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setInput(s);
              runPreview(s);
            }}
            className="px-3 py-1.5 rounded-full border border-gray-200 hover:border-black hover:text-black hover:bg-white transition-all duration-200 text-[12px] font-medium hover:shadow-sm"
          >
            {s}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {isPreviewing && !preview && <PreviewSkeleton />}

        {error && !preview && !isPreviewing && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-4"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-[14px] text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        {preview && (
          <motion.section
            key={preview.username}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease }}
            className="space-y-6"
          >
            <ProfileHeader preview={preview} />
            <ProjectGrid projects={preview.projects} />

            {/* Claim CTA */}
            <ClaimCTA
              preview={preview}
              user={user}
              isClaiming={isClaiming}
              onClaim={handleClaim}
            />

            {claimResult && <ClaimResultBanner result={claimResult} />}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileHeader({ preview }: { preview: BuilderCardPreview }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-[28px] bg-white overflow-hidden"
      style={{
        border: "1px solid #EBEBEB",
        boxShadow: "0 1px 0 rgba(0,0,0,0.03), 0 32px 64px -32px rgba(0,0,0,0.12)",
      }}
    >
      {/* Banner */}
      <div
        className="relative h-32 sm:h-36"
        style={{
          background:
            "linear-gradient(135deg, #C6F135 0%, #A8D82E 50%, #8BC34A 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.1) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="-mt-14 flex items-end justify-between flex-wrap gap-4">
          <div className="flex items-end gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15, ease }}
            >
              {preview.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.avatar_url}
                  alt={preview.name}
                  width={104}
                  height={104}
                  className="h-[104px] w-[104px] rounded-full object-cover"
                  style={{
                    border: "5px solid #FFFFFF",
                    boxShadow: "0 12px 32px -8px rgba(0,0,0,0.18)",
                  }}
                />
              ) : (
                <div
                  className="h-[104px] w-[104px] rounded-full flex items-center justify-center text-white text-[28px] font-bold"
                  style={{
                    background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                    border: "5px solid #FFFFFF",
                    boxShadow: "0 12px 32px -8px rgba(0,0,0,0.18)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {preview.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </motion.div>

            <div className="pb-2">
              <h2 className="text-[24px] sm:text-[28px] font-bold tracking-[-0.02em] text-black font-display leading-tight">
                {preview.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[14px] text-gray-500">@{preview.username}</span>
                {preview.location && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-[13px] text-gray-500 inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {preview.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <a
            href={`https://github.com/${preview.username}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-gray-600 hover:text-black border border-gray-200 hover:border-gray-400 transition-all duration-200 mb-2"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {preview.bio && (
          <p className="mt-5 text-[15px] leading-relaxed text-gray-700 max-w-[640px]">{preview.bio}</p>
        )}

        {/* Scout summary callout */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 rounded-[16px] p-5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(198,241,53,0.14) 0%, rgba(198,241,53,0.06) 100%)",
            border: "1px solid rgba(198,241,53,0.32)",
          }}
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full"
               style={{ background: "radial-gradient(circle, rgba(198,241,53,0.2) 0%, transparent 70%)" }} />
          <div className="relative flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#0A0A0A" }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "#C6F135" }} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-700 mb-1">
                Scout summary
              </p>
              <p className="text-[15px] leading-[1.55] text-black font-medium">
                {preview.scout_summary}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        {preview.inferred_skills.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {preview.inferred_skills.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.04, duration: 0.3, ease }}
                className="text-[12px] font-medium px-3 py-1.5 rounded-full"
                style={{
                  background: "#F5F5F5",
                  color: "#404040",
                }}
              >
                {s}
              </motion.span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 pt-5 border-t border-gray-100">
          <Stat label="Top projects" value={preview.projects.length.toString()} />
          <Stat label="Public repos" value={preview.public_repos.toString()} />
          <Stat label="Followers" value={preview.followers.toLocaleString()} />
          <Stat
            label="On GitHub since"
            value={
              preview.joined_github
                ? new Date(preview.joined_github).getFullYear().toString()
                : "—"
            }
          />
        </div>
      </div>
    </motion.div>
  );
}

function ProjectGrid({ projects }: { projects: BuilderCardPreview["projects"] }) {
  return (
    <div>
      <div className="flex items-end justify-between mb-4 gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
            Top scored projects
          </p>
          <h3 className="mt-1 text-[20px] sm:text-[22px] font-bold tracking-[-0.02em] text-black">
            The {projects.length} projects we&apos;d pin to your Antry profile
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.length === 0 && (
          <p className="col-span-full text-[14px] text-gray-500">
            No public shipped projects detected yet. Push something this weekend.
          </p>
        )}
        {projects.map((p, i) => (
          <ProjectCard key={p.full_name} project={p} index={i} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({
  project: p,
  index,
}: {
  project: BuilderCardPreview["projects"][number];
  index: number;
}) {
  const gradient = PROJECT_GRADIENTS[index % PROJECT_GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.06, duration: 0.4, ease }}
      whileHover={{ y: -3 }}
      className="group rounded-[20px] bg-white overflow-hidden transition-all duration-300"
      style={{
        border: "1px solid #EBEBEB",
        boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 16px 36px -16px rgba(0,0,0,0.15)";
        e.currentTarget.style.borderColor = "#D4D4D4";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 0 rgba(0,0,0,0.03)";
        e.currentTarget.style.borderColor = "#EBEBEB";
      }}
    >
      {/* Gradient header strip */}
      <div className="h-1.5" style={{ background: gradient }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-[16px] font-bold tracking-[-0.015em] text-black truncate">
              {p.title}
            </h4>
            <p className="text-[12px] text-gray-400 truncate mt-0.5">{p.full_name}</p>
          </div>
          <ScoreBadge score={p.score} />
        </div>

        {p.tagline && (
          <p className="mt-3 text-[13px] leading-[1.55] text-gray-600 line-clamp-3">
            {p.tagline}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.tech_stack.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md"
              style={{ background: "#F5F5F5", color: "#525252" }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-[12px] text-gray-500">
          <a
            href={p.repo_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-black transition-colors"
          >
            <Github className="w-3 h-3" /> Repo
          </a>
          {p.demo_url && (
            <a
              href={p.demo_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-black transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Demo
            </a>
          )}
          {typeof p.stars === "number" && p.stars > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star className="w-3 h-3" /> {p.stars.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tier =
    score >= 85 ? { label: "Strong", color: "#0A0A0A", bg: "#C6F135" }
    : score >= 70 ? { label: "Solid", color: "#0A0A0A", bg: "rgba(198,241,53,0.4)" }
    : { label: "Fair", color: "#525252", bg: "#F5F5F5" };

  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 shrink-0"
      style={{ background: tier.bg, color: tier.color }}
    >
      <TrendingUp className="w-3 h-3" />
      <span className="text-[12px] font-bold tabular-nums">{score}</span>
    </div>
  );
}

function ClaimCTA({
  preview,
  user,
  isClaiming,
  onClaim,
}: {
  preview: BuilderCardPreview;
  user: ReturnType<typeof useAuth>["user"];
  isClaiming: boolean;
  onClaim: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease }}
      className="relative rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between overflow-hidden"
      style={{ background: "#0A0A0A", color: "#fff" }}
    >
      {/* Lime glow */}
      <div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(198,241,53,0.20) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex-1 min-w-0">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "#C6F135" }}
        >
          Looks like you?
        </p>
        <p className="mt-2 text-[18px] sm:text-[20px] font-bold tracking-[-0.015em] leading-[1.3]">
          Claim this card and we&apos;ll import {preview.projects.length} project
          {preview.projects.length === 1 ? "" : "s"} to your Antry profile.
        </p>
        <p
          className="mt-1.5 text-[13px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          You can edit, hide, or delete anything afterward — nothing is final.
        </p>
      </div>

      {!user ? (
        <Link
          href={`/signup?redirect=${encodeURIComponent(`/claim-card?u=${preview.username}`)}`}
          className="relative inline-flex items-center justify-center gap-2 rounded-[14px] px-5 h-[52px] text-[14px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5"
          style={{
            background: "#C6F135",
            color: "#0A0A0A",
            boxShadow: "0 8px 24px rgba(198,241,53,0.35)",
          }}
        >
          <Github className="w-4 h-4" /> Sign up & claim
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClaim}
          disabled={isClaiming}
          className="relative inline-flex items-center justify-center gap-2 rounded-[14px] px-5 h-[52px] text-[14px] font-semibold whitespace-nowrap disabled:opacity-50 transition-all hover:-translate-y-0.5"
          style={{
            background: "#C6F135",
            color: "#0A0A0A",
            boxShadow: "0 8px 24px rgba(198,241,53,0.35)",
          }}
        >
          {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {isClaiming ? "Claiming..." : "Claim this card"}
        </button>
      )}
    </motion.div>
  );
}

function ClaimResultBanner({
  result,
}: {
  result:
    | { ok: true; username: string; created: number }
    | { ok: false; message: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl px-5 py-4 flex items-start gap-3 text-[14px]"
      style={{
        background: result.ok ? "rgba(198,241,53,0.16)" : "#FEF2F2",
        border: result.ok ? "1px solid rgba(198,241,53,0.4)" : "1px solid #FECACA",
        color: result.ok ? "#0A0A0A" : "#B91C1C",
      }}
    >
      {result.ok ? (
        <>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#0A0A0A" }}
          >
            <Check className="w-4 h-4" style={{ color: "#C6F135" }} strokeWidth={3} />
          </div>
          <div>
            <p className="font-semibold">
              Claimed. {result.created} project{result.created === 1 ? "" : "s"} imported.
            </p>
            <Link href={`/builders/${result.username}`} className="underline font-semibold mt-0.5 inline-block">
              See your profile →
            </Link>
          </div>
        </>
      ) : (
        <>
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p>{result.message}</p>
        </>
      )}
    </motion.div>
  );
}

function PreviewSkeleton() {
  return (
    <motion.div
      key="skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div
        className="rounded-[28px] bg-white overflow-hidden"
        style={{ border: "1px solid #EBEBEB" }}
      >
        <div
          className="h-32 sm:h-36"
          style={{
            background:
              "linear-gradient(135deg, #C6F135 0%, #A8D82E 50%, #8BC34A 100%)",
            opacity: 0.5,
          }}
        />
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-14 flex items-end gap-4">
            <div
              className="h-[104px] w-[104px] rounded-full bg-gray-200 animate-pulse"
              style={{ border: "5px solid #FFFFFF" }}
            />
            <div className="pb-2 space-y-2">
              <div className="h-7 w-44 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-4 w-32 bg-gray-100 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="mt-6 h-4 w-full bg-gray-100 rounded-md animate-pulse" />
          <div className="mt-2 h-4 w-3/4 bg-gray-100 rounded-md animate-pulse" />
          <div
            className="mt-6 rounded-[16px] p-5"
            style={{
              background:
                "linear-gradient(135deg, rgba(198,241,53,0.14) 0%, rgba(198,241,53,0.06) 100%)",
              border: "1px solid rgba(198,241,53,0.32)",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-900 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-gray-300 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[20px] bg-white overflow-hidden"
            style={{ border: "1px solid #EBEBEB" }}
          >
            <div className="h-1.5 bg-gray-200 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="flex gap-1.5">
                <div className="h-5 w-14 bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-12 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{label}</p>
      <p className="mt-0.5 text-[15px] font-bold text-black tabular-nums">{value}</p>
    </div>
  );
}
