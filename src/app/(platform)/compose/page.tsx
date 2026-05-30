import type { Metadata } from "next";
import { ComposeClient } from "./ComposeClient";

export const metadata: Metadata = {
  title: "Compose",
  description: "Share what you're building.",
  // Per-user write surface — keep out of the index.
  robots: { index: false, follow: false },
};

export default function ComposePage() {
  return <ComposeClient />;
}
