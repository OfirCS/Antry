import type { Metadata } from "next";

const FALLBACK_URL = "https://antry.com";

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    FALLBACK_URL
  );
}

export function absoluteUrl(path = "/"): string {
  const base = siteUrl().replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type OgInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
};

export function ogImageUrl(params: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  variant?: "default" | "project" | "builder" | "blog" | "hackathon";
}): string {
  const search = new URLSearchParams();
  search.set("title", params.title.slice(0, 100));
  if (params.subtitle) search.set("subtitle", params.subtitle.slice(0, 140));
  if (params.eyebrow) search.set("eyebrow", params.eyebrow.slice(0, 32));
  if (params.variant) search.set("variant", params.variant);
  return absoluteUrl(`/api/og?${search.toString()}`);
}

export function defaultOpenGraph(input: OgInput): Metadata["openGraph"] {
  return {
    type: "website",
    siteName: "Antry",
    locale: "en_US",
    url: absoluteUrl(input.path ?? "/"),
    title: input.title,
    description: input.description,
    images: [
      {
        url: input.image ?? ogImageUrl({ title: input.title, subtitle: input.description }),
        width: 1200,
        height: 630,
        alt: input.title,
      },
    ],
  };
}

export function defaultTwitter(input: {
  title: string;
  description: string;
  image?: string;
}): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title: input.title,
    description: input.description,
    images: [input.image ?? ogImageUrl({ title: input.title, subtitle: input.description })],
  };
}
