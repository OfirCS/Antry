// Builder Card preview engine.
// Given a GitHub username, fetch the user + top public repos, score them,
// and return a "what your Antry profile would look like" preview.
//
// Reuses the existing `scoreRepo` from ./scorer so the same quality model
// runs in admin discovery and in the public preview surface.

import { scoreRepo } from "./scorer";
import type { GitHubRepo } from "./types";

const GITHUB_API = "https://api.github.com";

type PreviewProject = {
  name: string;
  full_name: string;
  title: string;
  tagline: string;
  description: string;
  demo_url: string | null;
  repo_url: string;
  tech_stack: string[];
  primary_language: string | null;
  stars: number;
  category: string;
  score: number;
  pushed_at: string | null;
};

export type BuilderCardPreview = {
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
  scout_summary: string;
  inferred_skills: string[];
  projects: PreviewProject[];
  truncated: boolean;
};

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

function inferCategory(repo: GitHubRepo, languages: string[]): string {
  const text = `${repo.description || ""} ${(repo.topics || []).join(" ")} ${languages.join(" ")}`.toLowerCase();
  if (text.includes("ai") || text.includes("llm") || text.includes("agent") || text.includes("rag") || text.includes("ml")) return "ai-agents";
  if (text.includes("mobile") || text.includes("ios") || text.includes("android") || text.includes("react-native")) return "mobile";
  if (text.includes("data") || text.includes("analytics") || text.includes("dashboard")) return "data-ml";
  if (text.includes("design") || text.includes("ui") || text.includes("figma")) return "design";
  if (text.includes("cli") || text.includes("tool") || text.includes("devtool") || text.includes("util")) return "tools";
  return "web-apps";
}

function titleFromName(name: string): string {
  return name
    .replace(/[-_.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildScoutSummary(user: GitHubUser, projects: PreviewProject[]): string {
  if (projects.length === 0) {
    return `${user.name || user.login} — no public shipped projects detected yet. Push something this weekend.`;
  }
  const categoryCounts = new Map<string, number>();
  const langCounts = new Map<string, number>();
  for (const p of projects) {
    categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
    if (p.primary_language) {
      langCounts.set(p.primary_language, (langCounts.get(p.primary_language) || 0) + 1);
    }
  }
  const topCategory = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const topLangs = [...langCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([l]) => l);
  const recentDays = projects
    .map((p) => (p.pushed_at ? Math.max(0, Math.floor((Date.now() - new Date(p.pushed_at).getTime()) / 86_400_000)) : null))
    .filter((d): d is number => d !== null)
    .sort((a, b) => a - b)[0];

  const focus =
    topCategory === "ai-agents" ? "ships AI agents" :
    topCategory === "tools" ? "builds developer tools" :
    topCategory === "data-ml" ? "works on data and ML systems" :
    topCategory === "mobile" ? "ships mobile apps" :
    topCategory === "design" ? "designs and builds frontends" :
    "builds web apps";

  const langPart = topLangs.length ? ` in ${topLangs.join(" + ")}` : "";
  const tempo = recentDays !== undefined && recentDays <= 14 ? "; shipping every couple weeks" : recentDays !== undefined && recentDays <= 60 ? "; consistent monthly cadence" : "";

  return `${user.name || user.login} ${focus}${langPart}${tempo}.`;
}

function inferSkills(projects: PreviewProject[], userBio: string | null): string[] {
  const counts = new Map<string, number>();
  for (const p of projects) {
    for (const t of p.tech_stack) {
      const key = t.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  const bio = (userBio || "").toLowerCase();
  for (const tag of ["ai", "ml", "rag", "llm", "agent", "design", "fullstack", "frontend", "backend", "devops"]) {
    if (bio.includes(tag)) counts.set(tag.toUpperCase(), (counts.get(tag.toUpperCase()) || 0) + 2);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([s]) => s);
}

export async function buildBuilderCard(rawUsername: string): Promise<
  | { ok: true; card: BuilderCardPreview }
  | { ok: false; error: string }
> {
  const username = rawUsername.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?github\.com\//, "").split("/")[0];
  if (!username || !/^[A-Za-z0-9-]{1,39}$/.test(username)) {
    return { ok: false, error: "That doesn't look like a valid GitHub username." };
  }

  // Demo fixture path for offline previews and presentations.
  // Activated only when the username is exactly "demo" AND the
  // ANTRY_DEMO_FIXTURE env flag is set — never in production by default.
  if (username === "demo" && process.env.ANTRY_DEMO_FIXTURE === "1") {
    return { ok: true, card: demoFixtureCard() };
  }

  const user = await ghFetch<GitHubUser>(`${GITHUB_API}/users/${encodeURIComponent(username)}`);
  if (!user) {
    return { ok: false, error: "Couldn't find that GitHub user. Double-check the spelling." };
  }

  // Top repos by stars; falls back to recently pushed if user has no stars.
  const repos =
    (await ghFetch<GitHubRepo[]>(
      `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=30&sort=updated&direction=desc&type=owner`
    )) || [];

  const ownRepos = repos.filter((r) => !(r as GitHubRepo & { fork?: boolean }).fork);
  const candidates = [...ownRepos]
    .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (Date.parse(b.pushed_at || "0") - Date.parse(a.pushed_at || "0")))
    .slice(0, 8);

  const previewProjects: PreviewProject[] = [];

  for (const repo of candidates) {
    // Languages call adds a network hop — limit to first 6 to stay quick.
    let languages: string[] = [];
    if (previewProjects.length < 6) {
      const langs = await ghFetch<Record<string, number>>(`${GITHUB_API}/repos/${repo.full_name}/languages`);
      languages = langs ? Object.keys(langs) : [];
    } else if (repo.language) {
      languages = [repo.language];
    }

    // Skip very thin/low-signal repos to keep the preview crisp.
    if (
      previewProjects.length >= 6 ||
      (repo.stargazers_count === 0 && !(repo.description && repo.description.length > 20) && !repo.homepage)
    ) {
      // We'll still consider these only if we have nothing yet.
      if (previewProjects.length >= 3) continue;
    }

    const { score } = scoreRepo(repo, repo.description || "", languages.length ? languages : repo.language ? [repo.language] : []);
    const techStack = languages.length ? languages : repo.language ? [repo.language] : [];

    previewProjects.push({
      name: repo.name,
      full_name: repo.full_name,
      title: titleFromName(repo.name),
      tagline: (repo.description || "").slice(0, 200),
      description: (repo.description || "").slice(0, 500),
      demo_url: repo.homepage || null,
      repo_url: repo.html_url,
      tech_stack: techStack.slice(0, 6),
      primary_language: repo.language,
      stars: repo.stargazers_count,
      category: inferCategory(repo, languages),
      score,
      pushed_at: repo.pushed_at,
    });
  }

  // Sort by Antry quality score, keep top 6.
  previewProjects.sort((a, b) => b.score - a.score || b.stars - a.stars);
  const topProjects = previewProjects.slice(0, 6);

  const card: BuilderCardPreview = {
    username: user.login,
    name: user.name || user.login,
    avatar_url: user.avatar_url,
    bio: user.bio,
    blog: user.blog,
    twitter_handle: user.twitter_username,
    location: user.location,
    followers: user.followers,
    public_repos: user.public_repos,
    joined_github: user.created_at,
    projects: topProjects,
    inferred_skills: inferSkills(topProjects, user.bio),
    scout_summary: buildScoutSummary(user, topProjects),
    truncated: ownRepos.length > topProjects.length,
  };

  return { ok: true, card };
}

function demoFixtureCard(): BuilderCardPreview {
  const projects = [
    {
      name: "scout-engine",
      full_name: "demo/scout-engine",
      title: "Scout Engine",
      tagline: "Open-source NLU agent for finding builders by what they ship — not by keywords on a profile.",
      description: "TypeScript NLU agent. 1.9k LOC, 95%+ test coverage. Used in Antry's discovery pipeline.",
      demo_url: "https://demo.example.com/scout",
      repo_url: "https://github.com/demo/scout-engine",
      tech_stack: ["TypeScript", "Bun", "Zod"],
      primary_language: "TypeScript",
      stars: 1280,
      category: "ai-agents",
      score: 92,
      pushed_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      name: "rag-streaming",
      full_name: "demo/rag-streaming",
      title: "Rag Streaming",
      tagline: "Streaming RAG pipeline that handles 10k tokens/s with token-by-token UI updates.",
      description: "FastAPI + LangChain + Server-Sent Events. Production-tested at scale.",
      demo_url: "https://demo.example.com/rag",
      repo_url: "https://github.com/demo/rag-streaming",
      tech_stack: ["Python", "FastAPI", "LangChain", "Postgres"],
      primary_language: "Python",
      stars: 540,
      category: "ai-agents",
      score: 88,
      pushed_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
    {
      name: "antathon-kit",
      full_name: "demo/antathon-kit",
      title: "Antathon Kit",
      tagline: "Templates and CI for shipping a 48-hour hackathon project that doesn't fall over.",
      description: "Next.js + Supabase + Vercel + Resend starter. Includes auth, billing, OG images, mobile-first UI.",
      demo_url: "https://antathon-kit.vercel.app",
      repo_url: "https://github.com/demo/antathon-kit",
      tech_stack: ["TypeScript", "Next.js", "Supabase", "Tailwind"],
      primary_language: "TypeScript",
      stars: 320,
      category: "tools",
      score: 81,
      pushed_at: new Date(Date.now() - 86400000 * 21).toISOString(),
    },
    {
      name: "demo-builder-blog",
      full_name: "demo/demo-builder-blog",
      title: "Demo Builder Blog",
      tagline: "Build-in-public blog template with MDX, RSS, and built-in changelog.",
      description: "Notes from shipping. Statically rendered, deploys in minutes.",
      demo_url: null,
      repo_url: "https://github.com/demo/demo-builder-blog",
      tech_stack: ["TypeScript", "MDX", "Tailwind"],
      primary_language: "TypeScript",
      stars: 90,
      category: "web-apps",
      score: 64,
      pushed_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    },
  ];

  return {
    username: "demo",
    name: "Demo Builder",
    avatar_url: null,
    bio: "Solo founder shipping AI tooling. Currently building Antry.",
    blog: "https://demo.example.com",
    twitter_handle: "demobuilder",
    location: "Toronto, ON",
    followers: 1240,
    public_repos: 47,
    joined_github: "2018-04-12T00:00:00Z",
    projects,
    inferred_skills: ["TypeScript", "Python", "Next.js", "FastAPI", "LangChain", "Supabase"],
    scout_summary:
      "Demo Builder ships AI agents in TypeScript + Python; consistent monthly cadence, with two top-shipped projects in production.",
    truncated: false,
  };
}
