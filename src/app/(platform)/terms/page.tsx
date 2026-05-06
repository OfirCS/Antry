import type { Metadata } from "next";
import { LegalLayout, type LegalSection } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The agreement between you and Antry.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "May 2026";

const sections: LegalSection[] = [
  {
    id: "the-deal",
    title: "The deal",
    body: (
      <p>
        Antry is a community for AI builders to showcase shipped projects and find each other. These terms
        describe what we expect from you, and what you can expect from us.
      </p>
    ),
  },
  {
    id: "your-account",
    title: "Your account",
    body: (
      <ul className="list-disc pl-5 space-y-2.5">
        <li>You must be at least 16 years old.</li>
        <li>You&apos;re responsible for everything posted under your account.</li>
        <li>Don&apos;t impersonate other people, brands, or claim authorship of work that isn&apos;t yours.</li>
      </ul>
    ),
  },
  {
    id: "your-content",
    title: "Your content",
    body: (
      <p>
        Projects, profiles, and posts you publish remain yours. By publishing them on Antry you give us a
        worldwide, non-exclusive licence to host, display, and feature them within the product and in
        marketing about Antry (e.g. featured-builder posts, social previews). You can remove content at any
        time and the licence ends with it.
      </p>
    ),
  },
  {
    id: "what-we-dont-allow",
    title: "What we don't allow",
    body: (
      <>
        <ul className="list-disc pl-5 space-y-2.5">
          <li>Spam, scraping, or attempting to extract user data outside the public surface area.</li>
          <li>Content that&apos;s illegal, infringing, hateful, or harassing.</li>
          <li>Misrepresenting projects you didn&apos;t build or didn&apos;t meaningfully contribute to.</li>
          <li>
            Attacks on our infrastructure, including but not limited to abusing the Scout agent or claim flow.
          </li>
        </ul>
        <p>We may remove content or suspend accounts that violate these rules.</p>
      </>
    ),
  },
  {
    id: "scout-agent",
    title: "The Scout agent",
    body: (
      <p>
        Scout is an AI-powered search tool. Results are best-effort and may be incomplete or wrong.
        Don&apos;t use Scout to make hiring or investment decisions without independently verifying what you
        find.
      </p>
    ),
  },
  {
    id: "service-availability",
    title: "Service availability",
    body: (
      <p>
        Antry is provided &quot;as is&quot;. We work hard to keep it up but don&apos;t guarantee uninterrupted
        service. If we have to take it down for maintenance we&apos;ll try to give notice.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Liability",
    body: (
      <p>
        To the fullest extent permitted by law, Antry isn&apos;t liable for indirect, incidental, or
        consequential damages arising from your use of the service. Our total liability for any claim is
        capped at $100 USD or the amount you paid us in the past 12 months, whichever is greater.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes",
    body: (
      <p>
        We may update these terms. If the changes are material we&apos;ll email people with accounts and
        update the date above. Continued use after changes means you accept them.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions: <a href="mailto:[email protected]">[email protected]</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms of Service"
      intro="The agreement between you and Antry. Plain English, no hidden traps. We expect builders to act in good faith, and we promise to do the same."
      updated={UPDATED}
      sections={sections}
    />
  );
}
