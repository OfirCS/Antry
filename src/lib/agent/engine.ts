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
  AgentToolStep,
  BuilderDetailData,
  ComparisonData,
  TeamData,
} from "./types";

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
  ],
  find_projects: [
    "show projects using python",
    "find demos built with nextjs",
    "what are the top shipped apps",
    "search for data ml projects",
    "show me tools category projects",
  ],
  find_hackathons: [
    "what hackathons are active",
    "which events can i join",
    "show upcoming antathons",
    "any current hackathon right now",
  ],
  build_team: [
    "build me a team for an ai hackathon",
    "assemble a squad for agents",
    "create a balanced builder team",
    "help me form a startup team",
  ],
  compare_builders: [
    "compare mara and jake",
    "who is better between two builders",
    "side by side comparison of profiles",
    "versus analysis for these developers",
  ],
  builder_detail: [
    "tell me about mara",
    "show full profile of aisha",
    "details on this builder",
    "who is ofir",
  ],
  platform_stats: [
    "how many builders are on the platform",
    "give me platform stats",
    "numbers overview",
    "current metrics",
  ],
  help: [
    "what can you do",
    "help me use scout",
    "how does this work",
    "available commands",
  ],
};

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
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#-]+/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
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

  const [profilesResult, projectsResult, hackathonsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, username, full_name, bio, skills, gradient, github_url, twitter_url, website_url"
      ),
    supabase
      .from("projects")
      .select(
        "id, builder_id, title, tagline, description, category, tech_stack, demo_url, source_url, build_time, likes_count, created_at, gradient"
      ),
    supabase
      .from("hackathons")
      .select(
        "id, title, theme, description, status, start_date, end_date, prizes, sponsors, participant_count, submission_count"
      ),
  ]);

  if (profilesResult.error || projectsResult.error) {
    return null;
  }

  const profileRows = (profilesResult.data || []) as ProfileRow[];
  const projectRows = (projectsResult.data || []) as ProjectRow[];
  const hackathonRows = ((hackathonsResult.error ? [] : hackathonsResult.data) || []) as HackathonRow[];

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
      antathonIds: [],
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
      antathonId: undefined,
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

const DOMAIN_QUERY_REGEX =
  /(builder|developer|engineer|designer|talent|profile|project|demo|hackathon|antathon|event|team|compare|skills?|recruit|hire|discover|directory|stats?|metrics?|overview|likes?|ship|sponsor)/i;

export function isDomainScopedAgentQuery(message: string): boolean {
  return DOMAIN_QUERY_REGEX.test(message);
}

function classifyIntent(message: string): { intent: AgentIntent; confidence: number } {
  const ranked = INTENT_INDEX.rank(message);
  const scoreByIntent = new Map<AgentIntent, number>();

  ranked.forEach(({ item, score }) => {
    const current = scoreByIntent.get(item.intent) || 0;
    if (score > current) {
      scoreByIntent.set(item.intent, score);
    }
  });

  const q = message.toLowerCase();

  const boosts: IntentScore[] = [];
  if (/(compare|versus|\bvs\b)/.test(q)) {
    boosts.push({ intent: "compare_builders", score: 0.42 });
  }
  if (/(build|assemble|form|create).*(team|squad)|team/.test(q)) {
    boosts.push({ intent: "build_team", score: 0.35 });
  }
  if (/(tell me about|who is|profile|details)/.test(q)) {
    boosts.push({ intent: "builder_detail", score: 0.38 });
  }
  if (/(hackathon|antathon|event|join)/.test(q)) {
    boosts.push({ intent: "find_hackathons", score: 0.33 });
  }
  if (/(project|demo|built with|using|tool|app)/.test(q)) {
    boosts.push({ intent: "find_projects", score: 0.31 });
  }
  if (/(builder|developer|engineer|designer|talent)/.test(q)) {
    boosts.push({ intent: "find_builders", score: 0.31 });
  }
  if (/(how many|stats|numbers|overview|metrics)/.test(q)) {
    boosts.push({ intent: "platform_stats", score: 0.4 });
  }
  if (/(help|what can you do|commands|capabilities)/.test(q)) {
    boosts.push({ intent: "help", score: 0.3 });
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
  const normalized = Math.max(0.35, Math.min(0.98, topScore));
  return { intent: topIntent, confidence: normalized };
}

function isShortFollowUp(message: string): boolean {
  return tokenize(message).length <= 3;
}

function buildRetrievalQuery(message: string, history: AgentChatTurn[]): string {
  if (!isShortFollowUp(message) || history.length === 0) return message;
  const context = history.slice(-2).map((turn) => turn.content).join(" ");
  return `${context} ${message}`.trim();
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

function rankBuilders(query: string, dataset: AgentDataset): AgentBuilder[] {
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

  return index
    .rank(query)
    .map(({ item, score }) => {
      let boosted = score;
      if (q.includes(item.username.toLowerCase())) boosted += 0.9;
      if (q.includes(item.name.toLowerCase().split(" ")[0])) boosted += 0.45;
      if (item.skills.some((skill) => q.includes(skill.toLowerCase()))) boosted += 0.22;
      boosted += Math.min(0.3, (likesByBuilder.get(item.username) || 0) / 600);
      boosted += Math.min(0.2, item.projectCount / 30);
      return { builder: item, score: boosted };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.builder);
}

function rankProjects(query: string, dataset: AgentDataset): AgentProject[] {
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
  return index
    .rank(query)
    .map(({ item, score }) => {
      let boosted = score + Math.min(0.35, item.likes / 500);
      if (q.includes(item.title.toLowerCase())) boosted += 0.7;
      if (item.techStack.some((tech) => q.includes(tech.toLowerCase()))) boosted += 0.25;
      return { project: item, score: boosted };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.project);
}

function rankHackathons(query: string, dataset: AgentDataset): AgentHackathon[] {
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
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.hackathon);
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

function buildTeam(theme: string, dataset: AgentDataset): TeamData {
  const roles = [
    {
      role: "AI / Backend Lead",
      skillTokens: ["python", "ai", "rag", "langchain", "fastapi", "pytorch"],
    },
    {
      role: "Full-Stack Engineer",
      skillTokens: ["react", "next", "typescript", "node", "websockets", "postgres"],
    },
    {
      role: "Design Engineer",
      skillTokens: ["design", "figma", "three", "motion", "css", "ui"],
    },
    {
      role: "Infrastructure / DevOps",
      skillTokens: ["go", "rust", "terraform", "kubernetes", "docker", "infra"],
    },
  ];

  const themeRank = rankBuilders(theme, dataset);
  const themeScoreByUsername = new Map<string, number>();
  themeRank.forEach((builder, index) => {
    themeScoreByUsername.set(builder.username, Math.max(0, 1 - index * 0.15));
  });

  const likesByBuilder = computeBuilderLikes(dataset.projects);
  const used = new Set<string>();

  const members = roles
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
      if (!picked) return null;

      used.add(picked.builder.id);

      const reasonSkills =
        picked.matchedSkills.length > 0
          ? picked.matchedSkills.slice(0, 3).join(", ")
          : picked.builder.skills.slice(0, 3).join(", ");

      return {
        builder: picked.builder,
        role: slot.role,
        reason: `Best fit from skills and delivery track record: ${reasonSkills}`,
      };
    })
    .filter((member): member is TeamData["members"][number] => member !== null);

  return {
    members,
    theme,
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

export function runAgent(
  message: string,
  history: AgentChatTurn[],
  dataset: AgentDataset
): AgentResponseBody {
  const query = buildRetrievalQuery(message, history);
  const { intent, confidence } = classifyIntent(message);
  const steps: AgentToolStep[] = [];
  const cards: AgentRichCard[] = [];

  if (intent === "build_team") {
    const theme = extractTheme(message);
    const team = buildTeam(theme, dataset);

    steps.push({
      tool: "analyze_builder_graph",
      result: `Scored ${dataset.builders.length} builders across role + delivery dimensions`,
    });
    steps.push({
      tool: "compose_team",
      result: `Built ${team.members.length}-person team for \"${team.theme}\"`,
    });

    cards.push({ type: "team", data: team });

    return {
      intent,
      confidence,
      response:
        `I assembled a balanced team for **${team.theme}** with clear role coverage across AI, product, design, and infrastructure.`,
      steps,
      cards,
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
          "I need two builder names to compare. Try: **Compare Mara and Jake**.",
        steps,
        cards,
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

    cards.push({ type: "comparison", data: comparison });

    return {
      intent,
      confidence,
      response:
        `Compared **${comparison.builderA.name}** vs **${comparison.builderB.name}** across projects, likes, and skill overlap.`,
      steps,
      cards,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "builder_detail") {
    const topBuilder = rankBuilders(query, dataset)[0];

    if (!topBuilder) {
      return {
        intent,
        confidence,
        response: "I couldn't find that builder. Try a name or skill.",
        steps,
        cards,
        model: "tfidf-intent-rag-v1",
        source: dataset.source,
      };
    }

    const detail = getBuilderDetail(topBuilder, dataset);
    steps.push({
      tool: "fetch_builder_profile",
      result: `Loaded ${topBuilder.name} profile + projects`,
    });

    cards.push({ type: "builder_detail", data: detail });

    return {
      intent,
      confidence,
      response:
        `Here is the full profile for **${topBuilder.name}** with project depth and performance context.`,
      steps,
      cards,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "find_hackathons") {
    const ranked = rankHackathons(query, dataset);
    const selected = ranked.slice(0, 4);

    steps.push({
      tool: "rank_hackathons",
      result: `Evaluated ${dataset.hackathons.length} events by relevance and status`,
    });

    selected.forEach((hackathon) => cards.push({ type: "hackathon", data: hackathon }));

    if (selected.length === 0) {
      return {
        intent,
        confidence,
        response: "No hackathons are available right now.",
        steps,
        cards,
        model: "tfidf-intent-rag-v1",
        source: dataset.source,
      };
    }

    const best = selected[0];
    return {
      intent,
      confidence,
      response:
        `Top recommendation: **${best.title}** (${best.status}) with a prize pool around **${toPrizePool(best.prizes)}**.`,
      steps,
      cards,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "find_projects") {
    const ranked = rankProjects(query, dataset);
    const selected = ranked.slice(0, 4);

    steps.push({
      tool: "retrieve_projects",
      result: `Ranked ${dataset.projects.length} projects by semantic relevance + quality signals`,
    });

    selected.forEach((project) => cards.push({ type: "project", data: project }));

    if (selected.length === 0) {
      return {
        intent,
        confidence,
        response: "No matching projects found. Try a different technology or category.",
        steps,
        cards,
        model: "tfidf-intent-rag-v1",
        source: dataset.source,
      };
    }

    return {
      intent,
      confidence,
      response:
        `I found **${selected.length} high-signal projects** that match your query, ranked by relevance and traction.`,
      steps,
      cards,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "platform_stats") {
    const totalLikes = dataset.projects.reduce((sum, project) => sum + project.likes, 0);
    const activeHackathons = dataset.hackathons.filter(
      (hackathon) => hackathon.status === "active"
    ).length;

    steps.push({
      tool: "aggregate_platform_metrics",
      result: "Computed builder/project/event activity metrics",
    });

    return {
      intent,
      confidence,
      response:
        `Platform now: **${dataset.builders.length} builders**, **${dataset.projects.length} projects**, **${dataset.hackathons.length} hackathons** (${activeHackathons} active), and **${totalLikes.toLocaleString()} total likes**.`,
      steps,
      cards,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  if (intent === "find_builders") {
    const ranked = rankBuilders(query, dataset);
    const selected = ranked.slice(0, 4);

    steps.push({
      tool: "retrieve_builders",
      result: `Ranked ${dataset.builders.length} builders by semantic match + delivery score`,
    });

    selected.forEach((builder) => cards.push({ type: "builder", data: builder }));

    if (selected.length === 0) {
      return {
        intent,
        confidence,
        response: "No builders matched that query. Try a skill, stack, or role.",
        steps,
        cards,
        model: "tfidf-intent-rag-v1",
        source: dataset.source,
      };
    }

    return {
      intent,
      confidence,
      response:
        `I found **${selected.length} strong builder matches** and ranked them by fit and shipping history.`,
      steps,
      cards,
      model: "tfidf-intent-rag-v1",
      source: dataset.source,
    };
  }

  return {
    intent: "help",
    confidence,
    response:
      "I can find builders, rank projects, compare profiles, recommend hackathons, and build balanced teams. Try: **Compare Mara and Jake** or **Build me a team for an AI hackathon**.",
    steps,
    cards,
    model: "tfidf-intent-rag-v1",
    source: dataset.source,
  };
}
