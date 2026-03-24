import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";
import {
  getInitials,
  formatDate,
  getBuilder,
  getProject,
  getBuilderProjects,
  getProjectsByCategory,
  getAntathon,
  getAntathonProjects,
  getBuilderAntathons,
  builders,
  projects,
} from "@/lib/mock-data";

// ── cn() ────────────────────────────────────────────

describe("cn()", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes via clsx", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    const result = cn("px-4", "px-8");
    expect(result).toBe("px-8");
  });

  it("handles undefined and null inputs gracefully", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("resolves array inputs", () => {
    expect(cn(["px-4", "py-2"])).toBe("px-4 py-2");
  });
});

// ── getInitials() ───────────────────────────────────

describe("getInitials()", () => {
  it("returns two initials for a two-word name", () => {
    expect(getInitials("Mara Chen")).toBe("MC");
  });

  it("returns two initials for a single-word name", () => {
    expect(getInitials("Mara")).toBe("M");
  });

  it("returns at most 2 characters", () => {
    expect(getInitials("John Michael Smith")).toBe("JM");
  });

  it("uppercases lowercase names", () => {
    expect(getInitials("jake torres")).toBe("JT");
  });
});

// ── formatDate() ────────────────────────────────────

describe("formatDate()", () => {
  it("formats ISO date string to readable format", () => {
    const result = formatDate("2026-02-20");
    expect(result).toMatch(/Feb/);
    expect(result).toMatch(/20/);
    expect(result).toMatch(/2026/);
  });

  it("formats another date correctly", () => {
    const result = formatDate("2026-01-15");
    expect(result).toMatch(/Jan/);
    // Date parsing of "2026-01-15" may show 14 or 15 depending on timezone
    expect(result).toMatch(/1[45]/);
    expect(result).toMatch(/2026/);
  });
});

// ── getBuilder() ────────────────────────────────────

describe("getBuilder()", () => {
  it("returns a builder by username", () => {
    const builder = getBuilder("marachen");
    expect(builder).toBeDefined();
    expect(builder!.name).toBe("Mara Chen");
  });

  it("returns undefined for unknown username", () => {
    expect(getBuilder("nonexistent")).toBeUndefined();
  });

  it("finds builder with correct fields", () => {
    const builder = getBuilder("jaketorres");
    expect(builder).toBeDefined();
    expect(builder!.skills).toContain("React");
    expect(builder!.id).toBe("b2");
  });
});

// ── getProject() ────────────────────────────────────

describe("getProject()", () => {
  it("returns a project by id", () => {
    const project = getProject("p1");
    expect(project).toBeDefined();
    expect(project!.title).toBe("Sentinel");
  });

  it("returns undefined for unknown id", () => {
    expect(getProject("p999")).toBeUndefined();
  });

  it("returns project with correct builder info", () => {
    const project = getProject("p2");
    expect(project).toBeDefined();
    expect(project!.builder.username).toBe("jaketorres");
  });
});

// ── getBuilderProjects() ────────────────────────────

describe("getBuilderProjects()", () => {
  it("returns all projects for a builder", () => {
    const maraProjects = getBuilderProjects("marachen");
    expect(maraProjects.length).toBeGreaterThanOrEqual(3);
    maraProjects.forEach((p) => {
      expect(p.builder.username).toBe("marachen");
    });
  });

  it("returns empty array for unknown builder", () => {
    expect(getBuilderProjects("nobody")).toEqual([]);
  });

  it("returns correct count for a builder with one project", () => {
    const sofiaProjects = getBuilderProjects("sofiarivera");
    expect(sofiaProjects.length).toBe(1);
    expect(sofiaProjects[0].title).toBe("Nomad");
  });
});

// ── getProjectsByCategory() ─────────────────────────

describe("getProjectsByCategory()", () => {
  it("returns all projects when category is 'all'", () => {
    const allProjects = getProjectsByCategory("all");
    expect(allProjects.length).toBe(projects.length);
  });

  it("filters projects by ai-agents category", () => {
    const aiProjects = getProjectsByCategory("ai-agents");
    expect(aiProjects.length).toBeGreaterThan(0);
    aiProjects.forEach((p) => {
      expect(p.category).toBe("ai-agents");
    });
  });

  it("filters projects by tools category", () => {
    const toolsProjects = getProjectsByCategory("tools");
    expect(toolsProjects.length).toBeGreaterThan(0);
    toolsProjects.forEach((p) => {
      expect(p.category).toBe("tools");
    });
  });

  it("filters projects by mobile category", () => {
    const mobileProjects = getProjectsByCategory("mobile");
    expect(mobileProjects.length).toBeGreaterThan(0);
    mobileProjects.forEach((p) => {
      expect(p.category).toBe("mobile");
    });
  });
});

// ── getAntathon() ───────────────────────────────────

describe("getAntathon()", () => {
  it("returns an antathon by id", () => {
    const antathon = getAntathon("h1");
    expect(antathon).toBeDefined();
    expect(antathon!.title).toBe("Build with AI Agents");
  });

  it("returns undefined for unknown id", () => {
    expect(getAntathon("h999")).toBeUndefined();
  });
});

// ── getAntathonProjects() ───────────────────────────

describe("getAntathonProjects()", () => {
  it("returns projects for an antathon", () => {
    const h2Projects = getAntathonProjects("h2");
    expect(h2Projects.length).toBeGreaterThan(0);
    h2Projects.forEach((p) => {
      expect(p.antathonId).toBe("h2");
    });
  });

  it("returns empty for antathon with no projects", () => {
    expect(getAntathonProjects("h999")).toEqual([]);
  });
});

// ── getBuilderAntathons() ───────────────────────────

describe("getBuilderAntathons()", () => {
  it("returns antathons for a builder who participated", () => {
    const maraAntathons = getBuilderAntathons("marachen");
    expect(maraAntathons.length).toBe(2);
    const ids = maraAntathons.map((a) => a.id);
    expect(ids).toContain("h1");
    expect(ids).toContain("h3");
  });

  it("returns empty for builder with no antathons", () => {
    expect(getBuilderAntathons("omarhassan")).toEqual([]);
  });

  it("returns empty for unknown builder", () => {
    expect(getBuilderAntathons("nonexistent")).toEqual([]);
  });
});

// ── Data integrity checks ───────────────────────────

describe("data integrity", () => {
  it("all builders have unique ids", () => {
    const ids = builders.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all projects have unique ids", () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every project references a valid builder", () => {
    projects.forEach((p) => {
      const builder = getBuilder(p.builder.username);
      expect(builder).toBeDefined();
    });
  });
});
