import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Sora, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { siteUrl, ogImageUrl } from "@/lib/seo";
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
  "Antry is the work portfolio for AI engineers. Solve company-authored Briefs, mint gateway-signed Receipts, and prove how you think — not just where you've worked.";
const OG_IMAGE = ogImageUrl({
  title: "Show your receipts.",
  subtitle: "The work portfolio for AI engineers.",
  eyebrow: "Antry",
});

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
        description: DESCRIPTION,
        sameAs: [],
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: "Antry",
        url: base,
        description: DESCRIPTION,
        publisher: { "@id": `${base}/#organization` },
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
    "Antry",
    "AI engineer portfolio",
    "vibe coders",
    "developer showcase",
    "hackathons",
    "AI engineering Briefs",
    "Receipts",
    "ship your work",
    "builder community",
    "proof of work",
  ],
  authors: [{ name: "Antry" }],
  creator: "Antry",
  publisher: "Antry",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Antry",
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Antry — show your receipts.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#171614",
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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Script
          id="antry-jsonld"
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
