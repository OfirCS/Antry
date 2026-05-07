-- Antry: hackathons + MCP attempt events
-- Migration 009
--
-- 1. `hackathons` — what /hackathons/new mints. References briefs by ID.
-- 2. `mcp_attempt_events` — the trace bundle from the MCP lifecycle tools.
--    Distinct from gateway_calls (which is for instrumented Lab telemetry —
--    per-LLM-call shape with input/output tokens). MCP events are higher
--    level: prompt | tool_call | file_edit | pivot | note.
--
-- Both tables use sane RLS. Service role bypasses for system-level writes
-- (the MCP gateway acts on the user's behalf with the bearer token).

-- ── Hackathons ─────────────────────────────────────────
create table if not exists public.hackathons (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  vibe text not null check (vibe in ('speedrun','build-night','weekend-mode','agent-cup')),
  duration_hours int not null check (duration_hours between 1 and 168),
  prize text default '',
  brief_ids uuid[] not null default '{}',
  host_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'live' check (status in ('draft','live','closed')),
  created_at timestamptz default now() not null,
  closed_at timestamptz
);

create index if not exists idx_hackathons_status_created
  on public.hackathons(status, created_at desc);
create index if not exists idx_hackathons_host
  on public.hackathons(host_user_id) where host_user_id is not null;

alter table public.hackathons enable row level security;

create policy "Live hackathons are public"
  on public.hackathons for select using (status = 'live');

create policy "Hosts read their own"
  on public.hackathons for select using (host_user_id = auth.uid());

create policy "Hosts manage their own"
  on public.hackathons for update using (host_user_id = auth.uid());

create policy "Authenticated users can create hackathons"
  on public.hackathons for insert with check (host_user_id = auth.uid());

-- ── MCP attempt events ─────────────────────────────────
-- Persistence target for the /api/mcp lifecycle tools.
-- One row per log_event call. Strict ordering via (attempt_id, seq).
create table if not exists public.mcp_attempt_events (
  id uuid default gen_random_uuid() primary key,
  attempt_id uuid references public.brief_attempts(id) on delete cascade not null,
  seq int not null,
  type text not null check (type in ('prompt','tool_call','file_edit','pivot','note')),
  payload jsonb default '{}'::jsonb,
  signature text,
  created_at timestamptz default now() not null,
  unique (attempt_id, seq)
);

create index if not exists idx_mcp_events_attempt
  on public.mcp_attempt_events(attempt_id, seq);

alter table public.mcp_attempt_events enable row level security;

create policy "Builders read their own MCP events"
  on public.mcp_attempt_events for select using (
    exists (
      select 1 from public.brief_attempts ba
      where ba.id = mcp_attempt_events.attempt_id
        and ba.builder_id = auth.uid()
    )
  );

-- Service role inserts via the gateway; no anon-side insert policy.
