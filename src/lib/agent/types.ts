export type AgentIntent =
  | "find_builders"
  | "find_projects"
  | "find_hackathons"
  | "build_team"
  | "compare_builders"
  | "builder_detail"
  | "platform_stats"
  | "help";

export interface AgentBuilder {
  id: string;
  username: string;
  name: string;
  tagline: string;
  bio: string;
  skills: string[];
  social: {
    github?: string;
    twitter?: string;
    website?: string;
  };
  projectCount: number;
  gradient: string;
  antathonIds: string[];
}

export interface AgentProject {
  id: string;
  title: string;
  tagline: string;
  description: string;
  demoUrl: string;
  sourceUrl?: string;
  techStack: string[];
  buildTime: string;
  category: string;
  builder: {
    username: string;
    name: string;
    gradient: string;
  };
  likes: number;
  createdAt: string;
  gradient: string;
  antathonId?: string;
}

export interface AgentHackathon {
  id: string;
  title: string;
  theme: string;
  description: string;
  startDate: string;
  endDate: string;
  prizes: { place: string; reward: string }[];
  sponsors: { name: string; tier: "title" | "gold" | "partner" }[];
  participantCount: number;
  submissionCount: number;
  status: "upcoming" | "active" | "completed";
  gradient: string;
}

export interface TeamData {
  members: { builder: AgentBuilder; role: string; reason: string }[];
  theme: string;
}

export interface BuilderDetailData {
  builder: AgentBuilder;
  projects: AgentProject[];
  antathons: AgentHackathon[];
  totalLikes: number;
}

export interface ComparisonData {
  builderA: AgentBuilder;
  builderB: AgentBuilder;
  projectsA: AgentProject[];
  projectsB: AgentProject[];
  likesA: number;
  likesB: number;
  sharedSkills: string[];
  uniqueA: string[];
  uniqueB: string[];
}

export type AgentRichCard =
  | { type: "builder"; data: AgentBuilder }
  | { type: "project"; data: AgentProject }
  | { type: "hackathon"; data: AgentHackathon }
  | { type: "team"; data: TeamData }
  | { type: "builder_detail"; data: BuilderDetailData }
  | { type: "comparison"; data: ComparisonData };

export interface AgentToolStep {
  tool: string;
  result: string;
}

export interface AgentChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AgentRequestBody {
  message: string;
  history?: AgentChatTurn[];
}

export interface AgentResponseBody {
  intent: AgentIntent;
  confidence: number;
  response: string;
  steps: AgentToolStep[];
  cards: AgentRichCard[];
  model: "tfidf-intent-rag-v1";
  source: "supabase" | "mock";
}

export interface AgentDataset {
  builders: AgentBuilder[];
  projects: AgentProject[];
  hackathons: AgentHackathon[];
  source: "supabase" | "mock";
}
