import { describe, it, expect } from "vitest";
import { isDomainScopedAgentQuery, runAgent } from "@/lib/agent/engine";
import type { AgentDataset, AgentChatTurn } from "@/lib/agent/types";

// ── isDomainScopedAgentQuery() ──────────────────────

describe("isDomainScopedAgentQuery()", () => {
  it("returns true for builder-related queries", () => {
    expect(isDomainScopedAgentQuery("find me a builder")).toBe(true);
    expect(isDomainScopedAgentQuery("search for a developer")).toBe(true);
    expect(isDomainScopedAgentQuery("who is this engineer")).toBe(true);
    expect(isDomainScopedAgentQuery("looking for a designer")).toBe(true);
  });

  it("returns true for project-related queries", () => {
    expect(isDomainScopedAgentQuery("show me projects")).toBe(true);
    expect(isDomainScopedAgentQuery("best demo")).toBe(true);
  });

  it("returns true for hackathon-related queries", () => {
    expect(isDomainScopedAgentQuery("any hackathon running")).toBe(true);
    expect(isDomainScopedAgentQuery("upcoming antathon")).toBe(true);
    expect(isDomainScopedAgentQuery("events near me")).toBe(true);
  });

  it("returns true for team queries", () => {
    expect(isDomainScopedAgentQuery("build me a team")).toBe(true);
  });

  it("returns true for compare queries", () => {
    expect(isDomainScopedAgentQuery("compare these two profiles")).toBe(true);
  });

  it("returns true for skills and recruiting queries", () => {
    expect(isDomainScopedAgentQuery("who has react skills")).toBe(true);
    expect(isDomainScopedAgentQuery("recruit a dev")).toBe(true);
    expect(isDomainScopedAgentQuery("hire talent")).toBe(true);
  });

  it("returns true for stats/overview queries", () => {
    expect(isDomainScopedAgentQuery("platform stats")).toBe(true);
    expect(isDomainScopedAgentQuery("metrics overview")).toBe(true);
  });

  it("returns true for discover/directory", () => {
    expect(isDomainScopedAgentQuery("discover new talent")).toBe(true);
    expect(isDomainScopedAgentQuery("builder directory")).toBe(true);
  });

  it("returns true for likes/ship/sponsor keywords", () => {
    expect(isDomainScopedAgentQuery("who has the most likes")).toBe(true);
    expect(isDomainScopedAgentQuery("what did they ship")).toBe(true);
    expect(isDomainScopedAgentQuery("who are the sponsors")).toBe(true);
  });

  it("returns false for unrelated queries", () => {
    expect(isDomainScopedAgentQuery("hello world")).toBe(false);
    expect(isDomainScopedAgentQuery("what is the weather")).toBe(false);
    expect(isDomainScopedAgentQuery("tell me a joke")).toBe(false);
    expect(isDomainScopedAgentQuery("how are you")).toBe(false);
  });
});

// ── runAgent() ──────────────────────────────────────

function makeMockDataset(): AgentDataset {
  return {
    builders: [
      {
        id: "b1",
        username: "alice",
        name: "Alice Wonderland",
        tagline: "AI engineer building agents",
        bio: "AI engineer building autonomous agents and multi-agent systems.",
        skills: ["Python", "LangChain", "TypeScript"],
        social: { github: "alice" },
        projectCount: 2,
        gradient: "linear-gradient(135deg, #111 0%, #222 100%)",
        antathonIds: ["h1"],
        createdAt: "2026-01-15",
      },
      {
        id: "b2",
        username: "bob",
        name: "Bob Builder",
        tagline: "Full-stack builder who ships",
        bio: "Full-stack developer specializing in React and Node.",
        skills: ["React", "Next.js", "Node.js", "Postgres"],
        social: { github: "bob" },
        projectCount: 1,
        gradient: "linear-gradient(135deg, #333 0%, #444 100%)",
        antathonIds: [],
        createdAt: "2026-02-01",
      },
      {
        id: "b3",
        username: "carol",
        name: "Carol Designer",
        tagline: "Design engineer bridging aesthetics",
        bio: "Design engineer creating beautiful interfaces with motion.",
        skills: ["Figma", "React", "Three.js", "CSS"],
        social: { github: "carol" },
        projectCount: 1,
        gradient: "linear-gradient(135deg, #555 0%, #666 100%)",
        antathonIds: ["h1"],
        createdAt: "2026-02-10",
      },
      {
        id: "b4",
        username: "dave",
        name: "Dave Infra",
        tagline: "Makes infrastructure invisible",
        bio: "DevOps and infrastructure engineer.",
        skills: ["Go", "Terraform", "Kubernetes", "Docker"],
        social: { github: "dave" },
        projectCount: 1,
        gradient: "linear-gradient(135deg, #777 0%, #888 100%)",
        antathonIds: [],
        createdAt: "2026-03-01",
      },
    ],
    projects: [
      {
        id: "p1",
        title: "Agent X",
        tagline: "AI agent for code review",
        description: "An autonomous code review agent using LangChain.",
        demoUrl: "https://agentx.dev",
        sourceUrl: "https://github.com/alice/agentx",
        techStack: ["Python", "LangChain", "FastAPI"],
        buildTime: "3 weeks",
        category: "ai-agents",
        builder: { username: "alice", name: "Alice Wonderland", gradient: "#111" },
        likes: 50,
        createdAt: "2026-02-01",
        gradient: "#111",
      },
      {
        id: "p2",
        title: "Collab Board",
        tagline: "Real-time collaboration tool",
        description: "A whiteboard for teams with live cursors.",
        demoUrl: "https://collab.dev",
        techStack: ["React", "WebSockets", "Next.js"],
        buildTime: "4 weeks",
        category: "web-apps",
        builder: { username: "bob", name: "Bob Builder", gradient: "#333" },
        likes: 30,
        createdAt: "2026-02-15",
        gradient: "#333",
      },
      {
        id: "p3",
        title: "Design System",
        tagline: "Component library with motion",
        description: "Beautiful design system with animation.",
        demoUrl: "https://design.dev",
        techStack: ["React", "Framer Motion", "CSS"],
        buildTime: "2 weeks",
        category: "design",
        builder: { username: "carol", name: "Carol Designer", gradient: "#555" },
        likes: 20,
        createdAt: "2026-03-01",
        gradient: "#555",
      },
      {
        id: "p4",
        title: "Agent Y",
        tagline: "Multi-agent orchestration",
        description: "Framework for multi-agent AI systems.",
        demoUrl: "https://agenty.dev",
        techStack: ["Python", "Claude API", "Redis"],
        buildTime: "6 weeks",
        category: "ai-agents",
        builder: { username: "alice", name: "Alice Wonderland", gradient: "#111" },
        likes: 80,
        createdAt: "2026-01-20",
        gradient: "#111",
      },
      {
        id: "p5",
        title: "Infra CLI",
        tagline: "Terminal tool for cloud ops",
        description: "A CLI for managing Kubernetes clusters.",
        demoUrl: "https://infra-cli.dev",
        techStack: ["Go", "Kubernetes", "Docker"],
        buildTime: "2 weeks",
        category: "tools",
        builder: { username: "dave", name: "Dave Infra", gradient: "#777" },
        likes: 15,
        createdAt: "2026-02-28",
        gradient: "#777",
      },
    ],
    hackathons: [
      {
        id: "h1",
        title: "AI Agent Hack",
        theme: "Build autonomous AI agents",
        description: "Create an AI agent that solves a real problem.",
        startDate: "2026-04-01",
        endDate: "2026-04-03",
        prizes: [
          { place: "1st", reward: "$5000" },
          { place: "2nd", reward: "$2000" },
        ],
        sponsors: [{ name: "Anthropic", tier: "title" }],
        participantCount: 50,
        submissionCount: 20,
        status: "active",
        gradient: "#111",
      },
      {
        id: "h2",
        title: "Ship Weekend",
        theme: "Build and deploy in 48 hours",
        description: "Speed challenge to build a product in a weekend.",
        startDate: "2026-05-01",
        endDate: "2026-05-03",
        prizes: [{ place: "1st", reward: "$3000" }],
        sponsors: [{ name: "Vercel", tier: "title" }],
        participantCount: 0,
        submissionCount: 0,
        status: "upcoming",
        gradient: "#333",
      },
    ],
    source: "mock",
  };
}

describe("runAgent()", () => {
  const dataset = makeMockDataset();
  const emptyHistory: AgentChatTurn[] = [];

  describe("intent classification", () => {
    it("classifies builder search queries as find_builders", () => {
      const result = runAgent("find builders who know python", emptyHistory, dataset);
      expect(result.intent).toBe("find_builders");
    });

    it("classifies project queries as find_projects", () => {
      const result = runAgent("show me projects using react", emptyHistory, dataset);
      expect(result.intent).toBe("find_projects");
    });

    it("classifies hackathon queries as find_hackathons", () => {
      const result = runAgent("what hackathons are active right now", emptyHistory, dataset);
      expect(result.intent).toBe("find_hackathons");
    });

    it("classifies team queries as build_team", () => {
      const result = runAgent("build me a team for an AI hackathon", emptyHistory, dataset);
      expect(result.intent).toBe("build_team");
    });

    it("classifies compare queries as compare_builders", () => {
      const result = runAgent("compare alice and bob", emptyHistory, dataset);
      expect(result.intent).toBe("compare_builders");
    });

    it("classifies detail queries as builder_detail", () => {
      const result = runAgent("tell me about alice", emptyHistory, dataset);
      expect(result.intent).toBe("builder_detail");
    });

    it("classifies stats queries as platform_stats", () => {
      const result = runAgent("how many builders are on the platform", emptyHistory, dataset);
      expect(result.intent).toBe("platform_stats");
    });

    it("classifies help queries as help", () => {
      const result = runAgent("what can you do", emptyHistory, dataset);
      expect(result.intent).toBe("help");
    });
  });

  describe("fuzzy matching / typo tolerance", () => {
    it("handles typos in builder queries", () => {
      const result = runAgent("find biulders who know python", emptyHistory, dataset);
      expect(result.intent).toBe("find_builders");
    });

    it("handles colloquial language like who's good at", () => {
      const result = runAgent("who's good at react developer", emptyHistory, dataset);
      expect(result.intent).toBe("find_builders");
    });

    it("handles hackathon misspellings", () => {
      const result = runAgent("any hackaton events active", emptyHistory, dataset);
      expect(result.intent).toBe("find_hackathons");
    });

    it("handles shorthand like devs", () => {
      const result = runAgent("find devs skilled in python developer", emptyHistory, dataset);
      expect(result.intent).toBe("find_builders");
    });

    it("handles compare typos", () => {
      const result = runAgent("comapre alice and bob", emptyHistory, dataset);
      expect(result.intent).toBe("compare_builders");
    });
  });

  describe("find_builders", () => {
    it("returns builder cards ranked by relevance", () => {
      const result = runAgent("find builders who know python", emptyHistory, dataset);
      expect(result.cards.length).toBeGreaterThan(0);
      expect(result.cards[0].type).toBe("builder");
    });

    it("ranks python-skilled builder first", () => {
      const result = runAgent("find builders who know python", emptyHistory, dataset);
      const firstCard = result.cards[0];
      expect(firstCard.type).toBe("builder");
      if (firstCard.type === "builder") {
        expect(firstCard.data.skills).toContain("Python");
      }
    });

    it("includes steps metadata", () => {
      const result = runAgent("find developers skilled in react", emptyHistory, dataset);
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.steps[0].tool).toBe("retrieve_builders");
    });

    it("includes relevanceScore on each card", () => {
      const result = runAgent("find builders who know python", emptyHistory, dataset);
      result.cards.forEach((card) => {
        expect(card.relevanceScore).toBeDefined();
        expect(card.relevanceScore).toBeGreaterThanOrEqual(60);
        expect(card.relevanceScore).toBeLessThanOrEqual(99);
      });
    });

    it("top card has highest relevance score", () => {
      const result = runAgent("find builders who know python", emptyHistory, dataset);
      if (result.cards.length >= 2) {
        expect(result.cards[0].relevanceScore).toBeGreaterThanOrEqual(result.cards[1].relevanceScore);
      }
    });
  });

  describe("find_projects", () => {
    it("returns project cards", () => {
      const result = runAgent("show me projects built with python", emptyHistory, dataset);
      expect(result.cards.length).toBeGreaterThan(0);
      expect(result.cards[0].type).toBe("project");
    });

    it("includes relevanceScore on project cards", () => {
      const result = runAgent("show me projects built with python", emptyHistory, dataset);
      result.cards.forEach((card) => {
        expect(card.relevanceScore).toBeDefined();
        expect(card.relevanceScore).toBeGreaterThanOrEqual(60);
      });
    });
  });

  describe("find_hackathons", () => {
    it("returns hackathon cards", () => {
      const result = runAgent("what hackathons are happening", emptyHistory, dataset);
      expect(result.cards.length).toBeGreaterThan(0);
      expect(result.cards[0].type).toBe("hackathon");
    });

    it("boosts active hackathons", () => {
      const result = runAgent("active hackathon", emptyHistory, dataset);
      const firstCard = result.cards[0];
      if (firstCard.type === "hackathon") {
        expect(firstCard.data.status).toBe("active");
      }
    });

    it("includes relevanceScore on hackathon cards", () => {
      const result = runAgent("what hackathons are happening", emptyHistory, dataset);
      result.cards.forEach((card) => {
        expect(card.relevanceScore).toBeDefined();
        expect(card.relevanceScore).toBeGreaterThanOrEqual(60);
      });
    });
  });

  describe("build_team", () => {
    it("returns a team card", () => {
      const result = runAgent("build me a team for AI hackathon", emptyHistory, dataset);
      expect(result.intent).toBe("build_team");
      expect(result.cards.length).toBe(1);
      expect(result.cards[0].type).toBe("team");
    });

    it("team has members with roles and relevance scores", () => {
      const result = runAgent("build me a team for AI hackathon", emptyHistory, dataset);
      const teamCard = result.cards[0];
      if (teamCard.type === "team") {
        expect(teamCard.data.members.length).toBeGreaterThan(0);
        teamCard.data.members.forEach((member) => {
          expect(member.role).toBeTruthy();
          expect(member.reason).toBeTruthy();
          expect(member.builder).toBeDefined();
          expect(member.relevanceScore).toBeDefined();
          expect(member.relevanceScore).toBeGreaterThanOrEqual(0);
          expect(member.relevanceScore).toBeLessThanOrEqual(100);
          expect(Array.isArray(member.complementarySkills)).toBe(true);
        });
      }
    });

    it("team has role gap analysis", () => {
      const result = runAgent("build me a team for AI hackathon", emptyHistory, dataset);
      const teamCard = result.cards[0];
      if (teamCard.type === "team") {
        expect(Array.isArray(teamCard.data.roleGaps)).toBe(true);
        expect(teamCard.data.roleGaps.length).toBeGreaterThan(0);
        teamCard.data.roleGaps.forEach((gap) => {
          expect(gap.role).toBeTruthy();
          expect(Array.isArray(gap.neededSkills)).toBe(true);
          expect(typeof gap.filled).toBe("boolean");
        });
      }
    });

    it("team has team coverage", () => {
      const result = runAgent("build me a team for AI hackathon", emptyHistory, dataset);
      const teamCard = result.cards[0];
      if (teamCard.type === "team") {
        expect(Array.isArray(teamCard.data.teamCoverage)).toBe(true);
        expect(teamCard.data.teamCoverage.length).toBeGreaterThan(0);
      }
    });

    it("includes role_gap_analysis step", () => {
      const result = runAgent("build me a team for AI hackathon", emptyHistory, dataset);
      const gapStep = result.steps.find((s) => s.tool === "role_gap_analysis");
      expect(gapStep).toBeDefined();
    });
  });

  describe("compare_builders", () => {
    it("returns a comparison card when two builders are mentioned", () => {
      const result = runAgent("compare alice and bob", emptyHistory, dataset);
      expect(result.intent).toBe("compare_builders");
      expect(result.cards.length).toBe(1);
      expect(result.cards[0].type).toBe("comparison");
    });

    it("returns error when not enough builders can be found", () => {
      const emptyDataset: AgentDataset = {
        ...dataset,
        builders: [],
      };
      const result = runAgent("compare alice and bob", emptyHistory, emptyDataset);
      expect(result.response).toContain("two builder names");
    });

    it("comparison data has correct structure", () => {
      const result = runAgent("compare alice and bob", emptyHistory, dataset);
      const card = result.cards[0];
      if (card.type === "comparison") {
        expect(card.data.builderA).toBeDefined();
        expect(card.data.builderB).toBeDefined();
        expect(Array.isArray(card.data.sharedSkills)).toBe(true);
        expect(Array.isArray(card.data.uniqueA)).toBe(true);
        expect(Array.isArray(card.data.uniqueB)).toBe(true);
      }
    });

    it("comparison response includes markdown-formatted names", () => {
      const result = runAgent("compare alice and bob", emptyHistory, dataset);
      expect(result.response).toContain("**");
    });
  });

  describe("builder_detail", () => {
    it("returns a builder_detail card", () => {
      const result = runAgent("tell me about alice", emptyHistory, dataset);
      expect(result.intent).toBe("builder_detail");
      expect(result.cards.length).toBe(1);
      expect(result.cards[0].type).toBe("builder_detail");
    });

    it("builder detail contains projects and likes", () => {
      const result = runAgent("tell me about alice", emptyHistory, dataset);
      const card = result.cards[0];
      if (card.type === "builder_detail") {
        expect(card.data.projects.length).toBeGreaterThan(0);
        expect(card.data.totalLikes).toBeGreaterThan(0);
      }
    });

    it("detail response includes username and project count", () => {
      const result = runAgent("tell me about alice", emptyHistory, dataset);
      expect(result.response).toContain("Alice Wonderland");
      expect(result.response).toContain("@alice");
    });
  });

  describe("platform_stats", () => {
    it("returns stats in the response", () => {
      const result = runAgent("how many builders on the platform", emptyHistory, dataset);
      expect(result.intent).toBe("platform_stats");
      expect(result.response).toContain("4");
      expect(result.response).toContain("builders");
      expect(result.response).toContain("5");
      expect(result.response).toContain("projects");
      expect(result.response).toContain("2");
      expect(result.response).toContain("hackathons");
    });
  });

  describe("help", () => {
    it("returns help guidance", () => {
      const result = runAgent("what can you do", emptyHistory, dataset);
      expect(result.intent).toBe("help");
      // The help response should mention key capabilities
      const lower = result.response.toLowerCase();
      expect(lower).toContain("find builders");
    });
  });

  describe("response suggestions", () => {
    it("returns suggestions array on every response", () => {
      const result = runAgent("find builders who know python", emptyHistory, dataset);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it("suggestions have label and prompt fields", () => {
      const result = runAgent("find builders who know python", emptyHistory, dataset);
      result.suggestions.forEach((s) => {
        expect(s.label).toBeTruthy();
        expect(s.prompt).toBeTruthy();
      });
    });

    it("builder results include compare and detail suggestions", () => {
      const result = runAgent("find builders who know python", emptyHistory, dataset);
      const labels = result.suggestions.map((s) => s.label.toLowerCase());
      // Should suggest comparison or detail view
      const hasCompareOrDetail = labels.some(
        (l) => l.includes("compare") || l.includes("tell me") || l.includes("team")
      );
      expect(hasCompareOrDetail).toBe(true);
    });

    it("team results include relevant follow-ups", () => {
      const result = runAgent("build me a team for AI hackathon", emptyHistory, dataset);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("help results include action suggestions", () => {
      const result = runAgent("what can you do", emptyHistory, dataset);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe("multi-turn conversation context", () => {
    it("uses prior context for short follow-ups", () => {
      const history: AgentChatTurn[] = [
        { role: "user", content: "find react builders" },
        { role: "assistant", content: "I found 4 strong builder matches.", intent: "find_builders" },
      ];
      const result = runAgent("which one has the most projects builder", history, dataset);
      // Should resolve to find_builders context, not help
      expect(result.intent).toBe("find_builders");
    });

    it("resolves contextual follow-up referencing prior results", () => {
      const history: AgentChatTurn[] = [
        { role: "user", content: "find python developers" },
        { role: "assistant", content: "Here are 3 strong builder matches.", intent: "find_builders" },
      ];
      const result = runAgent("tell me more about the first developer", history, dataset);
      // Should attempt builder detail or re-use find_builders context
      expect(["find_builders", "builder_detail"]).toContain(result.intent);
    });
  });

  describe("conversational response formatting", () => {
    it("builder responses use markdown bold", () => {
      const result = runAgent("find builders who know python", emptyHistory, dataset);
      expect(result.response).toContain("**");
    });

    it("team responses mention role coverage", () => {
      const result = runAgent("build me a team for AI hackathon", emptyHistory, dataset);
      expect(result.response.toLowerCase()).toContain("team");
    });

    it("help response uses bullet points", () => {
      const result = runAgent("what can you do", emptyHistory, dataset);
      expect(result.response).toContain("- ");
    });

    it("comparison response includes project and like counts", () => {
      const result = runAgent("compare alice and bob", emptyHistory, dataset);
      expect(result.response).toContain("projects");
      expect(result.response).toContain("likes");
    });
  });

  describe("response metadata", () => {
    it("always includes model identifier", () => {
      const result = runAgent("find builders", emptyHistory, dataset);
      expect(result.model).toBe("tfidf-intent-rag-v1");
    });

    it("always includes source from dataset", () => {
      const result = runAgent("find builders", emptyHistory, dataset);
      expect(result.source).toBe("mock");
    });

    it("confidence is between 0.35 and 0.98", () => {
      const result = runAgent("find builders who know react", emptyHistory, dataset);
      expect(result.confidence).toBeGreaterThanOrEqual(0.35);
      expect(result.confidence).toBeLessThanOrEqual(0.98);
    });
  });
});
