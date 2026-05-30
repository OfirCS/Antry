import type { Metadata } from "next";
import { defaultOpenGraph, defaultTwitter, ogImageUrl } from "@/lib/seo";
import { ScoutClient } from "./ScoutClient";

const TITLE = "Scout — find builders by Receipt";
const DESCRIPTION =
  "Describe who you need. Antry ranks Receipt-holders with rationale. Hire on output, not résumé.";

export const metadata: Metadata = {
  title: "Scout",
  description: DESCRIPTION,
  alternates: { canonical: "/scout" },
  openGraph: defaultOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/scout",
    image: ogImageUrl({
      title: "Scout.",
      subtitle: "Find builders by Receipt, not résumé.",
      eyebrow: "ANTRY · SCOUT",
    }),
  }),
  twitter: defaultTwitter({ title: TITLE, description: DESCRIPTION }),
};

export default function ScoutPage() {
  return <ScoutClient />;
}
