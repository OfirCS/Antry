"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
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
        stroke="#F5F5F5"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={percent === 100 ? "#22C55E" : "#C6F135"}
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
          <div className="h-8 bg-[#F5F5F5] rounded-lg w-48" />
          <div className="h-4 bg-[#F5F5F5] rounded-lg w-32" />
          <div className="flex gap-3 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#F5F5F5] rounded-xl flex-1" />
            ))}
          </div>
          <div className="h-px bg-[#F5F5F5] mt-6" />
          <div className="space-y-3 mt-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-[#F5F5F5] rounded-xl" />
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
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#737373] group-hover:text-[#111111] transition-colors">
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
              <p className="text-[13px] text-[#A3A3A3]">
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
      {showOnboarding && (
        <div className="mb-10 rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[#F5F5F5] bg-[#FAFAF7]">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(198,241,53,0.18)" }}>
                <Sparkles className="w-3.5 h-3.5 text-[#0A0A0A]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#111111] tracking-tight">Get set up</p>
                <p className="text-[11px] text-[#A3A3A3] tabular-nums">
                  {completedSteps}/{onboardingSteps.length} complete
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {onboardingSteps.map((s) => (
                <span
                  key={s.key}
                  className="h-1.5 w-6 rounded-full transition-colors"
                  style={{ background: s.done ? "#C6F135" : "#EBEBEB" }}
                />
              ))}
            </div>
          </div>
          <ul className="divide-y divide-[#F5F5F5]">
            {onboardingSteps.map((s) => (
              <li key={s.key}>
                <Link
                  href={s.href}
                  className="flex items-center gap-3.5 px-5 py-3.5 group hover:bg-[#FAFAFA] transition-colors"
                >
                  <span
                    className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 border transition-colors"
                    style={{
                      background: s.done ? "#C6F135" : "transparent",
                      borderColor: s.done ? "#C6F135" : "#D4D4D4",
                      color: s.done ? "#0A0A0A" : "#737373",
                    }}
                  >
                    {s.done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : s.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[14px] font-medium text-[#111111]"
                      style={{ textDecoration: s.done ? "line-through" : "none", opacity: s.done ? 0.5 : 1 }}
                    >
                      {s.title}
                    </p>
                    <p className="text-[12px] text-[#A3A3A3]">{s.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#D4D4D4] group-hover:text-[#111111] transition-colors shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Quick actions ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          {
            label: "Submit project",
            href: "/submit",
            icon: <Plus className="w-[18px] h-[18px]" />,
            iconBg: "bg-[#C6F135]",
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
            iconBg: "bg-[#F5F5F5]",
            iconColor: "text-[#525252]",
          },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex flex-col items-center gap-2.5 rounded-xl border border-[#EBEBEB] bg-white p-4 hover:border-[#D4D4D4] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200"
          >
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center ${action.iconBg} ${action.iconColor} group-hover:scale-105 transition-transform duration-200`}
            >
              {action.icon}
            </div>
            <span className="text-[13px] font-medium text-[#525252] group-hover:text-[#111111] transition-colors">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* ── Your projects ────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-[#111111]">Your projects</h2>
          <span className="text-[12px] text-[#A3A3A3] tabular-nums">{projects.length}</span>
        </div>

        {projects.length === 0 ? (
          <Link
            href="/submit"
            className="group flex items-center gap-4 rounded-xl border border-dashed border-[#D4D4D4] bg-[#FAFAFA] p-5 hover:border-[#C6F135] hover:bg-[#C6F135]/5 transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-lg bg-[#C6F135]/15 flex items-center justify-center shrink-0 group-hover:bg-[#C6F135]/25 transition-colors">
              <Rocket className="w-[18px] h-[18px] text-[#111111]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#111111]">Ship your first project</p>
              <p className="text-[13px] text-[#A3A3A3]">
                Showcase your work and get discovered by the community.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#D4D4D4] group-hover:text-[#111111] transition-colors shrink-0" />
          </Link>
        ) : (
          <div className="rounded-xl border border-[#EBEBEB] bg-white divide-y divide-[#F5F5F5] overflow-hidden">
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
                <div className="flex items-center gap-1 text-[12px] text-[#737373] tabular-nums shrink-0">
                  <Heart className="w-3 h-3" />
                  {project.likes_count}
                </div>

                {/* Edit */}
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="h-7 w-7 flex items-center justify-center rounded-md text-[#A3A3A3] hover:text-[#111111] hover:bg-[#F5F5F5] transition-all duration-150 shrink-0 opacity-0 group-hover:opacity-100"
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
                    className="h-7 w-7 flex items-center justify-center rounded-md text-[#A3A3A3] hover:text-[#111111] hover:bg-[#F5F5F5] transition-all duration-150 shrink-0 opacity-0 group-hover:opacity-100"
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
                    className="h-7 w-7 flex items-center justify-center rounded-md text-[#A3A3A3] hover:text-[#EF4444] hover:bg-red-50 transition-all duration-150"
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
        <div className="mb-10 rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[#F5F5F5]">
            <div>
              <p className="text-[13px] font-bold text-[#111111] tracking-tight">Invite a builder</p>
              <p className="text-[12px] text-[#A3A3A3] mt-0.5">
                You have invites. Friends who use this link skip the waitlist.
              </p>
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-1 rounded"
              style={{ background: "rgba(198,241,53,0.18)", color: "#0A0A0A" }}
            >
              Beta perk
            </span>
          </div>
          <div className="px-5 py-4 flex items-center gap-3">
            <code className="flex-1 min-w-0 text-[13px] font-mono text-[#525252] truncate">
              {inviteUrl || `Code: ${profileData.invite_code}`}
            </code>
            <button
              type="button"
              onClick={handleCopyInvite}
              disabled={!inviteUrl}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 h-8 text-[12px] font-semibold transition-colors shrink-0 disabled:opacity-50"
              style={{ background: "#0A0A0A", color: "#fff" }}
            >
              {inviteCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy link
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Activity ─────────────────────────────────────── */}
      <div>
        <h2 className="text-[15px] font-semibold text-[#111111] mb-4">Activity</h2>
        {activities.length === 0 ? (
          <p className="text-[13px] text-[#A3A3A3]">No activity yet.</p>
        ) : (
          <div className="space-y-0">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-baseline justify-between py-2 text-[13px]"
              >
                <span className="text-[#525252] truncate mr-4">{activity.text}</span>
                <span className="text-[#A3A3A3] text-[12px] tabular-nums shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
