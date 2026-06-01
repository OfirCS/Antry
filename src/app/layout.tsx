import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Sora, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { siteUrl } from "@/lib/seo";
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

const TITLE = "Antry | Proof-of-work network for AI builders";
const DESCRIPTION =
  "Antry turns AI build sessions into signed Receipts, so builders can prove how they think and companies can hire from verified work.";

function siteJsonLd(base: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "Antry",
        url: base,
        logo: `${base}/antry-logo-mark.png`,
        description: DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: "Antry",
        url: base,
        publisher: { "@id": `${base}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${base}/#app`,
        name: "Antry",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
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
    template: "%s - Antry",
  },
  description: DESCRIPTION,
  applicationName: "Antry",
  keywords: [
    "Antry",
    "AI builders",
    "proof of work",
    "builder receipts",
    "AI hackathons",
    "developer hiring",
    "technical assessment",
    "verifiable work",
  ],
  authors: [{ name: "Antry" }],
  creator: "Antry",
  publisher: "Antry",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Antry",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [
      {
        url: "/antry-logo-mark.png",
        width: 1254,
        height: 1254,
        alt: "Antry logo.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/antry-logo-mark.png"],
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
      { url: "/antry-logo-mark.png", type: "image/png" },
    ],
    apple: "/antry-logo-mark.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#070806",
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
