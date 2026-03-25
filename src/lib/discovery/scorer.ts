import type { GitHubRepo, ScoreBreakdown } from "./types";

/**
 * Score a GitHub repo 0-100 based on quality signals.
 * All scoring is deterministic — no LLM needed.
 */
export function scoreRepo(
  repo: GitHubRepo,
  readme: string,
  languages: string[]
): { score: number; breakdown: ScoreBreakdown } {
  const breakdown: ScoreBreakdown = {
    stars: 0,
    readme: 0,
    demo: 0,
    activity: 0,
    size: 0,
    techStack: 0,
    description: 0,
  };

  // Stars (max 15): min(15, stars / 20)
  breakdown.stars = Math.min(15, Math.floor(repo.stargazers_count / 20));

  // README quality (max 20)
  if (readme.length > 500) breakdown.readme += 10;
  else if (readme.length > 200) breakdown.readme += 5;

  const readmeLower = readme.toLowerCase();
  if (readmeLower.includes("http://") || readmeLower.includes("https://"))
    breakdown.readme += 5;
  if (readmeLower.includes("##") || readmeLower.includes("installation") || readmeLower.includes("usage"))
    breakdown.readme += 5;

  // Demo present (max 25)
  if (repo.homepage) breakdown.demo += 15;
  const descLower = (repo.description || "").toLowerCase();
  if (
    repo.homepage ||
    descLower.includes("http://") ||
    descLower.includes("https://") ||
    readmeLower.includes("demo")
  ) {
    breakdown.demo += 10;
  }
  breakdown.demo = Math.min(25, breakdown.demo);

  // Recent activity (max 10)
  if (repo.pushed_at) {
    const pushedAt = new Date(repo.pushed_at).getTime();
    const now = Date.now();
    const daysSincePush = (now - pushedAt) / (1000 * 60 * 60 * 24);

    if (daysSincePush <= 7) breakdown.activity = 10;
    else if (daysSincePush <= 30) breakdown.activity = 7;
    else if (daysSincePush <= 90) breakdown.activity = 3;
  }

  // Small codebase (max 10): size is in KB
  const sizeMB = repo.size / 1024;
  if (sizeMB < 1) breakdown.size = 10;
  else if (sizeMB < 5) breakdown.size = 7;
  else if (sizeMB < 20) breakdown.size = 3;

  // Tech stack clarity (max 10)
  if (languages.length > 2) breakdown.techStack += 5;
  if ((repo.topics || []).length > 0) breakdown.techStack += 5;

  // Description quality (max 10)
  const desc = repo.description || "";
  if (desc.length > 50) breakdown.description += 5;
  if (
    descLower.includes("demo") ||
    descLower.includes("deploy") ||
    descLower.includes("live") ||
    descLower.includes("hosted")
  ) {
    breakdown.description += 5;
  }

  const score = Math.min(
    100,
    breakdown.stars +
      breakdown.readme +
      breakdown.demo +
      breakdown.activity +
      breakdown.size +
      breakdown.techStack +
      breakdown.description
  );

  return { score, breakdown };
}
