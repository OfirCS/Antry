import { createClient } from "@/lib/supabase/server";
import type {
  AgentBuilder,
  AgentChatTurn,
  AgentDataset,
  AgentHackathon,
  AgentIntent,
  AgentProject,
  AgentResponseBody,
  AgentRichCard,
  AgentSuggestion,
  AgentToolStep,
  BuilderDetailData,
  ComparisonData,
  NetworkStats,
  RecentActivityItem,
  RoleGap,
  SkillDistribution,
  TeamData,
  TeamMember,
  TrendingResult,
} from "./types";
import {
  TRAINING_EXAMPLES,
  SYNONYM_LOOKUP,
  TECH_STACKS,
  TECH_ALIASES,
  parseTimeWindow,
  calibrateConfidence,
} from "./training-data";

interface IntentScore {
  intent: AgentIntent;
  score: number;
}

type SparseVector = Map<string, number>;

const DATASET_CACHE_TTL_MS = 60_000;

type DatasetCache = {
  value: AgentDataset;
  expiresAt: number;
};

const globalCache = globalThis as typeof globalThis & {
  __antryAgentDatasetCache?: DatasetCache;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "we",
  "what",
  "who",
  "with",
  "you",
  "your",
  "can",
  "show",
  "find",
  "about",
  "please",
]);

const INTENT_EXAMPLES: Record<AgentIntent, string[]> = {
  find_builders: [
    "find builders who know react",
    "who are strong in ai agents",
    "search for a backend engineer",
    "show me top developers",
    "looking for product engineers",
    "who's good at react",
    "anyone skilled in python",
    "devs that know typescript",
    "ppl who do frontend",
    "got any ml engineers",
    "who can do nextjs and tailwind",
    "I need a designer who codes",
    "show fullstack developers",
    "find me a rust developer",
    "who works with supabase",
    "any langchain experts",
    "mobile engineers on antry",
    "find people who know flutter",
    "react native developers",
    "anyone here do solidity",
    "people who build with AI",
    "looking for a cofounder",
    "who knows kubernetes",
    "find go developers",
    "designers on the platform",
    "data scientists",
  ],
  find_projects: [
    "show projects using python",
    "find demos built with nextjs",
    "what are the top shipped apps",
    "search for data ml projects",
    "show me tools category projects",
    "cool stuff built with react",
    "any ai agent projects",
    "what have people built",
    "show me all web apps",
    "most liked projects",
    "best projects on the platform",
    "anything built with langchain",
    "find tools built with typescript",
    "saas projects",
    "chrome extensions on antry",
    "show me chatbot projects",
    "open source projects",
    "recently shipped",
    "mobile apps people built",
  ],
  find_hackathons: [
    "what hackathons are active",
    "which events can i join",
    "show upcoming antathons",
    "any current hackathon right now",
    "when is the next event",
    "hackathons i can enter",
    "are there any competitions running",
    "show me live events",
    "any hackathon with AI theme",
    "events with prizes",
    "I want to join a hackathon",
    "where can I compete",
    "what's the next buildathon",
    "any bounties available",
  ],
  build_team: [
    "build me a team for an ai hackathon",
    "assemble a squad for agents",
    "create a balanced builder team",
    "help me form a startup team",
    "put together a group for the hack",
    "i need a crew for building an app",
    "draft a team for web3 project",
    "who should I team up with for mobile",
    "make a team around data engineering",
  ],
  compare_builders: [
    "compare mara and jake",
    "who is better between two builders",
    "side by side comparison of profiles",
    "versus analysis for these developers",
    "mara vs jake",
    "difference between alice and bob",
    "how do these two developers compare",
    "alice versus bob who is stronger",
    "skill comparison between builders",
  ],
  builder_detail: [
    "tell me about mara",
    "show full profile of aisha",
    "details on this builder",
    "who is ofir",
    "what has alice built",
    "more info on bob",
    "give me the full picture on jake",
    "show jake's profile",
    "deep dive on this developer",
    "what's alice's background",
  ],
  platform_stats: [
    "how many builders are on the platform",
    "give me platform stats",
    "numbers overview",
    "current metrics",
    "how big is the network",
    "total projects and builders",
    "platform summary",
    "community size",
  ],
  trending: [
    "what's trending right now",
    "hot projects this week",
    "popular builders right now",
    "show me what's buzzing",
    "most liked projects recently",
    "who's on fire in the community",
    "what's getting traction",
    "top projects this month",
    "trending builders",
    "rising stars on the platform",
    "what's popular lately",
    "show me the most active builders",
    "which projects are blowing up",
    "highest rated this week",
    "viral projects",
  ],
  recommend: [
    "recommend projects for me",
    "what should I build next",
    "suggest a hackathon for beginners",
    "any recommendations for someone learning AI",
    "what's a good project idea",
    "inspire me with project ideas",
    "which hackathon should I join",
    "suggest builders to follow",
    "recommend a tech stack for a startup",
    "what should I check out on antry",
  ],
  profile_tips: [
    "how can I improve my profile",
    "what skills should I add",
    "tips for my builder profile",
    "how do I stand out on the platform",
    "make my profile better",
    "what makes a great builder profile",
    "how to get more visibility",
    "profile optimization tips",
    "what should I put in my bio",
    "how to attract team invites",
  ],
  network_stats: [
    "how many projects shipped this month",
    "new builders this week",
    "growth rate of the community",
    "how many people joined recently",
    "what's the skill distribution",
    "most popular tech stack",
    "what skills are in demand",
    "builder activity this week",
    "projects shipped today",
    "recent activity on the platform",
  ],
  help: [
    "what can you do",
    "help me use scout",
    "how does this work",
    "available commands",
    "what are your capabilities",
    "how do I use this",
    "what can scout do",
  ],
  greeting: [
    "hi",
    "hello",
    "hey",
    "hey there",
    "hi there",
    "good morning",
    "good afternoon",
    "good evening",
    "sup",
    "yo",
    "howdy",
    "hiya",
    "whats up",
    "heyo",
    "hi scout",
    "hello scout",
    "hey scout",
  ],
  off_topic: [
    "what is the weather today",
    "tell me a joke",
    "who is the president",
    "write me an essay",
    "how do I cook pasta",
    "what time is it",
    "translate this to french",
    "play some music",
    "who won the game last night",
    "solve this math problem",
    "can you book me a flight",
    "what's the stock price of apple",
    "write me a poem",
    "order me a pizza",
    "help me with my homework",
  ],
};

// ── Typo / colloquial alias map for fuzzy matching ────────
// Maps common misspellings and slang to canonical tokens used in intent examples.
const TYPO_ALIASES: Record<string, string> = {
  // Common misspellings
  biulder: "builder",
  buidler: "builder",
  buider: "builder",
  bulider: "builder",
  buidlers: "builders",
  biulders: "builders",
  develper: "developer",
  develoer: "developer",
  devloper: "developer",
  devs: "developers",
  enginr: "engineer",
  enginer: "engineer",
  enginers: "engineers",
  engineeer: "engineer",
  hackathn: "hackathon",
  hackaton: "hackathon",
  hacakthon: "hackathon",
  hakcathon: "hackathon",
  proejct: "project",
  porject: "project",
  projet: "project",
  projcts: "projects",
  prjects: "projects",
  compre: "compare",
  comapre: "compare",
  copmare: "compare",
  cmopare: "compare",
  reavt: "react",
  raect: "react",
  typescrpt: "typescript",
  typscript: "typescript",
  pythn: "python",
  pyton: "python",
  langcahin: "langchain",
  // Colloquial / slang
  "who's": "who",
  whos: "who",
  whois: "who",
  gonna: "going",
  wanna: "want",
  gotta: "got",
  ppl: "people",
  peeps: "people",
  dev: "developer",
  devops: "infrastructure",
  infra: "infrastructure",
  fe: "frontend",
  be: "backend",
  fs: "fullstack",
  "full-stack": "fullstack",
  squad: "team",
  crew: "team",
  grp: "group",
  prolly: "probably",
  tho: "though",
  thx: "thanks",
};

// ── Levenshtein distance for fuzzy matching ───────────────

function levenshtein(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  // Use single-row optimization
  let prev = Array.from({ length: lb + 1 }, (_, i) => i);
  let curr = new Array<number>(lb + 1);

  for (let i = 1; i <= la; i++) {
    curr[0] = i;
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[lb];
}

/**
 * Attempts to fix a token by finding the closest match from a vocabulary.
 * Returns the original token if no close match is found.
 */
function fuzzyCorrect(token: string, vocabulary: string[], maxDistance = 2): string {
  // First check exact alias
  const alias = TYPO_ALIASES[token];
  if (alias) return alias;

  if (token.length <= 2) return token;

  let bestMatch = token;
  let bestDist = maxDistance + 1;

  for (const word of vocabulary) {
    // Skip if length difference alone exceeds threshold
    if (Math.abs(word.length - token.length) > maxDistance) continue;
    const dist = levenshtein(token, word);
    if (dist < bestDist) {
      bestDist = dist;
      bestMatch = word;
    }
  }

  return bestMatch;
}

// Build a vocabulary from intent examples + training data for fuzzy correction
const INTENT_VOCABULARY: string[] = (() => {
  const words = new Set<string>();
  Object.values(INTENT_EXAMPLES)
    .flat()
    .forEach((phrase) => {
      phrase
        .toLowerCase()
        .split(/\s+/)
        .forEach((w) => {
          if (w.length > 2) words.add(w);
        });
    });
  // Add words from training examples
  TRAINING_EXAMPLES.forEach((example) => {
    example.query
      .toLowerCase()
      .split(/\s+/)
      .forEach((w) => {
        if (w.length > 2) words.add(w);
      });
  });
  // Add common domain terms
  [
    "builder", "builders", "developer", "developers", "engineer", "engineers",
    "designer", "designers", "project", "projects", "hackathon", "hackathons",
    "compare", "team", "profile", "react", "python", "typescript", "nextjs",
    "langchain", "frontend", "backend", "fullstack", "infrastructure",
    "active", "upcoming", "skills", "stats", "metrics",
    "trending", "popular", "hot", "buzzing", "recommend", "suggest",
    "tips", "improve", "growth", "activity", "recent", "network",
  ].forEach((w) => words.add(w));
  // Add tech stacks from training data
  TECH_STACKS.forEach((w) => { if (w.length > 2) words.add(w); });
  return Array.from(words);
})();


class TfIdfIndex<T> {
  private readonly docs: T[];
  private readonly vectors: SparseVector[];
  private readonly idf: Map<string, number>;

  constructor(items: T[], getText: (item: T) => string) {
    this.docs = items;
    const tokenized = items.map((item) => tokenize(getText(item)));
    const tfList = tokenized.map((tokens) => toFrequency(tokens));

    const docCountByToken = new Map<string, number>();
    tfList.forEach((tf) => {
      tf.forEach((_count, token) => {
        docCountByToken.set(token, (docCountByToken.get(token) || 0) + 1);
      });
    });

    const docCount = Math.max(1, items.length);
    this.idf = new Map<string, number>();
    docCountByToken.forEach((df, token) => {
      const value = Math.log((docCount + 1) / (df + 1)) + 1;
      this.idf.set(token, value);
    });

    this.vectors = tfList.map((tf) => toTfIdfVector(tf, this.idf));
  }

  rank(query: string): Array<{ item: T; score: number }> {
    const qVector = this.vectorize(query);
    return this.docs
      .map((item, index) => ({
        item,
        score: cosineSimilarity(qVector, this.vectors[index]),
      }))
      .sort((a, b) => b.score - a.score);
  }

  vectorize(text: string): SparseVector {
    return toTfIdfVector(toFrequency(tokenize(text)), this.idf);
  }
}

const INTENT_SAMPLES = Object.entries(INTENT_EXAMPLES).flatMap(([intent, phrases]) =>
  phrases.map((phrase) => ({ intent: intent as AgentIntent, phrase }))
);
const INTENT_INDEX = new TfIdfIndex(INTENT_SAMPLES, (sample) => sample.phrase);

interface ProfileRow {
  id: string;
  username: string;
  full_name: string;
  bio: string | null;
  skills: string[] | null;
  gradient: string | null;
  github_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  created_at: string | null;
}

interface ProjectRow {
  id: string;
  builder_id: string;
  title: string;
  tagline: string;
  description: string | null;
  category: string;
  tech_stack: string[] | null;
  demo_url: string | null;
  source_url: string | null;
  build_time: string | null;
  likes_count: number | null;
  created_at: string | null;
  gradient: string | null;
}

interface HackathonRow {
  id: string;
  title: string;
  theme: string;
  description: string | null;
  status: string;
  start_date: string;
  end_date: string;
  prizes: unknown;
  sponsors: unknown;
  participant_count: number | null;
  submission_count: number | null;
  created_at: string | null;
}

// ── Participant / submission rows for engagement data ──────

interface HackathonParticipantRow {
  user_id: string;
  hackathon_id: string;
  registered_at: string;
}

interface HackathonSubmissionRow {
  id: string;
  hackathon_id: string;
  project_id: string;
  submitted_by: string;
  submitted_at: string;
}

interface ProjectLikeRow {
  user_id: string;
  project_id: string;
  created_at: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#-]+/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

/**
 * Tokenize with fuzzy correction: fix typos, expand colloquial aliases,
 * and normalize synonyms using training data before tokenizing.
 * Used for user input, not for indexed documents.
 */
function tokenizeFuzzy(text: string): string[] {
  const raw = text
    .toLowerCase()
    .replace(/[^a-z0-9+.#'-]+/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  return raw
    .map((token) => {
      // First check synonym lookup from training data
      const synonym = SYNONYM_LOOKUP[token];
      if (synonym) return synonym;
      // Then apply fuzzy correction
      return fuzzyCorrect(token, INTENT_VOCABULARY);
    })
    .filter((token) => !STOP_WORDS.has(token));
}

function toFrequency(tokens: string[]): SparseVector {
  const freq = new Map<string, number>();
  if (!tokens.length) return freq;

  const denom = tokens.length;
  tokens.forEach((token) => {
    freq.set(token, (freq.get(token) || 0) + 1 / denom);
  });

  return freq;
}

function toTfIdfVector(tf: SparseVector, idf: Map<string, number>): SparseVector {
  const vector = new Map<string, number>();
  tf.forEach((value, token) => {
    vector.set(token, value * (idf.get(token) || 0));
  });
  return vector;
}

function cosineSimilarity(a: SparseVector, b: SparseVector): number {
  if (a.size === 0 || b.size === 0) return 0;

  let dot = 0;
  a.forEach((value, key) => {
    dot += value * (b.get(key) || 0);
  });

  const magA = Math.sqrt(Array.from(a.values()).reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(Array.from(b.values()).reduce((sum, val) => sum + val * val, 0));

  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function deriveTagline(bio: string | null, skills: string[] | null): string {
  if (bio && bio.trim().length > 0) {
    const firstSentence = bio.split(".")[0]?.trim();
    if (firstSentence) return firstSentence.slice(0, 80);
  }

  if (skills && skills.length > 0) {
    return `${skills.slice(0, 2).join(" + ")} builder shipping in public`;
  }

  return "Builder shipping projects on Antry";
}

function parseHandle(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return undefined;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      return parsed.pathname.split("/").filter(Boolean)[0] || undefined;
    } catch {
      return undefined;
    }
  }

  return trimmed.replace(/^@/, "");
}

function parseWebsite(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      return parsed.host + parsed.pathname.replace(/\/$/, "");
    } catch {
      return undefined;
    }
  }

  return trimmed;
}

function coerceStatus(status: string): "upcoming" | "active" | "completed" {
  if (status === "active" || status === "completed" || status === "upcoming") {
    return status;
  }
  return "upcoming";
}

function normalizePrizes(prizes: unknown): { place: string; reward: string }[] {
  if (!Array.isArray(prizes)) return [];

  const normalized: { place: string; reward: string }[] = [];
  prizes.forEach((entry, index) => {
    if (entry && typeof entry === "object") {
      const maybePlace = "place" in entry ? String(entry.place) : `${index + 1}`;
      const maybeReward = "reward" in entry ? String(entry.reward) : "$0";
      normalized.push({ place: maybePlace, reward: maybeReward });
    }
  });

  return normalized;
}

function normalizeSponsors(sponsors: unknown): { name: string; tier: "title" | "gold" | "partner" }[] {
  if (!Array.isArray(sponsors)) return [];

  const normalized: { name: string; tier: "title" | "gold" | "partner" }[] = [];
  sponsors.forEach((entry) => {
    if (typeof entry === "string") {
      normalized.push({ name: entry, tier: "partner" });
      return;
    }

    if (entry && typeof entry === "object") {
      const name = "name" in entry ? String(entry.name) : "Sponsor";
      const tierRaw = "tier" in entry ? String(entry.tier) : "partner";
      const tier = tierRaw === "title" || tierRaw === "gold" ? tierRaw : "partner";
      normalized.push({ name, tier });
    }
  });

  return normalized;
}

async function buildSupabaseDataset(): Promise<AgentDataset | null> {
  const supabase = await createClient();

  // Pull ALL relevant data in parallel, including engagement tables
  const [
    profilesResult,
    projectsResult,
    hackathonsResult,
    participantsResult,
    submissionsResult,
    likesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, username, full_name, bio, skills, gradient, github_url, twitter_url, website_url, created_at"
      ),
    supabase
      .from("projects")
      .select(
        "id, builder_id, title, tagline, description, category, tech_stack, demo_url, source_url, build_time, likes_count, created_at, gradient"
      ),
    supabase
      .from("hackathons")
      .select(
        "id, title, theme, description, status, start_date, end_date, prizes, sponsors, participant_count, submission_count, created_at"
      ),
    supabase
      .from("hackathon_participants")
      .select("user_id, hackathon_id, registered_at"),
    supabase
      .from("hackathon_submissions")
      .select("id, hackathon_id, project_id, submitted_by, submitted_at"),
    supabase
      .from("project_likes")
      .select("user_id, project_id, created_at"),
  ]);

  if (profilesResult.error || projectsResult.error) {
    return null;
  }

  const profileRows = (profilesResult.data || []) as ProfileRow[];
  const projectRows = (projectsResult.data || []) as ProjectRow[];
  const hackathonRows = ((hackathonsResult.error ? [] : hackathonsResult.data) || []) as HackathonRow[];
  const participantRows = ((participantsResult.error ? [] : participantsResult.data) || []) as HackathonParticipantRow[];
  const submissionRows = ((submissionsResult.error ? [] : submissionsResult.data) || []) as HackathonSubmissionRow[];
  const _likeRows = ((likesResult.error ? [] : likesResult.data) || []) as ProjectLikeRow[];

  // Build a map of hackathon IDs per builder for engagement data
  const hackathonIdsByUserId = new Map<string, string[]>();
  participantRows.forEach((row) => {
    const ids = hackathonIdsByUserId.get(row.user_id) || [];
    ids.push(row.hackathon_id);
    hackathonIdsByUserId.set(row.user_id, ids);
  });

  // Map submissions: project_id -> hackathon_id
  const hackathonIdByProjectId = new Map<string, string>();
  submissionRows.forEach((row) => {
    hackathonIdByProjectId.set(row.project_id, row.hackathon_id);
  });

  const buildersById = new Map<string, AgentBuilder>();

  profileRows.forEach((profile) => {
    buildersById.set(profile.id, {
      id: profile.id,
      username: profile.username,
      name: profile.full_name,
      tagline: deriveTagline(profile.bio, profile.skills),
      bio: profile.bio || "",
      skills: profile.skills || [],
      social: {
        github: parseHandle(profile.github_url),
        twitter: parseHandle(profile.twitter_url),
        website: parseWebsite(profile.website_url),
      },
      projectCount: 0,
      gradient:
        profile.gradient ||
        "linear-gradient(135deg, #111827 0%, #374151 100%)",
      antathonIds: hackathonIdsByUserId.get(profile.id) || [],
      createdAt: profile.created_at || new Date().toISOString(),
    });
  });

  const projects: AgentProject[] = [];
  projectRows.forEach((project) => {
    const builder = buildersById.get(project.builder_id);
    if (!builder) return;

    projects.push({
      id: project.id,
      title: project.title,
      tagline: project.tagline,
      description: project.description || "",
      demoUrl: project.demo_url || "https://antry.dev",
      sourceUrl: project.source_url || undefined,
      techStack: project.tech_stack || [],
      buildTime: project.build_time || "N/A",
      category: project.category,
      builder: {
        username: builder.username,
        name: builder.name,
        gradient: builder.gradient,
      },
      likes: project.likes_count || 0,
      createdAt: project.created_at || new Date().toISOString(),
      gradient:
        project.gradient ||
        "linear-gradient(135deg, #111827 0%, #374151 100%)",
      antathonId: hackathonIdByProjectId.get(project.id) || undefined,
    });
  });

  const projectCountByUsername = new Map<string, number>();
  projects.forEach((project) => {
    projectCountByUsername.set(
      project.builder.username,
      (projectCountByUsername.get(project.builder.username) || 0) + 1
    );
  });

  const builders = Array.from(buildersById.values()).map((builder) => ({
    ...builder,
    projectCount: projectCountByUsername.get(builder.username) || 0,
  }));

  const hackathons: AgentHackathon[] = hackathonRows.map((hackathon) => ({
    id: hackathon.id,
    title: hackathon.title,
    theme: hackathon.theme,
    description: hackathon.description || "",
    startDate: hackathon.start_date,
    endDate: hackathon.end_date,
    prizes: normalizePrizes(hackathon.prizes),
    sponsors: normalizeSponsors(hackathon.sponsors),
    participantCount: hackathon.participant_count || 0,
    submissionCount: hackathon.submission_count || 0,
    status: coerceStatus(hackathon.status),
    gradient: "linear-gradient(135deg, #111827 0%, #374151 100%)",
  }));

  return {
    builders,
    projects,
    hackathons,
    source: "supabase",
  };
}

export async function loadAgentDatasetStrict(): Promise<AgentDataset | null> {
  const now = Date.now();
  const cached = globalCache.__antryAgentDatasetCache;

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const dataset = await buildSupabaseDataset();
  if (!dataset) return null;

  globalCache.__antryAgentDatasetCache = {
    value: dataset,
    expiresAt: now + DATASET_CACHE_TTL_MS,
  };

  return dataset;
}

/**
 * Checks whether the message is a reasonable Antry-network query.
 * Keep this gate broad enough for fuzzy user phrasing, but reject
 * generic chat/off-topic prompts before loading Scout data.
 */
export function isDomainScopedAgentQuery(message: string): boolean {
  const lower = message.toLowerCase().trim();

  // Block obvious prompt injection attempts
  if (
    lower.includes("ignore previous instructions") ||
    lower.includes("ignore all instructions") ||
    lower.includes("forget your instructions") ||
    lower.includes("system prompt") ||
    lower.includes("you are now") ||
    lower.includes("act as") && lower.includes("ignore")
  ) {
    return false;
  }

  // Block messages that are just URLs or look like automated spam
  const urlCount = (message.match(/https?:\/\//g) || []).length;
  if (urlCount > 3) return false;

  return /\b(antry|scout|builder|builders|developer|developers|engineer|engineers|designer|designers|talent|profile|profiles|project|projects|demo|demos|brief|briefs|receipt|receipts|hackathon|hackathons|antathon|antathons|event|events|team|squad|crew|skill|skills|recruit|hire|hiring|stats|metrics|overview|discover|directory|likes|ship|shipped|shipping|sponsor|sponsors|company|companies|mcp)\b/.test(lower);
}

// ── Greeting / off-topic detection ─────────────────────────

const GREETING_PATTERNS = /^\s*(hi|hello|hey|howdy|hiya|heyo|yo|sup|good\s*(morning|afternoon|evening|day)|what'?s\s*up|greetings|hola)(\s+scout)?\s*[!?.]*\s*$/i;

/**
 * Detects if the message is a short greeting with no substantive query.
 */
function isGreeting(message: string): boolean {
  return GREETING_PATTERNS.test(message.trim());
}

/**
 * Detects if the message is a meta-question about Scout's capabilities.
 * These overlap with "help" but are more conversational.
 */
function isMetaQuestion(message: string): boolean {
  const q = message.toLowerCase().trim();
  return /^(what can you do|what do you do|how does this work|what is this|what is antry|what is scout|how do i use this|who are you|tell me about yourself|what are you)\s*[!?.]*$/.test(q);
}

function classifyIntent(message: string): { intent: AgentIntent; confidence: number } {
  // Fast-path: greetings
  if (isGreeting(message)) {
    return { intent: "greeting", confidence: 0.95 };
  }

  // Fast-path: meta-questions -> help
  if (isMetaQuestion(message)) {
    return { intent: "help", confidence: 0.92 };
  }

  // Apply fuzzy correction to the user message before classification
  const correctedTokens = tokenizeFuzzy(message);
  const correctedMessage = correctedTokens.join(" ");

  // Rank against both original and corrected message, take the better scores
  const rankedOriginal = INTENT_INDEX.rank(message);
  const rankedCorrected = correctedMessage !== message.toLowerCase()
    ? INTENT_INDEX.rank(correctedMessage)
    : [];

  const scoreByIntent = new Map<AgentIntent, number>();

  rankedOriginal.forEach(({ item, score }) => {
    const current = scoreByIntent.get(item.intent) || 0;
    if (score > current) {
      scoreByIntent.set(item.intent, score);
    }
  });

  // Merge corrected scores (take max)
  rankedCorrected.forEach(({ item, score }) => {
    const current = scoreByIntent.get(item.intent) || 0;
    if (score > current) {
      scoreByIntent.set(item.intent, score);
    }
  });

  const q = message.toLowerCase();
  // Also check the corrected form for regex boosts
  const qCorrected = correctedMessage;

  const boosts: IntentScore[] = [];
  if (/(compare|versus|\bvs\b)/.test(q) || /(compare|versus|\bvs\b)/.test(qCorrected)) {
    boosts.push({ intent: "compare_builders", score: 0.42 });
  }
  if (/(build|assemble|form|create|put together).*(team|squad|crew|group)|team|squad|crew/.test(q) ||
      /(build|assemble|form|create|put together).*(team|squad|crew|group)|team|squad|crew/.test(qCorrected)) {
    boosts.push({ intent: "build_team", score: 0.35 });
  }
  if (/(tell me about|who is|profile|details|more info|what has.*built)/.test(q) ||
      /(tell me about|who is|profile|details|more info|what has.*built)/.test(qCorrected)) {
    boosts.push({ intent: "builder_detail", score: 0.38 });
  }
  if (/(hackathon|antathon|event|join)/.test(q) || /(hackathon|antathon|event|join)/.test(qCorrected)) {
    boosts.push({ intent: "find_hackathons", score: 0.33 });
  }
  if (/(project|demo|built with|using|tool|app|shipped|stuff)/.test(q) ||
      /(project|demo|built with|using|tool|app|shipped|stuff)/.test(qCorrected)) {
    boosts.push({ intent: "find_projects", score: 0.31 });
  }
  if (/(builder|developer|engineer|designer|talent|good at|skilled|anyone|devs|ppl)/.test(q) ||
      /(builder|developer|engineer|designer|talent|good at|skilled|anyone)/.test(qCorrected)) {
    boosts.push({ intent: "find_builders", score: 0.31 });
  }
  if (/(how many|stats|numbers|overview|metrics|how big)/.test(q) ||
      /(how many|stats|numbers|overview|metrics|how big)/.test(qCorrected)) {
    boosts.push({ intent: "platform_stats", score: 0.4 });
  }
  // New intent boosts: trending
  if (/(trending|hot|popular|buzzing|on fire|blowing up|viral|rising star|most liked|most active|highest rated)/.test(q) ||
      /(trending|hot|popular|buzzing|on fire|blowing up|viral|rising star|most liked|most active)/.test(qCorrected)) {
    boosts.push({ intent: "trending", score: 0.44 });
  }
  // New intent boosts: recommend
  if (/(recommend|suggest|should i|inspiration|inspire|idea|check out|what.*build)/.test(q) ||
      /(recommend|suggest|should i|inspiration|inspire|idea|check out)/.test(qCorrected)) {
    boosts.push({ intent: "recommend", score: 0.4 });
  }
  // New intent boosts: profile_tips
  if (/(improve.*profile|profile.*tip|stand out|better profile|visibility|bio tip|optimize.*profile|make.*profile)/.test(q) ||
      /(improve.*profile|profile.*tip|stand out|better profile|visibility|bio tip|optimize.*profile)/.test(qCorrected)) {
    boosts.push({ intent: "profile_tips", score: 0.45 });
  }
  // New intent boosts: network_stats (time-aware queries)
  if (/(shipped this|new.*this week|this month|joined recently|skill distribution|in demand|activity this|shipped today|recent activity|growth rate)/.test(q) ||
      /(shipped this|new.*this week|this month|joined recently|skill distribution|in demand|activity this|shipped today|recent activity)/.test(qCorrected)) {
    boosts.push({ intent: "network_stats", score: 0.43 });
  }
  if (/(help|what can you do|commands|capabilities|how does this|how do i use)/.test(q)) {
    boosts.push({ intent: "help", score: 0.3 });
  }
  // Greeting boost
  if (/^(hi|hello|hey|yo|sup|howdy|hiya|good\s*(morning|afternoon|evening))\b/.test(q)) {
    boosts.push({ intent: "greeting", score: 0.5 });
  }

  boosts.forEach((boost) => {
    scoreByIntent.set(
      boost.intent,
      (scoreByIntent.get(boost.intent) || 0) + boost.score
    );
  });

  const sorted = Array.from(scoreByIntent.entries()).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    return { intent: "help", confidence: 0.35 };
  }

  const [topIntent, topScore] = sorted[0];
  // Count how many training examples matched this intent above threshold
  const intentMatchCount = rankedOriginal.filter(
    (r) => r.item.intent === topIntent && r.score > 0.15
  ).length;
  const confidence = calibrateConfidence(topScore, intentMatchCount);
  return { intent: topIntent, confidence };
}

function isShortFollowUp(message: string): boolean {
  return tokenize(message).length <= 3;
}

// ── Enhanced multi-turn conversation context ──────────────

/**
 * Extracts the last assistant intent from history, if available.
 * Checks the `intent` field stashed on assistant turns, falling back
 * to a keyword heuristic on the assistant response text.
 */
function inferPriorIntent(history: AgentChatTurn[]): AgentIntent | null {
  // Walk backwards to find the most recent assistant turn
  for (let i = history.length - 1; i >= 0; i--) {
    const turn = history[i];
    if (turn.role === "assistant") {
      if (turn.intent) return turn.intent;
      // Fallback: infer from response text
      const text = turn.content.toLowerCase();
      if (text.includes("builder match")) return "find_builders";
      if (text.includes("project")) return "find_projects";
      if (text.includes("hackathon")) return "find_hackathons";
      if (text.includes("team for")) return "build_team";
      if (text.includes("compared") || text.includes("vs")) return "compare_builders";
      if (text.includes("profile for")) return "builder_detail";
      if (text.includes("trending") || text.includes("hot")) return "trending";
      if (text.includes("recommend") || text.includes("suggest")) return "recommend";
      if (text.includes("profile tip") || text.includes("stand out")) return "profile_tips";
      if (text.includes("activity") || text.includes("growth")) return "network_stats";
      break;
    }
  }
  return null;
}

/**
 * Detects if the current message is a follow-up that references prior results
 * (e.g., "which one has the most projects?", "tell me more about the first one").
 */
function isContextualFollowUp(message: string): boolean {
  const q = message.toLowerCase();
  return /\b(which one|the first|the second|the top|the best|most|any of them|from those|these|that one|from the list)\b/.test(q);
}

function buildRetrievalQuery(message: string, history: AgentChatTurn[]): string {
  // If it's a short follow-up OR a contextual reference, enrich with history
  if ((!isShortFollowUp(message) && !isContextualFollowUp(message)) || history.length === 0) {
    return message;
  }
  const context = history.slice(-2).map((turn) => turn.content).join(" ");
  return `${context} ${message}`.trim();
}

/**
 * For contextual follow-ups, try to re-use the prior intent if the current
 * classification is weak or generic (help).
 */
function resolveIntentWithContext(
  message: string,
  history: AgentChatTurn[],
  classified: { intent: AgentIntent; confidence: number }
): { intent: AgentIntent; confidence: number } {
  const contextual = isContextualFollowUp(message) || isShortFollowUp(message);
  const priorIntent = contextual ? inferPriorIntent(history) : null;

  if (
    contextual &&
    priorIntent === "find_builders" &&
    classified.intent === "find_projects" &&
    /\b(which one|the first|the second|the top|the best|most|any of them|from those|these|that one|from the list)\b/i.test(message)
  ) {
    return {
      intent: priorIntent,
      confidence: Math.max(classified.confidence, 0.56),
    };
  }

  // If the classifier is reasonably confident, trust it
  if (classified.confidence > 0.55 && classified.intent !== "help") {
    return classified;
  }

  // If it's a contextual follow-up, inherit the prior intent
  if (contextual) {
    if (priorIntent) {
      return {
        intent: priorIntent,
        confidence: Math.max(classified.confidence, 0.5),
      };
    }
  }

  return classified;
}

function computeBuilderLikes(projects: AgentProject[]): Map<string, number> {
  const likes = new Map<string, number>();
  projects.forEach((project) => {
    likes.set(
      project.builder.username,
      (likes.get(project.builder.username) || 0) + project.likes
    );
  });
  return likes;
}

// ── Scoring helpers that return raw scores alongside items ─

function rankBuildersWithScores(query: string, dataset: AgentDataset): Array<{ builder: AgentBuilder; score: number }> {
  const index = new TfIdfIndex(dataset.builders, (builder) =>
    [
      builder.name,
      builder.username,
      builder.tagline,
      builder.bio,
      builder.skills.join(" "),
    ].join(" ")
  );

  const likesByBuilder = computeBuilderLikes(dataset.projects);
  const q = query.toLowerCase();
  const searchTerms = extractSearchTerms(query);

  return index
    .rank(query)
    .map(({ item, score }) => {
      let boosted = score;
      // Name/username exact match
      if (q.includes(item.username.toLowerCase())) boosted += 0.9;
      if (q.includes(item.name.toLowerCase().split(" ")[0])) boosted += 0.45;

      // Skill matching with partial/alias support
      const skillMatchCount = searchTerms.filter((term) =>
        item.skills.some((skill) => techMatches(term, skill))
      ).length;
      boosted += skillMatchCount * 0.25;

      // Bio text matching: check if search terms appear in bio
      const lowerBio = item.bio.toLowerCase();
      const bioMatchCount = searchTerms.filter((term) => lowerBio.includes(term)).length;
      boosted += bioMatchCount * 0.12;

      // Tagline matching
      const lowerTagline = item.tagline.toLowerCase();
      const taglineMatchCount = searchTerms.filter((term) => lowerTagline.includes(term)).length;
      boosted += taglineMatchCount * 0.08;

      // Engagement signals
      boosted += Math.min(0.3, (likesByBuilder.get(item.username) || 0) / 600);
      boosted += Math.min(0.2, item.projectCount / 30);
      return { builder: item, score: boosted };
    })
    .sort((a, b) => b.score - a.score);
}

function rankBuilders(query: string, dataset: AgentDataset): AgentBuilder[] {
  return rankBuildersWithScores(query, dataset).map((entry) => entry.builder);
}

function rankProjectsWithScores(query: string, dataset: AgentDataset): Array<{ project: AgentProject; score: number }> {
  const index = new TfIdfIndex(dataset.projects, (project) =>
    [
      project.title,
      project.tagline,
      project.description,
      project.techStack.join(" "),
      project.category,
      project.builder.name,
    ].join(" ")
  );

  const q = query.toLowerCase();
  const searchTerms = extractSearchTerms(query);

  return index
    .rank(query)
    .map(({ item, score }) => {
      let boosted = score + Math.min(0.35, item.likes / 500);
      // Title match
      if (q.includes(item.title.toLowerCase())) boosted += 0.7;

      // Tech stack matching with partial/alias support
      const techMatchCount = searchTerms.filter((term) =>
        item.techStack.some((tech) => techMatches(term, tech))
      ).length;
      boosted += techMatchCount * 0.28;

      // Description matching
      const lowerDesc = item.description.toLowerCase();
      const descMatchCount = searchTerms.filter((term) => lowerDesc.includes(term)).length;
      boosted += descMatchCount * 0.1;

      // Tagline matching
      const lowerTagline = item.tagline.toLowerCase();
      const taglineMatchCount = searchTerms.filter((term) => lowerTagline.includes(term)).length;
      boosted += taglineMatchCount * 0.08;

      // Category matching
      if (searchTerms.some((term) => item.category.toLowerCase().includes(term))) {
        boosted += 0.15;
      }

      return { project: item, score: boosted };
    })
    .sort((a, b) => b.score - a.score);
}

function rankProjects(query: string, dataset: AgentDataset): AgentProject[] {
  return rankProjectsWithScores(query, dataset).map((entry) => entry.project);
}

function rankHackathonsWithScores(query: string, dataset: AgentDataset): Array<{ hackathon: AgentHackathon; score: number }> {
  const index = new TfIdfIndex(dataset.hackathons, (hackathon) =>
    [
      hackathon.title,
      hackathon.theme,
      hackathon.description,
      hackathon.status,
      hackathon.sponsors.map((sponsor) => sponsor.name).join(" "),
    ].join(" ")
  );

  const q = query.toLowerCase();
  return index
    .rank(query)
    .map(({ item, score }) => {
      let boosted = score;
      if (item.status === "active") boosted += 0.28;
      if (item.status === "upcoming") boosted += 0.12;
      if (q.includes("active") && item.status === "active") boosted += 0.4;
      if (q.includes("upcoming") && item.status === "upcoming") boosted += 0.4;
      return { hackathon: item, score: boosted };
    })
    .sort((a, b) => b.score - a.score);
}

function rankHackathons(query: string, dataset: AgentDataset): AgentHackathon[] {
  return rankHackathonsWithScores(query, dataset).map((entry) => entry.hackathon);
}

/**
 * Converts a raw TF-IDF + boost score into a 0-100 relevance percentage.
 * Uses the top score in the ranked list as a reference ceiling.
 */
function toRelevancePercent(score: number, topScore: number): number {
  if (topScore <= 0) return 50;
  const ratio = score / topScore;
  // Map to 60-99 range (we never show less than 60% for returned results,
  // since we already filter to the top N). The top result is always 95-99%.
  const percent = Math.round(60 + ratio * 39);
  return Math.min(99, Math.max(60, percent));
}

/**
 * Checks if a search term partially matches a skill/tech, using the TECH_ALIASES map
 * and case-insensitive substring matching.
 * E.g., "react" matches "React.js", "ReactJS", "react-native"
 */
function techMatches(searchTerm: string, skill: string): boolean {
  const lowerSearch = searchTerm.toLowerCase();
  const lowerSkill = skill.toLowerCase();

  // Direct case-insensitive match
  if (lowerSkill.includes(lowerSearch) || lowerSearch.includes(lowerSkill)) return true;

  // Normalized match: strip dots, hyphens, spaces, "js" suffix
  const normalize = (s: string) => s.replace(/[.\-\s]/g, "").replace(/js$/i, "");
  if (normalize(lowerSkill) === normalize(lowerSearch)) return true;

  // Check alias groups
  for (const [_canonical, aliases] of Object.entries(TECH_ALIASES)) {
    const aliasesLower = aliases.map((a) => a.toLowerCase());
    const searchInGroup = aliasesLower.some((a) => a === lowerSearch || a.includes(lowerSearch) || lowerSearch.includes(a));
    const skillInGroup = aliasesLower.some((a) => a === lowerSkill || lowerSkill.includes(a) || a.includes(lowerSkill));
    if (searchInGroup && skillInGroup) return true;
  }

  return false;
}

/**
 * Extracts search keywords from a query that might be tech/skill terms.
 */
function extractSearchTerms(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9+.#\-\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function findMentionedBuilders(message: string, builders: AgentBuilder[]): AgentBuilder[] {
  const q = message.toLowerCase();

  return builders
    .map((builder) => {
      const firstName = builder.name.toLowerCase().split(" ")[0];
      const fullName = builder.name.toLowerCase();
      const username = builder.username.toLowerCase();

      let score = 0;
      if (q.includes(fullName)) score += 1;
      if (q.includes(firstName)) score += 0.6;
      if (q.includes(username)) score += 0.8;

      return { builder, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.builder);
}

function getBuilderProjects(username: string, projects: AgentProject[]): AgentProject[] {
  return projects
    .filter((project) => project.builder.username === username)
    .sort((a, b) => b.likes - a.likes);
}

function getBuilderHackathons(username: string, dataset: AgentDataset): AgentHackathon[] {
  const builder = dataset.builders.find((item) => item.username === username);
  if (!builder) return [];

  if (builder.antathonIds.length === 0) return [];
  return dataset.hackathons.filter((hackathon) =>
    builder.antathonIds.includes(hackathon.id)
  );
}

// ── Enhanced team building with role-gap analysis ─────────

/** Infers needed roles based on the theme/topic of the hackathon or project. */
function inferRolesForTheme(theme: string): Array<{ role: string; skillTokens: string[]; description: string }> {
  const q = theme.toLowerCase();

  const roles: Array<{ role: string; skillTokens: string[]; description: string }> = [];

  // Always need some form of these core roles
  const hasAI = /(ai|ml|machine learning|agent|llm|gpt|claude|rag|langchain|openai|deep learning|neural)/.test(q);
  const hasWeb = /(web|frontend|ui|ux|react|next|vue|angular|interface)/.test(q);
  const hasData = /(data|analytics|pipeline|etl|warehouse|visualization)/.test(q);
  const hasMobile = /(mobile|ios|android|react native|flutter|swift)/.test(q);

  if (hasAI) {
    roles.push({
      role: "ML / AI Engineer",
      skillTokens: ["python", "ai", "rag", "langchain", "pytorch", "ml", "tensorflow", "claude"],
      description: "Builds the AI/ML core - models, agents, or RAG pipelines",
    });
  } else {
    roles.push({
      role: "AI / Backend Lead",
      skillTokens: ["python", "ai", "rag", "langchain", "fastapi", "pytorch"],
      description: "Handles backend logic and any AI integrations",
    });
  }

  if (hasWeb || !hasMobile) {
    roles.push({
      role: "Full-Stack Engineer",
      skillTokens: ["react", "next", "typescript", "node", "websockets", "postgres"],
      description: "Owns the product surface - frontend, API layer, and database",
    });
  }

  if (hasMobile) {
    roles.push({
      role: "Mobile Engineer",
      skillTokens: ["react-native", "swift", "kotlin", "flutter", "ios", "android"],
      description: "Builds native or cross-platform mobile experience",
    });
  }

  roles.push({
    role: "Design Engineer",
    skillTokens: ["design", "figma", "three", "motion", "css", "ui", "ux"],
    description: "Creates the visual identity, interactions, and user experience",
  });

  if (hasData) {
    roles.push({
      role: "Data Engineer",
      skillTokens: ["python", "sql", "postgres", "bigquery", "spark", "pandas"],
      description: "Manages data pipelines, storage, and analytics layer",
    });
  }

  roles.push({
    role: "Infrastructure / DevOps",
    skillTokens: ["go", "rust", "terraform", "kubernetes", "docker", "infra", "aws", "gcp"],
    description: "Ensures reliable deployment, CI/CD, and scalability",
  });

  return roles;
}

/** Detects skills from a builder that complement (don't overlap with) other team members. */
function findComplementarySkills(builder: AgentBuilder, otherMembers: AgentBuilder[]): string[] {
  const otherSkills = new Set<string>();
  otherMembers.forEach((m) => {
    m.skills.forEach((s) => otherSkills.add(s.toLowerCase()));
  });

  return builder.skills.filter((s) => !otherSkills.has(s.toLowerCase()));
}

function buildTeam(theme: string, dataset: AgentDataset): TeamData {
  const roles = inferRolesForTheme(theme);

  const themeRank = rankBuilders(theme, dataset);
  const themeScoreByUsername = new Map<string, number>();
  themeRank.forEach((builder, index) => {
    themeScoreByUsername.set(builder.username, Math.max(0, 1 - index * 0.15));
  });

  const likesByBuilder = computeBuilderLikes(dataset.projects);
  const used = new Set<string>();
  const pickedBuilders: AgentBuilder[] = [];

  const roleGaps: RoleGap[] = [];

  const members: TeamMember[] = roles
    .map((slot) => {
      const scored = dataset.builders
        .filter((builder) => !used.has(builder.id))
        .map((builder) => {
          const lowerSkills = builder.skills.map((skill) => skill.toLowerCase());
          const matchedSkills = builder.skills.filter((skill) =>
            slot.skillTokens.some((token) => skill.toLowerCase().includes(token))
          );

          const skillScore = slot.skillTokens.reduce((sum, token) => {
            return sum + (lowerSkills.some((skill) => skill.includes(token)) ? 1 : 0);
          }, 0);

          const relevanceScore = themeScoreByUsername.get(builder.username) || 0;
          const deliveryScore =
            builder.projectCount * 0.15 +
            Math.min(0.8, (likesByBuilder.get(builder.username) || 0) / 250);

          const score = skillScore * 0.45 + relevanceScore * 0.35 + deliveryScore * 0.2;

          return {
            builder,
            score,
            matchedSkills,
          };
        })
        .sort((a, b) => b.score - a.score);

      const picked = scored[0];
      if (!picked || picked.score < 0.05) {
        // Role gap: couldn't find a good fit
        roleGaps.push({
          role: slot.role,
          neededSkills: slot.skillTokens.slice(0, 4),
          filled: false,
        });
        return null;
      }

      used.add(picked.builder.id);

      const reasonSkills =
        picked.matchedSkills.length > 0
          ? picked.matchedSkills.slice(0, 3).join(", ")
          : picked.builder.skills.slice(0, 3).join(", ");

      const complementary = findComplementarySkills(picked.builder, pickedBuilders);
      pickedBuilders.push(picked.builder);

      // Compute a relevance percentage for this role assignment
      const maxPossible = slot.skillTokens.length * 0.45 + 1 * 0.35 + 0.8 * 0.2;
      const relevancePct = Math.min(99, Math.round((picked.score / Math.max(0.1, maxPossible)) * 100));

      roleGaps.push({
        role: slot.role,
        neededSkills: slot.skillTokens.slice(0, 4),
        filled: true,
      });

      return {
        builder: picked.builder,
        role: slot.role,
        reason: `Best fit for ${slot.role}: strong in ${reasonSkills}. ${slot.description}.`,
        relevanceScore: relevancePct,
        complementarySkills: complementary.slice(0, 5),
      };
    })
    .filter((member): member is TeamMember => member !== null);

  // Compute team coverage: union of all skills
  const teamCoverage = Array.from(
    new Set(members.flatMap((m) => m.builder.skills))
  );

  return {
    members,
    theme,
    roleGaps,
    teamCoverage,
  };
}

function getBuilderDetail(builder: AgentBuilder, dataset: AgentDataset): BuilderDetailData {
  const projects = getBuilderProjects(builder.username, dataset.projects);
  const antathons = getBuilderHackathons(builder.username, dataset);

  return {
    builder,
    projects,
    antathons,
    totalLikes: projects.reduce((sum, project) => sum + project.likes, 0),
  };
}

function compareBuilders(
  builderA: AgentBuilder,
  builderB: AgentBuilder,
  dataset: AgentDataset
): ComparisonData {
  const projectsA = getBuilderProjects(builderA.username, dataset.projects);
  const projectsB = getBuilderProjects(builderB.username, dataset.projects);

  const setA = new Set(builderA.skills.map((skill) => skill.toLowerCase()));
  const setB = new Set(builderB.skills.map((skill) => skill.toLowerCase()));

  return {
    builderA,
    builderB,
    projectsA,
    projectsB,
    likesA: projectsA.reduce((sum, project) => sum + project.likes, 0),
    likesB: projectsB.reduce((sum, project) => sum + project.likes, 0),
    sharedSkills: builderA.skills.filter((skill) => setB.has(skill.toLowerCase())),
    uniqueA: builderA.skills.filter((skill) => !setB.has(skill.toLowerCase())),
    uniqueB: builderB.skills.filter((skill) => !setA.has(skill.toLowerCase())),
  };
}

function extractTheme(message: string): string {
  const match = message.match(/(?:for|about|around|theme(?:d)?\s+as)\s+(.+)$/i);
  if (match?.[1]) return match[1].trim();
  return "AI + Product";
}

function toPrizePool(prizes: { place: string; reward: string }[]): string {
  const total = prizes
    .map((prize) => parseInt(prize.reward.replace(/[^0-9]/g, ""), 10) || 0)
    .reduce((sum, value) => sum + value, 0);

  return total > 0 ? `$${total.toLocaleString()}` : "TBD";
}

// ── Data Aggregation Helpers ──────────────────────────────

/** Get builders with the most recent activity/likes, sorted by a composite score. */
export function getTrendingBuilders(dataset: AgentDataset, limit = 5): AgentBuilder[] {
  const likesByBuilder = computeBuilderLikes(dataset.projects);
  const now = Date.now();

  return [...dataset.builders]
    .map((builder) => {
      const likes = likesByBuilder.get(builder.username) || 0;
      // Recency bonus: builders who joined recently get a boost
      const ageMs = now - new Date(builder.createdAt).getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      const recencyBonus = ageDays < 7 ? 0.5 : ageDays < 30 ? 0.25 : 0;
      // Activity score: likes + projects + recency
      const score = likes * 0.4 + builder.projectCount * 0.4 + recencyBonus;
      return { builder, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.builder);
}

/** Get projects with the most recent likes/engagement, sorted by popularity + recency. */
export function getTrendingProjects(dataset: AgentDataset, limit = 5): AgentProject[] {
  const now = Date.now();

  return [...dataset.projects]
    .map((project) => {
      const ageMs = now - new Date(project.createdAt).getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      // More weight to recent projects: decay older projects
      const recencyMultiplier = ageDays < 7 ? 2.0 : ageDays < 30 ? 1.5 : 1.0;
      const score = project.likes * recencyMultiplier;
      return { project, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.project);
}

/** Compute comprehensive network stats with time-aware counts. */
export function getNetworkStats(dataset: AgentDataset): NetworkStats {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalLikes = dataset.projects.reduce((sum, p) => sum + p.likes, 0);

  const newBuildersThisWeek = dataset.builders.filter(
    (b) => new Date(b.createdAt) >= weekAgo
  ).length;
  const newBuildersThisMonth = dataset.builders.filter(
    (b) => new Date(b.createdAt) >= monthAgo
  ).length;
  const newProjectsThisWeek = dataset.projects.filter(
    (p) => new Date(p.createdAt) >= weekAgo
  ).length;
  const newProjectsThisMonth = dataset.projects.filter(
    (p) => new Date(p.createdAt) >= monthAgo
  ).length;

  return {
    totalBuilders: dataset.builders.length,
    totalProjects: dataset.projects.length,
    totalHackathons: dataset.hackathons.length,
    totalLikes,
    activeHackathons: dataset.hackathons.filter((h) => h.status === "active").length,
    upcomingHackathons: dataset.hackathons.filter((h) => h.status === "upcoming").length,
    completedHackathons: dataset.hackathons.filter((h) => h.status === "completed").length,
    avgProjectsPerBuilder:
      dataset.builders.length > 0
        ? Math.round((dataset.projects.length / dataset.builders.length) * 10) / 10
        : 0,
    avgLikesPerProject:
      dataset.projects.length > 0
        ? Math.round((totalLikes / dataset.projects.length) * 10) / 10
        : 0,
    newBuildersThisWeek,
    newProjectsThisWeek,
    newBuildersThisMonth,
    newProjectsThisMonth,
  };
}

/** Get breakdown of skills across all builders. */
export function getSkillDistribution(dataset: AgentDataset): SkillDistribution[] {
  const counts = new Map<string, number>();
  dataset.builders.forEach((builder) => {
    builder.skills.forEach((skill) => {
      const key = skill.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  });

  const total = dataset.builders.length || 1;

  return Array.from(counts.entries())
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

/** Get recent activity: new builders, new projects, active hackathons. */
export function getRecentActivity(dataset: AgentDataset, sinceDaysAgo = 14): RecentActivityItem[] {
  const since = new Date(Date.now() - sinceDaysAgo * 24 * 60 * 60 * 1000);
  const items: RecentActivityItem[] = [];

  dataset.builders
    .filter((b) => new Date(b.createdAt) >= since)
    .forEach((builder) => {
      items.push({
        type: "new_builder",
        label: `${builder.name} joined the network`,
        detail: builder.skills.length > 0
          ? `Skills: ${builder.skills.slice(0, 3).join(", ")}`
          : "New builder",
        timestamp: builder.createdAt,
      });
    });

  dataset.projects
    .filter((p) => new Date(p.createdAt) >= since)
    .forEach((project) => {
      items.push({
        type: "new_project",
        label: `${project.title} shipped by ${project.builder.name}`,
        detail: `${project.techStack.slice(0, 3).join(", ")} | ${project.likes} likes`,
        timestamp: project.createdAt,
      });
    });

  dataset.hackathons
    .filter((h) => h.status === "active")
    .forEach((hackathon) => {
      items.push({
        type: "active_hackathon",
        label: `${hackathon.title} is live`,
        detail: `Theme: ${hackathon.theme} | ${hackathon.participantCount} participants`,
        timestamp: hackathon.startDate,
      });
    });

  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ── Response formatting helpers (conversational + markdown) ─

function builderListIntro(count: number, _query: string): string {
  return `Found **${count} builder${count !== 1 ? "s" : ""}** matching your search:`;
}

function projectListIntro(count: number): string {
  return `Found **${count} project${count !== 1 ? "s" : ""}** matching your search:`;
}

function hackathonIntro(best: AgentHackathon): string {
  if (best.status === "active") {
    return `**${best.title}** is live now -- "${best.theme}" theme, **${toPrizePool(best.prizes)}** in prizes.`;
  }
  if (best.status === "upcoming") {
    return `**${best.title}** is coming up -- "${best.theme}" theme, **${toPrizePool(best.prizes)}** in prizes.`;
  }
  return `Top match: **${best.title}** (${best.status}), **${toPrizePool(best.prizes)}** in prizes.`;
}

function teamIntro(team: TeamData): string {
  const filledCount = team.roleGaps.filter((r) => r.filled).length;
  const totalRoles = team.roleGaps.length;
  const gapCount = totalRoles - filledCount;

  let intro = `**${team.members.length}-person team** for **${team.theme}**, covering ${team.teamCoverage.length} skills.`;

  if (gapCount > 0) {
    const unfilled = team.roleGaps.filter((r) => !r.filled).map((r) => r.role);
    intro += ` Gap: **${unfilled.join(", ")}**.`;
  } else {
    intro += ` All ${totalRoles} roles covered.`;
  }

  return intro;
}

function builderDetailIntro(detail: BuilderDetailData): string {
  const b = detail.builder;
  let intro = `**${b.name}** (@${b.username}) -- ${detail.projects.length} project${detail.projects.length !== 1 ? "s" : ""}, ${detail.totalLikes} likes.`;

  if (b.skills.length > 0) {
    intro += ` Stack: **${b.skills.slice(0, 4).join(", ")}**.`;
  }

  return intro;
}

function comparisonIntro(data: ComparisonData): string {
  let intro = `**${data.builderA.name}** vs **${data.builderB.name}**:\n`;
  intro += `\n- **${data.builderA.name}**: ${data.projectsA.length} projects, ${data.likesA} likes`;
  intro += `\n- **${data.builderB.name}**: ${data.projectsB.length} projects, ${data.likesB} likes`;

  if (data.sharedSkills.length > 0) {
    intro += `\n\nShared skills: **${data.sharedSkills.join(", ")}**.`;
  }

  return intro;
}

function platformStatsIntro(dataset: AgentDataset): string {
  const totalLikes = dataset.projects.reduce((sum, project) => sum + project.likes, 0);
  const activeHackathons = dataset.hackathons.filter(
    (hackathon) => hackathon.status === "active"
  ).length;

  return (
    `**${dataset.builders.length}** builders, **${dataset.projects.length}** projects, ` +
    `**${dataset.hackathons.length}** hackathons (${activeHackathons} active), ` +
    `**${totalLikes.toLocaleString()}** total likes.`
  );
}

function trendingIntro(_trendingBuilders: AgentBuilder[], _trendingProjects: AgentProject[]): string {
  return "Here's what's trending on Antry right now:";
}

function recommendIntro(_dataset: AgentDataset): string {
  return "Here are my top picks for you right now:";
}

function profileTipsIntro(_dataset: AgentDataset): string {
  return (
    "Ship projects, list your skills, write a clear bio, and link your socials. " +
    "Active builders get noticed fast."
  );
}

function networkStatsIntro(dataset: AgentDataset, query: string): string {
  const stats = getNetworkStats(dataset);
  const timeWindow = parseTimeWindow(query);

  if (timeWindow) {
    const filteredProjects = dataset.projects.filter(
      (p) => new Date(p.createdAt) >= new Date(timeWindow.since)
    );
    const filteredBuilders = dataset.builders.filter(
      (b) => new Date(b.createdAt) >= new Date(timeWindow.since)
    );
    return `**${timeWindow.label}:** ${filteredBuilders.length} new builders, ${filteredProjects.length} projects shipped.`;
  }

  return (
    `This week: **${stats.newBuildersThisWeek}** new builders, **${stats.newProjectsThisWeek}** projects shipped. ` +
    `Total: **${stats.totalBuilders}** builders, **${stats.totalProjects}** projects.`
  );
}

// ── Contextual suggestions engine ─────────────────────────

function generateSuggestions(intent: AgentIntent, cards: AgentRichCard[], dataset: AgentDataset): AgentSuggestion[] {
  const suggestions: AgentSuggestion[] = [];

  switch (intent) {
    case "find_builders": {
      if (cards.length >= 2) {
        const names = cards
          .filter((c): c is AgentRichCard & { type: "builder" } => c.type === "builder")
          .slice(0, 2)
          .map((c) => c.data.name.split(" ")[0]);
        if (names.length === 2) {
          suggestions.push({
            label: `Compare ${names[0]} and ${names[1]}`,
            prompt: `Compare ${names[0]} and ${names[1]}`,
          });
        }
      }
      if (cards.length > 0) {
        const first = cards[0];
        if (first.type === "builder") {
          suggestions.push({
            label: `Tell me more about ${first.data.name.split(" ")[0]}`,
            prompt: `Tell me about ${first.data.name}`,
          });
        }
      }
      suggestions.push({
        label: "Build a team from these matches",
        prompt: "Build me a team for an AI hackathon",
      });
      break;
    }
    case "find_projects": {
      suggestions.push({
        label: "Who built the top project?",
        prompt: cards.length > 0 && cards[0].type === "project"
          ? `Tell me about ${cards[0].data.builder.name}`
          : "Show me the top builders",
      });
      suggestions.push({
        label: "Find builders with similar skills",
        prompt: "Find builders who work with AI",
      });
      break;
    }
    case "find_hackathons": {
      suggestions.push({
        label: "Build a team for this hackathon",
        prompt: cards.length > 0 && cards[0].type === "hackathon"
          ? `Build me a team for ${cards[0].data.title}`
          : "Build me a hackathon team",
      });
      suggestions.push({
        label: "Who's participating?",
        prompt: "Find builders who joined hackathons",
      });
      break;
    }
    case "build_team": {
      suggestions.push({
        label: "Show me their profiles",
        prompt: "Tell me about the team members",
      });
      if (dataset.hackathons.some((h) => h.status === "active")) {
        suggestions.push({
          label: "What hackathons can we join?",
          prompt: "What hackathons are active right now?",
        });
      }
      break;
    }
    case "compare_builders": {
      suggestions.push({
        label: "Build a team with both",
        prompt: "Build me a team for an AI hackathon",
      });
      break;
    }
    case "builder_detail": {
      if (cards.length > 0 && cards[0].type === "builder_detail") {
        const detail = cards[0].data;
        if (detail.projects.length > 0) {
          suggestions.push({
            label: `See ${detail.builder.name.split(" ")[0]}'s projects`,
            prompt: `Show projects by ${detail.builder.name}`,
          });
        }
        suggestions.push({
          label: "Find similar builders",
          prompt: `Find builders who know ${detail.builder.skills[0] || "AI"}`,
        });
      }
      break;
    }
    case "platform_stats": {
      suggestions.push({
        label: "Show me the top builders",
        prompt: "Find the best builders on the platform",
      });
      suggestions.push({
        label: "What hackathons are running?",
        prompt: "What hackathons are active?",
      });
      break;
    }
    case "trending": {
      suggestions.push({
        label: "Find the top builders",
        prompt: "Find the best builders on the platform",
      });
      suggestions.push({
        label: "Explore trending projects",
        prompt: "Show me the most liked projects",
      });
      suggestions.push({
        label: "What's the network like?",
        prompt: "Show me network stats",
      });
      break;
    }
    case "recommend": {
      suggestions.push({
        label: "What's trending?",
        prompt: "What's trending right now?",
      });
      if (dataset.hackathons.some((h) => h.status === "active")) {
        suggestions.push({
          label: "Join an active hackathon",
          prompt: "What hackathons are active?",
        });
      }
      suggestions.push({
        label: "Find builders to team up with",
        prompt: "Find builders who know AI",
      });
      break;
    }
    case "profile_tips": {
      suggestions.push({
        label: "What skills are in demand?",
        prompt: "What's the skill distribution?",
      });
      suggestions.push({
        label: "Find top builders for inspiration",
        prompt: "Show me the most active builders",
      });
      suggestions.push({
        label: "Show me trending projects",
        prompt: "What's trending right now?",
      });
      break;
    }
    case "network_stats": {
      suggestions.push({
        label: "What's trending?",
        prompt: "What's trending right now?",
      });
      suggestions.push({
        label: "Find top builders",
        prompt: "Show me the best builders",
      });
      suggestions.push({
        label: "View platform overview",
        prompt: "Give me platform stats",
      });
      break;
    }
    case "help": {
      suggestions.push({ label: "Find builders", prompt: "Find builders who work with AI" });
      suggestions.push({ label: "Explore hackathons", prompt: "What hackathons are active?" });
      suggestions.push({ label: "Build a team", prompt: "Build me a team for an AI hackathon" });
      break;
    }
    case "greeting": {
      suggestions.push({ label: "What's trending?", prompt: "What's trending right now?" });
      suggestions.push({ label: "Find builders", prompt: "Find builders who work with AI" });
      suggestions.push({ label: "Explore hackathons", prompt: "What hackathons are active?" });
      break;
    }
    case "off_topic": {
      suggestions.push({ label: "Find builders", prompt: "Find builders who work with AI" });
      suggestions.push({ label: "What's trending?", prompt: "What's trending right now?" });
      suggestions.push({ label: "How can you help?", prompt: "What can you do?" });
      break;
    }
  }

  return suggestions.slice(0, 3);
}

// ── Main agent entry point ────────────────────────────────

export function runAgent(
  message: string,
  history: AgentChatTurn[],
  dataset: AgentDataset
): AgentResponseBody {
  const query = buildRetrievalQuery(message, history);
  const rawClassification = classifyIntent(message);
  const { intent, confidence } = resolveIntentWithContext(message, history, rawClassification);
  const steps: AgentToolStep[] = [];
  const cards: AgentRichCard[] = [];

  // ── Greeting ────────────────────────────────────────────
  if (intent === "greeting") {
    const trendingProjects = getTrendingProjects(dataset, 2);

    const response = "Hey! I'm Scout. Ask me anything about builders, projects, or hackathons on Antry.";

    // Add trending project cards as a teaser
    trendingProjects.forEach((project, i) => {
      cards.push({
        type: "project",
        data: project,
        relevanceScore: Math.max(60, 95 - i * 10),
      });
    });

    const suggestions: AgentSuggestion[] = [
      { label: "What's trending?", prompt: "What's trending right now?" },
      { label: "Find builders", prompt: "Find builders who work with AI" },
      { label: "Explore hackathons", prompt: "What hackathons are active?" },
    ];

    return {
      intent,
      confidence,
      response,
      steps: [{ tool: "greeting_context", result: "Loaded community snapshot for welcome message" }],
      cards,
      suggestions,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  // ── Off-topic ───────────────────────────────────────────
  if (intent === "off_topic") {
    const trendingProjects = getTrendingProjects(dataset, 2);

    trendingProjects.forEach((project, i) => {
      cards.push({
        type: "project",
        data: project,
        relevanceScore: Math.max(60, 90 - i * 10),
      });
    });

    const suggestions: AgentSuggestion[] = [
      { label: "Find builders", prompt: "Find builders who work with AI" },
      { label: "What's trending?", prompt: "What's trending right now?" },
      { label: "How can you help?", prompt: "What can you do?" },
    ];

    return {
      intent,
      confidence,
      response:
        "I can only help with the Antry network -- try asking about builders, projects, or hackathons!",
      steps: [{ tool: "redirect_to_domain", result: "Redirected off-topic query to platform suggestions" }],
      cards,
      suggestions,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "build_team") {
    const theme = extractTheme(message);
    const team = buildTeam(theme, dataset);

    steps.push({
      tool: "analyze_builder_graph",
      result: `Scored ${dataset.builders.length} builders across role + delivery dimensions`,
    });
    steps.push({
      tool: "role_gap_analysis",
      result: `Identified ${team.roleGaps.length} needed roles, ${team.roleGaps.filter((r) => r.filled).length} filled`,
    });
    steps.push({
      tool: "compose_team",
      result: `Built ${team.members.length}-person team for \"${team.theme}\"`,
    });

    cards.push({ type: "team", data: team, relevanceScore: 95 });

    const suggestions = generateSuggestions(intent, cards, dataset);

    return {
      intent,
      confidence,
      response: teamIntro(team),
      steps,
      cards,
      suggestions,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "compare_builders") {
    const mentioned = findMentionedBuilders(message, dataset.builders);
    const ranked = rankBuilders(query, dataset);

    const selected = [...mentioned];
    ranked.forEach((builder) => {
      if (selected.length >= 2) return;
      if (!selected.some((item) => item.id === builder.id)) {
        selected.push(builder);
      }
    });

    if (selected.length < 2) {
      return {
        intent,
        confidence,
        response:
          "I need two builder names to run a comparison. Try something like: **Compare Alice and Bob**.",
        steps,
        cards,
        suggestions: [
          { label: "Find builders first", prompt: "Find builders who know React" },
        ],
        model: "tfidf-intent-rag-v1",
        source: dataset.source,
      };
    }

    const comparison = compareBuilders(selected[0], selected[1], dataset);
    steps.push({
      tool: "resolve_entities",
      result: `Matched ${comparison.builderA.name} and ${comparison.builderB.name}`,
    });
    steps.push({
      tool: "compare_profiles",
      result: "Computed skills overlap and project performance",
    });

    cards.push({ type: "comparison", data: comparison, relevanceScore: 95 });

    const suggestions = generateSuggestions(intent, cards, dataset);

    return {
      intent,
      confidence,
      response: comparisonIntro(comparison),
      steps,
      cards,
      suggestions,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "builder_detail") {
    const topBuilder = rankBuilders(query, dataset)[0];

    if (!topBuilder) {
      // Show some builders as fallback
      const fallbackBuilders = getTrendingBuilders(dataset, 3);
      fallbackBuilders.forEach((builder, i) => {
        cards.push({
          type: "builder",
          data: builder,
          relevanceScore: Math.max(60, 85 - i * 10),
        });
      });

      return {
        intent,
        confidence,
        response:
          "Hmm, I couldn't find that builder in the network yet. They might not have created a profile. " +
          "Here are some active builders you can check out instead:",
        steps,
        cards,
        suggestions: [
          { label: "Browse all builders", prompt: "Show me the top builders" },
          { label: "Search by skill", prompt: "Find builders who know React" },
          { label: "What's trending?", prompt: "What's trending right now?" },
        ],
        model: "tfidf-intent-rag-v1",
        source: dataset.source,
      };
    }

    const detail = getBuilderDetail(topBuilder, dataset);
    steps.push({
      tool: "fetch_builder_profile",
      result: `Loaded ${topBuilder.name} profile + projects`,
    });

    cards.push({ type: "builder_detail", data: detail, relevanceScore: 97 });

    const suggestions = generateSuggestions(intent, cards, dataset);

    return {
      intent,
      confidence,
      response: builderDetailIntro(detail),
      steps,
      cards,
      suggestions,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "find_hackathons") {
    const rankedWithScores = rankHackathonsWithScores(query, dataset);
    const selectedWithScores = rankedWithScores.slice(0, 4);
    const topScore = selectedWithScores[0]?.score || 0;

    steps.push({
      tool: "rank_hackathons",
      result: `Evaluated ${dataset.hackathons.length} events by relevance and status`,
    });

    selectedWithScores.forEach(({ hackathon, score }) =>
      cards.push({
        type: "hackathon",
        data: hackathon,
        relevanceScore: toRelevancePercent(score, topScore),
      })
    );

    if (selectedWithScores.length === 0) {
      // Show trending content as fallback
      const fallbackProjects = getTrendingProjects(dataset, 2);
      fallbackProjects.forEach((project, i) => {
        cards.push({
          type: "project",
          data: project,
          relevanceScore: Math.max(60, 85 - i * 10),
        });
      });

      return {
        intent,
        confidence,
        response:
          "No hackathons are available right now, but new events pop up regularly! " +
          "In the meantime, you can **ship a project** to build your profile -- " +
          "active builders are first to get invited when new hackathons launch.\n\n" +
          "Here's what the community has been building:",
        steps,
        cards,
        suggestions: [
          { label: "Explore builders", prompt: "Find the top builders" },
          { label: "See trending projects", prompt: "What's trending right now?" },
          { label: "Profile tips", prompt: "How can I improve my profile?" },
        ],
        model: "tfidf-intent-rag-v1",
        source: dataset.source,
      };
    }

    const best = selectedWithScores[0].hackathon;
    const suggestions = generateSuggestions(intent, cards, dataset);

    return {
      intent,
      confidence,
      response: hackathonIntro(best),
      steps,
      cards,
      suggestions,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "find_projects") {
    const rankedWithScores = rankProjectsWithScores(query, dataset);
    const selectedWithScores = rankedWithScores.slice(0, 4);
    const topScore = selectedWithScores[0]?.score || 0;

    steps.push({
      tool: "retrieve_projects",
      result: `Ranked ${dataset.projects.length} projects by semantic relevance + quality signals`,
    });

    selectedWithScores.forEach(({ project, score }) =>
      cards.push({
        type: "project",
        data: project,
        relevanceScore: toRelevancePercent(score, topScore),
      })
    );

    if (selectedWithScores.length === 0) {
      // Show trending projects as fallback
      const fallbackProjects = getTrendingProjects(dataset, 3);
      fallbackProjects.forEach((project, i) => {
        cards.push({
          type: "project",
          data: project,
          relevanceScore: Math.max(60, 85 - i * 10),
        });
      });

      const searchTerms = extractSearchTerms(query);
      const termMention = searchTerms.length > 0 ? searchTerms.slice(0, 2).join(", ") : "that";

      return {
        intent,
        confidence,
        response:
          `No projects matched **${termMention}** yet. Here are some trending projects instead:`,
        steps,
        cards,
        suggestions: [
          { label: "Find builders instead", prompt: `Find builders who know ${searchTerms[0] || "React"}` },
          { label: "See all projects", prompt: "Show me the best projects on the platform" },
          { label: "What's trending?", prompt: "What's trending right now?" },
        ],
        model: "tfidf-intent-rag-v1",
        source: dataset.source,
      };
    }

    const suggestions = generateSuggestions(intent, cards, dataset);

    return {
      intent,
      confidence,
      response: projectListIntro(selectedWithScores.length),
      steps,
      cards,
      suggestions,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "platform_stats") {
    steps.push({
      tool: "aggregate_platform_metrics",
      result: "Computed builder/project/event activity metrics",
    });

    // Add top builders and projects as visual highlights
    const topBuilders = getTrendingBuilders(dataset, 2);
    topBuilders.forEach((builder, i) => {
      cards.push({
        type: "builder",
        data: builder,
        relevanceScore: Math.max(60, 92 - i * 10),
      });
    });
    const topProjects = getTrendingProjects(dataset, 2);
    topProjects.forEach((project, i) => {
      cards.push({
        type: "project",
        data: project,
        relevanceScore: Math.max(60, 90 - i * 10),
      });
    });

    const suggestions = generateSuggestions(intent, cards, dataset);

    return {
      intent,
      confidence,
      response: platformStatsIntro(dataset),
      steps,
      cards,
      suggestions,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "trending") {
    const tBuilders = getTrendingBuilders(dataset, 5);
    const tProjects = getTrendingProjects(dataset, 5);

    steps.push({
      tool: "compute_trending",
      result: `Analyzed ${dataset.projects.length} projects and ${dataset.builders.length} builders for trending signals`,
    });

    // Add top trending projects as cards
    tProjects.slice(0, 4).forEach((project, i) => {
      cards.push({
        type: "project",
        data: project,
        relevanceScore: Math.max(60, 99 - i * 10),
      });
    });

    // Add top trending builders as cards
    tBuilders.slice(0, 3).forEach((builder, i) => {
      cards.push({
        type: "builder",
        data: builder,
        relevanceScore: Math.max(60, 95 - i * 10),
      });
    });

    const suggestions = generateSuggestions(intent, cards, dataset);

    return {
      intent,
      confidence,
      response: trendingIntro(tBuilders, tProjects),
      steps,
      cards,
      suggestions,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "recommend") {
    const tProjects = getTrendingProjects(dataset, 3);
    const tBuilders = getTrendingBuilders(dataset, 2);

    steps.push({
      tool: "generate_recommendations",
      result: `Analyzed trending data, active events, and skill distribution to form recommendations`,
    });

    tProjects.forEach((project, i) => {
      cards.push({
        type: "project",
        data: project,
        relevanceScore: Math.max(60, 95 - i * 10),
      });
    });

    const activeHackathons = dataset.hackathons.filter((h) => h.status === "active");
    activeHackathons.slice(0, 2).forEach((hackathon, i) => {
      cards.push({
        type: "hackathon",
        data: hackathon,
        relevanceScore: Math.max(60, 90 - i * 10),
      });
    });

    // Also include trending builders as recommended connections
    tBuilders.forEach((builder, i) => {
      cards.push({
        type: "builder",
        data: builder,
        relevanceScore: Math.max(60, 88 - i * 10),
      });
    });

    const suggestions = generateSuggestions(intent, cards, dataset);

    return {
      intent,
      confidence,
      response: recommendIntro(dataset),
      steps,
      cards,
      suggestions,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "profile_tips") {
    steps.push({
      tool: "analyze_top_profiles",
      result: `Analyzed ${dataset.builders.length} builder profiles and skill distribution to generate tips`,
    });

    // Show top builders as inspiration for profile improvement
    const topBuilders = getTrendingBuilders(dataset, 3);
    topBuilders.forEach((builder, i) => {
      cards.push({
        type: "builder",
        data: builder,
        relevanceScore: Math.max(60, 92 - i * 10),
      });
    });

    const suggestions = generateSuggestions(intent, cards, dataset);

    return {
      intent,
      confidence,
      response: profileTipsIntro(dataset),
      steps,
      cards,
      suggestions,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "network_stats") {
    steps.push({
      tool: "compute_network_analytics",
      result: `Computed growth metrics, skill distribution, and recent activity`,
    });

    // Add trending projects as signal
    const tProjects = getTrendingProjects(dataset, 3);
    tProjects.forEach((project, i) => {
      cards.push({
        type: "project",
        data: project,
        relevanceScore: Math.max(60, 90 - i * 10),
      });
    });

    // Also add trending builders
    const tBuilders = getTrendingBuilders(dataset, 2);
    tBuilders.forEach((builder, i) => {
      cards.push({
        type: "builder",
        data: builder,
        relevanceScore: Math.max(60, 88 - i * 10),
      });
    });

    const suggestions = generateSuggestions(intent, cards, dataset);

    return {
      intent,
      confidence,
      response: networkStatsIntro(dataset, message),
      steps,
      cards,
      suggestions,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "find_builders") {
    const rankedWithScores = rankBuildersWithScores(query, dataset);
    const selectedWithScores = rankedWithScores.slice(0, 4);
    const topScore = selectedWithScores[0]?.score || 0;

    steps.push({
      tool: "retrieve_builders",
      result: `Ranked ${dataset.builders.length} builders by semantic match + delivery score`,
    });

    selectedWithScores.forEach(({ builder, score }) =>
      cards.push({
        type: "builder",
        data: builder,
        relevanceScore: toRelevancePercent(score, topScore),
      })
    );

    if (selectedWithScores.length === 0) {
      // Still provide trending builders as fallback cards
      const fallbackBuilders = getTrendingBuilders(dataset, 3);
      fallbackBuilders.forEach((builder, i) => {
        cards.push({
          type: "builder",
          data: builder,
          relevanceScore: Math.max(60, 85 - i * 10),
        });
      });

      const searchTerms = extractSearchTerms(query);
      const skillMention = searchTerms.length > 0 ? searchTerms.slice(0, 2).join(", ") : "that criteria";

      return {
        intent,
        confidence,
        response:
          `No builders matched **${skillMention}** yet. Here are some trending builders instead:`,
        steps,
        cards,
        suggestions: [
          { label: "Browse all builders", prompt: "Show me the top builders" },
          { label: "See trending projects", prompt: "What's trending?" },
          { label: "Join a hackathon", prompt: "What hackathons are active?" },
        ],
        model: "tfidf-intent-rag-v1",
        source: dataset.source,
      };
    }

    const suggestions = generateSuggestions(intent, cards, dataset);

    return {
      intent,
      confidence,
      response: builderListIntro(selectedWithScores.length, query),
      steps,
      cards,
      suggestions,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  // Default: help
  // Add some trending content to make help feel alive
  const trendingProjectsForHelp = getTrendingProjects(dataset, 2);
  trendingProjectsForHelp.forEach((project, i) => {
    cards.push({
      type: "project",
      data: project,
      relevanceScore: Math.max(60, 90 - i * 10),
    });
  });

  const suggestions = generateSuggestions("help", cards, dataset);

  return {
    intent: "help",
    confidence,
    response:
      "I'm Scout! I can help with:\n" +
      "- Find builders by skill or name\n" +
      "- Explore projects and what's trending\n" +
      "- Browse hackathons and build teams\n\n" +
      "What do you need?",
    steps: [{ tool: "help_context", result: "Loaded platform overview for help response" }],
    cards,
    suggestions,
    model: "tfidf-intent-rag-v1",
    source: dataset.source,
  };
}
