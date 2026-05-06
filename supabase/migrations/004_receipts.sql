-- Antry Receipts
-- Hiring evaluation primitive: companies post Briefs, builders attempt them in
-- the instrumented Lab, and the gateway-signed telemetry mints an immutable
-- Receipt artifact with a Builder Fingerprint (multi-dimensional radar).

-- ── Companies (multi-tenant tenant model) ──────────────
create table public.companies (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  logo_url text,
  description text default '',
  plan text not null default 'starter' check (plan in ('starter','growth','enterprise')),
  monthly_token_budget int default 1000000,
  hmac_secret text,
  sponsor_color text default '#C6F135',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.company_members (
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'reviewer' check (role in ('owner','admin','reviewer')),
  joined_at timestamptz default now() not null,
  primary key (company_id, user_id)
);

-- ── Briefs (the assignment) ────────────────────────────
create table public.briefs (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  slug text unique not null,
  version int default 1,
  title text not null,
  tagline text default '',
  prompt_md text not null,
  rubric_json jsonb default '{}',
  hold_out_test_json jsonb default '{}',
  allowed_tools text[] default '{}',
  difficulty text default 'mid' check (difficulty in ('intro','mid','senior','staff')),
  category text default 'ai-agents',
  token_cap int default 50000,
  time_cap_seconds int default 3600,
  sponsor_label text default '',
  status text not null default 'draft' check (status in ('draft','live','closed')),
  mode text not null default 'public' check (mode in ('public','private')),
  attempts_count int default 0,
  receipts_count int default 0,
  median_score int,
  created_at timestamptz default now() not null,
  closed_at timestamptz,
  updated_at timestamptz default now() not null
);

create index idx_briefs_status on public.briefs(status, created_at desc);
create index idx_briefs_company on public.briefs(company_id);

-- ── Brief invitations (private mode) ───────────────────
create table public.brief_invitations (
  id uuid default gen_random_uuid() primary key,
  brief_id uuid references public.briefs(id) on delete cascade not null,
  email text not null,
  token text unique not null,
  invited_at timestamptz default now() not null,
  accepted_at timestamptz
);

-- ── Brief attempts (a builder's run of a brief) ────────
create table public.brief_attempts (
  id uuid default gen_random_uuid() primary key,
  brief_id uuid references public.briefs(id) on delete cascade not null,
  builder_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'in_progress'
    check (status in ('in_progress','completed','timed_out','budget_exceeded','abandoned')),
  started_at timestamptz default now() not null,
  ended_at timestamptz,
  lab_session_token_hash text,
  raw_telemetry_uri text,
  tokens_spent int default 0,
  cost_usd_cents int default 0,
  notes text default ''
);

create index idx_attempts_builder on public.brief_attempts(builder_id, started_at desc);
create index idx_attempts_brief on public.brief_attempts(brief_id, status);

-- ── Gateway calls (raw telemetry) ──────────────────────
create table public.gateway_calls (
  id uuid default gen_random_uuid() primary key,
  attempt_id uuid references public.brief_attempts(id) on delete cascade not null,
  turn_index int not null,
  model text not null,
  input_tokens int not null,
  output_tokens int not null,
  cache_read_tokens int default 0,
  cache_creation_tokens int default 0,
  cost_usd_cents int default 0,
  tool_calls jsonb default '[]',
  prompt_prefix_hash text,
  response_hash text,
  receipt_signature text,
  latency_ms int,
  created_at timestamptz default now() not null
);

create index idx_gateway_attempt on public.gateway_calls(attempt_id, turn_index);

-- ── Receipts (immutable artifact) ──────────────────────
create table public.receipts (
  id uuid default gen_random_uuid() primary key,
  attempt_id uuid references public.brief_attempts(id) on delete cascade unique not null,
  builder_id uuid references public.profiles(id) on delete cascade not null,
  brief_id uuid references public.briefs(id) on delete cascade not null,
  fingerprint jsonb not null,
  composite_score int not null check (composite_score between 0 and 100),
  trace_visibility text not null default 'redacted'
    check (trace_visibility in ('public','redacted','company-only')),
  display_visibility text not null default 'public'
    check (display_visibility in ('public','unlisted','private')),
  content_hash text unique not null,
  signed_at timestamptz default now() not null,
  signature text not null
);

create index idx_receipts_builder on public.receipts(builder_id, signed_at desc);
create index idx_receipts_brief on public.receipts(brief_id, composite_score desc);

-- ── Triggers: keep counters fresh ──────────────────────
create or replace function public.bump_brief_attempts_count()
returns trigger as $$
begin
  if new.status = 'in_progress' then
    update public.briefs set attempts_count = attempts_count + 1 where id = new.brief_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_bump_brief_attempts
  after insert on public.brief_attempts
  for each row execute function public.bump_brief_attempts_count();

create or replace function public.bump_brief_receipts_count()
returns trigger as $$
begin
  update public.briefs set receipts_count = receipts_count + 1 where id = new.brief_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_bump_brief_receipts
  after insert on public.receipts
  for each row execute function public.bump_brief_receipts_count();

-- ── RLS ────────────────────────────────────────────────
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.briefs enable row level security;
alter table public.brief_invitations enable row level security;
alter table public.brief_attempts enable row level security;
alter table public.gateway_calls enable row level security;
alter table public.receipts enable row level security;

-- Companies: public read of name/slug/logo for marketing; admin write only
create policy "Companies are viewable by everyone"
  on public.companies for select using (true);

-- Briefs: public-mode briefs readable by anyone; private-mode only company members + invited
create policy "Public briefs are viewable by everyone"
  on public.briefs for select using (mode = 'public' and status in ('live','closed'));

create policy "Company members can read their briefs"
  on public.briefs for select using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = briefs.company_id and cm.user_id = auth.uid()
    )
  );

-- Brief attempts: builder reads own + company reads attempts on its briefs
create policy "Builders read own attempts"
  on public.brief_attempts for select using (builder_id = auth.uid());

create policy "Builders insert own attempts"
  on public.brief_attempts for insert with check (builder_id = auth.uid());

create policy "Builders update own attempts"
  on public.brief_attempts for update using (builder_id = auth.uid());

create policy "Company members read attempts on their briefs"
  on public.brief_attempts for select using (
    exists (
      select 1 from public.briefs b
      join public.company_members cm on cm.company_id = b.company_id
      where b.id = brief_attempts.brief_id and cm.user_id = auth.uid()
    )
  );

-- Gateway calls: builder reads own + company reads on their briefs (admin writes)
create policy "Builders read own gateway calls"
  on public.gateway_calls for select using (
    exists (
      select 1 from public.brief_attempts ba
      where ba.id = gateway_calls.attempt_id and ba.builder_id = auth.uid()
    )
  );

-- Receipts: public reads if display_visibility is public; otherwise builder/company
create policy "Public receipts are viewable by everyone"
  on public.receipts for select using (display_visibility = 'public');

create policy "Builders read own receipts"
  on public.receipts for select using (builder_id = auth.uid());

create policy "Company members read receipts on their briefs"
  on public.receipts for select using (
    exists (
      select 1 from public.briefs b
      join public.company_members cm on cm.company_id = b.company_id
      where b.id = receipts.brief_id and cm.user_id = auth.uid()
    )
  );

-- Builder controls their own receipt visibility
create policy "Builders update own receipt visibility"
  on public.receipts for update using (builder_id = auth.uid());

-- Brief invitations: only the invited email + company members (admin writes only)
create policy "Company members read brief invitations"
  on public.brief_invitations for select using (
    exists (
      select 1 from public.briefs b
      join public.company_members cm on cm.company_id = b.company_id
      where b.id = brief_invitations.brief_id and cm.user_id = auth.uid()
    )
  );

-- Company members: read for self, admin writes only
create policy "Members read own membership"
  on public.company_members for select using (user_id = auth.uid());
