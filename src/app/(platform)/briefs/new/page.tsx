import type { Metadata } from "next";
import { BriefAuthorClient } from "./BriefAuthorClient";

export const metadata: Metadata = {
  title: "Author a Brief",
  description: "Describe the problem. Antry drafts the Brief.",
};

export default function NewBriefPage() {
  return <BriefAuthorClient />;
}
