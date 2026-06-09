// Prepare the working tree for a static (GitHub Pages) export.
//
// Next.js `output: 'export'` is all-or-nothing: a single route that needs
// a server (route handlers, server actions, cookies, the Next 16 proxy)
// fails the whole build. The Antry showcase surface — landing, Scout,
// Receipts, Leaderboard, Builders, Briefs, Hackathons, MCP/agents — is
// fully static-renderable. The account/admin surface is not.
//
// This script removes the server-only routes so the export builds clean.
// It is destructive by design and is meant to run on a throwaway CI
// checkout (the Pages workflow) — never commit its result. Locally,
// restore with `git checkout -- . && git clean -fd src`.
//
// The full app (every route) is preserved on the branch for the Vercel
// deploy, which keeps all server features.

import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

// Server-only routes + the Next 16 proxy. Paths are relative to repo root.
const REMOVE = [
  "src/proxy.ts", // Next 16 middleware equivalent — unsupported in export
  "src/app/api", // route handlers (Request/cookies)
  "src/app/auth", // OAuth callback route handler
  "src/app/(auth)", // login / signup / reset + server actions
  "src/app/(platform)/settings", // reads session via cookies
  "src/app/(platform)/dashboard", // reads session via cookies
  "src/app/(platform)/admin", // server actions + cookies
  "src/app/(platform)/claim-card", // server actions
  "src/app/(platform)/claim", // token claim (dynamic, server)
  "src/app/(platform)/actions.ts", // shared server actions
  "src/app/(platform)/receipts/[id]/verify", // fetches the verify API server-side
  "src/app/(platform)/scout/compare", // resolves ?ids server-side + redirect()
];

let removed = 0;
for (const rel of REMOVE) {
  const abs = join(root, rel);
  if (existsSync(abs)) {
    rmSync(abs, { recursive: true, force: true });
    console.log(`  removed  ${rel}`);
    removed += 1;
  } else {
    console.log(`  skip     ${rel} (not found)`);
  }
}

console.log(`\nprepare-static: removed ${removed} server-only path(s).`);
