export type DemoHackathon = {
  slug: string;
  title: string;
  theme: string;
  status: "live" | "upcoming" | "closed";
  prize: string;
  durationHours: number;
  participantCount: number;
  briefSlugs: string[];
};

export const demoHackathons: DemoHackathon[] = [
  {
    slug: "agent-cup",
    title: "Agent Cup",
    theme: "Three agent Briefs. Best signed Receipt wins.",
    status: "live",
    prize: "$2,000 + founder intros",
    durationHours: 12,
    participantCount: 84,
    briefSlugs: [
      "streaming-rag-pipeline",
      "multistep-tool-agent-budget",
      "edge-agent-cold-start",
    ],
  },
  {
    slug: "build-night",
    title: "Build Night",
    theme: "A short evening sprint for practical AI product work.",
    status: "upcoming",
    prize: "$1,000 + Antry Pro",
    durationHours: 8,
    participantCount: 41,
    briefSlugs: [
      "transactional-email-engine",
      "typed-extractor-validation",
    ],
  },
  {
    slug: "receipt-speedrun",
    title: "Receipt Speedrun",
    theme: "One focused Brief. Ship fast, verify cleanly.",
    status: "closed",
    prize: "Public leaderboard feature",
    durationHours: 4,
    participantCount: 128,
    briefSlugs: [
      "bug-fix-from-failing-test",
    ],
  },
];

export function getDemoHackathon(slug: string): DemoHackathon | null {
  return demoHackathons.find((hackathon) => hackathon.slug === slug) ?? null;
}
