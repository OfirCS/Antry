import type { GitHubRepo, GitHubReadme, ScanResult } from "./types";
import { scoreRepo } from "./scorer";
import { createAdminClient } from "@/lib/supabase/server";

const GITHUB_API = "https://api.github.com";

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

let rateLimitRemaining = 60;

async function githubFetch<T>(url: string): Promise<T | null> {
  if (rateLimitRemaining < 10) return null;

  const res = await fetch(url, { headers: headers() });

  const remaining = res.headers.get("X-RateLimit-Remaining");
  if (remaining) rateLimitRemaining = parseInt(remaining, 10);

  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

function thirtyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}

/**
 * Run 3 GitHub search queries and return unique repos.
 */
async function searchRepos(): Promise<GitHubRepo[]> {
  const since = thirtyDaysAgo();
  const queries = [
    `stars:5..500 pushed:>${since} topic:demo`,
    `stars:10..300 size:<5000 pushed:>${since}`,
    `"live demo" OR "deployed" stars:>5 pushed:>${since}`,
  ];

  const seen = new Set<string>();
  const repos: GitHubRepo[] = [];

  for (const q of queries) {
    const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=10`;
    const data = await githubFetch<{ items: GitHubRepo[] }>(url);
    if (!data?.items) continue;

    for (const repo of data.items) {
      if (!seen.has(repo.full_name)) {
        seen.add(repo.full_name);
        repos.push(repo);
      }
    }
  }

  return repos;
}

/**
 * Fetch the first 500 chars of a repo's README.
 */
async function fetchReadme(fullName: string): Promise<string> {
  const data = await githubFetch<GitHubReadme>(
    `${GITHUB_API}/repos/${fullName}/readme`
  );
  if (!data?.content) return "";

  try {
    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    return decoded.slice(0, 500);
  } catch {
    return "";
  }
}

/**
 * Fetch repo languages as an array of language names.
 */
async function fetchLanguages(fullName: string): Promise<string[]> {
  const data = await githubFetch<Record<string, number>>(
    `${GITHUB_API}/repos/${fullName}/languages`
  );
  return data ? Object.keys(data) : [];
}

/**
 * Infer a category from repo topics, language, and description.
 */
function inferCategory(repo: GitHubRepo, languages: string[]): string {
  const text = `${repo.description || ""} ${(repo.topics || []).join(" ")} ${languages.join(" ")}`.toLowerCase();

  if (text.includes("ai") || text.includes("ml") || text.includes("machine-learning") || text.includes("llm"))
    return "ai-agents";
  if (text.includes("mobile") || text.includes("ios") || text.includes("android") || text.includes("react-native"))
    return "mobile";
  if (text.includes("data") || text.includes("analytics") || text.includes("visualization"))
    return "data-ml";
  if (text.includes("design") || text.includes("figma") || text.includes("ui-kit"))
    return "design";
  if (text.includes("cli") || text.includes("tool") || text.includes("devtool") || text.includes("utility"))
    return "tools";

  return "web-apps";
}

/**
 * Run a full scan: search GitHub, score repos, insert into discovered_projects.
 */
export async function runGitHubScan(): Promise<ScanResult> {
  rateLimitRemaining = 60; // reset for this run
  const result: ScanResult = { discovered: 0, skipped: 0, errors: [] };

  const repos = await searchRepos();
  const adminClient = createAdminClient();

  for (const repo of repos) {
    try {
      // Check if already discovered
      const { data: existing } = await adminClient
        .from("discovered_projects")
        .select("id")
        .eq("source_url", repo.html_url)
        .single();

      if (existing) {
        result.skipped++;
        continue;
      }

      // Fetch extra details
      const [readme, languages] = await Promise.all([
        fetchReadme(repo.full_name),
        fetchLanguages(repo.full_name),
      ]);

      const { score, breakdown } = scoreRepo(repo, readme, languages);
      const category = inferCategory(repo, languages);

      const techStack = languages.length > 0 ? languages : repo.language ? [repo.language] : [];

      const { error } = await adminClient.from("discovered_projects").insert({
        source: "github",
        source_url: repo.html_url,
        title: repo.name
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        tagline: (repo.description || "").slice(0, 200),
        description: readme,
        category,
        tech_stack: techStack,
        demo_url: repo.homepage || null,
        repo_url: repo.html_url,
        github_stars: repo.stargazers_count,
        github_language: repo.language,
        github_owner_login: repo.owner.login,
        github_last_pushed_at: repo.pushed_at,
        github_repo_size_kb: repo.size,
        quality_score: score,
        score_breakdown: breakdown,
      });

      if (error) {
        result.errors.push(`Insert ${repo.full_name}: ${error.message}`);
      } else {
        result.discovered++;
      }
    } catch (err) {
      result.errors.push(
        `Process ${repo.full_name}: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  return result;
}
