import type { Metadata } from "next";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The agreement between you and Antry.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "May 2026";

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="bg-white">
        <div className="mx-auto max-w-[760px] px-6 py-20 sm:px-10 sm:py-28">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400">Legal</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.03em] text-black font-display">
            Terms of Service
          </h1>
          <p className="mt-3 text-[14px] text-gray-500">Last updated: {UPDATED}</p>

          <div className="prose prose-neutral mt-12 max-w-none text-[15px] leading-relaxed text-gray-700 space-y-6">
            <Section title="The deal">
              <p>
                Antry is a community for AI builders to showcase shipped projects and find each other.
                These terms describe what we expect from you, and what you can expect from us.
              </p>
            </Section>

            <Section title="Your account">
              <ul className="list-disc pl-5 space-y-2">
                <li>You must be at least 16 years old.</li>
                <li>You&apos;re responsible for everything posted under your account.</li>
                <li>Don&apos;t impersonate other people, brands, or claim authorship of work that isn&apos;t yours.</li>
              </ul>
            </Section>

            <Section title="Your content">
              <p>
                Projects, profiles, and posts you publish remain yours. By publishing them on Antry you give
                us a worldwide, non-exclusive licence to host, display, and feature them within the product
                and in marketing about Antry (e.g. featured-builder posts, social previews). You can remove
                content at any time and the licence ends with it.
              </p>
            </Section>

            <Section title="What we don&apos;t allow">
              <ul className="list-disc pl-5 space-y-2">
                <li>Spam, scraping, or attempting to extract user data outside the public surface area.</li>
                <li>Content that&apos;s illegal, infringing, hateful, or harassing.</li>
                <li>Misrepresenting projects you didn&apos;t build or didn&apos;t meaningfully contribute to.</li>
                <li>Attacks on our infrastructure, including but not limited to abusing the Scout agent or claim flow.</li>
              </ul>
              <p>We may remove content or suspend accounts that violate these rules.</p>
            </Section>

            <Section title="The Scout agent">
              <p>
                Scout is an AI-powered search tool. Results are best-effort and may be incomplete or wrong.
                Don&apos;t use Scout to make hiring or investment decisions without independently verifying
                what you find.
              </p>
            </Section>

            <Section title="Service availability">
              <p>
                Antry is provided &quot;as is&quot;. We work hard to keep it up but don&apos;t guarantee uninterrupted
                service. If we have to take it down for maintenance we&apos;ll try to give notice.
              </p>
            </Section>

            <Section title="Liability">
              <p>
                To the fullest extent permitted by law, Antry isn&apos;t liable for indirect, incidental, or
                consequential damages arising from your use of the service. Our total liability for any
                claim is capped at $100 USD or the amount you paid us in the past 12 months, whichever is
                greater.
              </p>
            </Section>

            <Section title="Changes">
              <p>
                We may update these terms. If the changes are material we&apos;ll email people with accounts
                and update the date above. Continued use after changes means you accept them.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                Questions: <a className="underline" href="mailto:[email protected]">[email protected]</a>.
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
