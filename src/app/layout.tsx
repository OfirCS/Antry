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

const TITLE = "Antry — Where builders ship, not pitch";
const DESCRIPTION =
  "Antry is the proof-of-work network for AI builders. Showcase shipped projects, join hackathons, and get discovered by teams that hire on output — not resumes.";

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

  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full">
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
