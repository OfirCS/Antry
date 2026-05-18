-- 011_restore_feed_tables.sql
--
-- Recreate the builder-feed tables the current app code depends on.
-- `drop_legacy_tables` (migration 20260507180500) removed these as
-- "pre-pivot legacy", but the working codebase still actively queries them:
-- dashboard, discover, claim-card, projects/[id], projects/[id]/edit,
-- lib/recommendations.ts, lib/discovery/importer.ts.
--
-- Purely additive and idempotent — no existing table or data is touched,
-- safe to re-run. NOTE: hackathon_participants / hackathon_submissions are
-- intentionally NOT recreated here — the live `hackathons` table is the
-- newer m009 model (no participant_count/submission_count columns), so the
-- old schema.sql count triggers would fail against it. That subsystem needs
-- a separate decision.

-- ── projects ─────────────────────────────────────────
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  builder_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  tagline text not null,
  description text default '',
  category text not null default 'web-apps',
  tech_stack text[] default '{}',
  demo_url text,
  source_url text,
  gradient text default 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  build_time text default '',
  likes_count int default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ── project_likes ────────────────────────────────────
create table if not exists public.project_likes (
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (user_id, project_id)
);

-- ── waitlist ─────────────────────────────────────────
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now() not null
);

-- ── blog_posts ───────────────────────────────────────
create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null,
  category text not null default 'Product',
  read_time text default '5 min',
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now() not null
);

-- ── Row Level Security ───────────────────────────────
alter table public.projects enable row level security;
alter table public.project_likes enable row level security;
alter table public.waitlist enable row level security;
alter table public.blog_posts enable row level security;

drop policy if exists "Projects are viewable by everyone" on public.projects;
create policy "Projects are viewable by everyone" on public.projects for select using (true);
drop policy if exists "Users can create projects" on public.projects;
create policy "Users can create projects" on public.projects for insert with check (auth.uid() = builder_id);
drop policy if exists "Users can update own projects" on public.projects;
create policy "Users can update own projects" on public.projects for update using (auth.uid() = builder_id);
drop policy if exists "Users can delete own projects" on public.projects;
create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = builder_id);

drop policy if exists "Likes are viewable by everyone" on public.project_likes;
create policy "Likes are viewable by everyone" on public.project_likes for select using (true);
drop policy if exists "Authenticated users can like" on public.project_likes;
create policy "Authenticated users can like" on public.project_likes for insert with check (auth.uid() = user_id);
drop policy if exists "Users can unlike" on public.project_likes;
create policy "Users can unlike" on public.project_likes for delete using (auth.uid() = user_id);

drop policy if exists "Anyone can join waitlist" on public.waitlist;
create policy "Anyone can join waitlist" on public.waitlist for insert with check (true);
drop policy if exists "Waitlist is not publicly readable" on public.waitlist;
create policy "Waitlist is not publicly readable" on public.waitlist for select using (false);

drop policy if exists "Published posts are viewable" on public.blog_posts;
create policy "Published posts are viewable" on public.blog_posts for select using (published = true);

-- ── likes_count trigger ──────────────────────────────
create or replace function public.update_likes_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.projects set likes_count = likes_count + 1 where id = new.project_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.projects set likes_count = likes_count - 1 where id = old.project_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_like_change on public.project_likes;
create trigger on_like_change
  after insert or delete on public.project_likes
  for each row execute procedure public.update_likes_count();

-- ── Indexes ──────────────────────────────────────────
create index if not exists idx_projects_builder on public.projects(builder_id);
create index if not exists idx_projects_category on public.projects(category);
create index if not exists idx_projects_created on public.projects(created_at desc);
create index if not exists idx_blog_published on public.blog_posts(published, published_at desc);
