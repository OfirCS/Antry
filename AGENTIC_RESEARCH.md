# Agentic Research: Making Antry Truly Agent-Driven

> Research document for transforming Antry from a passive community platform into an agentic builder network where AI agents proactively work for every user.

---

## Current State

### What the Agent Can Do Today

Antry has a single synchronous agent called **Scout** (`src/lib/agent/engine.ts`) exposed via `POST /api/agent` (`src/app/api/agent/route.ts`). It operates as a **reactive, query-response system** -- the user types a question, and Scout searches the database for answers.

**Current capabilities (8 intents):**

| Intent | What It Does |
|---|---|
| `find_builders` | TF-IDF search over builder profiles by skill, name, bio |
| `find_projects` | TF-IDF search over projects by tech stack, title, category |
| `find_hackathons` | Search and rank hackathons by status and relevance |
| `build_team` | Assemble a team from available builders using role-gap analysis |
| `compare_builders` | Side-by-side comparison of two builders |
| `builder_detail` | Full profile view with projects, hackathons, total likes |
| `platform_stats` | Aggregate counts (builders, projects, hackathons, likes) |
| `help` | Explains what Scout can do |

**Technical architecture:**
- **Engine**: Custom TF-IDF intent classifier with cosine similarity ranking (`TfIdfIndex` class in `engine.ts`)
- **Data source**: Supabase tables (`profiles`, `projects`, `hackathons`) cached for 60 seconds (`DATASET_CACHE_TTL_MS`)
- **API**: Single `POST /api/agent` endpoint with Zod validation, rate limiting (24 requests per 15 minutes), prompt injection guards, and domain-scoping regex
- **UI**: Chat-based interface in `AgentHome.tsx` with suggestion chips, rich cards (builder, project, hackathon, team, comparison, detail), and multi-turn conversation context
- **No LLM**: The entire agent runs on TF-IDF + regex heuristics + handcrafted response templates -- zero external AI API calls
- **No background processing**: Everything is synchronous request-response
- **No user context**: Scout doesn't know who is asking -- it treats all users identically

### Existing Discovery System

The GitHub Discovery Agent (`src/lib/discovery/github-scanner.ts`) is the closest thing to a proactive agent:
- Scans GitHub for repos matching quality criteria (stars, README quality, demo URL, recent activity)
- Scores them 0-100 using `scoreRepo()` in `src/lib/discovery/scorer.ts`
- Inserts into `discovered_projects` table with status `pending`
- Admin reviews and approves via `src/app/(platform)/admin/discovery/page.tsx`
- Approved projects can be claimed by builders and imported into the main `projects` table via `src/lib/discovery/importer.ts`

This is triggered manually via `POST /api/discovery/scan` -- not on a schedule.

### Dashboard

The dashboard (`src/app/(platform)/dashboard/page.tsx`) shows:
- Profile completeness bar
- Project stats (count, likes, views)
- Hardcoded "Recommended builders" list (`RECOMMENDED_BUILDERS` constant)
- Mock activity feed
- Quick actions (submit project, join hackathon, find teammates)

### Gaps and Limitations

1. **Entirely reactive**: Nothing happens unless the user initiates. No notifications, no proactive suggestions, no background processing.
2. **No personalization**: Scout doesn't know who you are. The dashboard recommendations are hardcoded constants, not computed from your profile.
3. **No LLM intelligence**: Response generation uses template strings. Can't handle nuanced queries, can't explain reasoning, can't have natural conversations.
4. **No background agents**: GitHub scanner must be triggered manually. No cron jobs, no webhooks, no event-driven processing.
5. **No user-to-user connections**: No follow/connect system, no messaging, no collaboration requests.
6. **No activity tracking**: Profile views are mocked (hardcoded `127`). No real analytics on who viewed your profile or projects.
7. **No GitHub sync**: Builder profiles don't auto-update when they push new code or create new repos.
8. **No email/notifications**: No way to reach users outside the app.
9. **Recommendations are static**: The "Recommended for you" section uses a hardcoded array rather than computing matches based on the current user's skills and interests.
10. **Discovery is admin-bottlenecked**: Every discovered project needs manual admin review before appearing on the platform.

---

## Agentic Vision: What Could Be

### 1. Proactive Agent Features

#### 1.1 GitHub Activity Sync Agent
**Description**: Monitors connected GitHub accounts and auto-updates builder profiles when they ship new projects, gain stars, or contribute to notable repos. Shows a "Recently shipped" badge on profiles.

**How it would work technically**:
- Add a `github_access_token` column to `profiles` table (encrypted)
- Background job (Inngest/Trigger.dev) runs every 6 hours per user via cron
- Calls GitHub API (`/users/{username}/repos?sort=pushed`) to detect new/updated repos
- Compares against stored `last_synced_repos` in a new `github_sync_state` table
- Auto-creates entries in `discovered_projects` with status `auto_synced` (bypasses admin review for the user's own repos)
- Updates builder `skills` array by analyzing repo languages via `/repos/{owner}/{repo}/languages`
- Triggers a Supabase realtime event that the dashboard subscribes to

**Files to modify**: `src/lib/discovery/github-scanner.ts` (extend), `src/lib/supabase/queries.ts` (new query), `src/app/(platform)/dashboard/page.tsx` (live updates)

**Difficulty**: Medium
**Impact**: High
**Priority**: Phase 1 -- this is the core value prop of "discovered by what you ship"

---

#### 1.2 Weekly Builder Digest Agent
**Description**: Sends personalized weekly emails to each builder highlighting new builders with overlapping skills, trending projects in their tech stack, upcoming hackathons matching their interests, and profile engagement stats.

**How it would work technically**:
- New `notification_preferences` table with email opt-in, frequency, topics
- Cron job (Inngest scheduled function, weekly) iterates over opted-in users
- For each user: query builders who joined this week with overlapping skills (reuse `rankBuildersWithScores` from `engine.ts`), new projects in their tech stack, active/upcoming hackathons
- Use an LLM (Claude API) to compose a natural, personalized email body
- Send via Resend or SendGrid API
- Track opens/clicks in `digest_analytics` table

**Files to modify**: New `src/lib/agents/digest-agent.ts`, new API route `src/app/api/cron/weekly-digest/route.ts`

**Difficulty**: Medium
**Impact**: High (retention driver)
**Priority**: Phase 2

---

#### 1.3 Hackathon Teammate Suggestion Agent
**Description**: When a builder joins a hackathon, the agent proactively analyzes their skills, finds complementary builders who also joined (or might be interested), and sends teammate suggestions with a "chemistry score."

**How it would work technically**:
- Hook into `hackathon_participants` table insert (Supabase database webhook or Trigger.dev event)
- When a builder joins, run `buildTeam()` from `engine.ts` scoped to builders who also joined that hackathon
- Compute a "chemistry score" based on skill complementarity (reuse `findComplementarySkills` from `engine.ts`) and past hackathon performance
- Store suggestions in a `teammate_suggestions` table
- Show in-app notification on dashboard and (optionally) email

**Files to modify**: `src/lib/agent/engine.ts` (extract `buildTeam` to be reusable), new `src/lib/agents/teammate-agent.ts`

**Difficulty**: Medium
**Impact**: High
**Priority**: Phase 1

---

#### 1.4 Profile Improvement Agent
**Description**: Proactively analyzes your profile and gives actionable suggestions: "Your bio mentions Python but it's not in your skills list," "Builders with a website link get 2x more views," "Your top project has no demo URL -- adding one would boost visibility."

**How it would work technically**:
- Run on profile view or dashboard load (client-side or edge function)
- Analyze profile fields: completeness (already computed in `calculateCompleteness` in `dashboard/page.tsx`), consistency (skills vs. project tech stacks), missing high-value fields
- Cross-reference with GitHub data if connected: repos show Python but profile doesn't list it
- Generate suggestions as structured data, render as dismissible cards on dashboard
- Optionally use LLM to generate natural-language improvement tips

**Files to modify**: `src/app/(platform)/dashboard/page.tsx` (replace hardcoded completeness with agent suggestions), new `src/lib/agents/profile-advisor.ts`

**Difficulty**: Easy
**Impact**: Medium
**Priority**: Phase 1

---

#### 1.5 New Project Auto-Tagging Agent
**Description**: When a builder submits a project, the agent auto-analyzes the description, demo URL, and source code to suggest category, tech stack tags, and a refined tagline.

**How it would work technically**:
- Hook into project creation (server action in `src/app/(platform)/actions.ts` or Supabase trigger)
- If `source_url` points to GitHub, fetch repo languages and topics
- If `demo_url` exists, optionally fetch and analyze the page (lightweight scrape for meta tags)
- Use an LLM to generate: refined tagline, suggested category (from `CATEGORIES` in `mock-data.ts`), additional tech stack tags
- Present as suggestions the builder can accept/reject before publishing

**Files to modify**: `src/app/(platform)/submit/page.tsx`, new `src/lib/agents/auto-tag-agent.ts`

**Difficulty**: Easy
**Impact**: Medium
**Priority**: Phase 2

---

### 2. Matchmaking Agent

#### 2.1 Smart Builder-Hackathon Matching
**Description**: For each active/upcoming hackathon, the agent computes a match score for every builder based on their tech stack alignment with the hackathon theme, past hackathon performance, and team availability.

**How it would work technically**:
- Extend `rankHackathonsWithScores` in `engine.ts` to be user-aware: boost hackathons where the builder's skills match the theme keywords
- Use `inferRolesForTheme` to determine what skills a hackathon needs, then check if the builder fills a gap
- Store personalized match scores in a `hackathon_matches` table, updated when hackathon or builder data changes
- Surface on dashboard: "This hackathon needs your exact skills -- 94% match"
- Surface in hackathon detail page: "Builders who'd be great for this" (replacing generic participant list)

**Files to modify**: `src/lib/agent/engine.ts` (extend ranking), `src/app/(platform)/hackathons/[id]/HackathonDetailClient.tsx`, `src/app/(platform)/dashboard/page.tsx`

**Difficulty**: Medium
**Impact**: High
**Priority**: Phase 2

---

#### 2.2 Project Collaboration Suggestions
**Description**: Analyzes a builder's skills and current projects to suggest collaboration opportunities: "Jake is building a real-time app and needs a design engineer -- your Three.js skills are a perfect fit."

**How it would work technically**:
- New concept: projects can have a `seeking_collaborators` flag and a list of `needed_roles`
- Agent matches builders to open collaboration slots using the same role-scoring logic from `buildTeam()` in `engine.ts`
- Background job scans for matches periodically
- In-app notification: "3 projects are looking for someone with your skills"

**Files to modify**: Add `seeking_collaborators`, `needed_roles` columns to `projects` table, new `src/lib/agents/collab-matcher.ts`

**Difficulty**: Medium
**Impact**: High
**Priority**: Phase 2

---

#### 2.3 Builder Chemistry Analysis
**Description**: Given two builders, computes a "chemistry score" predicting how well they'd work together based on complementary skills, overlapping hackathon history, similar project categories, and communication style.

**How it would work technically**:
- Extend `compareBuilders` in `engine.ts` to compute a multi-dimensional score:
  - Skill complementarity (already have `findComplementarySkills`)
  - Shared hackathon participation (check `antathonIds` overlap)
  - Project category diversity (one builds tools, the other builds AI -- great pairing)
  - Activity recency (both recently active = better chance of collaboration)
- Expose as a new card type in the agent UI and as a standalone API endpoint
- Surface on builder profile pages: "Works well with: [list of complementary builders]"

**Files to modify**: `src/lib/agent/engine.ts`, `src/lib/agent/types.ts` (new `ChemistryData` type), `src/app/(platform)/builders/[username]/BuilderProfileClient.tsx`

**Difficulty**: Easy
**Impact**: Medium
**Priority**: Phase 2

---

### 3. Recruiter Agent

#### 3.1 Talent Radar
**Description**: An AI agent for companies/recruiters that continuously monitors the builder network and alerts when a builder ships something relevant to their hiring needs. "A builder just shipped a production-grade RAG pipeline -- matches your AI Engineer role."

**How it would work technically**:
- New `company_profiles` table with `hiring_criteria` (skills, experience level, project types)
- Companies page already exists at `src/app/(platform)/companies/page.tsx`
- Background job: on every new project submission, check against all active hiring criteria
- Compute relevance score using TF-IDF matching (reuse `TfIdfIndex` from `engine.ts`) between project description/tech stack and hiring criteria
- If score > threshold, create alert in `talent_alerts` table
- Email digest to recruiter: "3 new builders matched your AI Engineer criteria this week"

**Files to modify**: New `src/lib/agents/talent-radar.ts`, `src/app/(platform)/companies/CompaniesClient.tsx` (add alerts UI)

**Difficulty**: Hard
**Impact**: High (monetization potential)
**Priority**: Phase 3

---

#### 3.2 Automated Outreach Drafting
**Description**: When a recruiter identifies a builder they want to reach out to, the agent drafts a personalized message referencing the builder's specific projects and skills.

**How it would work technically**:
- Use Claude API to generate outreach messages
- Input: builder profile (from `AgentBuilder` type), specific projects that triggered the match, company hiring criteria
- Template: "Hi {name}, I noticed your project {project} -- the way you used {tech} to solve {problem} is exactly what we're looking for..."
- Recruiter can edit before sending
- Track response rates in `outreach_analytics` table

**Files to modify**: New `src/lib/agents/outreach-agent.ts`, new UI component for message drafting

**Difficulty**: Medium
**Impact**: Medium
**Priority**: Phase 3

---

#### 3.3 Builder Signal Score
**Description**: A composite "builder signal" score (0-100) computed from shipping velocity, project quality, community engagement, hackathon participation, and GitHub activity. Visible on profiles, usable for ranking and filtering.

**How it would work technically**:
- Score components:
  - Shipping velocity: projects per month (data from `projects.created_at`)
  - Quality signal: total likes normalized by project count
  - Community: hackathon participations (from `hackathon_participants`)
  - Code quality: GitHub stars, repo quality score (from `scoreRepo` in `scorer.ts`)
  - Recency: last project/activity timestamp
- Store as `signal_score` on `profiles` table, recomputed via background job
- Display on builder cards and profile pages
- Allow recruiters to filter/sort by signal score

**Files to modify**: New `src/lib/agents/signal-scorer.ts`, `src/components/BuilderCard.tsx`, `src/app/(platform)/builders/[username]/BuilderProfileClient.tsx`

**Difficulty**: Easy
**Impact**: High
**Priority**: Phase 1

---

### 4. Community Agent

#### 4.1 Trending Skills Tracker
**Description**: Agent that analyzes project submissions and builder signups over time to identify trending technologies and skills. "LangChain usage is up 340% this month" or "Three.js builders are in high demand for hackathons."

**How it would work technically**:
- Weekly cron job aggregates `tech_stack` from `projects` and `skills` from `profiles`, grouped by week/month
- Computes week-over-week growth rates
- Stores in `skill_trends` table: `{ skill, period, count, growth_rate }`
- Surface on homepage, discover page, and in agent responses
- Use in hackathon theme suggestions and profile improvement tips

**Files to modify**: New `src/lib/agents/trend-tracker.ts`, `src/app/(platform)/discover/DiscoverClient.tsx` (add trends section)

**Difficulty**: Easy
**Impact**: Medium
**Priority**: Phase 2

---

#### 4.2 Quality Content Highlighter
**Description**: Automatically identifies and features high-quality projects based on multi-signal analysis (not just likes). Considers code quality, documentation, demo availability, community engagement, and novelty.

**How it would work technically**:
- Extend the scoring logic from `scoreRepo` in `scorer.ts` to all projects (not just discovered ones)
- Add signals: like velocity (likes per day since creation), uniqueness of tech stack combination, hackathon submission status
- Auto-tag top projects as "Featured" or "Editor's Pick"
- Surface in a "Trending on Antry" section on the homepage and discover page

**Files to modify**: `src/lib/discovery/scorer.ts` (generalize), new `src/lib/agents/quality-highlighter.ts`

**Difficulty**: Easy
**Impact**: Medium
**Priority**: Phase 2

---

#### 4.3 Community Health Dashboard
**Description**: Agent that tracks platform health metrics: new signups rate, project submission rate, hackathon participation, builder retention, skill diversity index. Surfaces insights to admins.

**How it would work technically**:
- Extend `getPlatformStats` in `src/lib/supabase/queries.ts` with time-series data
- New `platform_metrics` table storing daily snapshots
- Cron job captures daily: new profiles count, new projects count, active users, hackathon join rate
- Admin dashboard at `/admin/health` with charts (use a lightweight chart library or SVG)
- Alert admin if metrics drop below thresholds

**Files to modify**: `src/lib/supabase/queries.ts`, new `src/app/(platform)/admin/health/page.tsx`

**Difficulty**: Medium
**Impact**: Medium (admin-facing)
**Priority**: Phase 3

---

### 5. Builder Agent (Personal AI Assistant)

#### 5.1 Skill Gap Analyzer
**Description**: Analyzes your current skills, project history, and the broader market trends to suggest what to learn next. "Builders with your Python + AI stack who also know TypeScript ship 2x more projects. Here's why adding it would help."

**How it would work technically**:
- Compare builder's skills against trending skills from Trend Tracker (4.1)
- Analyze successful builders with similar base skills (who else started with Python + AI?) and what additional skills correlated with more projects/likes
- Use LLM to generate personalized learning recommendations
- Surface on dashboard as "Growth suggestions"

**Files to modify**: New `src/lib/agents/skill-gap-agent.ts`, `src/app/(platform)/dashboard/page.tsx`

**Difficulty**: Medium
**Impact**: Medium
**Priority**: Phase 3

---

#### 5.2 Hackathon Prep Agent
**Description**: When you join a hackathon, the agent creates a personalized prep plan: suggested teammates (from 1.3), recommended tech stack based on the theme, similar winning projects from past hackathons to study, and a project idea brainstorm.

**How it would work technically**:
- Triggered when builder joins a hackathon (database event)
- Components:
  - Teammate suggestions (reuse 1.3)
  - Tech stack recommendation: analyze past hackathon winners' tech stacks for the same theme category
  - Past winner analysis: query `hackathon_submissions` joined with `projects` for completed hackathons with similar themes
  - Idea generation: use Claude API with context about the builder's skills, the hackathon theme, and winning patterns
- Deliver as a "Hackathon Prep Kit" page or modal

**Files to modify**: New `src/lib/agents/hackathon-prep-agent.ts`, `src/app/(platform)/hackathons/[id]/HackathonDetailClient.tsx`

**Difficulty**: Hard
**Impact**: High
**Priority**: Phase 3

---

#### 5.3 Project Idea Generator
**Description**: Based on your skills, current trends, and gaps in the Antry ecosystem, suggests project ideas you could build. "There are 12 AI agent projects on Antry but zero focus on code review -- your Python + LangChain skills could fill this gap."

**How it would work technically**:
- Analyze builder's skills and existing projects
- Cross-reference with platform-wide project categories and tech stacks to find underrepresented niches
- Use Claude API to brainstorm 3-5 project ideas with descriptions, suggested tech stacks, and estimated build times
- Surface as a "What to build next" card on the dashboard

**Files to modify**: New `src/lib/agents/idea-generator.ts`, `src/app/(platform)/dashboard/page.tsx`

**Difficulty**: Medium
**Impact**: Medium
**Priority**: Phase 3

---

#### 5.4 Smart Scout (LLM-Powered Agent Upgrade)
**Description**: Upgrade the existing Scout agent from TF-IDF + templates to an LLM-powered conversational agent that can reason about complex queries, chain multiple data lookups, and provide nuanced analysis.

**How it would work technically**:
- Replace `classifyIntent` + template responses with Claude API call
- Keep the existing `TfIdfIndex` and ranking functions as **tools** the LLM can call
- Define tool schemas: `search_builders(query, skills_filter)`, `search_projects(query, category)`, `search_hackathons(status)`, `build_team(theme)`, `compare_builders(name_a, name_b)`, `get_builder_detail(username)`, `get_platform_stats()`
- LLM decides which tools to call based on the conversation
- Enables complex queries: "Find someone like Mara but with more frontend experience who's available for the next hackathon"
- Keep the existing TF-IDF as a fallback for when the LLM is unavailable
- Stream responses via `ReadableStream` for real-time UX

**Files to modify**: `src/lib/agent/engine.ts` (major refactor -- extract tools, add LLM orchestration), `src/app/api/agent/route.ts` (streaming), `src/components/AgentHome.tsx` (streaming UI)

**Difficulty**: Hard
**Impact**: Very High
**Priority**: Phase 2

---

#### 5.5 Personalized Dashboard Feed
**Description**: Replace the hardcoded `RECOMMENDED_BUILDERS` and mock activity feed with a real-time, personalized feed driven by the agent system.

**How it would work technically**:
- On dashboard load, run a lightweight personalization pass:
  - Fetch builder's skills from their profile
  - Use `rankBuildersWithScores` from `engine.ts` to find similar builders (not the same hardcoded 3)
  - Use `rankProjectsWithScores` to find relevant recent projects
  - Query recent `hackathon_participants` and `projects` inserts for real activity
- Store precomputed recommendations in a `user_recommendations` table (refreshed periodically by background job)
- Replace mock `profileViews` with real view tracking (Supabase row-level security + `profile_views` table)

**Files to modify**: `src/app/(platform)/dashboard/page.tsx` (replace `RECOMMENDED_BUILDERS`, `generateActivity`, mock `profileViews`), `src/lib/supabase/queries.ts` (new queries)

**Difficulty**: Medium
**Impact**: High
**Priority**: Phase 1

---

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 Weeks)

These require minimal new infrastructure and build on existing code.

| # | Feature | Effort | Impact | Key Change |
|---|---|---|---|---|
| 1 | **Builder Signal Score** (3.3) | 2 days | High | New scoring function, display on cards |
| 2 | **Profile Improvement Agent** (1.4) | 2 days | Medium | Extend `calculateCompleteness`, add suggestion cards |
| 3 | **Personalized Dashboard Feed** (5.5) | 3 days | High | Replace hardcoded recommendations with real queries |
| 4 | **Hackathon Teammate Suggestions** (1.3) | 3 days | High | Hook into hackathon join event, reuse `buildTeam` |
| 5 | **GitHub Activity Sync** (1.1) | 4 days | High | Background job + GitHub API integration |

**Outcome**: Dashboard becomes personalized and alive. Builders see real recommendations, real activity, and real signal scores. Profile improvement nudges drive engagement.

### Phase 2: Core Agentic Features (1-2 Months)

These require adding background job infrastructure and (for Smart Scout) an LLM API.

| # | Feature | Effort | Impact | Key Change |
|---|---|---|---|---|
| 6 | **Smart Scout LLM Upgrade** (5.4) | 2 weeks | Very High | Claude API integration, tool-use pattern, streaming |
| 7 | **Builder-Hackathon Matching** (2.1) | 1 week | High | User-aware ranking, match scores |
| 8 | **Project Collaboration Suggestions** (2.2) | 1 week | High | New DB columns, matching logic |
| 9 | **Weekly Builder Digest** (1.2) | 1 week | High | Email service integration, cron job |
| 10 | **Trending Skills Tracker** (4.1) | 3 days | Medium | Aggregation cron, trend UI |
| 11 | **Quality Content Highlighter** (4.2) | 3 days | Medium | Extended scoring, auto-feature |
| 12 | **Builder Chemistry Analysis** (2.3) | 3 days | Medium | Extended comparison, new card type |
| 13 | **Project Auto-Tagging** (1.5) | 3 days | Medium | LLM call on submit, suggestion UI |

**Outcome**: The platform becomes proactively useful. Builders get matched to hackathons and collaborators. Scout becomes a real AI assistant. Email keeps users coming back.

### Phase 3: Advanced AI Features (3+ Months)

These are high-value but require significant new infrastructure, LLM usage, and design work.

| # | Feature | Effort | Impact | Key Change |
|---|---|---|---|---|
| 14 | **Talent Radar** (3.1) | 2 weeks | High | Company profiles, matching pipeline, alerts |
| 15 | **Hackathon Prep Agent** (5.2) | 1 week | High | Multi-component agent, Claude API |
| 16 | **Skill Gap Analyzer** (5.1) | 1 week | Medium | Trend correlation, LLM recommendations |
| 17 | **Project Idea Generator** (5.3) | 1 week | Medium | Gap analysis, Claude API |
| 18 | **Automated Outreach Drafting** (3.2) | 1 week | Medium | LLM message generation |
| 19 | **Community Health Dashboard** (4.3) | 1 week | Medium | Time-series metrics, admin UI |

**Outcome**: Antry becomes a monetizable talent platform. Recruiters pay for talent radar. Builders get AI-powered career coaching. The platform has flywheel metrics.

---

## Architecture Recommendations

### Current Architecture

```
User --> AgentHome.tsx --> POST /api/agent --> runAgent() --> Supabase queries --> Template response
                                                  |
                                           TF-IDF ranking
                                           (synchronous, no LLM)
```

### Proposed Architecture

```
                              ┌──────────────────────────┐
                              |    Background Agents      |
                              |  (Inngest / Trigger.dev)  |
                              |                          |
                              |  - GitHub Sync (cron)    |
                              |  - Weekly Digest (cron)  |
                              |  - Talent Radar (event)  |
                              |  - Trend Tracker (cron)  |
                              |  - Signal Scorer (cron)  |
                              └────────────┬─────────────┘
                                           |
                                     writes to DB
                                           |
User --> AgentHome.tsx --> POST /api/agent --> Smart Scout (Claude API + tools)
    |                         |                    |
    |                    Streaming response    Uses existing TF-IDF
    |                    (ReadableStream)      functions as tools
    |
    └--> Dashboard --> reads personalized data from DB
              |
              └── Profile suggestions, match scores, activity feed
                  (precomputed by background agents)

                              ┌──────────────────────────┐
                              |    Event Triggers         |
                              |                          |
                              |  DB webhook: new project  |
                              |  DB webhook: hackathon    |
                              |     join                  |
                              |  DB webhook: new profile  |
                              |  Cron: every 6 hours      |
                              |  Cron: weekly              |
                              └──────────────────────────┘
```

### Key Architectural Decisions

#### 1. Background Job System: Inngest or Trigger.dev

**Recommendation: Trigger.dev**

Both integrate well with Next.js and Supabase. Trigger.dev is the better fit because:
- Code-first approach (no visual workflow builder needed)
- First-class support for long-running AI agent tasks
- Built-in retries, logging, and observability
- Open source, self-hostable for cost control
- Better DX for a developer-facing platform like Antry
- Direct Supabase integration as a partner

**Integration pattern**: Define trigger functions in `src/trigger/` directory, deploy alongside the Next.js app.

#### 2. LLM Integration: Claude API with Tool Use

**Recommendation: Anthropic Claude API (claude-sonnet-4-20250514 for Scout, claude-haiku-4-20250414 for background tasks)**

- The existing agent already structures responses as tool steps + cards -- this maps perfectly to Claude's tool-use API
- Use Sonnet for interactive Scout queries (good balance of speed and quality)
- Use Haiku for background tasks like auto-tagging, outreach drafting, digest generation (cost-efficient)
- Keep TF-IDF as a fast fallback when Claude is unavailable or for simple queries with high-confidence intent classification

**Implementation in `engine.ts`**:
```typescript
// Convert existing functions to tool definitions
const tools = [
  { name: "search_builders", fn: rankBuildersWithScores },
  { name: "search_projects", fn: rankProjectsWithScores },
  { name: "search_hackathons", fn: rankHackathonsWithScores },
  { name: "build_team", fn: buildTeam },
  { name: "compare_builders", fn: compareBuilders },
  { name: "get_builder_detail", fn: getBuilderDetail },
];
```

#### 3. Event-Driven vs. Cron

Use **events** for user-triggered actions that need near-real-time response:
- Builder joins hackathon --> trigger teammate matching
- New project submitted --> trigger auto-tagging + talent radar check
- Profile updated --> trigger signal score recomputation

Use **cron** for periodic aggregation that doesn't need to be instant:
- GitHub sync: every 6 hours
- Weekly digest: every Monday
- Trend tracking: daily
- Signal score batch recompute: daily
- Community health snapshot: daily

#### 4. Streaming Responses

For the Smart Scout LLM upgrade, use the Web Streams API:
```typescript
// In src/app/api/agent/route.ts
return new Response(
  new ReadableStream({
    async start(controller) {
      const stream = await claude.messages.stream({ ... });
      for await (const event of stream) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      }
      controller.close();
    }
  }),
  { headers: { 'Content-Type': 'text/event-stream' } }
);
```

Update `AgentHome.tsx` to consume the stream progressively, rendering partial responses and tool-use steps in real time.

#### 5. Database Schema Additions

```sql
-- GitHub sync state
CREATE TABLE github_sync_state (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,
  github_username TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ,
  synced_repos JSONB DEFAULT '[]',
  sync_errors TEXT[]
);

-- Personalized recommendations (precomputed)
CREATE TABLE user_recommendations (
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL, -- 'builder', 'project', 'hackathon'
  target_id UUID NOT NULL,
  score FLOAT NOT NULL,
  reason TEXT,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, type, target_id)
);

-- Builder signal scores
ALTER TABLE profiles ADD COLUMN signal_score INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN signal_breakdown JSONB;

-- Skill trends
CREATE TABLE skill_trends (
  skill TEXT NOT NULL,
  period DATE NOT NULL,
  count INTEGER DEFAULT 0,
  growth_rate FLOAT DEFAULT 0,
  PRIMARY KEY (skill, period)
);

-- Profile views (real tracking)
CREATE TABLE profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  viewer_id UUID REFERENCES profiles(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teammate suggestions
CREATE TABLE teammate_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hackathon_id UUID REFERENCES hackathons(id),
  builder_id UUID REFERENCES profiles(id),
  suggested_teammate_id UUID REFERENCES profiles(id),
  chemistry_score FLOAT,
  complementary_skills TEXT[],
  reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, accepted, dismissed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE notification_preferences (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,
  weekly_digest BOOLEAN DEFAULT true,
  teammate_alerts BOOLEAN DEFAULT true,
  hackathon_matches BOOLEAN DEFAULT true,
  talent_alerts BOOLEAN DEFAULT false, -- for recruiters
  email TEXT
);

-- Talent radar (for companies)
CREATE TABLE talent_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  builder_id UUID REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id),
  match_score FLOAT,
  criteria_snapshot JSONB,
  status TEXT DEFAULT 'new', -- new, viewed, contacted, dismissed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. Suggested Package Additions

```json
{
  "@anthropic-ai/sdk": "latest",        // Claude API for Smart Scout + background agents
  "@trigger.dev/sdk": "latest",          // Background job orchestration
  "@trigger.dev/nextjs": "latest",       // Next.js integration
  "resend": "latest"                     // Transactional email for digests
}
```

These are lightweight additions that don't bloat the bundle. The Anthropic SDK is server-only. Trigger.dev runs as a separate process. Resend is a single API call.

### What NOT to Add

- **No vector database** (Pinecone, Weaviate, etc.) -- the dataset is small enough that TF-IDF + Claude tool use is sufficient. Adding a vector DB is premature optimization.
- **No message queue** (Redis, RabbitMQ) -- Trigger.dev handles job queuing. Supabase Realtime handles pub/sub for live updates.
- **No separate microservices** -- Keep everything in the Next.js monolith with Trigger.dev for background work. The codebase is small and manageable.
- **No real-time chat/messaging between users** yet -- focus on agent-to-user communication first. User-to-user can come later as the community grows.

---

## Key Insight: The Agentic Flywheel

The most important architectural principle is that every agent should feed data back into the system that makes other agents smarter:

1. **GitHub Sync** updates builder profiles --> better **Signal Scores**
2. Better Signal Scores --> more accurate **Teammate Matching**
3. More teammate matches --> higher **hackathon participation**
4. More hackathon projects --> richer **Trending Skills** data
5. Richer trend data --> better **Skill Gap** and **Project Idea** suggestions
6. Better suggestions --> more projects shipped --> back to step 1

This flywheel is what makes the platform truly agentic: the agents don't just respond to queries -- they continuously improve the data that powers every other agent in the system.

---

## Summary: From Search Engine to Agent Network

| Dimension | Today | Agentic Future |
|---|---|---|
| **User interaction** | User asks, Scout answers | Agents proactively reach out to users |
| **Personalization** | None (hardcoded recommendations) | Every surface personalized to the builder |
| **Intelligence** | TF-IDF + templates | LLM-powered reasoning with tool use |
| **Timing** | Synchronous request-response | Background agents running 24/7 |
| **Data freshness** | Manual entry only | Auto-synced from GitHub, computed trends |
| **Matchmaking** | User must search | Agent suggests matches automatically |
| **Recruiter value** | None | Talent radar, signal scores, outreach drafting |
| **Retention** | Hope users come back | Weekly digests, notifications, prep kits |
| **Discovery** | Manual admin review | Auto-scoring, auto-featuring, smart curation |

The transformation is from "a platform where builders search for things" to "a platform where agents work for builders around the clock."
