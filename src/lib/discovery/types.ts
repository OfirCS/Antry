// Discovery Agent types

export type DiscoverySource = "github" | "twitter" | "manual";
export type DiscoveryStatus = "pending" | "approved" | "rejected" | "claimed";

export interface ScoreBreakdown {
  stars: number;
  readme: number;
  demo: number;
  activity: number;
  size: number;
  techStack: number;
  description: number;
}

export interface DiscoveredProject {
  id: string;
  source: DiscoverySource;
  source_url: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  tech_stack: string[];
  demo_url: string | null;
  repo_url: string | null;
  github_stars: number;
  github_language: string | null;
  github_owner_login: string | null;
  github_last_pushed_at: string | null;
  github_repo_size_kb: number;
  quality_score: number;
  score_breakdown: ScoreBreakdown;
  status: DiscoveryStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  claim_token: string | null;
  claimed_by: string | null;
  imported_project_id: string | null;
  discovered_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  full_name: string;
  html_url: string;
  name: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  pushed_at: string;
  size: number; // KB
  owner: {
    login: string;
  };
}

export interface GitHubReadme {
  content: string; // base64 encoded
  encoding: string;
}

export interface ScanResult {
  discovered: number;
  skipped: number;
  errors: string[];
}
