-- Antry: performance indexes + collision-safe signup trigger
-- Migration 010
--
-- 1. Adds four missing indexes that back hot read paths:
--    - profiles.created_at desc  — "newest builders" feeds / admin listing.
--    - profiles.updated_at       — sync / "recently active" queries.
--    - project_likes.project_id  — the like-count trigger and per-project
--      like lookups currently sequential-scan this table.
--    - projects (builder_id, category) — composite for the common
--      "this builder's projects in category X" filter; the existing
--      single-column indexes can't serve it efficiently.
-- 2. Replaces handle_new_user() with a collision-safe username generator.
--    The previous version appended only the first 4 hex chars of the user
--    id, which can collide for users sharing a display name. The new
--    version retries against the profiles.username unique constraint.
--
-- All index creates use `if not exists` so the migration is idempotent.

-- ── Indexes ────────────────────────────────────────────
create index if not exists idx_profiles_created
  on public.profiles(created_at desc);

create index if not exists idx_profiles_updated
  on public.profiles(updated_at desc);

create index if not exists idx_project_likes_project
  on public.project_likes(project_id);

create index if not exists idx_projects_builder_category
  on public.projects(builder_id, category);

-- ── Collision-safe signup trigger ──────────────────────
-- Generates a unique username by sanitizing the display name into a slug
-- and, on collision, retrying with an incrementing numeric suffix. The
-- profiles.username unique constraint is the source of truth, so this is
-- safe even under concurrent signups.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_slug text;
  candidate text;
  suffix int := 0;
begin
  base_slug := lower(coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    split_part(new.email, '@', 1)
  ));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '(^-+|-+$)', '', 'g');
  base_slug := left(base_slug, 24);
  if base_slug = '' then
    base_slug := 'builder';
  end if;

  candidate := base_slug;
  loop
    begin
      insert into public.profiles (id, username, full_name, invite_code)
      values (
        new.id,
        candidate,
        coalesce(
          nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
          split_part(new.email, '@', 1)
        ),
        new.raw_user_meta_data->>'invite_code'
      );
      exit; -- insert succeeded
    exception when unique_violation then
      -- A row for new.id already exists → nothing to do (idempotent).
      if exists (select 1 from public.profiles where id = new.id) then
        exit;
      end if;
      -- Otherwise the username collided; advance the suffix and retry.
      suffix := suffix + 1;
      candidate := base_slug || '-' || suffix::text;
    end;
  end loop;

  return new;
end;
$$ language plpgsql security definer;
