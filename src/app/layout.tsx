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

const TITLE = "GTA Fix N Clean | Window & Door Repair in the GTA";
const DESCRIPTION =
  "GTA Fix N Clean repairs, installs, seals, adjusts, and cleans windows, doors, screens, locks, weatherstripping, and related property fixes across the Greater Toronto Area.";

function siteJsonLd(base: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${base}/#organization`,
        name: "GTA Fix N Clean",
        url: base,
        logo: `${base}/logo.svg`,
        image: `${base}/gtafixnclean/white-door-after.jpeg`,
        description: DESCRIPTION,
        areaServed: [
          "Toronto",
          "Mississauga",
          "Brampton",
          "Vaughan",
          "Markham",
          "Richmond Hill",
          "North York",
          "Etobicoke",
          "Scarborough",
          "Greater Toronto Area",
        ],
        knowsAbout: [
          "door repair",
          "window repair",
          "door installation",
          "window installation",
          "screen repair",
          "weatherstripping",
          "lock hardware",
          "caulking",
          "property cleaning",
        ],
        makesOffer: {
          "@type": "OfferCatalog",
          name: "Window, door, cleaning, and property repair services",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Door repair and installation" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Window repair and sealing" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Screen, lock, and hardware repair" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Clean finishing and small property fixes" } },
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: "GTA Fix N Clean",
        url: base,
        publisher: { "@id": `${base}/#organization` },
      },
    ],
  };
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: TITLE,
    template: "%s · GTA Fix N Clean",
  },
  description: DESCRIPTION,
  applicationName: "GTA Fix N Clean",
  keywords: [
    "GTA Fix N Clean",
    "GTA window repair",
    "GTA door repair",
    "Toronto window repair",
    "Toronto door repair",
    "door installation GTA",
    "window installation GTA",
    "screen repair GTA",
    "weatherstripping repair",
    "property repair GTA",
  ],
  authors: [{ name: "GTA Fix N Clean" }],
  creator: "GTA Fix N Clean",
  publisher: "GTA Fix N Clean",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "GTA Fix N Clean",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [
      {
        url: "/gtafixnclean/white-door-after.jpeg",
        width: 1536,
        height: 2048,
        alt: "GTA Fix N Clean completed exterior door repair.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/gtafixnclean/white-door-after.jpeg"],
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
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.svg",
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
          id="gtafixnclean-jsonld"
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
