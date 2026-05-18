// Scout — profile a builder by GitHub username.
//
// "Trigger Scout on someone": given a GitHub handle, fetch their public repos
// via the free GitHub REST API, score each one, detect AI relevance, and build
// a profile. AI-relevant repos are persisted into `discovered_projects` (the
// existing discovery pipeline) so the builder's AI portfolio enters review —
// that's the "build the profile if it doesn't exist" step. Non-AI repos are
// returned as context but not persisted.
//
// All scoring is deterministic — no LLM, no paid API. Set GITHUB_TOKEN to lift
// the 60 req/hr unauthenticated rate limit to 5,000.

import { scoreRepo } from "./scorer";
import type { GitHubRepo, ScoreBreakdown } from "./types";
import { createAdminClient } from "@/lib/supabase/server";

const GITHUB_API = "https://api.github.com";

// Repos considered at all, after sorting by stars then recency.
const MAX_REPOS = 24;
// Detail fetches (languages + README) are one network hop each, so cap how
// many repos we deep-inspect to keep a scout within the free rate budget.
const MAX_DETAIL_REPOS = 12;

/**
 * AI-relevance vocabulary. "strong" terms are unambiguous — a repo about an
 * "agent" or "rag" pipeline is almost certainly AI work. "weak" terms ("ai",
 * "ml") are matched too, but on their own (especially from a README) aren't
 * enough to flag a repo, since they collide with ordinary prose.
 */
const AI_STRONG = [
  "llm", "llms", "gpt", "chatgpt", "claude", "anthropic", "openai", "gemini",
  "mistral", "llama", "agent", "agents", "agentic", "rag", "langchain",
  "llamaindex", "embeddings", "transformer", "transformers", "huggingface",
  "hugging face", "pytorch", "tensorflow", "diffusion", "stable diffusion",
  "generative ai", "genai", "gen ai", "copilot", "mcp", "fine tune",
  "fine tuning", "finetune", "ollama", "whisper", "multimodal",
  "neural network", "deep learning", "machine learning",
  "reinforcement learning", "computer vision", "semantic search",
  "vector db", "vectordb", "pinecone", "prompt engineering", "chatbot", "nlp",
];
const AI_WEAK = ["ai", "ml", "generative", "inference", "embedding", "prompt"];

const ACRONYMS: Record<string, string> = {
  llm: "LLM", llms: "LLMs", rag: "RAG", ai: "AI", ml: "ML", nlp: "NLP",
  mcp: "MCP", gpt: "GPT", genai: "GenAI", openai: "OpenAI", gemini: "Gemini",
};

export type ScoutedProject = {
  name: string;
  full_name: string;
  title: string;
  tagline: string;
  description: string;
  repo_url: string;
  demo_url: string | null;
  tech_stack: string[];
  primary_language: string | null;
  stars: number;
  pushed_at: string | null;
  repo_size_kb: number;
  category: string;
  quality_score: number;
  score_breakdown: ScoreBreakdown;
  is_ai: boolean;
  ai_signals: string[];
};

export type ScoutedProfile = {
  username: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  blog: string | null;
  twitter_handle: string | null;
  location: string | null;
  followers: number;
  public_repos: number;
  joined_github: string | null;
  /** 0-100: how AI-centric this builder's public work looks. */
  ai_focus_score: number;
  ai_summary: string;
  inferred_skills: string[];
  ai_projects: ScoutedProject[];
  other_projects: ScoutedProject[];
  repos_scanned: number;
};

export type ScoutResult =
  | {
      ok: true;
      profile: ScoutedProfile;
      /** True if this builder already had rows in discovered_projects. */
      already_scouted: boolean;
      persisted: { inserted: number; skipped: number; errors: string[] };
    }
  | { ok: false; error: string };

type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  blog: string | null;
  twitter_username: string | null;
  location: string | null;
  followers: number;
  public_repos: number;
  created_at: string | null;
};

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function ghFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: ghHeaders(), next: { revalidate: 600 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function ghReadme(fullName: string): Promise<string> {
  const data = await ghFetch<{ content?: string }>(`${GITHUB_API}/repos/${fullName}/readme`);
  if (!data?.content) return "";
  try {
    return Buffer.from(data.content, "base64").toString("utf-8").slice(0, 1500);
  } catch {
    return "";
  }
}

/** Normalize for matching: lowercase, separators → spaces, space-padded. */
function norm(s: string): string {
  return ` ${(s || "").toLowerCase().replace(/[-_/.]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

/** Word-boundary contains — avoids "ai" matching "email"/"detail"/"chair". */
function hasTerm(paddedHaystack: string, term: string): boolean {
  return paddedHaystack.includes(` ${term} `);
}

function prettySignal(s: string): string {
  if (ACRONYMS[s]) return ACRONYMS[s];
  return s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * Decide whether a repo is AI work and collect the matched signals.
 * A repo counts as AI when any AI term shows up on its high-confidence
 * surface (name/description/topics/languages), or when its README leans
 * AI hard enough (≥2 strong terms) that a passing mention is unlikely.
 */
function detectAi(repo: GitHubRepo, languages: string[], readme: string) {
  const surface = norm(
    `${repo.name} ${repo.description || ""} ${(repo.topics || []).join(" ")} ${languages.join(" ")}`
  );
  const readmeText = norm(readme);

  const surfaceSignals: string[] = [];
  for (const term of [...AI_STRONG, ...AI_WEAK]) {
    if (hasTerm(surface, term)) surfaceSignals.push(term);
  }
  const readmeStrong: string[] = [];
  for (const term of AI_STRONG) {
    if (hasTerm(readmeText, term)) readmeStrong.push(term);
  }

  const is_ai = surfaceSignals.length > 0 || readmeStrong.length >= 2;
  const signals = [...new Set([...surfaceSignals, ...readmeStrong])]
    .slice(0, 8)
    .map(prettySignal);
  return { is_ai, signals };
}

function inferCategory(repo: GitHubRepo, languages: string[]): string {
  const text = norm(`${repo.description || ""} ${(repo.topics || []).join(" ")} ${languages.join(" ")}`);
  if (["mobile", "ios", "android", "react native"].some((t) => hasTerm(text, t))) return "mobile";
  if (["data", "analytics", "dashboard", "visualization"].some((t) => hasTerm(text, t))) return "data-ml";
  if (["design", "ui", "figma", "ui kit"].some((t) => hasTerm(text, t))) return "design";
  if (["cli", "tool", "devtool", "util", "utility"].some((t) => hasTerm(text, t))) return "tools";
  return "web-apps";
}

function titleFromName(name: string): string {
  return name
    .replace(/[-_.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function aiFocusScore(aiCount: number, total: number, bio: string | null): number {
  if (total === 0) return 0;
  let s = Math.round((aiCount / total) * 100);
  const b = norm(bio || "");
  if (AI_STRONG.some((t) => hasTerm(b, t))) s = Math.min(100, s + 10);
  return s;
}

function buildAiSummary(
  name: string,
  aiProjects: ScoutedProject[],
  scannedCount: number
): string {
  if (aiProjects.length === 0) {
    return `${name} — scanned ${scannedCount} public repo${scannedCount === 1 ? "" : "s"}, no clear AI/LLM work detected yet.`;
  }
  const langCounts = new Map<string, number>();
  const signalCounts = new Map<string, number>();
  for (const p of aiProjects) {
    if (p.primary_language) {
      langCounts.set(p.primary_language, (langCounts.get(p.primary_language) || 0) + 1);
    }
    for (const s of p.ai_signals) signalCounts.set(s, (signalCounts.get(s) || 0) + 1);
  }
  const topLangs = [...langCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([l]) => l);
  const topSignals = [...signalCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => s);
  const recentDays = aiProjects
    .map((p) => (p.pushed_at ? Math.floor((Date.now() - Date.parse(p.pushed_at)) / 86_400_000) : null))
    .filter((d): d is number => d !== null)
    .sort((a, b) => a - b)[0];

  const langPart = topLangs.length ? ` in ${topLangs.join(" + ")}` : "";
  const focusPart = topSignals.length ? ` Focus areas: ${topSignals.join(", ")}.` : "";
  const cadence =
    recentDays === undefined ? "" :
    recentDays <= 21 ? " Actively shipping — last AI push within 3 weeks." :
    recentDays <= 90 ? " Steady cadence — last AI push within 3 months." :
    " AI work looks dormant — no AI push in 3+ months.";
  const best = aiProjects[0];

  return `${name} ships AI/LLM projects${langPart} — ${aiProjects.length} AI repo${aiProjects.length === 1 ? "" : "s"} of ${scannedCount} scanned, top pick "${best.title}" (quality ${best.quality_score}/100).${focusPart}${cadence}`;
}

function inferSkills(
  allProjects: ScoutedProject[],
  aiProjects: ScoutedProject[],
  bio: string | null
): string[] {
  const counts = new Map<string, number>();
  const add = (raw: string, weight: number) => {
    const key = raw.trim();
    if (key) counts.set(key, (counts.get(key) || 0) + weight);
  };
  for (const p of allProjects) {
    for (const t of p.tech_stack) add(t, p.is_ai ? 2 : 1);
  }
  for (const p of aiProjects) {
    for (const s of p.ai_signals) add(s, 2);
  }
  const b = norm(bio || "");
  for (const t of AI_STRONG) {
    if (hasTerm(b, t)) add(prettySignal(t), 3);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([s]) => s);
}

/**
 * Scout a builder by GitHub username. Fetches + scores their repos, builds an
 * AI-first profile, and persists AI-relevant repos into discovered_projects.
 */
export async function scoutBuilderProfile(rawUsername: string): Promise<ScoutResult> {
  const username = (rawUsername || "")
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .split("/")[0];
  if (!username || !/^[A-Za-z0-9-]{1,39}$/.test(username)) {
    return { ok: false, error: "That doesn't look like a valid GitHub username." };
  }

  const user = await ghFetch<GitHubUser>(`${GITHUB_API}/users/${encodeURIComponent(username)}`);
  if (!user) {
    return {
      ok: false,
      error: `Couldn't find GitHub user "${username}". Check the spelling — or GitHub may be rate-limiting (set GITHUB_TOKEN to lift the limit).`,
    };
  }

  const repos =
    (await ghFetch<GitHubRepo[]>(
      `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&direction=desc&type=owner`
    )) || [];

  const ownRepos = repos
    .filter((r) => {
      const meta = r as GitHubRepo & { fork?: boolean; archived?: boolean };
      return !meta.fork && !meta.archived;
    })
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        Date.parse(b.pushed_at || "0") - Date.parse(a.pushed_at || "0")
    )
    .slice(0, MAX_REPOS);

  const scouted: ScoutedProject[] = [];
  for (let i = 0; i < ownRepos.length; i++) {
    const repo = ownRepos[i];
    let languages: string[] = repo.language ? [repo.language] : [];
    let readme = "";
    if (i < MAX_DETAIL_REPOS) {
      const langs = await ghFetch<Record<string, number>>(
        `${GITHUB_API}/repos/${repo.full_name}/languages`
      );
      if (langs && Object.keys(langs).length) languages = Object.keys(langs);
      readme = await ghReadme(repo.full_name);
    }

    const { score, breakdown } = scoreRepo(repo, readme, languages);
    const { is_ai, signals } = detectAi(repo, languages, readme);

    scouted.push({
      name: repo.name,
      full_name: repo.full_name,
      title: titleFromName(repo.name),
      tagline: (repo.description || "").slice(0, 200),
      description: (readme || repo.description || "").slice(0, 500),
      repo_url: repo.html_url,
      demo_url: repo.homepage || null,
      tech_stack: languages.slice(0, 6),
      primary_language: repo.language,
      stars: repo.stargazers_count,
      pushed_at: repo.pushed_at,
      repo_size_kb: repo.size || 0,
      category: is_ai ? "ai-agents" : inferCategory(repo, languages),
      quality_score: score,
      score_breakdown: breakdown,
      is_ai,
      ai_signals: signals,
    });
  }

  const byQuality = (a: ScoutedProject, b: ScoutedProject) =>
    b.quality_score - a.quality_score || b.stars - a.stars;
  const aiProjects = scouted.filter((p) => p.is_ai).sort(byQuality);
  const otherProjects = scouted.filter((p) => !p.is_ai).sort(byQuality);

  const displayName = user.name || user.login;
  const profile: ScoutedProfile = {
    username: user.login,
    name: displayName,
    avatar_url: user.avatar_url,
    bio: user.bio,
    blog: user.blog || null,
    twitter_handle: user.twitter_username,
    location: user.location,
    followers: user.followers,
    public_repos: user.public_repos,
    joined_github: user.created_at,
    ai_focus_score: aiFocusScore(aiProjects.length, scouted.length, user.bio),
    ai_summary: buildAiSummary(displayName, aiProjects, scouted.length),
    inferred_skills: inferSkills(scouted, aiProjects, user.bio),
    ai_projects: aiProjects,
    other_projects: otherProjects.slice(0, 8),
    repos_scanned: scouted.length,
  };

  // Persist the AI portfolio into the discovery pipeline — "build the profile
  // if it doesn't exist". source_url is globally unique, so an upsert that
  // ignores duplicates is race-safe and idempotent across repeat scouts.
  const persisted = { inserted: 0, skipped: 0, errors: [] as string[] };
  let already_scouted = false;
  try {
    const admin = createAdminClient();
    const { data: priorRows } = await admin
      .from("discovered_projects")
      .select("source_url")
      .eq("github_owner_login", user.login);
    already_scouted = (priorRows?.length ?? 0) > 0;

    if (aiProjects.length > 0) {
      const rows = aiProjects.map((p) => ({
        source: "github" as const,
        source_url: p.repo_url,
        title: p.title,
        tagline: p.tagline,
        description: p.description,
        category: "ai-agents",
        tech_stack: p.tech_stack,
        demo_url: p.demo_url,
        repo_url: p.repo_url,
        github_stars: p.stars,
        github_language: p.primary_language,
        github_owner_login: user.login,
        github_last_pushed_at: p.pushed_at,
        github_repo_size_kb: p.repo_size_kb,
        quality_score: p.quality_score,
        score_breakdown: p.score_breakdown,
      }));
      const { data: inserted, error } = await admin
        .from("discovered_projects")
        .upsert(rows, { onConflict: "source_url", ignoreDuplicates: true })
        .select("id");
      if (error) {
        persisted.errors.push(error.message);
      } else {
        persisted.inserted = inserted?.length ?? 0;
        persisted.skipped = rows.length - persisted.inserted;
      }
    }
  } catch (err) {
    persisted.errors.push(err instanceof Error ? err.message : "Persistence failed");
  }

  return { ok: true, profile, already_scouted, persisted };
}
