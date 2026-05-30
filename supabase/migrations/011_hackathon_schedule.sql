-- Antry: hackathon schedule (starts_at / ends_at)
-- Migration 011
--
-- The launcher's step 2 lets hosts schedule a start time. Until now, a
-- hackathon was implicitly "starts at created_at, ends at created_at +
-- duration_hours". This migration makes the window explicit so the
-- /h/[slug] landing can render an accurate countdown and so "scheduled
-- for later" hackathons can exist before they go live.
--
-- Both columns are nullable. `starts_at = null` means "starts immediately
-- on create" (interpreted at read time as created_at). `ends_at = null`
-- means "open-ended / no deadline" (the landing renders "started Xh ago"
-- instead of "ends in Xh Ym").

alter table public.hackathons
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz;

-- Index for "what's live right now" queries used by the public catalog.
create index if not exists idx_hackathons_window
  on public.hackathons(starts_at, ends_at)
  where status = 'live';
