import type { Metadata } from "next";
import { ScoutClient } from "./ScoutClient";

export const metadata: Metadata = {
  title: "Scout",
  description:
    "Describe who you need. Antry ranks Receipt-holders with rationale.",
};

export default function ScoutPage() {
  return <ScoutClient />;
}
