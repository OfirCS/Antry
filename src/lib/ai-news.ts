export type AiNewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  label: string;
};

type AlgoliaHit = {
  objectID?: string;
  title?: string | null;
  url?: string | null;
  created_at?: string | null;
  points?: number | null;
  num_comments?: number | null;
};

type AlgoliaResponse = {
  hits?: AlgoliaHit[];
};

const AI_NEWS_REVALIDATE_SECONDS = 15 * 60;
const HITS_PER_QUERY = 20;

const AI_NEWS_QUERIES = [
  "OpenAI",
  "Anthropic",
  "AI regulation",
  "AI safety",
  "AI lawsuit",
  "AI security",
];

const SERIOUS_LABELS = [
  { match: /\b(sues?|sued|lawsuit|court|copyright)\b/i, label: "Legal" },
  { match: /\b(regulat|policy|government|senate|congress|eu|law)\b/i, label: "Policy" },
  { match: /\b(safety|risk|harms?|frontier|alignment)\b/i, label: "Safety" },
  { match: /\b(security|breach|privacy|surveillance|permissions?)\b/i, label: "Security" },
  { match: /\b(military|defense|weapon|election|super pac)\b/i, label: "Power" },
  { match: /\b(chip|nvidia|export|compute|datacenter|data center)\b/i, label: "Compute" },
];

const AI_TITLE_MATCH = /\b(ai|a\.i\.|openai|anthropic|deepmind|gemini|claude|nvidia|artificial intelligence)\b/i;
const SKIP_TITLE_MATCH = /^(ask hn|show hn|launch hn|who is hiring|freelancer\?|tell hn)/i;

const DOMAIN_WEIGHT = new Map([
  ["reuters.com", 9],
  ["apnews.com", 9],
  ["nytimes.com", 8],
  ["wsj.com", 8],
  ["washingtonpost.com", 8],
  ["bbc.com", 7],
  ["bbc.co.uk", 7],
  ["ft.com", 7],
  ["bloomberg.com", 7],
  ["nbcnews.com", 7],
  ["theverge.com", 6],
  ["technologyreview.com", 6],
  ["wired.com", 6],
  ["arstechnica.com", 6],
  ["techcrunch.com", 5],
  ["theregister.com", 5],
  ["lawfaremedia.org", 5],
]);

export async function getSeriousAiNews(limit = 5): Promise<AiNewsItem[]> {
  const batches = await Promise.allSettled(
    AI_NEWS_QUERIES.map((query) => fetchHackerNewsStories(query)),
  );

  const scored = batches
    .flatMap((batch) => (batch.status === "fulfilled" ? batch.value : []))
    .map(toScoredItem)
    .filter((item): item is ScoredAiNewsItem => item !== null)
    .toSorted((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const items: AiNewsItem[] = [];

  for (const item of scored) {
    const key = canonicalKey(item.url, item.title);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    items.push({
      id: item.id,
      title: item.title,
      url: item.url,
      source: item.source,
      publishedAt: item.publishedAt,
      label: item.label,
    });

    if (items.length >= limit) {
      break;
    }
  }

  return items;
}

async function fetchHackerNewsStories(query: string): Promise<AlgoliaHit[]> {
  const params = new URLSearchParams({
    query,
    tags: "story",
    hitsPerPage: String(HITS_PER_QUERY),
  });

  const response = await fetch(
    `https://hn.algolia.com/api/v1/search_by_date?${params.toString()}`,
    { next: { revalidate: AI_NEWS_REVALIDATE_SECONDS } },
  );

  if (!response.ok) {
    throw new Error(`Unable to fetch AI news for ${query}`);
  }

  const data = (await response.json()) as AlgoliaResponse;
  return Array.isArray(data.hits) ? data.hits : [];
}

type ScoredAiNewsItem = AiNewsItem & {
  score: number;
};

function toScoredItem(hit: AlgoliaHit): ScoredAiNewsItem | null {
  const title = hit.title?.trim();
  const url = hit.url?.trim();
  const publishedAt = hit.created_at?.trim();

  if (!title || !url || !publishedAt || SKIP_TITLE_MATCH.test(title)) {
    return null;
  }

  if (!AI_TITLE_MATCH.test(title)) {
    return null;
  }

  const parsedUrl = safeUrl(url);

  if (!parsedUrl) {
    return null;
  }

  const label = SERIOUS_LABELS.find(({ match }) => match.test(title))?.label;
  const seriousScore = label ? 14 : 0;
  const source = parsedUrl.hostname.replace(/^www\./, "");
  const publishedMs = Date.parse(publishedAt);
  const ageHours = Number.isFinite(publishedMs)
    ? Math.max(0, (Date.now() - publishedMs) / 36e5)
    : 168;

  const recencyScore = ageHours <= 24 ? 14 : ageHours <= 72 ? 9 : ageHours <= 168 ? 4 : 0;
  const sourceScore = DOMAIN_WEIGHT.get(source) ?? 0;
  const discussionScore = Math.min(10, Math.max(0, hit.points ?? 0) / 4);
  const commentScore = Math.min(5, Math.max(0, hit.num_comments ?? 0) / 8);

  return {
    id: hit.objectID ?? `${source}-${title}`,
    title,
    url,
    source,
    publishedAt,
    label: label ?? "AI",
    score: seriousScore + recencyScore + sourceScore + discussionScore + commentScore,
  };
}

function safeUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function canonicalKey(url: string, title: string) {
  const parsedUrl = safeUrl(url);

  if (!parsedUrl) {
    return title.toLowerCase();
  }

  parsedUrl.hash = "";
  parsedUrl.search = "";
  return parsedUrl.toString().toLowerCase();
}
