-- Discovery Agent: discovered_projects table
create table public.discovered_projects (
  id uuid default gen_random_uuid() primary key,
  source text not null check (source in ('github', 'twitter', 'manual')),
  source_url text not null unique,
  title text not null,
  tagline text default '',
  description text default '',
  category text default 'web-apps',
  tech_stack text[] default '{}',
  demo_url text,
  repo_url text,
  -- GitHub metadata
  github_stars int default 0,
  github_language text,
  github_owner_login text,
  github_last_pushed_at timestamptz,
  github_repo_size_kb int default 0,
  -- Scoring
  quality_score int default 0 check (quality_score between 0 and 100),
  score_breakdown jsonb default '{}',
  -- Workflow
  status text default 'pending' check (status in ('pending','approved','rejected','claimed')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  claim_token text unique,
  claimed_by uuid references public.profiles(id),
  imported_project_id uuid references public.projects(id),
  discovered_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS (all writes go through admin client, so no policies needed for inserts/updates)
alter table public.discovered_projects enable row level security;

-- Only admins read via admin client; no public access needed
create policy "No public access to discovered projects"
  on public.discovered_projects for select using (false);

-- Indexes
create index idx_discovered_status on public.discovered_projects(status);
create index idx_discovered_score on public.discovered_projects(quality_score desc);
create index idx_discovered_claim_token on public.discovered_projects(claim_token) where claim_token is not null;
