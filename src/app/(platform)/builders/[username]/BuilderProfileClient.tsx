"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  Github,
  Globe,
  Heart,
  Pencil,
  Play,
  Twitter,
  Users,
} from "lucide-react";
import { getInitials } from "@/lib/mock-data";
import { useAuth } from "@/lib/supabase/auth-context";

interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description?: string;
  gradient: string;
  likes: number;
  demoUrl: string;
  sourceUrl?: string;
  techStack: string[];
  buildTime?: string;
  category?: string;
  createdAt?: string;
}

interface SponsorItem {
  name: string;
  tier: string;
}

interface HackathonItem {
  id: string;
  title: string;
  theme: string;
  status: "active" | "upcoming" | "completed";
  gradient?: string;
  prizes: { place: string; reward: string }[];
  participantCount: number;
  submissionCount?: number;
  startDate?: string;
  endDate?: string;
  sponsors?: SponsorItem[];
}

interface OutsideProjectItem {
  title: string;
  url: string;
  description: string;
}

interface BuilderData {
  username: string;
  name: string;
  tagline: string;
  bio: string;
  joinedAt?: string;
  skills: string[];
  gradient: string;
  social: { github?: string; twitter?: string; website?: string };
  outsideProjects?: OutsideProjectItem[];
  projects: ProjectItem[];
  hackathons: HackathonItem[];
}

function resolveProfileHref(
  kind: "github" | "twitter" | "website",
  raw?: string
) {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (kind === "github") {
    return `https://github.com/${trimmed.replace(/^@/, "")}`;
  }

  if (kind === "twitter") {
    return `https://x.com/${trimmed.replace(/^@/, "")}`;
  }

  return `https://${trimmed.replace(/^https?:\/\//i, "")}`;
}

export default function BuilderProfileClient({
  builder,
}: {
  builder: BuilderData | null;
}) {
  const { user } = useAuth();

  const isOwner = builder
    ? user?.user_metadata?.username === builder.username ||
      user?.email?.split("@")[0] === builder.username
    : false;

  if (!builder) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-8"
        style={{ background: "#F7F8FA" }}
      >
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F4F6]">
            <Users className="h-6 w-6 text-[#9CA3AF]" />
          </div>
          <p className="mb-4 text-[15px] text-[#6B7280]">
            This builder hasn&apos;t joined yet.
          </p>
          <Link
            href="/builders"
            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#111111] transition-colors hover:text-[#20F5A0]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to the directory
          </Link>
        </div>
      </div>
    );
  }

  const socialLinks = [
    builder.social.github
      ? {
          key: "github",
          href: resolveProfileHref("github", builder.social.github),
          icon: Github,
          label: "GitHub",
        }
      : null,
    builder.social.twitter
      ? {
          key: "twitter",
          href: resolveProfileHref("twitter", builder.social.twitter),
          icon: Twitter,
          label: "X",
        }
      : null,
    builder.social.website
      ? {
          key: "website",
          href: resolveProfileHref("website", builder.social.website),
          icon: Globe,
          label: "Website",
        }
      : null,
  ].filter(Boolean) as {
    key: string;
    href?: string;
    icon: typeof Github;
    label: string;
  }[];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111111]">
      {/* Hero */}
      <div className="border-b border-[#E8E4DA]">
        <div className="mx-auto max-w-3xl px-6 pb-10 pt-10 sm:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/builders"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6B7280] transition-colors hover:text-[#111111]"
            >
              <ArrowLeft className="h-4 w-4" />
              Builders
            </Link>

            {isOwner ? (
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6B7280] transition-colors hover:text-[#111111]"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
            ) : null}
          </div>

          <div className="mt-8 flex items-start gap-5">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-[22px] font-semibold text-white"
              style={{ background: builder.gradient }}
            >
              {getInitials(builder.name)}
            </div>

            <div className="min-w-0 pt-1">
              <h1 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-[#111111]">
                {builder.name}
              </h1>
              <p className="mt-1 text-[15px] text-[#6B7280]">
                {builder.tagline}
              </p>
            </div>
          </div>

          {/* Skills */}
          {builder.skills.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {builder.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[#E8E4DA] bg-white px-3 py-1 text-[12px] font-medium text-[#57534E]"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Social icons */}
          {socialLinks.length > 0 && (
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E4DA] bg-white text-[#57534E] transition-colors hover:border-[#C6C0B3] hover:text-[#111111]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#8E8A7E]">
          Projects
        </h2>

        {builder.projects.length > 0 ? (
          <div className="mt-5 space-y-4">
            {builder.projects.map((project) => (
              <div
                key={project.id}
                className="group rounded-lg border border-[#E8E4DA] bg-white p-5 transition-colors hover:border-[#D2CBB9]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#111111]">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-[#57534E]">
                      {project.tagline}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 pt-1 text-[13px] text-[#8E8A7E]">
                    <Heart className="h-3.5 w-3.5" />
                    {project.likes}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {project.techStack.map((stack) => (
                    <span
                      key={stack}
                      className="rounded-full bg-[#F5F3EC] px-2.5 py-1 text-[11px] font-medium text-[#57534E]"
                    >
                      {stack}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#111111] transition-colors hover:text-[#57534E]"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Demo
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                  {project.sourceUrl && (
                    <a
                      href={project.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6B7280] transition-colors hover:text-[#111111]"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      Source
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-[14px] text-[#6B7280]">No projects yet.</p>
        )}
      </div>

      {/* Receipts (Antry Receipts integration) */}
      <BuilderReceipts username={builder.username} />
    </div>
  );
}

function BuilderReceipts({ username }: { username: string }) {
  // Demo-data sourced — when Supabase has receipts, this becomes a real query.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getDemoReceiptsForBuilder } = require("@/lib/receipts/demo-data") as typeof import("@/lib/receipts/demo-data");
  const receipts = getDemoReceiptsForBuilder(username);
  if (receipts.length === 0) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-2">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#8E8A7E]">
          Receipts
          <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded" style={{ background: "rgba(32,245,160,0.30)", color: "#0A0A0A" }}>
            New
          </span>
        </h2>
        <Link
          href="/briefs"
          className="text-[12px] font-semibold text-[#111111] hover:underline underline-offset-2"
        >
          Earn one →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {receipts.map((r) => (
          <Link
            key={r.id}
            href={`/receipts/${r.id}`}
            className="group rounded-lg border border-[#E8E4DA] bg-white p-4 transition-colors hover:border-[#D2CBB9]"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
                style={{ background: r.company.sponsor_color, color: "#FFFFFF" }}
              >
                {r.company.name}
              </span>
              <span className="text-[11px] text-[#8E8A7E] tabular-nums">
                Score {r.composite_score}
              </span>
            </div>
            <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-[#111111] line-clamp-2">
              {r.brief_title}
            </h3>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[#8E8A7E]">
              <span>{r.tokens_spent.toLocaleString()} tokens</span>
              <span>{Math.round(r.attempt_duration_seconds / 60)}m</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
