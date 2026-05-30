"use client";

import { ArrowRight, FileText, Cpu, Trophy } from "lucide-react";

/**
 * Step 1 — Welcome. Three one-sentence bullets explaining Antry,
 * a single "Get started" CTA, no other distractions.
 */
export function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <h1
        className="font-display font-bold tracking-[-0.03em] text-[#0A0A0A] leading-[1.05]"
        style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}
      >
        Welcome to Antry.
      </h1>
      <p className="mt-3 text-[15px] leading-[1.55] text-gray-600">
        Your Receipt is your resume. One Receipt, every job board.
      </p>

      <ul className="mt-7 space-y-3">
        <Bullet
          icon={<FileText className="w-3.5 h-3.5" />}
          text="Pick a Brief — real engineering scoped by a hiring company, not a take-home."
        />
        <Bullet
          icon={<Cpu className="w-3.5 h-3.5" />}
          text="Solve it in your IDE with the Antry MCP. Every step signed at our gateway."
        />
        <Bullet
          icon={<Trophy className="w-3.5 h-3.5" />}
          text="Mint a signed Receipt — shipping replays, not interview replays."
        />
      </ul>

      <button
        type="button"
        onClick={onNext}
        className="mt-8 inline-flex items-center justify-center gap-1.5 rounded-[10px] px-5 h-11 text-[14px] font-bold transition-all hover:-translate-y-0.5"
        style={{ background: "#0A0A0A", color: "#FFFFFF" }}
      >
        Get started <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function Bullet({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="inline-flex items-center justify-center w-6 h-6 rounded-md shrink-0 mt-0.5"
        style={{ background: "rgba(198,241,53,0.18)", color: "#0A0A0A" }}
      >
        {icon}
      </span>
      <p className="text-[14px] leading-[1.55] text-[#0A0A0A]">{text}</p>
    </li>
  );
}
