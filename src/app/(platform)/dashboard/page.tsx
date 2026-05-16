"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ArrowRight,
  Pencil,
  ArrowUpRight,
  Trophy,
  UserCircle,
  Heart,
  Rocket,
  Trash2,
  Github,
  Check,
  Copy,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/client";
import { deleteProject } from "../actions";

type Project = {
  id: string;
  title: string;
  tagline: string;
  category: string;
  likes_count: number;
  created_at: string;
  demo_url: string | null;
};

type ActivityItem = {
  id: string;
  text: string;
  time: string;
};

// ── Profile completeness calculator ────────────────────

function calculateCompleteness(profile: {
  bio?: string;
  skills?: string[];
  full_name?: string;
  github_url?: string;
  twitter_url?: string;
  website_url?: string;
  avatar_url?: string;
}): number {
  let score = 0;
  const total = 6;
  if (profile.full_name && profile.full_name.trim()) score++;
  if (profile.bio && profile.bio.trim()) score++;
  if (profile.skills && profile.skills.length > 0) score++;
  if (profile.github_url) score++;
  if (profile.twitter_url || profile.website_url) score++;
  if (profile.avatar_url) score++;
  return Math.round((score / total) * 100);
}

// ── Activity generator ────────────────────────────────

function generateActivity(projects: Project[]): ActivityItem[] {
  const activities: ActivityItem[] = [];

  projects.forEach((p) => {
    activities.push({
      id: `created-${p.id}`,
      text: `Shipped "${p.title}"`,
      time: formatRelativeTime(p.created_at),
    });
    if (p.likes_count > 0) {
      activities.push({
        id: `likes-${p.id}`,
        text: `"${p.title}" received ${p.likes_count} signal${p.likes_count !== 1 ? "s" : ""}`,
        time: formatRelativeTime(p.created_at),
      });
    }
  });

  activities.push({
    id: "joined",
    text: "Joined the Antry community",
    time: "Recently",
  });

  return activities.slice(0, 3);
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

// ── Progress ring SVG ─────────────────────────────────

function ProgressRing({
  percent,
  size = 36,
  strokeWidth = 3,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#F3F4F6"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={percent === 100 ? "#22C55E" : "#20F5A0"}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

// ── Main component ─────────────────────────────────────

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<{
    bio?: string;
    skills?: string[];
    full_name?: string;
    username?: string;
    github_url?: string;
    twitter_url?: string;
    website_url?: string;
    avatar_url?: string;
    invite_code?: string;
  }>({});
  const [hasJoinedHackathon, setHasJoinedHackathon] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const supabase = createClient();

      const [projectsResult, profileResult, hackathonsResult] = await Promise.all([
        supabase
          .from("projects")
          .select("id, title, tagline, category, likes_count, created_at, demo_url")
          .eq("builder_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select(
            "bio, skills, full_name, username, github_url, twitter_url, website_url, avatar_url, invite_code"
          )
          .eq("id", user.id)
          .single(),
        supabase
          .from("hackathon_participants")
          .select("hackathon_id", { head: false })
          .eq("user_id", user.id)
          .limit(1),
      ]);

      setProjects(projectsResult.data || []);

      if (profileResult.data) {
        setProfileData(profileResult.data);
      }

      setHasJoinedHackathon(((hackathonsResult.data as unknown[]) || []).length > 0);

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const name =
    user?.user_metadata?.full_name || profileData.full_name || user?.email?.split("@")[0] || "Builder";
  const completeness = calculateCompleteness(profileData);
  const activities = useMemo(() => generateActivity(projects), [projects]);

  const onboardingSteps = [
    {
      key: "profile",
      title: "Finish your profile",
      desc: "Add a bio, skills, and links so Scout can index you.",
      done: completeness >= 80,
      href: "/settings",
      icon: <UserCircle className="w-4 h-4" />,
    },
    {
      key: "import",
      title: "Import a project from GitHub",
      desc: "Paste a username on Antry Card to auto-import your top shipped repos.",
      done: projects.length > 0,
      href: "/claim-card",
      icon: <Github className="w-4 h-4" />,
    },
    {
      key: "hackathon",
      title: "Join the next Antathon",
      desc: "Ship something real in 48 hours alongside other builders.",
      done: hasJoinedHackathon,
      href: "/hackathons",
      icon: <Trophy className="w-4 h-4" />,
    },
  ];

  const completedSteps = onboardingSteps.filter((s) => s.done).length;
  const showOnboarding = completedSteps < onboardingSteps.length;

  const inviteUrl =
    profileData.invite_code && typeof window !== "undefined"
      ? `${window.location.origin}/signup?invite=${encodeURIComponent(profileData.invite_code)}`
      : null;

  const handleCopyInvite = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    });
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-16">
        <div className="animate-pulse space-y-5">
          <div className="h-8 bg-[#F3F4F6] rounded-lg w-48" />
          <div className="h-4 bg-[#F3F4F6] rounded-lg w-32" />
          <div className="flex gap-3 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#F3F4F6] rounded-md flex-1" />
            ))}
          </div>
          <div className="h-px bg-[#F3F4F6] mt-6" />
          <div className="space-y-3 mt-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-[#F3F4F6] rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 py-12 sm:py-16 min-h-screen">
      {/* ── Greeting + profile ring ──────────────────────── */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3.5">
          {completeness < 100 ? (
            <Link href="/settings" className="relative group" title={`Profile ${completeness}% complete`}>
              <ProgressRing percent={completeness} size={40} strokeWidth={3} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#6B7280] group-hover:text-[#111111] transition-colors">
                {completeness}
              </span>
            </Link>
          ) : (
            <div className="relative">
              <ProgressRing percent={100} size={40} strokeWidth={3} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#22C55E]">
                &#10003;
              </span>
            </div>
          )}
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#111111]">
              Hey, {name.split(" ")[0]}
            </h1>
            {completeness < 100 && (
              <p className="text-[13px] text-[#9CA3AF]">
                Profile {completeness}% complete &middot;{" "}
                <Link href="/settings" className="text-[#111111] hover:underline">
                  finish it
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Onboarding checklist (until all steps done) ──── */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 rounded-lg bg-white overflow-hidden relative"
            style={{
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 0 rgba(0,0,0,0.03), 0 12px 32px -16px rgba(0,0,0,0.08)",
            }}
          >
            <div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(32,245,160,0.12) 0%, transparent 70%)",
              }}
            />
            <div className="relative px-5 py-4 flex items-center justify-between border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2.5">
                <motion.div
                  animate={{ rotate: [0, 8, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(32,245,160,0.18)" }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0A0A0A]" />
                </motion.div>
                <div>
                  <p className="text-[13px] font-bold text-[#111111] tracking-tight">Get set up</p>
                  <p className="text-[11px] text-[#9CA3AF] tabular-nums">
                    {completedSteps}/{onboardingSteps.length} complete
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {onboardingSteps.map((s, i) => (
                  <motion.span
                    key={s.key}
                    initial={false}
                    animate={{
                      backgroundColor: s.done ? "#20F5A0" : "#E5E7EB",
                      width: s.done ? 28 : 24,
                    }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="h-1.5 rounded-full"
                  />
                ))}
              </div>
            </div>
            <ul className="divide-y divide-[#F3F4F6]">
              {onboardingSteps.map((s, i) => (
                <motion.li
                  key={s.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={s.href}
                    className="flex items-center gap-3.5 px-5 py-4 group transition-colors"
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = s.done
                        ? "transparent"
                        : "rgba(32,245,160,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <motion.span
                      animate={{
                        background: s.done ? "#20F5A0" : "transparent",
                        borderColor: s.done ? "#20F5A0" : "#D1D5DB",
                        scale: s.done ? [1, 1.15, 1] : 1,
                      }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border"
                      style={{ color: s.done ? "#0A0A0A" : "#6B7280" }}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {s.done ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="icon"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {s.icon}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[14px] font-semibold transition-all"
                        style={{
                          textDecoration: s.done ? "line-through" : "none",
                          color: s.done ? "#9CA3AF" : "#111111",
                        }}
                      >
                        {s.title}
                      </p>
                      <p className="text-[12px] text-[#6B7280]">{s.desc}</p>
                    </div>
                    {!s.done && (
                      <ArrowRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#0A0A0A] group-hover:translate-x-0.5 transition-all shrink-0" />
                    )}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick actions ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          {
            label: "Submit project",
            href: "/submit",
            icon: <Plus className="w-[18px] h-[18px]" />,
            iconBg: "bg-[#20F5A0]",
            iconColor: "text-[#111111]",
          },
          {
            label: "Join hackathon",
            href: "/hackathons",
            icon: <Trophy className="w-[18px] h-[18px]" />,
            iconBg: "bg-[#111111]",
            iconColor: "text-white",
          },
          {
            label: "Edit profile",
            href: "/settings",
            icon: <UserCircle className="w-[18px] h-[18px]" />,
            iconBg: "bg-[#F3F4F6]",
            iconColor: "text-[#4B5563]",
          },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex flex-col items-center gap-2.5 rounded-md border border-[#E5E7EB] bg-white p-4 hover:border-[#D1D5DB] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200"
          >
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center ${action.iconBg} ${action.iconColor} group-hover:scale-105 transition-transform duration-200`}
            >
              {action.icon}
            </div>
            <span className="text-[13px] font-medium text-[#4B5563] group-hover:text-[#111111] transition-colors">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* ── Your projects ────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-[#111111]">Your projects</h2>
          <span className="text-[12px] text-[#9CA3AF] tabular-nums">{projects.length}</span>
        </div>

        {projects.length === 0 ? (
          <Link
            href="/submit"
            className="group flex items-center gap-4 rounded-md border border-dashed border-[#D1D5DB] bg-[#FAFAFA] p-5 hover:border-[#20F5A0] hover:bg-[#20F5A0]/5 transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-lg bg-[#20F5A0]/15 flex items-center justify-center shrink-0 group-hover:bg-[#20F5A0]/25 transition-colors">
              <Rocket className="w-[18px] h-[18px] text-[#111111]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#111111]">Ship your first project</p>
              <p className="text-[13px] text-[#9CA3AF]">
                Showcase your work and get discovered by the community.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#111111] transition-colors shrink-0" />
          </Link>
        ) : (
          <div className="rounded-md border border-[#E5E7EB] bg-white divide-y divide-[#F3F4F6] overflow-hidden">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-3 px-4 py-3 group hover:bg-[#FAFAFA] transition-colors duration-150"
              >
                {/* Title + category */}
                <div className="flex-1 min-w-0 flex items-center gap-2.5">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-[14px] font-medium text-[#111111] hover:underline truncate"
                  >
                    {project.title}
                  </Link>
                  {project.category && (
                    <Badge variant="secondary" className="shrink-0 text-[10px] px-2 py-0.5">
                      {project.category}
                    </Badge>
                  )}
                </div>

                {/* Likes */}
                <div className="flex items-center gap-1 text-[12px] text-[#6B7280] tabular-nums shrink-0">
                  <Heart className="w-3 h-3" />
                  {project.likes_count}
                </div>

                {/* Edit */}
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="h-7 w-7 flex items-center justify-center rounded-md text-[#9CA3AF] hover:text-[#111111] hover:bg-[#F3F4F6] transition-all duration-150 shrink-0 opacity-0 group-hover:opacity-100"
                  title="Edit"
                >
                  <Pencil className="w-3 h-3" />
                </Link>

                {/* Demo link */}
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-7 w-7 flex items-center justify-center rounded-md text-[#9CA3AF] hover:text-[#111111] hover:bg-[#F3F4F6] transition-all duration-150 shrink-0 opacity-0 group-hover:opacity-100"
                    title="Live demo"
                  >
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}

                {/* Delete */}
                <form action={deleteProject} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="hidden" name="project_id" value={project.id} />
                  <button
                    type="submit"
                    className="h-7 w-7 flex items-center justify-center rounded-md text-[#9CA3AF] hover:text-[#EF4444] hover:bg-red-50 transition-all duration-150"
                    title="Delete"
                    onClick={(e) => {
                      if (!confirm("Delete this project?")) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Invite codes ─────────────────────────────────── */}
      {profileData.invite_code && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 rounded-lg bg-white overflow-hidden relative"
          style={{
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
          }}
        >
          <div className="px-5 py-4 flex items-center justify-between border-b border-[#F3F4F6]">
            <div>
              <p className="text-[13px] font-bold text-[#111111] tracking-tight">Invite a builder</p>
              <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                Friends who use this link skip the waitlist.
              </p>
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-1 rounded-md"
              style={{ background: "rgba(32,245,160,0.20)", color: "#0A0A0A" }}
            >
              Beta perk
            </span>
          </div>
          <div className="px-5 py-4 flex items-center gap-3">
            <div
              className="flex-1 min-w-0 text-[13px] font-mono text-[#4B5563] truncate px-3 py-2 rounded-lg"
              style={{ background: "#F7F8FA", border: "1px solid #F3F4F6" }}
            >
              {inviteUrl || `Code: ${profileData.invite_code}`}
            </div>
            <motion.button
              type="button"
              onClick={handleCopyInvite}
              disabled={!inviteUrl}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 h-9 text-[12px] font-semibold transition-all shrink-0 disabled:opacity-50"
              style={{
                background: inviteCopied ? "#20F5A0" : "#0A0A0A",
                color: inviteCopied ? "#0A0A0A" : "#fff",
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {inviteCopied ? (
                  <motion.span
                    key="copied"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={3} /> Copied
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy link
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── Activity ─────────────────────────────────────── */}
      <div>
        <h2 className="text-[15px] font-semibold text-[#111111] mb-4">Activity</h2>
        {activities.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF]">No activity yet.</p>
        ) : (
          <div className="space-y-0">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-baseline justify-between py-2 text-[13px]"
              >
                <span className="text-[#4B5563] truncate mr-4">{activity.text}</span>
                <span className="text-[#9CA3AF] text-[12px] tabular-nums shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
