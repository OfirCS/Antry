import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Sora, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { siteUrl, defaultOpenGraph, defaultTwitter } from "@/lib/seo";
import "./globals.css";

const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const TITLE = "Antry — Show your receipts.";
const DESCRIPTION =
  "Antry is the proof-of-work network for AI builders. Companies post Briefs. Builders solve them in an instrumented Lab. Antry mints a signed Receipt that captures not just what shipped — but how you got there.";

function siteJsonLd(base: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "Antry",
        url: base,
        logo: `${base}/logo.png`,
        description:
          "Antry is the proof-of-work network for AI builders. Receipts show how you got there, not just what you shipped.",
        sameAs: [
          "https://github.com/OfirCS/Antry",
          "https://x.com/antrynetwork",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: "Antry",
        url: base,
        publisher: { "@id": `${base}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${base}/discover?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: TITLE,
    template: "%s · Antry",
  },
  description: DESCRIPTION,
  applicationName: "Antry",
  keywords: [
    "AI builders",
    "developer community",
    "shipped projects",
    "hackathons",
    "proof of work",
    "indie hackers",
    "portfolio",
    "Dribbble for builders",
  ],
  authors: [{ name: "Antry" }],
  creator: "Antry",
  publisher: "Antry",
  alternates: { canonical: "/" },
  openGraph: defaultOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/" }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const plausibleSrc = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js";

  const base = siteUrl().replace(/\/$/, "");

  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Script
          id="antry-org-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteJsonLd(base)),
          }}
        />
        <AuthProvider>{children}</AuthProvider>
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src={plausibleSrc}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
