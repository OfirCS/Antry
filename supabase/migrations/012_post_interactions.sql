-- Antry: post interactions (likes + comments)
-- Migration 012
--
-- Engagement is the feedback loop that keeps the network alive. We optimize
-- for anonymous-friendly engagement first (most visitors won't be signed in
-- for their first 5 minutes) and let the same tables carry real auth.uid()
-- engagement once the user signs up.
--
-- Identity model:
--   Authenticated → user_id is the auth.uid(), anon_id is null.
--   Anonymous     → user_id is null, anon_id is the value of the cookie
--                   `antry_anon_id` (set server-side on first interaction).
-- Uniqueness on (post_id, COALESCE(user_id::text, anon_id)) prevents
-- double-likes from the same identity.

-- ── post_likes ────────────────────────────────────────
create table if not exists public.post_likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  anon_id text,
  created_at timestamptz default now() not null,

  -- Exactly one of user_id / anon_id must be set
  constraint post_likes_identity check (
    (user_id is not null and anon_id is null) or
    (user_id is null and anon_id is not null)
  )
);

-- One like per identity per post (covers both authed + anon paths)
create unique index if not exists uq_post_likes_authed
  on public.post_likes(post_id, user_id)
  where user_id is not null;

create unique index if not exists uq_post_likes_anon
  on public.post_likes(post_id, anon_id)
  where anon_id is not null;

create index if not exists idx_post_likes_post
  on public.post_likes(post_id, created_at desc);

alter table public.post_likes enable row level security;

create policy "Likes are public read"
  on public.post_likes for select using (true);

-- Likes get inserted via the API route (server uses service role); we still
-- allow self-managed authed insert/delete via RLS for future direct writes.
create policy "Authed users can like"
  on public.post_likes for insert
  with check (user_id = auth.uid());

create policy "Authed users can unlike own"
  on public.post_likes for delete
  using (user_id = auth.uid());

-- ── post_comments ─────────────────────────────────────
create table if not exists public.post_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid references auth.users(id) on delete cascade,
  author_anon_name text,
  author_anon_id text,
  text text not null check (length(text) between 1 and 1000),
  created_at timestamptz default now() not null,

  -- Either an authed author or an anonymous handle/id pair
  constraint post_comments_identity check (
    (author_id is not null) or
    (author_anon_name is not null and author_anon_id is not null)
  )
);

create index if not exists idx_post_comments_post
  on public.post_comments(post_id, created_at desc);

alter table public.post_comments enable row level security;

create policy "Comments are public read"
  on public.post_comments for select using (true);

create policy "Authed users can comment"
  on public.post_comments for insert
  with check (author_id = auth.uid());

create policy "Authors delete own comments"
  on public.post_comments for delete
  using (author_id = auth.uid());

-- ── Keep posts.likes_count / comments_count in sync ───
-- Triggers maintain the denormalized counts on the posts table so feed
-- queries never have to aggregate.
create or replace function public.bump_post_likes_count()
returns trigger language plpgsql as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts
      set likes_count = coalesce(likes_count, 0) + 1
      where id = NEW.post_id;
    return NEW;
  elsif (TG_OP = 'DELETE') then
    update public.posts
      set likes_count = greatest(coalesce(likes_count, 0) - 1, 0)
      where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end $$;

drop trigger if exists trg_post_likes_count on public.post_likes;
create trigger trg_post_likes_count
  after insert or delete on public.post_likes
  for each row execute function public.bump_post_likes_count();

create or replace function public.bump_post_comments_count()
returns trigger language plpgsql as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts
      set comments_count = coalesce(comments_count, 0) + 1
      where id = NEW.post_id;
    return NEW;
  elsif (TG_OP = 'DELETE') then
    update public.posts
      set comments_count = greatest(coalesce(comments_count, 0) - 1, 0)
      where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end $$;

drop trigger if exists trg_post_comments_count on public.post_comments;
create trigger trg_post_comments_count
  after insert or delete on public.post_comments
  for each row execute function public.bump_post_comments_count();
