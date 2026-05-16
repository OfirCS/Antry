export type StaticPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
};

export const staticPosts: StaticPost[] = [
  {
    slug: "proof-of-work-hiring",
    title: "Why proof of work beats resume screening",
    excerpt:
      "A practical look at how shipped work, scoped challenges, and review trails help teams identify builders faster.",
    date: "2026-03-18",
    readTime: "4 min",
    category: "Hiring",
    author: "Antry Team",
  },
  {
    slug: "running-better-briefs",
    title: "How to write a Brief builders actually want to solve",
    excerpt:
      "The best Briefs are narrow, useful, and easy to judge. Here is the operating model we use at Antry.",
    date: "2026-03-11",
    readTime: "5 min",
    category: "Briefs",
    author: "Antry Team",
  },
];

export const postContent: Record<string, string> = {
  "proof-of-work-hiring": `
    <p>Most hiring funnels still ask teams to infer ability from proxies: school, company logos, keyword density, and interview performance. Those signals can help, but they are incomplete when the job depends on taste, speed, and execution.</p>
    <h2>Start with shipped work</h2>
    <p>A real project shows decisions under constraint. Reviewers can see the interface, inspect the stack, and understand how the builder thinks about scope.</p>
    <h2>Use the same criteria for everyone</h2>
    <p>Structured Briefs make comparison easier. Instead of asking every candidate to explain a different project, teams can review submissions against the same problem and rubric.</p>
    <h2>Keep the review trail</h2>
    <p>Receipts help teams preserve context: what was submitted, how it was evaluated, and why a builder belongs on the shortlist.</p>
  `,
  "running-better-briefs": `
    <p>A good Brief feels like a real product assignment, not a vague prompt. Builders should know what to make, what matters, and how their work will be reviewed.</p>
    <h2>Keep the scope narrow</h2>
    <p>The best Briefs can be completed in a focused sprint. Narrow scope produces better submissions and makes review more consistent.</p>
    <h2>Name the tradeoffs</h2>
    <p>Tell builders what you care about: UX quality, implementation detail, reliability, creativity, or speed. Clear criteria reduce guesswork.</p>
    <h2>Reward clarity</h2>
    <p>Ask for a short demo, a source link when possible, and a written note on important decisions. That context makes strong work easier to recognize.</p>
  `,
};
