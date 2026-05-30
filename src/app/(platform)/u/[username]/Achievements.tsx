// Achievement badges computed from the builder's Receipts. Up to three
// small chips above the tabs. Skipped entirely when nothing qualifies —
// no decorative filler. Predicates favor signals a hiring reviewer
// cares about: top-quartile composite, sub-30min throughput, mature
// recovery, verification rigor.

import { Trophy, Zap, Award, Sparkles, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Receipt } from "@/lib/receipts/types";

type Badge = { key: string; label: string; Icon: LucideIcon };

function computeBadges(receipts: Receipt[]): Badge[] {
  if (receipts.length === 0) return [];
  const badges: Badge[] = [];

  const anyTopQuartile = receipts.some((r) => r.composite_score >= 85);
  if (anyTopQuartile) {
    badges.push({ key: "top", label: "Top Quartile", Icon: Trophy });
  }

  const anySpeedrun = receipts.some(
    (r) => r.attempt_duration_seconds > 0 && r.attempt_duration_seconds < 1800
  );
  if (anySpeedrun) {
    badges.push({ key: "speed", label: "Speedrunner", Icon: Zap });
  }

  // First Win — at least one composite ≥ 80 — credits the leaderboard
  // top, mirrors the "hack-win" feed kind threshold used elsewhere.
  const hasWin = receipts.some((r) => r.composite_score >= 80);
  if (hasWin && !anyTopQuartile) {
    badges.push({ key: "first-win", label: "First Win", Icon: Award });
  }

  const anyRigor = receipts.some((r) => r.fingerprint.verificationRigor >= 90);
  if (anyRigor && badges.length < 3) {
    badges.push({ key: "rigor", label: "Rigor 90+", Icon: Target });
  }

  if (receipts.length >= 3 && badges.length < 3) {
    badges.push({ key: "prolific", label: "3+ Receipts", Icon: Sparkles });
  }

  return badges.slice(0, 3);
}

export function Achievements({ receipts }: { receipts: Receipt[] }) {
  const badges = computeBadges(receipts);
  if (badges.length === 0) return null;

  return (
    <section className="mt-5" aria-label="Achievements">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">
        Achievements
      </p>
      <div className="flex flex-wrap gap-1.5">
        {badges.map(({ key, label, Icon }) => (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full pl-2 pr-2.5 py-1 text-[11px] font-bold"
            style={{
              background: "#0A0A0A",
              color: "#FFFFFF",
            }}
          >
            <Icon className="w-3 h-3" />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
