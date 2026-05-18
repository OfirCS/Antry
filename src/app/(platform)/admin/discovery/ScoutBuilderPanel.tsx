"use client";

import { useState, useTransition } from "react";
import {
  Telescope,
  Loader2,
  Star,
  Sparkles,
  ExternalLink,
  GitBranch,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { scoutBuilder } from "./actions";
import type { ScoutResult, ScoutedProject } from "@/lib/discovery/scout-profile";

function ProjectRow({ project }: { project: ScoutedProject }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border-primary bg-background-primary p-3">
      <div className="h-8 w-8 shrink-0 rounded-md bg-accent/10 flex items-center justify-center">
        <span className="text-[12px] font-bold text-accent">
          {project.quality_score}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-semibold text-text-primary">
            {project.title}
          </span>
          {project.is_ai && (
            <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
              AI
            </span>
          )}
          <a
            href={project.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-text-tertiary hover:text-text-primary"
          >
            <GitBranch className="h-3.5 w-3.5" />
          </a>
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-accent hover:text-accent/80"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        {project.tagline && (
          <p className="line-clamp-1 text-[12px] text-text-tertiary">
            {project.tagline}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
          {project.primary_language && <span>{project.primary_language}</span>}
          {project.stars > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3" />
              {project.stars}
            </span>
          )}
          {project.ai_signals.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScoutBuilderPanel() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<ScoutResult | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleScout() {
    const handle = username.trim();
    if (!handle) return;
    setError("");
    setResult(null);
    startTransition(async () => {
      try {
        const res = await scoutBuilder(handle);
        if (res.ok) {
          setResult(res);
        } else {
          setError(res.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Scout failed");
      }
    });
  }

  const profile = result?.ok ? result.profile : null;

  return (
    <div className="mb-8 rounded-md border border-border-primary bg-surface p-5">
      <h3 className="mb-1 flex items-center gap-2 text-[14px] font-semibold text-text-primary">
        <Telescope className="h-4 w-4" />
        Scout a builder
      </h3>
      <p className="mb-3 text-[12px] text-text-tertiary leading-relaxed">
        Enter a GitHub username — Scout scans their public repos, builds an
        AI-first profile, and adds their AI projects to the discovery queue.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleScout();
          }}
          placeholder="GitHub username, e.g. torvalds"
          className="h-9 flex-1 rounded-lg border border-border-primary bg-background-primary px-3 text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <Button
          size="sm"
          onClick={handleScout}
          disabled={isPending || !username.trim()}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Telescope className="mr-1.5 h-3.5 w-3.5" />
              Scout
            </>
          )}
        </Button>
      </div>

      {error && <p className="mt-2 text-[12px] text-red-500">{error}</p>}

      {profile && (
        <div className="mt-5 space-y-4">
          {/* Builder header */}
          <div className="flex items-start gap-3">
            {profile.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="h-12 w-12 rounded-full"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <a
                  href={`https://github.com/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] font-semibold text-text-primary hover:underline"
                >
                  {profile.name}
                </a>
                <span className="text-[12px] text-text-tertiary">
                  @{profile.username}
                </span>
                {result?.ok && result.already_scouted && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                    Existing profile
                  </span>
                )}
              </div>
              {profile.bio && (
                <p className="text-[12px] text-text-tertiary">{profile.bio}</p>
              )}
              <div className="mt-0.5 flex flex-wrap gap-3 text-[11px] text-text-tertiary">
                <span>{profile.followers} followers</span>
                <span>{profile.public_repos} public repos</span>
                {profile.location && <span>{profile.location}</span>}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="flex items-center gap-1 text-[20px] font-bold text-violet-600">
                <Sparkles className="h-4 w-4" />
                {profile.ai_focus_score}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
                AI focus
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-[13px] leading-relaxed text-violet-900">
            {profile.ai_summary}
          </p>

          {/* Skills */}
          {profile.inferred_skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.inferred_skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border-primary bg-background-primary px-2.5 py-1 text-[11px] font-medium text-text-secondary"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Persistence result */}
          {result?.ok && (
            <div className="flex items-center gap-2 text-[12px] text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {result.persisted.inserted > 0
                ? `Added ${result.persisted.inserted} AI project${result.persisted.inserted === 1 ? "" : "s"} to the queue`
                : "No new AI projects to add"}
              {result.persisted.skipped > 0 &&
                ` · ${result.persisted.skipped} already in queue`}
              {result.persisted.errors.length > 0 && (
                <span className="text-red-600">
                  · {result.persisted.errors.length} error(s)
                </span>
              )}
            </div>
          )}

          {/* AI projects */}
          {profile.ai_projects.length > 0 && (
            <div>
              <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
                AI projects ({profile.ai_projects.length})
              </h4>
              <div className="space-y-2">
                {profile.ai_projects.map((p) => (
                  <ProjectRow key={p.repo_url} project={p} />
                ))}
              </div>
            </div>
          )}

          {/* Other projects */}
          {profile.other_projects.length > 0 && (
            <details>
              <summary className="cursor-pointer text-[12px] font-semibold uppercase tracking-wide text-text-tertiary">
                Other projects ({profile.other_projects.length})
              </summary>
              <div className="mt-2 space-y-2">
                {profile.other_projects.map((p) => (
                  <ProjectRow key={p.repo_url} project={p} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
