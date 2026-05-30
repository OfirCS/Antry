/**
 * Static "Companies hiring" rail card. Lists four placeholder companies
 * the way the existing demo data already brands them; each tile is a
 * single line that links to /scout (the agentic company-side surface,
 * which replaced the old /companies index in the focus pass).
 *
 * Server component — pure presentation, no client state.
 */

import Link from "next/link";

type Tile = {
  name: string;
  /** A 1-letter mark color so tiles still read as branded without logos. */
  color: string;
};

const TILES: Tile[] = [
  { name: "Anthropic", color: "#D97757" },
  { name: "Vercel", color: "#0A0A0A" },
  { name: "Supabase", color: "#3ECF8E" },
  { name: "Resend", color: "#1E1E1E" },
];

export function CompaniesRail() {
  return (
    <ul className="space-y-1">
      {TILES.map((t) => (
        <li key={t.name}>
          <Link
            href="/scout"
            className="flex items-center gap-2.5 py-1.5 group"
          >
            <span
              aria-hidden
              className="w-5 h-5 rounded-[5px] shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: t.color }}
            >
              {t.name.charAt(0)}
            </span>
            <span className="text-[12px] font-bold tracking-[-0.005em] text-black truncate group-hover:underline underline-offset-2">
              {t.name}
            </span>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
              Hiring
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
