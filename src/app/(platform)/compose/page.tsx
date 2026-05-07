import type { Metadata } from "next";
import { ComposeClient } from "./ComposeClient";

export const metadata: Metadata = {
  title: "Compose",
  description: "Share what you're building.",
};

export default function ComposePage() {
  return <ComposeClient />;
}
