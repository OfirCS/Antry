/**
 * Parse an X/Twitter post URL and extract any GitHub repo links from the text.
 * Since Twitter API requires paid access, this parses manually-provided URLs.
 */

const GITHUB_REPO_REGEX =
  /https?:\/\/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/g;

/**
 * Extract GitHub repo URLs from a block of text (tweet body, URL, etc.)
 */
export function extractGitHubUrls(text: string): string[] {
  const matches = text.matchAll(GITHUB_REPO_REGEX);
  const urls = new Set<string>();
  for (const match of matches) {
    // Normalize: remove trailing slashes, .git suffix
    const repoPath = match[1].replace(/\.git$/, "").replace(/\/$/, "");
    urls.add(`https://github.com/${repoPath}`);
  }
  return [...urls];
}

/**
 * Validate that a URL looks like a valid X/Twitter post URL.
 */
export function isTwitterUrl(url: string): boolean {
  return /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/.test(url);
}

/**
 * Parse a GitHub URL to extract owner and repo name.
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(
    /^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}
