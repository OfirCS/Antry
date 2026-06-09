# Antry

A community platform where developers showcase what they've **shipped** — not where they've worked.

**🔗 Live demo:** https://ofircs.github.io/Antry/ — featuring a **Scout agent** that ranks builders by their proof-of-work, running entirely in your browser (no server, no API key).

---

## Agentic Scout — the centerpiece

[`/scout`](https://ofircs.github.io/Antry/scout/) is an AI talent agent. You describe who you need in plain language ("senior who can ship streaming RAG with strong verification") and it ranks signed **Receipts** — proof-of-work records carrying a 7-dimension capability *Fingerprint* (token economy, verification rigor, tool-choice IQ, …).

- **In production** (`/api/scout`) it ranks with Claude Opus + adaptive thinking, and falls back to a heuristic when no `ANTHROPIC_API_KEY` is set — see [`src/app/api/scout/route.ts`](src/app/api/scout/route.ts).
- **On the static demo** the same ranking runs **client-side**: the query is parsed into capability dimensions + topic intent, scored against each Receipt's real Fingerprint, and an **agent trace** surfaces the reasoning — see [`src/lib/agent/scout-client.ts`](src/lib/agent/scout-client.ts).

The broader agent stack (Brief Author, Auto-post, Scout, MCP grader) lives under [`src/lib/agent`](src/lib/agent) and [`src/lib/mcp`](src/lib/mcp).

---

## The idea

Resumes and LinkedIn profiles reward credentials. Antry rewards builders. If you've shipped something real — an app, a tool, an experiment — this is where it lives.

## Three layers

### Layer 1 — Showcase
Your builder profile. Projects with live demos, source code, tech stack, and build time. Think of it as a portfolio that actually shows what you can do.

### Layer 2 — Community
Hackathons with real prizes and sponsor visibility. Builders compete, collaborate, and get noticed by companies who care about output over pedigree.

### Layer 3 — Launch Studio
A venture studio layer (coming soon). The best projects from the community get resources, mentorship, and funding to become real products.

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **Framer Motion v12**
- **TypeScript**

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Branches

| Branch | Owner | Purpose |
|--------|-------|---------|
| `main` | — | Production base |
| `OS` | Ofir | Dev branch |
| `LH` | Lior | Dev branch |

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── (platform)/           # Main pages (with nav)
│   │   ├── discover/         # Project & builder feed
│   │   ├── projects/[id]/    # Project detail
│   │   ├── builders/[username]/ # Builder profile
│   │   └── hackathons/       # Hackathon listing & detail
│   └── (auth)/               # Login & signup
├── components/               # Shared UI components
└── lib/                      # Utils & mock data
```

## Deployment

Two targets, one codebase:

| Target | Build | What ships |
|--------|-------|------------|
| **Vercel** | `next build` | The full app — every server feature, auth, API routes, MCP gateway. |
| **GitHub Pages** | `STATIC_EXPORT=1 next build` | A static export of the public showcase. The Scout agent runs client-side. |

The Pages build is automated by [`.github/workflows/pages.yml`](.github/workflows/pages.yml): it runs [`scripts/prepare-static.mjs`](scripts/prepare-static.mjs) to strip server-only routes, exports to `out/`, and publishes. **No secrets are ever bundled** — the static build has no server environment. To publish, set **Settings → Pages → Source → GitHub Actions** once.

Build the static showcase locally:

```bash
node scripts/prepare-static.mjs   # destructive — run on a throwaway checkout
STATIC_EXPORT=1 npx next build    # → ./out
git checkout -- . && git clean -fd src   # restore the full app
```

---

**7 North Park Rd, Vaughan, ON L4J 0C9, Canada**
