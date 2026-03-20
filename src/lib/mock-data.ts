// ── Types ──────────────────────────────────────────────

export interface Builder {
  id: string;
  username: string;
  name: string;
  tagline: string; // short 1-liner shown on cards
  bio: string;
  skills: string[];
  social: { github?: string; twitter?: string; website?: string };
  projectCount: number;
  joinedAt: string;
  gradient: string;
  antathonIds: string[]; // antathons participated in or created
  outsideProjects: OutsideProject[];
}

export interface OutsideProject {
  title: string;
  url: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  demoUrl: string;
  sourceUrl?: string;
  techStack: string[];
  buildTime: string;
  category: Category;
  builder: { username: string; name: string; gradient: string };
  likes: number;
  createdAt: string;
  gradient: string;
  antathonId?: string; // if built during an antathon
}

export interface Antathon {
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

export type Category = "all" | "ai-agents" | "web-apps" | "tools" | "design" | "data-ml" | "mobile";

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ai-agents", label: "AI Agents" },
  { value: "web-apps", label: "Web Apps" },
  { value: "tools", label: "Tools" },
  { value: "design", label: "Design" },
  { value: "data-ml", label: "Data / ML" },
  { value: "mobile", label: "Mobile" },
];

// ── Builders (Ants) ───────────────────────────────────

export const builders: Builder[] = [
  {
    id: "b1",
    username: "marachen",
    name: "Mara Chen",
    tagline: "AI engineer building things that think",
    bio: "AI engineer obsessed with autonomous agents. Previously at DeepMind. I build things that think.",
    skills: ["Python", "LangChain", "TypeScript", "RAG", "Multi-agent systems"],
    social: { github: "marachen", twitter: "marachenai", website: "marachen.dev" },
    projectCount: 3,
    joinedAt: "2026-01-15",
    gradient: "linear-gradient(135deg, #27272a 0%, #09090b 100%)",
    antathonIds: ["h1", "h3"],
    outsideProjects: [
      { title: "LangChain Contrib", url: "https://github.com/marachen/langchain-contrib", description: "Popular contrib package for LangChain memory modules" },
    ],
  },
  {
    id: "b2",
    username: "jaketorres",
    name: "Jake Torres",
    tagline: "Full-stack builder who ships fast",
    bio: "Full-stack builder. I ship fast and break conventions. Currently exploring real-time collaboration.",
    skills: ["React", "Next.js", "Node.js", "WebSockets", "Postgres"],
    social: { github: "jaketorres", twitter: "jake_ships" },
    projectCount: 2,
    joinedAt: "2026-01-22",
    gradient: "linear-gradient(135deg, #404040 0%, #171717 100%)",
    antathonIds: ["h2"],
    outsideProjects: [
      { title: "Sync Engine", url: "https://github.com/jaketorres/sync-engine", description: "Open-source CRDT sync engine for collaborative apps" },
    ],
  },
  {
    id: "b3",
    username: "aishapatel",
    name: "Aisha Patel",
    tagline: "Design engineer bridging art and code",
    bio: "Design engineer who believes interfaces should feel like art. Bridging aesthetics and engineering.",
    skills: ["React", "Figma", "Three.js", "Framer Motion", "CSS"],
    social: { github: "aishapatel", twitter: "aisha_designs", website: "aishapatel.design" },
    projectCount: 2,
    joinedAt: "2026-02-01",
    gradient: "linear-gradient(135deg, #374151 0%, #111827 100%)",
    antathonIds: ["h2", "h3"],
    outsideProjects: [],
  },
  {
    id: "b4",
    username: "leokim",
    name: "Leo Kim",
    tagline: "Makes infrastructure invisible",
    bio: "Systems thinker. I make infrastructure invisible and developer tools delightful.",
    skills: ["Go", "Rust", "Terraform", "Kubernetes", "CLI"],
    social: { github: "leokim" },
    projectCount: 2,
    joinedAt: "2026-02-10",
    gradient: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
    antathonIds: ["h3"],
    outsideProjects: [
      { title: "k8s-dashboard", url: "https://github.com/leokim/k8s-dash", description: "Terminal dashboard for Kubernetes clusters" },
      { title: "go-migrate", url: "https://github.com/leokim/go-migrate", description: "Zero-dependency database migration tool in Go" },
    ],
  },
  {
    id: "b5",
    username: "sofiarivera",
    name: "Sofia Rivera",
    tagline: "ML engineer turning papers into products",
    bio: "ML engineer turning research papers into products people actually use. Data is my medium.",
    skills: ["Python", "PyTorch", "FastAPI", "Pandas", "Streamlit"],
    social: { github: "sofiarivera", twitter: "sofia_ml", website: "sofiarivera.io" },
    projectCount: 1,
    joinedAt: "2026-02-18",
    gradient: "linear-gradient(135deg, #18181b 0%, #000000 100%)",
    antathonIds: ["h1"],
    outsideProjects: [],
  },
  {
    id: "b6",
    username: "omarhassan",
    name: "Omar Hassan",
    tagline: "Mobile-first, cross-platform everything",
    bio: "Mobile-first builder. If it doesn't work on a phone, it doesn't work. Cross-platform everything.",
    skills: ["React Native", "Swift", "Kotlin", "Firebase", "Expo"],
    social: { github: "omarhassan", twitter: "omar_builds" },
    projectCount: 1,
    joinedAt: "2026-03-01",
    gradient: "linear-gradient(135deg, #4b5563 0%, #1f2937 100%)",
    antathonIds: [],
    outsideProjects: [
      { title: "Expo Starter", url: "https://github.com/omarhassan/expo-starter", description: "Opinionated Expo starter with auth, navigation, and theming" },
    ],
  },
];

// ── Projects ───────────────────────────────────────────

export const projects: Project[] = [
  {
    id: "p1",
    title: "Sentinel",
    tagline: "AI code reviewer that catches what linters miss",
    description:
      "Sentinel is an autonomous code review agent that analyzes pull requests for logic errors, security vulnerabilities, and architectural anti-patterns. It integrates with GitHub Actions and provides inline suggestions with explanations. Built with a multi-agent pipeline: one agent reads the diff, another checks against project conventions, and a third synthesizes the review.",
    demoUrl: "https://sentinel-demo.vercel.app",
    sourceUrl: "https://github.com/marachen/sentinel",
    techStack: ["Python", "LangChain", "Claude API", "GitHub Actions", "FastAPI"],
    buildTime: "3 weeks",
    category: "ai-agents",
    builder: { username: "marachen", name: "Mara Chen", gradient: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)" },
    likes: 142,
    createdAt: "2026-02-20",
    gradient: "linear-gradient(135deg, #262626 0%, #171717 100%)",
  },
  {
    id: "p2",
    title: "Flowstate",
    tagline: "Collaborative whiteboard that thinks with you",
    description:
      "A real-time collaborative whiteboard with AI-powered features: auto-layout for messy diagrams, smart grouping, and an assistant that can generate wireframes from text descriptions. Supports unlimited canvas, sticky notes, drawing tools, and live cursors. Built for distributed teams that think visually.",
    demoUrl: "https://flowstate.app",
    sourceUrl: "https://github.com/jaketorres/flowstate",
    techStack: ["Next.js", "WebSockets", "Canvas API", "Postgres", "Liveblocks"],
    buildTime: "5 weeks",
    category: "web-apps",
    builder: { username: "jaketorres", name: "Jake Torres", gradient: "linear-gradient(135deg, #27272a 0%, #09090b 100%)" },
    likes: 98,
    createdAt: "2026-03-01",
    gradient: "linear-gradient(135deg, #404040 0%, #171717 100%)",
    antathonId: "h2",
  },
  {
    id: "p3",
    title: "Chrono",
    tagline: "Time tracking from the terminal, finally done right",
    description:
      "A beautiful CLI time tracker that respects your workflow. Start/stop timers with simple commands, auto-detect project context from git, generate invoices in PDF, and sync with popular project management tools. Includes a TUI dashboard with charts built entirely in the terminal.",
    demoUrl: "https://chrono-cli.dev",
    techStack: ["Go", "Bubble Tea", "SQLite", "Lip Gloss"],
    buildTime: "2 weeks",
    category: "tools",
    builder: { username: "leokim", name: "Leo Kim", gradient: "linear-gradient(135deg, #374151 0%, #111827 100%)" },
    likes: 76,
    createdAt: "2026-02-28",
    gradient: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
    antathonId: "h3",
  },
  {
    id: "p4",
    title: "Palette",
    tagline: "AI color systems that actually look good",
    description:
      "Generate complete design system color palettes from a single seed color or a mood description. Palette understands color theory, accessibility contrast ratios, and modern design trends. Export to Figma, Tailwind config, CSS variables, or Swift. Used by 2,000+ designers.",
    demoUrl: "https://palette.aishapatel.design",
    techStack: ["React", "Three.js", "WebGL", "Framer Motion", "Vercel"],
    buildTime: "10 days",
    category: "design",
    builder: { username: "aishapatel", name: "Aisha Patel", gradient: "linear-gradient(135deg, #18181b 0%, #000000 100%)" },
    likes: 231,
    createdAt: "2026-02-14",
    gradient: "linear-gradient(135deg, #4b5563 0%, #1f2937 100%)",
    antathonId: "h3",
  },
  {
    id: "p5",
    title: "Nomad",
    tagline: "Your AI travel planner that learns your vibe",
    description:
      "Nomad builds personalized travel itineraries by learning your preferences over time. Tell it what you liked about past trips, and it suggests destinations, restaurants, and activities that match your style. Integrates with Google Maps, fetches real-time prices, and exports clean PDF itineraries.",
    demoUrl: "https://nomad-travel.vercel.app",
    techStack: ["Python", "FastAPI", "Claude API", "Streamlit", "Supabase"],
    buildTime: "4 weeks",
    category: "ai-agents",
    builder: { username: "sofiarivera", name: "Sofia Rivera", gradient: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)" },
    likes: 89,
    createdAt: "2026-03-10",
    gradient: "linear-gradient(135deg, #262626 0%, #171717 100%)",
  },
  {
    id: "p6",
    title: "Pulse",
    tagline: "Real-time health metrics on your wrist and screen",
    description:
      "A cross-platform health dashboard that syncs with Apple Watch, Fitbit, and Garmin. Visualizes heart rate, sleep, activity, and nutrition data in beautiful real-time charts. Includes AI insights that spot patterns in your data and suggest lifestyle adjustments.",
    demoUrl: "https://pulse-health.app",
    techStack: ["React Native", "Expo", "HealthKit", "D3.js", "Firebase"],
    buildTime: "6 weeks",
    category: "mobile",
    builder: { username: "omarhassan", name: "Omar Hassan", gradient: "linear-gradient(135deg, #27272a 0%, #09090b 100%)" },
    likes: 64,
    createdAt: "2026-03-05",
    gradient: "linear-gradient(135deg, #404040 0%, #171717 100%)",
  },
  {
    id: "p7",
    title: "Scribe",
    tagline: "Voice notes to structured docs in seconds",
    description:
      "Record a voice memo and Scribe turns it into clean, structured documentation. It understands context, adds formatting, creates code blocks from verbal descriptions, and organizes content into sections. Perfect for capturing architecture decisions on the go.",
    demoUrl: "https://scribe-ai.vercel.app",
    sourceUrl: "https://github.com/marachen/scribe",
    techStack: ["TypeScript", "Whisper API", "Claude API", "Next.js", "Vercel"],
    buildTime: "2 weeks",
    category: "ai-agents",
    builder: { username: "marachen", name: "Mara Chen", gradient: "linear-gradient(135deg, #374151 0%, #111827 100%)" },
    likes: 117,
    createdAt: "2026-03-08",
    gradient: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
  },
  {
    id: "p8",
    title: "Terraform Studio",
    tagline: "Visual infrastructure as code, no YAML required",
    description:
      "Drag-and-drop cloud architecture builder that generates production-ready Terraform configurations. Supports AWS, GCP, and Azure. Auto-detects resource dependencies, estimates monthly costs, and validates configurations before you apply. Makes infrastructure visual for the first time.",
    demoUrl: "https://tf-studio.dev",
    techStack: ["React", "Go", "Terraform", "D3.js", "Docker"],
    buildTime: "8 weeks",
    category: "tools",
    builder: { username: "leokim", name: "Leo Kim", gradient: "linear-gradient(135deg, #18181b 0%, #000000 100%)" },
    likes: 203,
    createdAt: "2026-01-30",
    gradient: "linear-gradient(135deg, #4b5563 0%, #1f2937 100%)",
  },
  {
    id: "p9",
    title: "Mood",
    tagline: "Music that matches how you feel, not what's trending",
    description:
      "An emotion-aware music player that curates playlists based on your current mood, time of day, and listening history. Uses facial expression analysis (optional) and text input to understand your emotional state. Features a stunning 3D audio visualizer.",
    demoUrl: "https://mood-player.vercel.app",
    techStack: ["React", "Web Audio API", "Three.js", "Spotify API", "TensorFlow.js"],
    buildTime: "3 weeks",
    category: "design",
    builder: { username: "aishapatel", name: "Aisha Patel", gradient: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)" },
    likes: 156,
    createdAt: "2026-03-12",
    gradient: "linear-gradient(135deg, #262626 0%, #171717 100%)",
    antathonId: "h2",
  },
  {
    id: "p10",
    title: "Relay",
    tagline: "API mocking that keeps up with your schema",
    description:
      "A smart API mock server that auto-generates realistic fake data from your OpenAPI spec. Supports GraphQL and REST. Hot-reloads when your spec changes. Includes a dashboard to inspect mock responses and simulate error states for frontend testing.",
    demoUrl: "https://relay-mock.dev",
    sourceUrl: "https://github.com/jaketorres/relay",
    techStack: ["Node.js", "Express", "Faker.js", "OpenAPI", "Docker"],
    buildTime: "10 days",
    category: "tools",
    builder: { username: "jaketorres", name: "Jake Torres", gradient: "linear-gradient(135deg, #27272a 0%, #09090b 100%)" },
    likes: 88,
    createdAt: "2026-02-05",
    gradient: "linear-gradient(135deg, #404040 0%, #171717 100%)",
  },
  {
    id: "p11",
    title: "Aether",
    tagline: "Multi-agent orchestration made simple",
    description:
      "A framework for building multi-agent AI systems with a simple declarative API. Define agents, their tools, and communication patterns in YAML. Aether handles orchestration, state management, and observability. Includes a real-time dashboard showing agent interactions.",
    demoUrl: "https://aether-agents.dev",
    sourceUrl: "https://github.com/marachen/aether",
    techStack: ["Python", "Claude API", "Redis", "React", "WebSockets"],
    buildTime: "6 weeks",
    category: "ai-agents",
    builder: { username: "marachen", name: "Mara Chen", gradient: "linear-gradient(135deg, #374151 0%, #111827 100%)" },
    likes: 184,
    createdAt: "2026-01-20",
    gradient: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
  },
];

// ── Antathons ─────────────────────────────────────────

export const antathons: Antathon[] = [
  {
    id: "h1",
    title: "Build with AI Agents",
    theme: "Autonomous agents that solve real problems",
    description:
      "Design and build an AI agent that autonomously solves a real-world problem. From code review to customer support to data analysis — show us what agents can do when given the right tools. Judged on creativity, technical depth, and real-world utility.",
    startDate: "2026-04-05",
    endDate: "2026-04-07",
    prizes: [
      { place: "1st", reward: "$5,000" },
      { place: "2nd", reward: "$2,500" },
      { place: "3rd", reward: "$1,000" },
      { place: "Best solo ant", reward: "$500" },
    ],
    sponsors: [
      { name: "Anthropic", tier: "title" },
      { name: "Vercel", tier: "gold" },
      { name: "Supabase", tier: "partner" },
    ],
    participantCount: 0,
    submissionCount: 0,
    status: "upcoming",
    gradient: "linear-gradient(135deg, #18181b 0%, #000000 100%)",
  },
  {
    id: "h2",
    title: "Ship in 48 Hours",
    theme: "From zero to deployed in a single weekend",
    description:
      "The ultimate speed challenge. Build and deploy a complete product in 48 hours. No pre-built code allowed. Judged on polish, functionality, and how fast you shipped. Bonus points for solo ants.",
    startDate: "2026-03-22",
    endDate: "2026-03-24",
    prizes: [
      { place: "1st", reward: "$3,000" },
      { place: "2nd", reward: "$1,500" },
      { place: "Best design", reward: "$750" },
    ],
    sponsors: [
      { name: "Vercel", tier: "title" },
      { name: "Neon", tier: "gold" },
    ],
    participantCount: 47,
    submissionCount: 12,
    status: "active",
    gradient: "linear-gradient(135deg, #4b5563 0%, #1f2937 100%)",
  },
  {
    id: "h3",
    title: "Open Source Sprint",
    theme: "Build something the colony can use forever",
    description:
      "Create an open-source tool, library, or framework that solves a common developer pain point. Must be published on GitHub with proper documentation, CI, and a README that makes contributors want to jump in.",
    startDate: "2026-02-15",
    endDate: "2026-02-17",
    prizes: [
      { place: "1st", reward: "$2,000" },
      { place: "2nd", reward: "$1,000" },
      { place: "Most stars (30 days)", reward: "$500" },
    ],
    sponsors: [
      { name: "GitHub", tier: "title" },
      { name: "Cloudflare", tier: "partner" },
    ],
    participantCount: 83,
    submissionCount: 34,
    status: "completed",
    gradient: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
  },
];

// ── Ofir's builder profile ───────────────────────────

builders.push({
  id: "b7",
  username: "ofirsela",
  name: "Ofir Sela",
  tagline: "Building the future of builder communities",
  bio: "Founder of Antry. Obsessed with creating the platform where builders are discovered by what they ship, not what they say.",
  skills: ["Next.js", "TypeScript", "Supabase", "Product", "AI Agents"],
  social: { github: "OfirCS", twitter: "ofirsela" },
  projectCount: 1,
  joinedAt: "2026-01-01",
  gradient: "linear-gradient(135deg, #262626 0%, #171717 100%)",
  antathonIds: [],
  outsideProjects: [
    { title: "Antry", url: "https://antry.dev", description: "Where builders are discovered — the platform itself" },
  ],
});

projects.push({
  id: "p12",
  title: "Wealthy",
  tagline: "AI-powered financial pathfinder for smart investing",
  description:
    "Wealthy is an AI-powered financial tool that helps users navigate investment decisions with a smart Pathfinder feature. It analyzes market trends, personal risk profiles, and financial goals to create personalized investment strategies. Features include real-time portfolio tracking, AI-driven insights, and an intuitive dashboard.",
  demoUrl: "https://cap.so/s/9evpv4n3m2vpcgg",
  techStack: ["Next.js", "TypeScript", "AI Agents", "Supabase", "Tailwind CSS"],
  buildTime: "4 weeks",
  category: "ai-agents",
  builder: { username: "ofirsela", name: "Ofir Sela", gradient: "linear-gradient(135deg, #27272a 0%, #09090b 100%)" },
  likes: 47,
  createdAt: "2026-03-01",
  gradient: "linear-gradient(135deg, #404040 0%, #171717 100%)",
});

// ── Helpers ────────────────────────────────────────────

export function getBuilder(username: string): Builder | undefined {
  return builders.find((b) => b.username === username);
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getAntathon(id: string): Antathon | undefined {
  return antathons.find((h) => h.id === id);
}

export function getBuilderProjects(username: string): Project[] {
  return projects.filter((p) => p.builder.username === username);
}

export function getProjectsByCategory(category: Category): Project[] {
  if (category === "all") return projects;
  return projects.filter((p) => p.category === category);
}

export function getAntathonProjects(antathonId: string): Project[] {
  return projects.filter((p) => p.antathonId === antathonId);
}

export function getBuilderAntathons(username: string): Antathon[] {
  const builder = getBuilder(username);
  if (!builder) return [];
  return antathons.filter((a) => builder.antathonIds.includes(a.id));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
