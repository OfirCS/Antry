-- Antry: posts (the social feed primitive)
-- Migration 010
--
-- The feed reads from this table. Denormalized author columns so feed
-- queries don't need a profiles join (most-read table on the platform).
-- Foreign keys link a post to its underlying artifact (Receipt / Brief /
-- Hackathon) so click-throughs are real.

create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references auth.users(id) on delete cascade,

  -- Denormalized for feed read perf (avoids profile join on every read)
  author_username text not null,
  author_name text not null,
  author_gradient text default 'linear-gradient(135deg, #C6F135 0%, #8AB91D 100%)',

  kind text not null check (
    kind in ('receipt','hack-win','hack-launch','build','ship','discuss')
  ),
  verb text not null default 'posted',
  headline text not null check (length(headline) between 1 and 200),
  subtext text default '',
  href text default '',
  badges text[] default '{}',
  metric_label text,
  metric_value text,

  receipt_id uuid references public.receipts(id) on delete set null,
  brief_id uuid references public.briefs(id) on delete set null,
  hackathon_id uuid references public.hackathons(id) on delete set null,

  likes_count int default 0,
  comments_count int default 0,

  created_at timestamptz default now() not null
);

create index if not exists idx_posts_created
  on public.posts(created_at desc);
create index if not exists idx_posts_author
  on public.posts(author_id, created_at desc);
create index if not exists idx_posts_kind
  on public.posts(kind, created_at desc);

alter table public.posts enable row level security;

create policy "Posts are public"
  on public.posts for select using (true);

create policy "Authenticated users can post"
  on public.posts for insert with check (author_id = auth.uid());

create policy "Authors update own posts"
  on public.posts for update using (author_id = auth.uid());

create policy "Authors delete own posts"
  on public.posts for delete using (author_id = auth.uid());
