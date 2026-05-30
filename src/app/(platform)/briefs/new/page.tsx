import type { Metadata } from "next";
import { BriefAuthorClient } from "./BriefAuthorClient";

export const metadata: Metadata = {
  title: "Author a Brief",
  description: "Describe the problem. Antry drafts the Brief.",
  // Per-user write surface — keep out of the index.
  robots: { index: false, follow: false },
};

export default function NewBriefPage() {
  return <BriefAuthorClient />;
}
