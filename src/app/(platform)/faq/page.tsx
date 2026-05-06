import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl, siteUrl } from "@/lib/seo";
import { FaqClient, type FaqItem } from "./FaqClient";

const TITLE = "FAQ — answers about Antry";
const DESCRIPTION = "How Antry works, who it's for, what's free, and what's coming next.";

export const metadata: Metadata = {
  title: "FAQ",
  description: DESCRIPTION,
  alternates: { canonical: "/faq" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/faq",
    image: ogImageUrl({ title: "FAQ", subtitle: "Everything about Antry, in plain English.", eyebrow: "FAQ" }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

const faqs: FaqItem[] = [
  {
    q: "What is Antry?",
    a: "Antry is a community for AI builders. Instead of resumes or LinkedIn profiles, your identity on Antry is a set of shipped projects with live demos, real tech stacks, and verifiable build histories. Recruiters and teams find you through the Scout agent — natural-language search across the network.",
  },
  {
    q: "Who is it for?",
    a: "Solo founders, indie hackers, weekend builders, students, and full-time engineers who actually ship. If you have side projects with demo links, Antry is built for you. If you only have a resume and a LinkedIn, this isn't the right network yet.",
  },
  {
    q: "Is it free?",
    a: "Yes — completely free for builders, forever. Recruiters and teams pay to use Scout for hiring. We deliberately structured it this way so builders are never the product.",
  },
  {
    q: "How does the Antry Card work?",
    a: "Paste a GitHub username on /claim-card. We pull public repos, score them on shipping signals (live demo, README depth, commit cadence, language signals, stars), and draft a builder profile in seconds. If it's your profile, you can claim it in one click — we import the top 6 projects under your account.",
  },
  {
    q: "Can I edit what gets imported?",
    a: "Yes. After claiming, every project is editable, hideable, or deletable. The auto-import is a starting point, not a contract.",
  },
  {
    q: "What is an Antathon?",
    a: "A 48-hour focused build event run inside Antry. You ship something real against a theme, submit it to your profile, and the best work gets featured. Antathons are designed to produce real proof of work — not weekend graveyard repos.",
  },
  {
    q: "How is this different from GitHub or Devpost?",
    a: "GitHub is for code; Antry is for the experience of using what the code creates. Devpost is hackathon-only; Antry is your continuous build log plus hackathons plus discovery for hiring. Most importantly: Scout (our AI agent) lets recruiters search by output, not by keywords stuffed in profiles.",
  },
  {
    q: "Who built Antry?",
    a: "A solo founder (Ofir) building in public. Stack: Next.js 16, Supabase, Tailwind, custom Scout agent. Codebase is small enough to ship fast, mature enough to take seriously.",
  },
  {
    q: "What's coming next?",
    a: "The roadmap: Recruiter beta (Scout for hiring) opens Q3. Antathon series runs monthly. Layer 3 (Launch Studio for top builders) is in early planning. We ship every week — see /changelog.",
  },
  {
    q: "How do I get on the platform now?",
    a: "Three ways: (1) join the waitlist and we'll email you when claims open, (2) try /claim-card with your GitHub username, or (3) DM the founder on X. Personal outreach is fastest.",
  },
];

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export default function FaqPage() {
  return (
    <>
      <Nav />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
        />

        <section className="bg-white">
          <div className="mx-auto max-w-[760px] px-6 pt-20 sm:pt-28 pb-6 sm:px-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">FAQ</p>
            <h1 className="mt-3 font-display text-[clamp(2.2rem,4.8vw,3.2rem)] font-bold tracking-[-0.035em] text-black leading-[1.05]">
              Answers, in plain English.
            </h1>
            <p className="mt-4 text-[15px] text-gray-600 max-w-[560px] leading-relaxed">
              Got a question we missed? Email{" "}
              <a className="text-black font-semibold underline underline-offset-4" href="mailto:[email protected]">[email protected]</a>{" "}
              — a real person reads it.
            </p>
          </div>
        </section>

        <section className="bg-white pb-24">
          <div className="mx-auto max-w-[760px] px-6 sm:px-10">
            <FaqClient faqs={faqs} />
          </div>
        </section>
      </main>
      <link rel="canonical" href={`${siteUrl()}/faq`} />
    </>
  );
}
