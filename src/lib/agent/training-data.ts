/**
 * Training data for Scout agent intent classification.
 *
 * This file provides:
 * 1. Example queries mapped to intents (100+ examples)
 * 2. Example good responses for each intent
 * 3. Synonym/alias maps for domain terms
 * 4. Domain-specific vocabulary
 * 5. Confidence calibration helpers
 */

import type { AgentIntent } from "./types";

// ── Synonym / alias groups ────────────────────────────────
// Each group maps domain synonyms so "developer" and "engineer" are treated equivalently.

export const SYNONYM_GROUPS: Record<string, string[]> = {
  builder: [
    "builder", "builders", "developer", "developers", "dev", "devs",
    "engineer", "engineers", "coder", "coders", "programmer", "programmers",
    "maker", "makers", "creator", "creators", "hacker", "hackers",
    "contributor", "contributors", "talent", "talents",
    "freelancer", "freelancers", "founder", "founders", "cofounder", "cofounders",
    "indie", "person", "people", "member", "members", "user", "users",
  ],
  project: [
    "project", "projects", "app", "apps", "application", "applications",
    "demo", "demos", "ship", "ships", "shipped", "shipping",
    "product", "products", "tool", "tools", "build", "builds",
    "creation", "creations", "work", "portfolio",
    "repo", "repos", "repository", "repositories", "side project",
    "startup", "saas", "extension", "plugin", "bot", "bots",
    "api", "library", "package", "module", "cli",
  ],
  hackathon: [
    "hackathon", "hackathons", "antathon", "antathons", "hack",
    "event", "events", "competition", "competitions", "challenge",
    "challenges", "sprint", "jam", "buildathon",
    "contest", "contests", "tournament", "tournaments",
    "bounty", "bounties",
  ],
  team: [
    "team", "teams", "squad", "squads", "crew", "crews",
    "group", "groups", "roster", "lineup", "collective",
    "partner", "partners", "collaborator", "collaborators", "duo",
  ],
  trending: [
    "trending", "popular", "hot", "top", "best", "rising",
    "viral", "buzzing", "most liked", "most popular", "most active",
    "highest rated", "on fire", "blowing up",
    "featured", "starred", "standout", "noteworthy",
  ],
  skill: [
    "skill", "skills", "stack", "stacks", "tech", "technology",
    "technologies", "language", "languages", "framework", "frameworks",
    "expertise", "experience", "proficiency", "specialization",
    "specialty", "tooling", "know", "knows", "knowledge",
  ],
  recommend: [
    "recommend", "suggest", "advice", "suggestion", "recommendation",
    "idea", "ideas", "should", "could", "try", "check out",
    "inspiration", "inspire", "pick", "picks", "curate",
  ],
  stats: [
    "stats", "statistics", "numbers", "metrics", "count",
    "total", "overview", "summary", "breakdown", "data",
    "analytics", "growth", "size", "how many", "how much",
  ],
  recent: [
    "recent", "new", "latest", "newest", "fresh", "just",
    "today", "this week", "this month", "recently", "last week",
    "just joined", "just shipped", "brand new",
  ],
  profile: [
    "profile", "bio", "about", "info", "details", "background",
    "portfolio", "resume", "who is", "tell me about",
    "page", "account",
  ],
  search: [
    "search", "find", "look", "looking", "lookup", "look up",
    "show", "get", "list", "browse", "explore", "discover",
    "where", "any", "who",
  ],
};

// Flatten synonym groups into a lookup: synonym -> canonical term
export const SYNONYM_LOOKUP: Record<string, string> = {};
for (const [canonical, synonyms] of Object.entries(SYNONYM_GROUPS)) {
  for (const synonym of synonyms) {
    SYNONYM_LOOKUP[synonym] = canonical;
  }
}

// ── Domain-specific vocabulary ────────────────────────────

export const TECH_STACKS = [
  // Languages
  "javascript", "typescript", "python", "rust", "go", "java", "swift",
  "kotlin", "ruby", "php", "c++", "c#", "scala", "elixir", "dart",
  // Frontend
  "react", "nextjs", "next.js", "vue", "angular", "svelte", "solid",
  "astro", "remix", "gatsby", "tailwind", "css", "html",
  // Backend
  "node", "express", "fastapi", "django", "flask", "rails",
  "spring", "nestjs", "hono", "bun", "deno",
  // AI/ML
  "openai", "claude", "anthropic", "langchain", "llamaindex",
  "pytorch", "tensorflow", "huggingface", "rag", "llm",
  "gpt", "transformer", "diffusion", "stable-diffusion", "midjourney",
  // Data
  "postgres", "postgresql", "mysql", "mongodb", "redis", "supabase",
  "firebase", "prisma", "drizzle", "graphql", "sql",
  // Infra
  "docker", "kubernetes", "terraform", "aws", "gcp", "azure",
  "vercel", "netlify", "cloudflare", "linux",
  // Mobile
  "react-native", "flutter", "swift", "swiftui", "jetpack-compose",
  "expo", "ios", "android",
  // Design
  "figma", "framer", "three.js", "threejs", "motion", "gsap", "d3",
  "blender", "webgl",
];

export const ROLES = [
  "frontend", "backend", "fullstack", "full-stack", "devops",
  "ml engineer", "ai engineer", "data scientist", "data engineer",
  "designer", "design engineer", "product engineer", "mobile",
  "ios developer", "android developer", "infrastructure",
  "qa", "security", "blockchain", "web3",
];

/**
 * Maps partial/variant technology names to their canonical forms.
 * Used for fuzzy matching: "react" matches "React.js", "ReactJS", "react-native", etc.
 */
export const TECH_ALIASES: Record<string, string[]> = {
  react: ["react", "react.js", "reactjs", "react-native", "react native", "rn"],
  next: ["next", "next.js", "nextjs", "next13", "next14", "next15"],
  vue: ["vue", "vue.js", "vuejs", "vue3", "nuxt", "nuxtjs"],
  angular: ["angular", "angularjs", "angular.js"],
  node: ["node", "node.js", "nodejs"],
  typescript: ["typescript", "ts", "typescriptjs"],
  javascript: ["javascript", "js", "ecmascript", "es6", "es2024"],
  python: ["python", "py", "python3"],
  rust: ["rust", "rustlang"],
  go: ["go", "golang"],
  tailwind: ["tailwind", "tailwindcss", "tailwind css", "tw"],
  postgres: ["postgres", "postgresql", "pg"],
  mongo: ["mongo", "mongodb", "mongoose"],
  graphql: ["graphql", "gql", "apollo"],
  docker: ["docker", "containerization", "containers"],
  kubernetes: ["kubernetes", "k8s", "kube"],
  tensorflow: ["tensorflow", "tf"],
  pytorch: ["pytorch", "torch"],
  langchain: ["langchain", "lang-chain"],
  three: ["three", "three.js", "threejs", "3js"],
  svelte: ["svelte", "sveltekit", "svelte-kit"],
  flutter: ["flutter", "dart"],
  swift: ["swift", "swiftui", "swift-ui"],
  supabase: ["supabase", "supa"],
  firebase: ["firebase", "firestore"],
  openai: ["openai", "open-ai", "chatgpt", "gpt-4", "gpt4", "gpt"],
  claude: ["claude", "anthropic"],
  vercel: ["vercel", "v0"],
  redis: ["redis", "upstash"],
  prisma: ["prisma", "drizzle"],
  solidity: ["solidity", "sol", "smart contracts", "web3", "ethereum", "eth"],
  aws: ["aws", "amazon web services", "lambda", "s3", "ec2"],
};

export const HACKATHON_TERMS = [
  "submission", "submissions", "participant", "participants",
  "prize", "prizes", "sponsor", "sponsors", "theme",
  "deadline", "start date", "end date", "registration",
  "active", "upcoming", "completed", "live", "ended",
  "winner", "winners", "finalist", "finalists",
  "judging", "criteria", "tracks", "bounty", "bounties",
];

// ── Intent examples (100+ entries) ────────────────────────

export interface TrainingExample {
  query: string;
  intent: AgentIntent;
  /** Expected confidence range: "high" >= 0.7, "medium" >= 0.5, "low" < 0.5 */
  expectedConfidence: "high" | "medium" | "low";
}

export const TRAINING_EXAMPLES: TrainingExample[] = [
  // ── find_builders (30+ examples) ────────────────────────
  { query: "find builders who know react", intent: "find_builders", expectedConfidence: "high" },
  { query: "who are strong in ai agents", intent: "find_builders", expectedConfidence: "high" },
  { query: "search for a backend engineer", intent: "find_builders", expectedConfidence: "high" },
  { query: "show me top developers", intent: "find_builders", expectedConfidence: "high" },
  { query: "looking for product engineers", intent: "find_builders", expectedConfidence: "high" },
  { query: "who's good at react", intent: "find_builders", expectedConfidence: "high" },
  { query: "anyone skilled in python", intent: "find_builders", expectedConfidence: "high" },
  { query: "devs that know typescript", intent: "find_builders", expectedConfidence: "high" },
  { query: "ppl who do frontend", intent: "find_builders", expectedConfidence: "high" },
  { query: "got any ml engineers", intent: "find_builders", expectedConfidence: "high" },
  { query: "who can do nextjs and tailwind", intent: "find_builders", expectedConfidence: "high" },
  { query: "I need a designer who codes", intent: "find_builders", expectedConfidence: "high" },
  { query: "show fullstack developers", intent: "find_builders", expectedConfidence: "high" },
  { query: "find me a rust developer", intent: "find_builders", expectedConfidence: "high" },
  { query: "talented people on the platform", intent: "find_builders", expectedConfidence: "medium" },
  { query: "who works with supabase", intent: "find_builders", expectedConfidence: "high" },
  { query: "any langchain experts", intent: "find_builders", expectedConfidence: "high" },
  { query: "developers with open source experience", intent: "find_builders", expectedConfidence: "high" },
  { query: "mobile engineers on antry", intent: "find_builders", expectedConfidence: "high" },
  { query: "find people who know flutter", intent: "find_builders", expectedConfidence: "high" },
  { query: "show me the best coders", intent: "find_builders", expectedConfidence: "high" },
  { query: "who has shipped the most", intent: "find_builders", expectedConfidence: "medium" },
  { query: "react native developers", intent: "find_builders", expectedConfidence: "high" },
  { query: "anyone here do solidity", intent: "find_builders", expectedConfidence: "high" },
  { query: "people who build with AI", intent: "find_builders", expectedConfidence: "high" },
  { query: "looking for a cofounder", intent: "find_builders", expectedConfidence: "medium" },
  { query: "who knows kubernetes", intent: "find_builders", expectedConfidence: "high" },
  { query: "find go developers", intent: "find_builders", expectedConfidence: "high" },
  { query: "designers on the platform", intent: "find_builders", expectedConfidence: "high" },
  { query: "data scientists", intent: "find_builders", expectedConfidence: "high" },
  { query: "who can build a chrome extension", intent: "find_builders", expectedConfidence: "high" },
  { query: "anyone good at three.js", intent: "find_builders", expectedConfidence: "high" },

  // ── find_projects (25+ examples) ────────────────────────
  { query: "show projects using python", intent: "find_projects", expectedConfidence: "high" },
  { query: "find demos built with nextjs", intent: "find_projects", expectedConfidence: "high" },
  { query: "what are the top shipped apps", intent: "find_projects", expectedConfidence: "high" },
  { query: "search for data ml projects", intent: "find_projects", expectedConfidence: "high" },
  { query: "show me tools category projects", intent: "find_projects", expectedConfidence: "high" },
  { query: "cool stuff built with react", intent: "find_projects", expectedConfidence: "high" },
  { query: "any ai agent projects", intent: "find_projects", expectedConfidence: "high" },
  { query: "what have people built", intent: "find_projects", expectedConfidence: "high" },
  { query: "show me all web apps", intent: "find_projects", expectedConfidence: "high" },
  { query: "most liked projects", intent: "find_projects", expectedConfidence: "high" },
  { query: "interesting things people shipped", intent: "find_projects", expectedConfidence: "medium" },
  { query: "best projects on the platform", intent: "find_projects", expectedConfidence: "high" },
  { query: "show me some hackathon submissions", intent: "find_projects", expectedConfidence: "medium" },
  { query: "anything built with langchain", intent: "find_projects", expectedConfidence: "high" },
  { query: "find tools built with typescript", intent: "find_projects", expectedConfidence: "high" },
  { query: "saas projects", intent: "find_projects", expectedConfidence: "high" },
  { query: "chrome extensions on antry", intent: "find_projects", expectedConfidence: "high" },
  { query: "show me chatbot projects", intent: "find_projects", expectedConfidence: "high" },
  { query: "open source projects", intent: "find_projects", expectedConfidence: "high" },
  { query: "projects with the most likes", intent: "find_projects", expectedConfidence: "high" },
  { query: "recently shipped", intent: "find_projects", expectedConfidence: "high" },
  { query: "what was built this week", intent: "find_projects", expectedConfidence: "high" },
  { query: "any CLI tools", intent: "find_projects", expectedConfidence: "high" },
  { query: "mobile apps people built", intent: "find_projects", expectedConfidence: "high" },
  { query: "show me API projects", intent: "find_projects", expectedConfidence: "high" },

  // ── find_hackathons (18+ examples) ──────────────────────
  { query: "what hackathons are active", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "which events can i join", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "show upcoming antathons", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "any current hackathon right now", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "when is the next event", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "hackathons i can enter", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "are there any competitions running", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "show me live events", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "what challenges are available", intent: "find_hackathons", expectedConfidence: "medium" },
  { query: "upcoming sprints or jams", intent: "find_hackathons", expectedConfidence: "medium" },
  { query: "any hackathon with AI theme", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "events with prizes", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "I want to join a hackathon", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "where can I compete", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "what's the next buildathon", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "any bounties available", intent: "find_hackathons", expectedConfidence: "medium" },
  { query: "hackathon with biggest prize", intent: "find_hackathons", expectedConfidence: "high" },
  { query: "can I still register for an event", intent: "find_hackathons", expectedConfidence: "high" },

  // ── build_team (10+ examples) ───────────────────────────
  { query: "build me a team for an ai hackathon", intent: "build_team", expectedConfidence: "high" },
  { query: "assemble a squad for agents", intent: "build_team", expectedConfidence: "high" },
  { query: "create a balanced builder team", intent: "build_team", expectedConfidence: "high" },
  { query: "help me form a startup team", intent: "build_team", expectedConfidence: "high" },
  { query: "put together a group for the hack", intent: "build_team", expectedConfidence: "high" },
  { query: "i need a crew for building an app", intent: "build_team", expectedConfidence: "high" },
  { query: "draft a team for web3 project", intent: "build_team", expectedConfidence: "high" },
  { query: "who should I team up with for mobile", intent: "build_team", expectedConfidence: "high" },
  { query: "make a team around data engineering", intent: "build_team", expectedConfidence: "high" },
  { query: "team for building a saas product", intent: "build_team", expectedConfidence: "high" },
  { query: "form a group for the upcoming antathon", intent: "build_team", expectedConfidence: "high" },

  // ── compare_builders (10+ examples) ─────────────────────
  { query: "compare mara and jake", intent: "compare_builders", expectedConfidence: "high" },
  { query: "who is better between two builders", intent: "compare_builders", expectedConfidence: "high" },
  { query: "side by side comparison of profiles", intent: "compare_builders", expectedConfidence: "high" },
  { query: "versus analysis for these developers", intent: "compare_builders", expectedConfidence: "high" },
  { query: "mara vs jake", intent: "compare_builders", expectedConfidence: "high" },
  { query: "difference between alice and bob", intent: "compare_builders", expectedConfidence: "high" },
  { query: "how do these two developers compare", intent: "compare_builders", expectedConfidence: "high" },
  { query: "alice versus bob who is stronger", intent: "compare_builders", expectedConfidence: "high" },
  { query: "skill comparison between builders", intent: "compare_builders", expectedConfidence: "high" },
  { query: "contrast these two profiles", intent: "compare_builders", expectedConfidence: "high" },

  // ── builder_detail (10+ examples) ───────────────────────
  { query: "tell me about mara", intent: "builder_detail", expectedConfidence: "high" },
  { query: "show full profile of aisha", intent: "builder_detail", expectedConfidence: "high" },
  { query: "details on this builder", intent: "builder_detail", expectedConfidence: "high" },
  { query: "who is ofir", intent: "builder_detail", expectedConfidence: "high" },
  { query: "what has alice built", intent: "builder_detail", expectedConfidence: "high" },
  { query: "more info on bob", intent: "builder_detail", expectedConfidence: "high" },
  { query: "give me the full picture on jake", intent: "builder_detail", expectedConfidence: "high" },
  { query: "show jake's profile", intent: "builder_detail", expectedConfidence: "high" },
  { query: "deep dive on this developer", intent: "builder_detail", expectedConfidence: "high" },
  { query: "what's alice's background", intent: "builder_detail", expectedConfidence: "high" },

  // ── platform_stats (10+ examples) ───────────────────────
  { query: "how many builders are on the platform", intent: "platform_stats", expectedConfidence: "high" },
  { query: "give me platform stats", intent: "platform_stats", expectedConfidence: "high" },
  { query: "numbers overview", intent: "platform_stats", expectedConfidence: "high" },
  { query: "current metrics", intent: "platform_stats", expectedConfidence: "high" },
  { query: "how big is the network", intent: "platform_stats", expectedConfidence: "high" },
  { query: "total projects and builders", intent: "platform_stats", expectedConfidence: "high" },
  { query: "platform summary", intent: "platform_stats", expectedConfidence: "high" },
  { query: "community size", intent: "platform_stats", expectedConfidence: "high" },
  { query: "give me the data on the network", intent: "platform_stats", expectedConfidence: "medium" },
  { query: "how active is the platform", intent: "platform_stats", expectedConfidence: "medium" },

  // ── trending (15+ examples) ─────────────────────────────
  { query: "what's trending right now", intent: "trending", expectedConfidence: "high" },
  { query: "hot projects this week", intent: "trending", expectedConfidence: "high" },
  { query: "popular builders right now", intent: "trending", expectedConfidence: "high" },
  { query: "show me what's buzzing", intent: "trending", expectedConfidence: "high" },
  { query: "most liked projects recently", intent: "trending", expectedConfidence: "high" },
  { query: "who's on fire in the community", intent: "trending", expectedConfidence: "high" },
  { query: "what's getting traction", intent: "trending", expectedConfidence: "high" },
  { query: "top projects this month", intent: "trending", expectedConfidence: "high" },
  { query: "trending builders", intent: "trending", expectedConfidence: "high" },
  { query: "rising stars on the platform", intent: "trending", expectedConfidence: "high" },
  { query: "what's popular lately", intent: "trending", expectedConfidence: "high" },
  { query: "show me the most active builders", intent: "trending", expectedConfidence: "high" },
  { query: "which projects are blowing up", intent: "trending", expectedConfidence: "high" },
  { query: "highest rated this week", intent: "trending", expectedConfidence: "high" },
  { query: "viral projects", intent: "trending", expectedConfidence: "high" },

  // ── recommend (10+ examples) ────────────────────────────
  { query: "recommend projects for me", intent: "recommend", expectedConfidence: "high" },
  { query: "what should I build next", intent: "recommend", expectedConfidence: "high" },
  { query: "suggest a hackathon for beginners", intent: "recommend", expectedConfidence: "high" },
  { query: "any recommendations for someone learning AI", intent: "recommend", expectedConfidence: "high" },
  { query: "what's a good project idea", intent: "recommend", expectedConfidence: "high" },
  { query: "inspire me with project ideas", intent: "recommend", expectedConfidence: "high" },
  { query: "which hackathon should I join", intent: "recommend", expectedConfidence: "high" },
  { query: "suggest builders to follow", intent: "recommend", expectedConfidence: "high" },
  { query: "recommend a tech stack for a startup", intent: "recommend", expectedConfidence: "high" },
  { query: "what should I check out on antry", intent: "recommend", expectedConfidence: "medium" },

  // ── profile_tips (10+ examples) ─────────────────────────
  { query: "how can I improve my profile", intent: "profile_tips", expectedConfidence: "high" },
  { query: "what skills should I add", intent: "profile_tips", expectedConfidence: "high" },
  { query: "tips for my builder profile", intent: "profile_tips", expectedConfidence: "high" },
  { query: "how do I stand out on the platform", intent: "profile_tips", expectedConfidence: "high" },
  { query: "make my profile better", intent: "profile_tips", expectedConfidence: "high" },
  { query: "what makes a great builder profile", intent: "profile_tips", expectedConfidence: "high" },
  { query: "how to get more visibility", intent: "profile_tips", expectedConfidence: "high" },
  { query: "profile optimization tips", intent: "profile_tips", expectedConfidence: "high" },
  { query: "what should I put in my bio", intent: "profile_tips", expectedConfidence: "high" },
  { query: "how to attract team invites", intent: "profile_tips", expectedConfidence: "medium" },

  // ── network_stats (10+ examples) ────────────────────────
  { query: "how many projects shipped this month", intent: "network_stats", expectedConfidence: "high" },
  { query: "new builders this week", intent: "network_stats", expectedConfidence: "high" },
  { query: "growth rate of the community", intent: "network_stats", expectedConfidence: "high" },
  { query: "how many people joined recently", intent: "network_stats", expectedConfidence: "high" },
  { query: "what's the skill distribution", intent: "network_stats", expectedConfidence: "high" },
  { query: "most popular tech stack", intent: "network_stats", expectedConfidence: "high" },
  { query: "what skills are in demand", intent: "network_stats", expectedConfidence: "high" },
  { query: "builder activity this week", intent: "network_stats", expectedConfidence: "high" },
  { query: "projects shipped today", intent: "network_stats", expectedConfidence: "high" },
  { query: "recent activity on the platform", intent: "network_stats", expectedConfidence: "high" },

  // ── help (8+ examples) ──────────────────────────────────
  { query: "what can you do", intent: "help", expectedConfidence: "high" },
  { query: "help me use scout", intent: "help", expectedConfidence: "high" },
  { query: "how does this work", intent: "help", expectedConfidence: "high" },
  { query: "available commands", intent: "help", expectedConfidence: "high" },
  { query: "what are your capabilities", intent: "help", expectedConfidence: "high" },
  { query: "how do I use this", intent: "help", expectedConfidence: "high" },
  { query: "what can scout do", intent: "help", expectedConfidence: "high" },
  { query: "guide me", intent: "help", expectedConfidence: "medium" },

  // ── greeting (18+ examples) ─────────────────────────────
  { query: "hi", intent: "greeting", expectedConfidence: "high" },
  { query: "hello", intent: "greeting", expectedConfidence: "high" },
  { query: "hey", intent: "greeting", expectedConfidence: "high" },
  { query: "hey there", intent: "greeting", expectedConfidence: "high" },
  { query: "hi there", intent: "greeting", expectedConfidence: "high" },
  { query: "good morning", intent: "greeting", expectedConfidence: "high" },
  { query: "good afternoon", intent: "greeting", expectedConfidence: "high" },
  { query: "good evening", intent: "greeting", expectedConfidence: "high" },
  { query: "sup", intent: "greeting", expectedConfidence: "high" },
  { query: "yo", intent: "greeting", expectedConfidence: "high" },
  { query: "howdy", intent: "greeting", expectedConfidence: "high" },
  { query: "hiya", intent: "greeting", expectedConfidence: "high" },
  { query: "whats up", intent: "greeting", expectedConfidence: "high" },
  { query: "what's up", intent: "greeting", expectedConfidence: "high" },
  { query: "heyo", intent: "greeting", expectedConfidence: "high" },
  { query: "hi scout", intent: "greeting", expectedConfidence: "high" },
  { query: "hello scout", intent: "greeting", expectedConfidence: "high" },
  { query: "hey scout", intent: "greeting", expectedConfidence: "high" },

  // ── off_topic (18+ examples) ────────────────────────────
  { query: "what is the weather today", intent: "off_topic", expectedConfidence: "high" },
  { query: "tell me a joke", intent: "off_topic", expectedConfidence: "high" },
  { query: "who is the president", intent: "off_topic", expectedConfidence: "high" },
  { query: "write me an essay", intent: "off_topic", expectedConfidence: "high" },
  { query: "how do I cook pasta", intent: "off_topic", expectedConfidence: "high" },
  { query: "what time is it", intent: "off_topic", expectedConfidence: "high" },
  { query: "translate this to french", intent: "off_topic", expectedConfidence: "high" },
  { query: "play some music", intent: "off_topic", expectedConfidence: "high" },
  { query: "who won the game last night", intent: "off_topic", expectedConfidence: "high" },
  { query: "solve this math problem", intent: "off_topic", expectedConfidence: "high" },
  { query: "what is the meaning of life", intent: "off_topic", expectedConfidence: "medium" },
  { query: "can you book me a flight", intent: "off_topic", expectedConfidence: "high" },
  { query: "what's the stock price of apple", intent: "off_topic", expectedConfidence: "high" },
  { query: "write me a poem", intent: "off_topic", expectedConfidence: "high" },
  { query: "how tall is mount everest", intent: "off_topic", expectedConfidence: "high" },
  { query: "order me a pizza", intent: "off_topic", expectedConfidence: "high" },
  { query: "what's on netflix", intent: "off_topic", expectedConfidence: "high" },
  { query: "help me with my homework", intent: "off_topic", expectedConfidence: "high" },
];

// ── Example good responses per intent ─────────────────────

export const EXAMPLE_RESPONSES: Record<AgentIntent, string[]> = {
  find_builders: [
    "Found {count} builders matching your search:",
    "Found {count} builders with {skill} experience:",
  ],
  find_projects: [
    "Found {count} projects matching your search:",
    "Found {count} projects to check out:",
  ],
  find_hackathons: [
    "{title} is live now -- \"{theme}\" theme, {prize} in prizes.",
    "Found {count} events you can join:",
  ],
  build_team: [
    "{count}-person team for {theme}, covering {skills} skills.",
    "Team assembled! {count} builders for {theme}.",
  ],
  compare_builders: [
    "{nameA} vs {nameB}:",
    "Side-by-side: {nameA} and {nameB}:",
  ],
  builder_detail: [
    "{name} (@{username}) -- {projectCount} projects, {totalLikes} likes.",
    "{name}: {skills} builder, {projectCount} projects shipped.",
  ],
  platform_stats: [
    "Here's a snapshot of the network:",
    "Antry by the numbers:",
  ],
  trending: [
    "Here's what's trending on Antry right now:",
    "Trending this week:",
  ],
  recommend: [
    "Here are my top picks for you:",
    "Worth checking out right now:",
  ],
  profile_tips: [
    "Ship projects, list your skills, write a clear bio, and link your socials.",
    "Active builders get noticed fast. Here's how to stand out:",
  ],
  network_stats: [
    "Here's the latest network activity:",
    "Network stats at a glance:",
  ],
  help: [
    "I'm Scout -- I find builders, explore projects, browse hackathons, build teams, and show trends.",
    "I'm Scout. Ask me about builders, projects, hackathons, or what's trending.",
  ],
  greeting: [
    "Hey! I'm Scout. Ask me anything about builders, projects, or hackathons on Antry.",
    "Hi! I'm Scout -- your guide to the Antry builder network. What do you need?",
  ],
  off_topic: [
    "I can only help with the Antry network -- try asking about builders, projects, or hackathons!",
    "That's outside my scope! Ask me about builders, projects, or hackathons on Antry.",
  ],
};

// ── Time-aware query helpers ──────────────────────────────

export interface TimeWindow {
  label: string;
  /** ISO date string threshold -- items created after this are "within" the window */
  since: string;
}

export function parseTimeWindow(query: string): TimeWindow | null {
  const q = query.toLowerCase();

  const now = new Date();

  if (/\btoday\b/.test(q)) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { label: "today", since: start.toISOString() };
  }

  if (/\bthis week\b|\blast 7 days?\b|\bpast week\b/.test(q)) {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return { label: "this week", since: start.toISOString() };
  }

  if (/\bthis month\b|\blast 30 days?\b|\bpast month\b/.test(q)) {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return { label: "this month", since: start.toISOString() };
  }

  if (/\blast week\b/.test(q)) {
    const start = new Date(now);
    start.setDate(start.getDate() - 14);
    const end = new Date(now);
    end.setDate(end.getDate() - 7);
    return { label: "last week", since: start.toISOString() };
  }

  if (/\brecent(?:ly)?\b|\bnew(?:est)?\b|\blatest\b|\bfresh\b|\bjust\b/.test(q)) {
    const start = new Date(now);
    start.setDate(start.getDate() - 14);
    return { label: "recently", since: start.toISOString() };
  }

  return null;
}

// ── Confidence calibration ────────────────────────────────

/**
 * Maps a raw TF-IDF + boost score into a calibrated confidence value.
 * Uses the training data distribution to normalize.
 */
export function calibrateConfidence(rawScore: number, intentMatchCount: number): number {
  // If multiple intent examples matched strongly, boost confidence
  const matchBonus = Math.min(0.15, intentMatchCount * 0.03);

  // Raw score typically ranges 0.3-1.5 after boosts
  // Map to 0.3-0.98 confidence range
  const base = Math.max(0.3, Math.min(0.98, rawScore * 0.65 + matchBonus));

  return Math.round(base * 100) / 100;
}
