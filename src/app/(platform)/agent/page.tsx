import type { Metadata } from "next";
import AgentPageClient from "./AgentPageClient";

export const metadata: Metadata = {
  title: "Scout - Antry",
  description:
    "Your guide to the builder network. Find talent, explore projects, and build teams.",
};

export default function AgentPage() {
  return <AgentPageClient />;
}
