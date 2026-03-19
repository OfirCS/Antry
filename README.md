# Antry

A community platform where developers showcase what they've **shipped** — not where they've worked.

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

---

**7 North Park Rd, Vaughan, ON L4J 0C9, Canada**
