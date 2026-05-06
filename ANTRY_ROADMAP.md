# Antry: 6-Week Plan to a Serious, Marketable Product

> Research deliverable: how to evolve Antry from a polished pre-launch site into a serious product, and how to market it naturally. Generated 2026-05-06.

## Context

Antry is a pre-launch "Dribbble for builders" community (Next.js 16 + Supabase, ~1,900 LOC tested, 247 waitlist signups, polished UI). The core thesis — *"Don't tell us what you've done. Show us what you built."* — is sharp, and the codebase already contains the seeds of a real differentiator: a `discovery/` library (github-scanner, twitter-parser, scorer, importer) that can auto-populate builder profiles from public signals. That existing plumbing is the secret weapon.

The gap between "polished pre-launch site" and "serious product" is **not** more features. It's three things:

1. **Inbound infrastructure** — every shared link converts ~0% today: no OG cards, no analytics, no email follow-up.
2. **A killer hook** the launch story can hang on — the "Antry Card" auto-import.
3. **Real seeded content + trust signals** so `/discover` doesn't look empty on day one.

Plan parameters:
- **Timeline:** aggressive — public launch in ~6 weeks (Show HN + Product Hunt + X).
- **Founder voice:** light — name + occasional posts, but no Loom/video/founder photo. Marketing leans on featured-builder content and product-led demos.
- **Emphasis:** balanced across foundation, hero feature, and seeded community.

**Marketing principle:** the product *is* the marketing. Every external post must link to a live, clickable build by a real builder, not to a static landing page.

---

## Week-by-Week Roadmap

### Week 1 — Foundation (stop bleeding inbound)

Highest leverage; nothing else compounds without these.

1. **Open Graph + Twitter cards + dynamic OG images.** Today `src/app/layout.tsx:18-22` exports only `title` + `description`. Replace with a full `metadata` object (`openGraph`, `twitter`, `metadataBase`, `alternates.canonical`). Add a generative OG route at `src/app/api/og/route.tsx` using Next 16's `ImageResponse` (lime `#C6F135` + cream, Sora typography from `globals.css`). Add `generateMetadata` to:
   - `src/app/(platform)/projects/[id]/page.tsx`
   - `src/app/(platform)/builders/[username]/page.tsx`
   - `src/app/(platform)/blog/[slug]/page.tsx` (source: `src/app/(platform)/blog/posts.ts`)
   - `src/app/(platform)/hackathons/[id]/page.tsx`
   
   *Why first:* every link a builder shares becomes a recruiting tool for Antry. Bare URLs convert ~0%; branded cards convert in double digits.

2. **`robots.ts` + `sitemap.ts` (Next 16 file conventions).** `src/app/robots.ts` and `src/app/sitemap.ts`, sitemap hydrating from Supabase (public profiles + projects + blog slugs from `posts.ts`). Without these, `/blog` essays — which are good — are invisible to Google.

3. **Plausible analytics + Sentry.** Plausible (not GA — privacy-first, no cookie banner needed, fits the indie ethos, $9/mo). Script tag in `src/app/layout.tsx`. Track exactly 4 events: `waitlist_join`, `project_view`, `agent_query`, `signup`. Add `@sentry/nextjs` — solo founders cannot debug from screenshots.

4. **Resend + welcome email.** `joinWaitlist` in `src/app/(platform)/actions.ts:294-317` writes to Supabase but never emails. Wrap it: after `insert` succeeds, send a Resend email from `[email protected]` with (a) thanks, (b) a 1-click reply prompt ("what are you building?" — pre-segments your list), (c) a link to one live project on `/discover`. Use `react-email` for templates (TS-native, fits stack).

5. **Privacy + Terms + `/reset-password`.** Boilerplate is fine; these unblock OAuth providers, GDPR for EU waitlist signups, and Product Hunt approval. Mirror the `(auth)` group: `src/app/(auth)/reset-password/page.tsx` reusing the form patterns from `src/app/(auth)/signup/page.tsx`.

6. **Mobile QA on landing + waitlist.** `src/app/page.tsx` and `src/components/WaitlistForm.tsx` have hard-coded widths. Audit on a real iPhone — every share will be on mobile and a broken hero burns the share.

7. **`vercel.json` with security headers** (CSP, X-Frame-Options, Referrer-Policy) + explicit `regions`. Required for any reporter or recruiter to vet you.

### Week 2 — Hero Feature: "Antry Card" auto-import

This is the launch story. Paste a GitHub username → in 5 seconds a draft builder profile appears with shipped projects, tech stack, and a one-sentence Scout summary. One-click claim. This is the differentiator that gets quote-tweeted.

- New route: `src/app/(platform)/claim-card/page.tsx` (extend the existing `claim/[token]` plumbing).
- Server action wires `src/lib/discovery/github-scanner.ts` + `scorer.ts` + `importer.ts` to a single endpoint that:
  - Pulls pinned repos, recent commits, README hero images via GitHub REST (single PAT, server-side).
  - Scores projects with the existing `scorer.ts`.
  - Generates a one-liner summary using the existing Scout NLU at `src/lib/agent/engine.ts`.
  - Writes a `pending_profile` row keyed by GitHub username.
- The `(platform)/agent/` UI pattern is the closest UX reference for the live preview.
- Add a 30-second screen-record of this flow to `/` (replaces "video on /about" since you don't want founder video — this product demo is the substitute).

### Week 3 — Seeded content + trust signals

A platform with empty `/discover` is a dead platform. Don't launch publicly until `/discover` has 50+ real projects.

1. **Manually seed 50 real builders.** Pick people in your existing X network who actually ship (AI-native is best — fits the audience). Run the importer against each, then DM each individually with a link to claim. Conversion >50% with personal outreach vs. <2% cold.
2. **Refresh `src/components/Testimonials.tsx`.** Today it's placeholder. Collect 4-6 real quotes during the seeding outreach — every claim conversation is a chance to grab a testimonial.
3. **Logo/avatar wall on landing page.** Pull avatars from real `profiles` rows under the hero in `src/app/page.tsx`.
4. **`/pricing` page** even though it's free. Two-card layout: "Builder (Free, forever)" + "Recruiter (waitlist — Q3)". Communicates seriousness and roadmap. Mirror `src/components/LayerCards.tsx` for visual consistency.
5. **`/faq` page** to pre-empt 80% of inbound DMs.
6. **`/press` page** — single page with logo SVGs from `public/`, the "Why I'm building Antry" essay re-cut as a press-style piece, three pull quotes from seeded testimonials. No founder photo (per your preference) — replace with the brand mark + screenshots of the product. Required for any reporter to cover you.
7. **`/changelog`** driven from `posts.ts` filtered by `category: "Changelog"`. Signals you ship every week without requiring a separate CMS.

### Week 4 — Distribution mechanics + Antathon #001

1. **Project share button + X intent links.** On `src/app/(platform)/projects/[id]/page.tsx` add a "Share" button generating `/api/og` card + pre-filled X intent: `Just shipped {tagline} on @antry → {url}`. Builders sharing their own work is your distribution flywheel. The sparkle animation in `src/components/WaitlistForm.tsx:21-37` is the right primitive for the "shared!" toast.
2. **Invite codes (referral mechanic).** Each claimed profile gets 5 invites; invited builders skip the waitlist. Add an "Invite" panel in `src/app/(platform)/dashboard/page.tsx`. The `profiles` table already has an `invite_code` column.
3. **Antathon #001 — "Ship in 48"** themed *"AI agents that do something useful for solo founders."* Use `src/app/(platform)/hackathons/`. Prizes: top-of-discover feature for a month + recruiter intros + sponsor swag. Partner with ONE tool company (Vercel, Resend, Clerk, or Supabase — all your stack neighbors) for co-promotion.
4. **Onboarding checklist on `/dashboard`.** First-time builder with no projects sees: claim profile → import a GitHub repo → join Antathon. Reuse `src/components/HowItWorks.tsx` patterns. No tour libraries needed.
5. **Soft-launch to existing 247 waitlist** at end of week — they get first dibs on @username slugs (honest scarcity since slugs really are scarce). Send via Resend.

### Week 5 — Public launch sequence

Order matters. Do not invert.

- **T-3 days:** quiet teaser to your build-in-public X audience. Post a 40-second screen-record of the Antry Card demo. Don't link to Antry — link to your own claimed profile. Let curiosity drive DMs.
- **Day 0, Tuesday 8am PT — Show HN.** Title: *"Show HN: Antry — paste a GitHub username, get a builder profile in 5 seconds."* Lead with the demo, not the company narrative. HN cares about the hack.
- **Day 0, simultaneous — X thread (8 tweets).** Tweet 1 = the demo video. Tweets 2-7 = real builder cards generated live. Tweet 8 = "claim yours."
- **Day +2 (next Tuesday) — Product Hunt.** Different audience, less technical. Lead with design + community angle. Reply to every comment within 4 hours.
- **Skip Reddit r/SideProject** until you hit 1,000 users — high effort, low conversion at this stage.

### Week 6 — Sustain + content engine

The "Build Log" content engine — light founder voice, builder-led:

- **Mondays:** "Shipped this week on Antry" (auto-generated from changelog + manual highlights). Short, ≤400 words.
- **Thursdays:** "This week on Antry: how @xyz shipped X" — featured builder. This is your top growth loop. Featured builders share to their network → their network discovers Antry → claims profiles. Aligns with your light-touch founder preference.
- **Cross-pollinate, don't broadcast:** 2 hours/week leaving substantive comments on builders you'd want on Antry, then DM with personalized claim links. >50% conversion vs. <2% cold.

---

## Critical Files to Modify

- `src/app/layout.tsx` — root metadata, Plausible/Sentry, OG defaults
- `src/app/api/og/route.tsx` — NEW, generative OG image endpoint
- `src/app/robots.ts`, `src/app/sitemap.ts` — NEW, Next 16 file conventions
- `src/app/(platform)/actions.ts:294-317` (`joinWaitlist`) — Resend integration
- `src/app/(platform)/claim-card/page.tsx` — NEW, hero feature route
- `src/app/(platform)/projects/[id]/page.tsx` — `generateMetadata` + share button
- `src/app/(platform)/builders/[username]/page.tsx` — `generateMetadata`
- `src/app/(platform)/blog/[slug]/page.tsx` — `generateMetadata`
- `src/app/(platform)/dashboard/page.tsx` — onboarding checklist + invite panel
- `src/app/(auth)/reset-password/page.tsx` — NEW
- `src/app/(platform)/pricing/page.tsx`, `/faq/page.tsx`, `/press/page.tsx`, `/changelog/page.tsx` — NEW
- `src/components/Testimonials.tsx` — replace placeholders with real quotes
- `src/app/page.tsx` + `src/components/WaitlistForm.tsx` — mobile audit, logo wall
- `vercel.json` — NEW, security headers + regions

## Reusable Code/Utilities Already in the Codebase

- `src/lib/discovery/{github-scanner,twitter-parser,scorer,importer}.ts` — backbone of the hero feature; NO new scraping code needed
- `src/lib/agent/engine.ts` — Scout NLU; powers the one-line builder summary
- `src/lib/supabase/` — auth-context, server/client, queries — already SSR-correct
- `src/components/WaitlistForm.tsx:21-37` — sparkle/toast primitive, reuse for "shared!" feedback
- `src/components/{LayerCards,HowItWorks,SocialProofBar}.tsx` — design primitives for new pages
- `src/app/(platform)/blog/posts.ts` — content source-of-truth for sitemap, changelog, RSS

## Recommended Tooling (opinionated, minimal)

| Need | Pick | Why |
|---|---|---|
| Email | Resend + react-email | TS-native, fits stack, generous free tier |
| Analytics | Plausible | Privacy-first, no cookie banner, $9/mo, brand-aligned |
| Errors | Sentry | Free tier covers pre-launch, essential for solo debugging |
| OG images | Next `ImageResponse` | Built-in, zero new deps |
| Hosting | Vercel | Already implied by Next 16/Turbopack |
| Status | Vercel uptime monitor → `/status` | Free, signals seriousness |

**Do NOT build (yet):** Slack/Discord (until 500+ active users — unmoderatable solo), mobile app, Chrome extension, paid plan, custom CMS.

## What "Marketing Naturally" Means Here

Given your light-touch founder preference, marketing is **product-led + builder-led**, not founder-led:

- Demos > opinions. Every post embeds a live, clickable build.
- Featured builders carry the narrative. Your job is to discover them, claim them on Antry, and write the post that makes them shine.
- The Antathon is a recurring content engine — one per month, one tool sponsor each, generates 20-50 real projects to feature.
- Honest scarcity (invite codes, slug grabs) instead of hype.
- No pop-ups, no exit intents, no "tag 3 friends." Trust is the moat.

---

## Verification (how to validate end-to-end)

**After Week 1:**
- Run `pnpm build && pnpm start`; visit `/` and any project page in a private window. Inspect `<head>` — confirm OG, Twitter, canonical tags exist.
- Hit `/robots.txt` and `/sitemap.xml` — both must return 200 with real content.
- Paste any project URL into Slack, iMessage, X — confirm a branded preview card unfurls.
- Trigger waitlist signup with a fresh email — confirm welcome email lands within 30 seconds.
- Trigger a fake server error — confirm Sentry receives it.
- Existing tests (`pnpm test`) must still pass; add a new test for the Resend wrapper around `joinWaitlist`.

**After Week 2:**
- Paste your own GitHub username into `/claim-card` — profile renders in <5s, "claim" button writes to Supabase, redirect to claimed profile works.
- Lighthouse mobile score on `/` ≥ 90.

**After Week 5 (launch day):**
- Plausible dashboard shows real-time traffic from HN / X / PH.
- 50+ projects on `/discover`, no broken demo links.
- HN comments answered within 60 minutes; PH comments within 4 hours.

If any of these fail, fix before moving phases — don't accumulate inbound debt.
