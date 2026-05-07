# Antry — Production Setup

This guide takes a fresh clone to a fully-wired production environment with
real Supabase auth (Google + GitHub + email) and the canonical Antry domain
schema.

> **TL;DR**: 1) create Supabase project → 2) run migrations → 3) configure
> Google OAuth in Supabase + Google Cloud Console → 4) paste env vars into
> `.env.local` → 5) `npm run build && npm start`.

---

## 1. Supabase project

1. Go to <https://supabase.com/dashboard> and create a new project.
2. Pick a region close to your users. Strong password on the database.
3. Wait for provisioning (~2 min).

**Keys to capture** from `Project Settings → API`:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(server-only, bypasses RLS — never ship to the browser)*

The repo is wired to project_ref `pgwcsrolxtnrxberndax` via `.mcp.json`.
If that project is yours, use those keys; otherwise create your own and
update `.mcp.json` to match.

---

## 2. Run the migrations

In the Supabase SQL Editor, run each migration file from
`supabase/migrations/` in numeric order:

```text
001_blog_and_triggers.sql
003_discovered_projects.sql
004_receipts.sql        ← canonical Antry domain (briefs, attempts, receipts)
005_receipts_immutable.sql
006_mission_economy.sql
007_api_keys.sql
008_marketing_content.sql  ← landing_stats, testimonials, methodology
```

Then run `supabase/schema.sql` once for the legacy `profiles` table that
auth.users hooks into (it's where Google OAuth users will land).

> **Note on the legacy schema**: tables `profiles`, `projects`, `hackathons`,
> `blog_posts`, `discovered_projects` are from an earlier incarnation. The
> canonical hiring-eval domain is `briefs / brief_attempts / gateway_calls /
> receipts / companies / api_keys`. Pages still consuming the legacy schema
> are listed in [Page migration backlog](#page-migration-backlog) below.

---

## 3. Google OAuth

OAuth requires manual config in **two** dashboards. I cannot do these clicks
for you — they need access to your accounts.

### 3a. Google Cloud Console (the OAuth provider)

1. <https://console.cloud.google.com/> → create a new project (or pick existing).
2. **APIs & Services → OAuth consent screen** → "External" → fill in:
   - App name: `Antry`
   - Support email: yours
   - App logo: optional
   - Authorized domains: `supabase.co` and your production domain (e.g. `antry.com`)
   - Developer contact: yours
3. **APIs & Services → Credentials → + CREATE CREDENTIALS → OAuth client ID**:
   - Type: `Web application`
   - Name: `Antry Supabase`
   - **Authorized JavaScript origins**:
     - `https://YOUR-PROJECT-REF.supabase.co`
     - `https://antry.com` (production)
     - `http://localhost:3000` (dev)
   - **Authorized redirect URIs**:
     - `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
4. Save → copy `Client ID` and `Client Secret`.

### 3b. Supabase dashboard (the auth gateway)

1. **Authentication → Providers → Google** → enable.
2. Paste the `Client ID` and `Client Secret` from step 3a.
3. Copy the `Callback URL (for OAuth)` shown there — it should match what
   you put into Google Cloud Console.
4. **Authentication → URL Configuration**:
   - Site URL: `https://antry.com` (or your domain)
   - Redirect URLs: add `http://localhost:3000/auth/callback`,
     `https://antry.com/auth/callback`

### 3c. (Optional) GitHub OAuth

The login page also offers GitHub. Repeat the pattern:
- Github → Settings → Developer settings → OAuth Apps → New OAuth App
- Authorization callback URL: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
- Copy Client ID + Secret into Supabase Auth → Providers → GitHub

---

## 4. `.env.local`

Copy `.env.example` to `.env.local` and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # anon public key
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # SERVER ONLY — never expose to client

# Site
NEXT_PUBLIC_SITE_URL=https://antry.com  # or http://localhost:3000 in dev

# Optional: dev fixtures
ANTRY_DEMO_FIXTURE=                     # leave blank in production
```

The middleware (`src/lib/supabase/proxy.ts`) checks for the URL/anon key
and falls through as anonymous if either is missing — so you'll see the
public marketing surface render even without env vars, but auth and
DB-backed pages will be empty.

---

## 5. Verify

```bash
npm install
npx tsc --noEmit
npm run build
npm start
```

Open <http://localhost:3000>. Click `Sign in` → `Continue with Google`
should redirect to Google's consent screen, then back to `/auth/callback`,
then to `/discover`.

Smoke-test the MCP discovery tools (no auth):

```bash
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq .
```

You should see 10 tools listed (6 discovery + 4 lifecycle).

---

## 6. Page migration backlog

The following pages still import `src/lib/supabase/queries.ts` (stale
schema) and/or `src/lib/mock-data.ts`. They render but show empty / mock
content until migrated to `src/lib/supabase/antry.ts`:

| Page | Current source | Target |
|---|---|---|
| `/` (landing) | mock + hardcoded | `getLandingStats`, `getTestimonials` |
| `/about` | mock-data | `getTestimonials('about')` |
| `/builders` | queries.ts (profiles) | `getBuilderByUsername`, new list query |
| `/builders/[username]` | queries.ts + mock | `getBuilderByUsername`, `getReceipts({builderId})` |
| `/companies` | queries.ts | new `getCompanies` query |
| `/discover` | mock + queries.ts | `getBriefs`, `getReceipts` |
| `/projects/[id]` | mock-data | delete or repurpose for Receipts |
| `/hackathons`, `/hackathons/[id]` | queries.ts (deleted schema) | repurpose for company-hosted Brief seasons |
| `/blog`, `/blog/[slug]` | queries.ts | new `blog_posts` migration if keeping |
| `/sitemap.ts` | queries.ts | rewrite against `getBriefs`, `getReceipts` |
| `/receipts/methodology` | hardcoded | `getMethodologyBlocks` |
| `/(platform)/agents` | hardcoded | already matches new patterns; doesn't need DB |
| `/briefs`, `/briefs/[slug]` | mock (`receipts/demo-data.ts`) | `getBriefs`, `getBrief` |
| `/receipts/[id]` | mock (`receipts/demo-data.ts`) | `getReceipt(id)` |

Recommended migration order: briefs → receipts → builders → marketing (landing/about) → blog → drop legacy `queries.ts` + `mock-data.ts`.

---

## 7. MCP attempt persistence (still in-memory)

The `/api/mcp` lifecycle tools (start_attempt / log_event / submit_attempt /
get_attempt_status) currently use an in-memory `Map` keyed by attempt_id.
Restart wipes attempts. The full schema for persistence already exists:

- `brief_attempts` (mirrors my `attempts` Map)
- `gateway_calls` (mirrors `attempt_events`)
- `receipts` (mint target)

The migration plan, when ready:
1. Resolve `Authorization: Bearer ant_<token>` → `builder_id` via
   `resolveApiKey()` in `src/lib/supabase/antry.ts`.
2. Replace the `Map` operations with `supabase.from('brief_attempts')`
   inserts/updates using `createAdminClient()` (RLS bypass, since the
   gateway is acting on the user's behalf).
3. On `submit_attempt`, run a real Agent-as-Judge (currently a heuristic)
   and insert into `receipts` with proper signature.

This is deferred because each step needs integration testing against a
live DB to avoid silent data corruption.

---

## 8. Production checklist

Before flipping the DNS:

- [ ] Migrations 001–008 applied
- [ ] Google OAuth working end-to-end (test signup + login + signout)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` in production env (not in client bundle)
- [ ] All 14 backlog pages migrated (or removed)
- [ ] MCP attempts persisted to DB
- [ ] Real grader (Agent-as-Judge) wired to `submit_attempt`
- [ ] HTTPS only, HSTS preload
- [ ] Rate limiting on `/api/mcp` (per builder_id)
- [ ] Backups configured (Supabase auto, plus Postgres dumps)
- [ ] Sentry / error tracking
- [ ] Privacy policy + terms reflect Receipt data handling

---

## What works today (before any DB hookup)

- ✅ Marketing surface (landing, /about, /agents docs, /receipts/methodology)
- ✅ Auth UI (login page renders, OAuth buttons fire — but error if Supabase not configured)
- ✅ MCP discovery tools over `mock-data.ts` (search_briefs, get_brief, etc.)
- ✅ MCP lifecycle tools (auth-gated, in-memory)
- ✅ TypeScript compiles, build passes, 169/171 unit tests pass

## What's mocked / placeholder

- ⚠ `/briefs/[slug]/lab` — the in-app sandbox is a UI shell; gateway-mock.ts
  generates synthetic telemetry; real Lab will run candidate code.
- ⚠ MCP `submit_attempt` grader is heuristic (event count → score).
- ⚠ Receipt signature uses a demo HMAC secret (`receipts/secret.ts`).
- ⚠ All `mock-data.ts` consumers (17 files) read static fixtures.
