import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { defaultOpenGraph, defaultTwitter, ogImageUrl, siteUrl } from "@/lib/seo";

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

const faqs: { q: string; a: string }[] = [
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
      <main className="bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
        />
        <section className="bg-white">
          <div className="mx-auto max-w-[760px] px-6 py-20 sm:px-10 sm:py-28">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400">FAQ</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-bold tracking-[-0.03em] text-black">
              Answers, in plain English.
            </h1>
            <p className="mt-3 text-[15px] text-gray-500 max-w-[560px]">
              Got a question we missed? Email{" "}
              <a className="underline" href="mailto:[email protected]">[email protected]</a>{" "}
              — a real person reads it.
            </p>

            <div className="mt-12 divide-y divide-gray-100 border-t border-gray-100">
              {faqs.map((f) => (
                <details key={f.q} className="group py-6">
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                    <h3 className="text-[17px] font-bold tracking-tight text-black pr-4">{f.q}</h3>
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-500 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-gray-600">{f.a}</p>
                </details>
              ))}
            </div>

            <div className="mt-14 rounded-[20px] border border-gray-200 bg-[#FAFAF7] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-bold tracking-tight text-black">Ready to claim your card?</h3>
                <p className="mt-1 text-[14px] text-gray-600">Takes 5 seconds. Paste your GitHub username.</p>
              </div>
              <Link
                href="/claim-card"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 h-[44px] text-[14px] font-semibold whitespace-nowrap"
                style={{ background: "#C6F135", color: "#111" }}
              >
                Try Antry Card
              </Link>
            </div>
          </div>
        </section>
      </main>
      <link rel="canonical" href={`${siteUrl()}/faq`} />
    </>
  );
}
