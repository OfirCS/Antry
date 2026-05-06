import type { Metadata } from "next";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Antry collects, uses, and protects builder data.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "May 2026";

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="bg-white">
        <div className="mx-auto max-w-[760px] px-6 py-20 sm:px-10 sm:py-28">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400">Legal</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.03em] text-black font-display">
            Privacy Policy
          </h1>
          <p className="mt-3 text-[14px] text-gray-500">Last updated: {UPDATED}</p>

          <div className="prose prose-neutral mt-12 max-w-none text-[15px] leading-relaxed text-gray-700 space-y-6">
            <Section title="The short version">
              <p>
                Antry is a community for builders. We collect the data we need to make profiles work,
                send the emails you asked for, and improve the product. We don&apos;t sell your data.
                We don&apos;t track you across the web. If you have a question, email us — a real person reads it.
              </p>
            </Section>

            <Section title="Data we collect">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Account data:</strong> name, email, username, profile bio, avatar, and OAuth identifiers (GitHub, Google) when you sign in.</li>
                <li><strong>Project data:</strong> projects you submit, demo links, technologies, and any text you publish.</li>
                <li><strong>Waitlist data:</strong> the email you give us, plus a timestamp.</li>
                <li><strong>Usage data:</strong> anonymized, privacy-first analytics (page views, referrers, country) via Plausible — no cookies, no cross-site tracking.</li>
                <li><strong>Crash data:</strong> if a page errors, we may collect a stack trace via Sentry to fix it. We strip personal data before it leaves your browser.</li>
              </ul>
            </Section>

            <Section title="How we use it">
              <ul className="list-disc pl-5 space-y-2">
                <li>To run your account and show your profile and projects.</li>
                <li>To send you transactional emails (welcome, password reset, project events) and product updates you opted into.</li>
                <li>To match builders with hackathons, opportunities, and Scout queries.</li>
                <li>To debug, improve performance, and fix abuse.</li>
              </ul>
            </Section>

            <Section title="Who we share with">
              <p>
                Service providers we depend on: Supabase (hosting + auth), Resend (transactional email),
                Plausible (analytics), Sentry (error monitoring), and Vercel (hosting). Each of these
                processes data on our behalf under written contracts.
              </p>
              <p>We never sell personal data to advertisers or data brokers.</p>
            </Section>

            <Section title="Your rights">
              <p>
                You can export, edit, or delete your profile from <code>/settings</code>. You can ask us to
                delete your account entirely by emailing <a className="underline" href="mailto:[email protected]">[email protected]</a>.
                If you&apos;re in the EU, UK, or California you also have the right to data portability,
                rectification, and to object to processing.
              </p>
            </Section>

            <Section title="Cookies">
              <p>
                We use one cookie: a Supabase auth session cookie that keeps you signed in. We do not use
                third-party advertising cookies. Plausible analytics is cookie-free.
              </p>
            </Section>

            <Section title="Children">
              <p>Antry is not intended for users under 16. If you believe a minor has signed up, contact us and we&apos;ll delete the account.</p>
            </Section>

            <Section title="Changes">
              <p>If we make material changes we&apos;ll email people on the waitlist and update the date above.</p>
            </Section>

            <Section title="Contact">
              <p>
                Questions: <a className="underline" href="mailto:[email protected]">[email protected]</a>.
                Real reply, every time.
              </p>
            </Section>
          </div>
        </div>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[20px] font-bold text-black tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
