import type { Metadata } from "next";
import { LegalLayout, type LegalSection } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Antry collects, uses, and protects builder data.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "May 2026";

const sections: LegalSection[] = [
  {
    id: "short-version",
    title: "The short version",
    body: (
      <p>
        Antry is a community for builders. We collect the data we need to make profiles work, send the emails
        you asked for, and improve the product. We don&apos;t sell your data. We don&apos;t track you across the web.
        If you have a question, email us — a real person reads it.
      </p>
    ),
  },
  {
    id: "data-we-collect",
    title: "Data we collect",
    body: (
      <ul className="list-disc pl-5 space-y-2.5">
        <li>
          <strong>Account data:</strong> name, email, username, profile bio, avatar, and OAuth identifiers
          (GitHub, Google) when you sign in.
        </li>
        <li>
          <strong>Project data:</strong> projects you submit, demo links, technologies, and any text you publish.
        </li>
        <li>
          <strong>Waitlist data:</strong> the email you give us, plus a timestamp.
        </li>
        <li>
          <strong>Usage data:</strong> anonymized, privacy-first analytics (page views, referrers, country) via
          Plausible — no cookies, no cross-site tracking.
        </li>
        <li>
          <strong>Crash data:</strong> if a page errors, we may collect a stack trace via Sentry to fix it. We
          strip personal data before it leaves your browser.
        </li>
      </ul>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    body: (
      <ul className="list-disc pl-5 space-y-2.5">
        <li>To run your account and show your profile and projects.</li>
        <li>
          To send you transactional emails (welcome, password reset, project events) and product updates you
          opted into.
        </li>
        <li>To match builders with hackathons, opportunities, and Scout queries.</li>
        <li>To debug, improve performance, and fix abuse.</li>
      </ul>
    ),
  },
  {
    id: "who-we-share-with",
    title: "Who we share with",
    body: (
      <>
        <p>
          Service providers we depend on: Supabase (hosting + auth), Resend (transactional email), Plausible
          (analytics), Sentry (error monitoring), and Vercel (hosting). Each of these processes data on our
          behalf under written contracts.
        </p>
        <p>We never sell personal data to advertisers or data brokers.</p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <p>
        You can export, edit, or delete your profile from <code className="px-1 py-0.5 rounded bg-gray-100 text-[13px]">/settings</code>. You can ask us to delete your
        account entirely by emailing{" "}
        <a href="mailto:[email protected]">[email protected]</a>. If you&apos;re in
        the EU, UK, or California you also have the right to data portability, rectification, and to object to
        processing.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        We use one cookie: a Supabase auth session cookie that keeps you signed in. We do not use third-party
        advertising cookies. Plausible analytics is cookie-free.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        Antry is not intended for users under 16. If you believe a minor has signed up, contact us and
        we&apos;ll delete the account.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes",
    body: (
      <p>
        If we make material changes we&apos;ll email people on the waitlist and update the date above.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions: <a href="mailto:[email protected]">[email protected]</a>. Real
        reply, every time.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy Policy"
      intro="The plain-English version of how Antry handles your data. We don't sell, we don't cross-track, and we keep the smallest amount we need to make the product work."
      updated={UPDATED}
      sections={sections}
    />
  );
}
