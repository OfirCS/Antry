import type { Metadata } from "next";
import AgentPageClient from "./AgentPageClient";

export const metadata: Metadata = {
  title: "Scout AI - Antry",
  description:
    "Your AI-powered guide to the builder network. Find talent, explore projects, build teams.",
};

export default function AgentPage() {
  return <AgentPageClient />;
}
