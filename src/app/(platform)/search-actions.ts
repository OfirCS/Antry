"use server";

/**
 * Global search — backs the Cmd/Ctrl+K command palette.
 *
 * Searches three corpora and returns a flat, ranked result list:
 *   - builders   → live from Supabase via the agent dataset
 *   - projects   → live from Supabase via the agent dataset
 *   - hackathons → live from Supabase via the agent dataset
 *   - briefs     → demo seed data (briefs have no live table yet)
 *
 * The agent dataset (`loadAgentDatasetStrict`) is reused deliberately: it
 * already normalises the stale-schema vs. live-schema split, is cached for
 * a few minutes, and never throws — it returns `null` when the DB is empty.
 */

import { loadAgentDatasetStrict } from "@/lib/agent/engine";
import { demoBriefs } from "@/lib/receipts/demo-data";

export type SearchResultType = "builder" | "project" | "hackathon" | "brief";

export interface SearchResult {
  type: SearchResultType;
  /** Stable key for React lists. */
  id: string;
  /** Primary line. */
  title: string;
  /** Secondary line — username, tagline, theme, etc. */
  subtitle: string;
  /** Destination route. */
  href: string;
  /** Small set of tags surfaced under the result (skills, tech, category). */
  tags: string[];
  /** Internal relevance score — higher is better. Not shown in the UI. */
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  /** Echoed back so the client can guard against stale responses. */
  query: string;
}

/** Lowercased, trimmed, collapsed-whitespace form for matching. */
function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Score a single result against the query tokens.
 *
 * Returns 0 when nothing matches (the caller drops it). A title match is
 * weighted heaviest, then subtitle, then tags. An exact prefix on the
 * title gets a bonus so "next" surfaces "Next.js Starter" near the top.
 */
function scoreEntry(
  query: string,
  tokens: string[],
  title: string,
  subtitle: string,
  tags: string[],
): number {
  const t = normalize(title);
  const s = normalize(subtitle);
  const g = tags.map(normalize);

  let score = 0;
  for (const token of tokens) {
    if (t.includes(token)) score += 10;
    if (t.startsWith(token)) score += 6;
    if (s.includes(token)) score += 4;
    if (g.some((tag) => tag.includes(token))) score += 3;
  }
  // Whole-query phrase match is a strong signal.
  if (t.includes(query)) score += 8;
  return score;
}

const MAX_RESULTS = 24;

export async function searchEverything(rawQuery: string): Promise<SearchResponse> {
  const query = normalize(rawQuery ?? "");

  if (query.length < 2) {
    return { results: [], query };
  }

  const tokens = query.split(" ").filter(Boolean);
  const out: SearchResult[] = [];

  // ── Briefs (demo seed) ───────────────────────────────────
  for (const brief of demoBriefs) {
    if (brief.status !== "live") continue;
    const tags = [brief.category, brief.difficulty, brief.company.name].filter(Boolean);
    const score = scoreEntry(query, tokens, brief.title, brief.tagline, tags);
    if (score > 0) {
      out.push({
        type: "brief",
        id: `brief-${brief.id}`,
        title: brief.title,
        subtitle: `${brief.company.name} · ${brief.tagline}`,
        href: `/briefs/${brief.slug}`,
        tags: [brief.category, brief.difficulty],
        score,
      });
    }
  }

  // ── Builders / projects / hackathons (live Supabase) ─────
  // loadAgentDatasetStrict never throws — it returns null when the DB
  // has no rows yet. In that case we simply return whatever briefs matched.
  let dataset = null;
  try {
    dataset = await loadAgentDatasetStrict();
  } catch {
    dataset = null;
  }

  if (dataset) {
    for (const builder of dataset.builders) {
      const tags = builder.skills ?? [];
      const score = scoreEntry(
        query,
        tokens,
        builder.name,
        `@${builder.username} · ${builder.tagline}`,
        [...tags, builder.username],
      );
      if (score > 0) {
        out.push({
          type: "builder",
          id: `builder-${builder.id}`,
          title: builder.name || builder.username,
          subtitle: builder.tagline
            ? `@${builder.username} · ${builder.tagline}`
            : `@${builder.username}`,
          href: `/builders/${builder.username}`,
          tags: tags.slice(0, 3),
          score: score + 1, // gentle bias toward people
        });
      }
    }

    for (const project of dataset.projects) {
      const tags = project.techStack ?? [];
      const score = scoreEntry(
        query,
        tokens,
        project.title,
        project.tagline,
        [...tags, project.category, project.builder.name],
      );
      if (score > 0) {
        out.push({
          type: "project",
          id: `project-${project.id}`,
          title: project.title,
          subtitle: `${project.tagline} · by ${project.builder.name}`,
          href: `/projects/${project.id}`,
          tags: tags.slice(0, 3),
          score,
        });
      }
    }

    for (const hackathon of dataset.hackathons) {
      const score = scoreEntry(
        query,
        tokens,
        hackathon.title,
        hackathon.theme,
        [hackathon.status],
      );
      if (score > 0) {
        out.push({
          type: "hackathon",
          id: `hackathon-${hackathon.id}`,
          title: hackathon.title,
          subtitle: hackathon.theme || hackathon.description,
          href: `/hackathons/${hackathon.id}`,
          tags: [hackathon.status],
          score,
        });
      }
    }
  }

  out.sort((a, b) => b.score - a.score);

  return { results: out.slice(0, MAX_RESULTS), query };
}
