/**
 * Core type definitions for the Scout Agent system.
 *
 * These types form the contract between the agent engine, the API route,
 * and the SDK. They are intentionally dependency-free so they can be
 * imported from any layer without pulling in runtime code.
 *
 * @module agent-types
 */

// ── Intent classification ────────────────────────────────────

/**
 * Discriminated intent label produced by the TF-IDF classifier.
 *
 * Each value maps to a distinct handler in the agent engine.
 * The `off_topic` and `greeting` intents are catch-all fallbacks;
 * all other intents trigger data lookup and card generation.
 */
export type AgentIntent =
  | "find_builders"
  | "find_projects"
  | "find_hackathons"
  | "build_team"
  | "compare_builders"
  | "builder_detail"
  | "platform_stats"
  | "trending"
  | "recommend"
  | "profile_tips"
  | "network_stats"
  | "help"
  | "greeting"
  | "off_topic";

// ── Domain entities ──────────────────────────────────────────

/**
 * A builder (user) in the Antry network.
 *
 * Builders are the primary entity -- they create projects, participate in
 * hackathons, and are the most common search target.
 */
export interface AgentBuilder {
  /** Unique identifier (UUID). */
  id: string;
  /** URL-safe username handle. */
  username: string;
  /** Display name. */
  name: string;
  /** One-line tagline shown on the builder card. */
  tagline: string;
  /** Extended biography / about text. */
  bio: string;
  /** Skill tags (e.g. "React", "Python", "UX Design"). */
  skills: string[];
  /** Social links. */
  social: {
    github?: string;
    twitter?: string;
    website?: string;
  };
  /** Number of projects this builder has submitted. */
  projectCount: number;
  /** CSS gradient string used for the builder's avatar background. */
  gradient: string;
  /** IDs of hackathons (antathons) this builder participated in. */
  antathonIds: string[];
  /** ISO-8601 timestamp of account creation. */
  createdAt: string;
}

/**
 * A project submitted to the Antry platform.
 */
export interface AgentProject {
  /** Unique identifier (UUID). */
  id: string;
  /** Project title. */
  title: string;
  /** Short one-liner description. */
  tagline: string;
  /** Full project description (markdown allowed). */
  description: string;
  /** Live demo URL. */
  demoUrl: string;
  /** Source code URL (optional, may be private). */
  sourceUrl?: string;
  /** Technology stack labels (e.g. "Next.js", "Supabase"). */
  techStack: string[];
  /** Human-readable build time (e.g. "2 weeks", "48 hours"). */
  buildTime: string;
  /** Project category (e.g. "AI/ML", "DevTools", "SaaS"). */
  category: string;
  /** The builder who submitted this project. */
  builder: {
    username: string;
    name: string;
    gradient: string;
  };
  /** Total number of likes/upvotes. */
  likes: number;
  /** ISO-8601 timestamp of project submission. */
  createdAt: string;
  /** CSS gradient string for the project card. */
  gradient: string;
  /** ID of the hackathon this was submitted to, if any. */
  antathonId?: string;
}

/**
 * A hackathon (antathon) event on the platform.
 */
export interface AgentHackathon {
  /** Unique identifier (UUID). */
  id: string;
  /** Hackathon title. */
  title: string;
  /** Theme or prompt for participants. */
  theme: string;
  /** Extended description of the hackathon. */
  description: string;
  /** ISO-8601 start date. */
  startDate: string;
  /** ISO-8601 end date. */
  endDate: string;
  /** Prize breakdown by placement. */
  prizes: { place: string; reward: string }[];
  /** Sponsors and their tier level. */
  sponsors: { name: string; tier: "title" | "gold" | "partner" }[];
  /** Number of registered participants. */
  participantCount: number;
  /** Number of project submissions. */
  submissionCount: number;
  /** Current lifecycle status. */
  status: "upcoming" | "active" | "completed";
  /** CSS gradient string for the hackathon card. */
  gradient: string;
}

// ── Team assembly ────────────────────────────────────────────

/**
 * A role gap identified during the team-building process.
 *
 * When the agent assembles a team for a given theme, it determines which
 * roles are needed and flags any that could not be filled from the
 * available builder pool.
 */
export interface RoleGap {
  /** The role title (e.g. "Backend Engineer", "Designer"). */
  role: string;
  /** Skills required for this role. */
  neededSkills: string[];
  /** Whether a matching builder was found and assigned. */
  filled: boolean;
}

/**
 * A builder assigned to a role within a generated team.
 */
export interface TeamMember {
  /** The builder assigned to this role. */
  builder: AgentBuilder;
  /** The role this builder fills (e.g. "Frontend Lead"). */
  role: string;
  /** Human-readable explanation of why this builder was chosen. */
  reason: string;
  /** Relevance percentage (0-100) for this role assignment. */
  relevanceScore: number;
  /** Skills this builder has that complement other team members. */
  complementarySkills: string[];
}

/**
 * A complete team assembled by the agent for a given theme/project idea.
 */
export interface TeamData {
  /** The assigned team members with their roles. */
  members: TeamMember[];
  /** The theme or project idea the team was built around. */
  theme: string;
  /** Analysis of what roles the theme requires and whether they were filled. */
  roleGaps: RoleGap[];
  /** The union of skills present across all team members. */
  teamCoverage: string[];
}

// ── Detail / comparison views ────────────────────────────────

/**
 * Full profile data for a single builder, including their projects and
 * hackathon participation.
 */
export interface BuilderDetailData {
  /** The builder's profile. */
  builder: AgentBuilder;
  /** All projects by this builder. */
  projects: AgentProject[];
  /** Hackathons this builder participated in. */
  antathons: AgentHackathon[];
  /** Sum of likes across all projects. */
  totalLikes: number;
}

/**
 * Side-by-side comparison data for two builders.
 */
export interface ComparisonData {
  /** First builder's profile. */
  builderA: AgentBuilder;
  /** Second builder's profile. */
  builderB: AgentBuilder;
  /** Projects by builder A. */
  projectsA: AgentProject[];
  /** Projects by builder B. */
  projectsB: AgentProject[];
  /** Total likes for builder A. */
  likesA: number;
  /** Total likes for builder B. */
  likesB: number;
  /** Skills both builders share. */
  sharedSkills: string[];
  /** Skills unique to builder A. */
  uniqueA: string[];
  /** Skills unique to builder B. */
  uniqueB: string[];
}

// ── Rich cards (discriminated union) ─────────────────────────

/**
 * A rich result card returned by the agent.
 *
 * This is a discriminated union on the `type` field. Each variant
 * carries a `relevanceScore` (0-100) indicating how well the card
 * matches the user's query.
 */
export type AgentRichCard =
  | { type: "builder"; data: AgentBuilder; relevanceScore: number }
  | { type: "project"; data: AgentProject; relevanceScore: number }
  | { type: "hackathon"; data: AgentHackathon; relevanceScore: number }
  | { type: "team"; data: TeamData; relevanceScore: number }
  | { type: "builder_detail"; data: BuilderDetailData; relevanceScore: number }
  | { type: "comparison"; data: ComparisonData; relevanceScore: number }
  | { type: "trending_projects"; data: AgentProject[]; relevanceScore: number }
  | { type: "trending_builders"; data: AgentBuilder[]; relevanceScore: number };

// ── Agent conversation ───────────────────────────────────────

/**
 * A single step performed by an internal agent tool during query processing.
 */
export interface AgentToolStep {
  /** Name of the tool that ran (e.g. "search_builders", "rank_results"). */
  tool: string;
  /** Human-readable summary of what the tool produced. */
  result: string;
}

/**
 * A single turn in a multi-turn conversation with the agent.
 */
export interface AgentChatTurn {
  /** Who produced this turn. */
  role: "user" | "assistant";
  /** The text content of the message. */
  content: string;
  /** Stashed intent from the assistant turn, used for multi-turn context. */
  intent?: AgentIntent;
}

// ── Request / Response ───────────────────────────────────────

/**
 * The shape of the JSON body sent to `POST /api/agent`.
 */
export interface AgentRequestBody {
  /** The user's natural-language message (1-320 characters). */
  message: string;
  /** Optional conversation history (up to 12 turns). */
  history?: AgentChatTurn[];
}

/**
 * A contextual follow-up suggestion shown after the response.
 */
export interface AgentSuggestion {
  /** Short label displayed on the suggestion chip. */
  label: string;
  /** The full prompt to send if the user clicks the suggestion. */
  prompt: string;
}

/**
 * The JSON response body returned by the Scout Agent API.
 *
 * Contains the classified intent, a natural-language response, rich
 * result cards, follow-up suggestions, and engine metadata.
 */
export interface AgentResponseBody {
  /** The classified intent for this query. */
  intent: AgentIntent;
  /** Confidence score from the classifier (0-1). */
  confidence: number;
  /** The agent's natural-language response text. */
  response: string;
  /** Internal tool steps executed during processing (for debugging). */
  steps: AgentToolStep[];
  /** Rich result cards matching the query. */
  cards: AgentRichCard[];
  /** Contextual follow-up suggestions based on the current response. */
  suggestions: AgentSuggestion[];
  /** Model identifier for the engine that produced this response. */
  model: "tfidf-intent-rag-v1";
  /** Whether the data came from Supabase or the mock/fallback dataset. */
  source: "supabase" | "mock";
}

/**
 * The full dataset loaded from the database (or mock data) that the
 * agent engine operates on.
 */
export interface AgentDataset {
  /** All builders in the network. */
  builders: AgentBuilder[];
  /** All projects on the platform. */
  projects: AgentProject[];
  /** All hackathons (past, present, and upcoming). */
  hackathons: AgentHackathon[];
  /** Whether this data came from Supabase or the mock/fallback dataset. */
  source: "supabase" | "mock";
}

// ── Aggregation / analytics types ────────────────────────────

/**
 * Platform-wide network statistics computed from the dataset.
 */
export interface NetworkStats {
  /** Total number of registered builders. */
  totalBuilders: number;
  /** Total number of submitted projects. */
  totalProjects: number;
  /** Total number of hackathons (all statuses). */
  totalHackathons: number;
  /** Sum of likes across all projects. */
  totalLikes: number;
  /** Number of hackathons with status "active". */
  activeHackathons: number;
  /** Number of hackathons with status "upcoming". */
  upcomingHackathons: number;
  /** Number of hackathons with status "completed". */
  completedHackathons: number;
  /** Average projects per builder (rounded to 1 decimal). */
  avgProjectsPerBuilder: number;
  /** Average likes per project (rounded to 1 decimal). */
  avgLikesPerProject: number;
  /** Number of builders who joined within the last 7 days. */
  newBuildersThisWeek: number;
  /** Number of projects shipped within the last 7 days. */
  newProjectsThisWeek: number;
  /** Number of builders who joined within the last 30 days. */
  newBuildersThisMonth: number;
  /** Number of projects shipped within the last 30 days. */
  newProjectsThisMonth: number;
}

/**
 * A single skill and its prevalence across the builder network.
 */
export interface SkillDistribution {
  /** The skill name (e.g. "React", "Python"). */
  skill: string;
  /** Absolute count of builders who list this skill. */
  count: number;
  /** Percentage of all builders who list this skill. */
  percentage: number;
}

/**
 * A single item in the recent-activity feed.
 */
export interface RecentActivityItem {
  /** The kind of activity. */
  type: "new_builder" | "new_project" | "active_hackathon";
  /** Short human-readable label. */
  label: string;
  /** Additional detail text. */
  detail: string;
  /** ISO-8601 timestamp of the activity. */
  timestamp: string;
}

/**
 * Trending builders and projects, typically sorted by recent likes
 * or creation date.
 */
export interface TrendingResult {
  /** Builders currently trending on the platform. */
  trendingBuilders: AgentBuilder[];
  /** Projects currently trending on the platform. */
  trendingProjects: AgentProject[];
}
