-- Antry: marketing content + remaining wiring
-- Migration 008: pulls landing-page constants out of code into the database
-- so site content can change without a deploy. Also seeds the initial values
-- with the strings currently hardcoded across the marketing surface.
--
-- Tables: landing_stats, testimonials, methodology_blocks.
-- All marketing tables are publicly readable; writes are admin-only
-- (CMS/dashboard surface lives in /admin and uses service role key).

-- ── Landing stats ──────────────────────────────────────
-- Hero/stat-strip numbers. Each row is one displayed stat.
create table if not exists public.landing_stats (
  key text primary key,
  value text not null,
  label text not null,
  sort_order int default 0,
  is_visible boolean default true,
  updated_at timestamptz default now() not null
);

alter table public.landing_stats enable row level security;
create policy "Landing stats are public" on public.landing_stats
  for select using (is_visible = true);

create index if not exists idx_landing_stats_sort
  on public.landing_stats(sort_order) where is_visible = true;

-- ── Testimonials ───────────────────────────────────────
-- Quotes shown on landing, /about, auth pages. Author identity is
-- intentionally a string (not a foreign key) — most quotes are from
-- non-Antry users (companies hiring through Antry, candidates' sponsors).
create table if not exists public.testimonials (
  id uuid default gen_random_uuid() primary key,
  quote text not null,
  author_name text not null,
  author_role text not null,
  author_company text default '',
  author_avatar_url text,
  gradient text default 'linear-gradient(135deg, #C6F135 0%, #8AB91D 100%)',
  surface text not null default 'landing'
    check (surface in ('landing','about','auth','agents','briefs','receipts','dashboard')),
  sort_order int default 0,
  is_visible boolean default true,
  created_at timestamptz default now() not null
);

alter table public.testimonials enable row level security;
create policy "Testimonials are public" on public.testimonials
  for select using (is_visible = true);

create index if not exists idx_testimonials_surface
  on public.testimonials(surface, sort_order) where is_visible = true;

-- ── Methodology blocks ─────────────────────────────────
-- The /receipts/methodology page is currently a wall of hardcoded markdown.
-- This table moves it to DB-driven content blocks so we can edit the
-- methodology without a deploy, A/B-test individual blocks, and surface
-- methodology snippets contextually elsewhere (e.g. tooltip on a Receipt).
create table if not exists public.methodology_blocks (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  surface text not null default 'methodology'
    check (surface in ('methodology','agents','briefs','receipts','landing')),
  eyebrow text default '',
  title text not null,
  body_md text not null,
  sort_order int default 0,
  is_visible boolean default true,
  updated_at timestamptz default now() not null
);

alter table public.methodology_blocks enable row level security;
create policy "Methodology blocks are public" on public.methodology_blocks
  for select using (is_visible = true);

create index if not exists idx_methodology_surface
  on public.methodology_blocks(surface, sort_order) where is_visible = true;

-- ── Touch-trigger: keep updated_at fresh on UPDATE ─────
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_landing_stats_touch on public.landing_stats;
create trigger trg_landing_stats_touch
  before update on public.landing_stats
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_methodology_touch on public.methodology_blocks;
create trigger trg_methodology_touch
  before update on public.methodology_blocks
  for each row execute function public.touch_updated_at();

-- ── Seed: initial values ───────────────────────────────
-- These are the strings currently hardcoded in src/app/_landing/* and
-- the /about, /receipts/methodology pages. Edit in Supabase dashboard
-- to change live content.

insert into public.landing_stats (key, value, label, sort_order) values
  ('briefs_live', '47', 'Briefs live this week', 1),
  ('receipts_minted', '1.2k', 'Signed Receipts minted', 2),
  ('builders_active', '380', 'Builders shipping', 3),
  ('avg_composite', '64', 'Median composite score', 4)
on conflict (key) do nothing;

insert into public.testimonials (quote, author_name, author_role, author_company, gradient, surface, sort_order) values
  (
    'I shipped two Briefs from Cursor in an evening. The Receipt got me a 30-min call the next morning. No CV, no LeetCode, just the trace.',
    'Mara Chen',
    'AI Engineer',
    'Independent',
    'linear-gradient(135deg, #C6F135 0%, #8AB91D 100%)',
    'landing',
    1
  ),
  (
    'We replaced one full take-home round with the Receipt. Cuts our time-to-offer by 6 days and our pass-through is up 40%.',
    'Priya Raman',
    'Head of Engineering',
    'Layerline',
    'linear-gradient(135deg, #1F2937 0%, #0F172A 100%)',
    'landing',
    2
  ),
  (
    'The Fingerprint is the part nobody else has. We can hire for token-economy or recovery — not just "they can ship." Game changer for senior IC roles.',
    'Daniel Okafor',
    'CTO',
    'Forge AI',
    'linear-gradient(135deg, #4B5563 0%, #1F2937 100%)',
    'landing',
    3
  )
on conflict do nothing;

insert into public.methodology_blocks (slug, surface, eyebrow, title, body_md, sort_order) values
  (
    'token-economy',
    'methodology',
    'Dimension 1',
    'Token Economy',
    'Output tokens per verified-correct unit of work. Lower means leaner. We measure raw output (no cache reads) divided by passing tests at submission. Score is normalized against the cohort attempting the same Brief.',
    1
  ),
  (
    'throughput',
    'methodology',
    'Dimension 2',
    'Throughput',
    'Wall-clock seconds from `start_attempt` to first verified-correct artifact. Penalizes stalling and over-thinking. Strong signal for "can ship under pressure."',
    2
  ),
  (
    'tool-choice-iq',
    'methodology',
    'Dimension 3',
    'Tool-Choice IQ',
    'Share of work done by deterministic tools (grep, ast-grep, type-check, run-tests) versus raw LLM generation. Senior engineers reach for grep before tokens. Computed from `gateway_calls.tool_calls`.',
    3
  ),
  (
    'recovery-index',
    'methodology',
    'Dimension 4',
    'Recovery Index',
    'How well you pivot when stuck. A dead-end pivot followed by a passing solution scores higher than a single linear path. We detect pivots via cosine distance between successive prompt prefixes.',
    4
  ),
  (
    'prompt-discipline',
    'methodology',
    'Dimension 5',
    'Prompt Discipline',
    'Instruction-block density per turn. Penalizes kitchen-sink prompts ("do everything in one go"). Computed from prompt token count divided by distinct instruction blocks.',
    5
  ),
  (
    'verification-rigor',
    'methodology',
    'Dimension 6',
    'Verification Rigor',
    'Self-check actions before declaring done — tests run, evals invoked, second opinions requested. Critical for trust on production-bound work.',
    6
  ),
  (
    'spend-vs-judgment',
    'methodology',
    'Dimension 7',
    'Spend vs Judgment',
    'When you spend tokens. Spend hard early then taper = mature judgment (high score). Uniform spend until budget runs out = poor judgment (low score). We compute a Gini-style coefficient over per-turn token spend.',
    7
  )
on conflict (slug) do nothing;
