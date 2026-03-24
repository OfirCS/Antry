-- Antry Database Schema
-- Run this in the Supabase SQL editor after creating your project

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text not null,
  bio text default '',
  avatar_url text,
  gradient text default 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  skills text[] default '{}',
  github_url text,
  twitter_url text,
  website_url text,
  invite_code text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Projects
create table public.projects (
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

-- Project likes (many-to-many)
create table public.project_likes (
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (user_id, project_id)
);

-- Hackathons
create table public.hackathons (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  theme text not null,
  description text default '',
  status text not null default 'upcoming' check (status in ('active', 'upcoming', 'completed')),
  start_date date not null,
  end_date date not null,
  prizes jsonb default '[]',
  sponsors text[] default '{}',
  participant_count int default 0,
  submission_count int default 0,
  created_at timestamptz default now() not null
);

-- Hackathon participants
create table public.hackathon_participants (
  user_id uuid references public.profiles(id) on delete cascade not null,
  hackathon_id uuid references public.hackathons(id) on delete cascade not null,
  registered_at timestamptz default now() not null,
  primary key (user_id, hackathon_id)
);

-- Hackathon submissions
create table public.hackathon_submissions (
  id uuid default gen_random_uuid() primary key,
  hackathon_id uuid references public.hackathons(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  submitted_by uuid references public.profiles(id) on delete cascade not null,
  submitted_at timestamptz default now() not null,
  unique (hackathon_id, project_id)
);

-- Waitlist
create table public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_likes enable row level security;
alter table public.hackathons enable row level security;
alter table public.hackathon_participants enable row level security;
alter table public.hackathon_submissions enable row level security;
alter table public.waitlist enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Projects: anyone can read, only builder can modify
create policy "Projects are viewable by everyone" on public.projects for select using (true);
create policy "Users can create projects" on public.projects for insert with check (auth.uid() = builder_id);
create policy "Users can update own projects" on public.projects for update using (auth.uid() = builder_id);
create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = builder_id);

-- Project likes: anyone can read, authenticated users can like/unlike
create policy "Likes are viewable by everyone" on public.project_likes for select using (true);
create policy "Authenticated users can like" on public.project_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike" on public.project_likes for delete using (auth.uid() = user_id);

-- Hackathons: anyone can read (admin creates via dashboard/SQL)
create policy "Hackathons are viewable by everyone" on public.hackathons for select using (true);

-- Hackathon participants: anyone can read, authenticated can join/leave
create policy "Participants are viewable by everyone" on public.hackathon_participants for select using (true);
create policy "Authenticated users can register" on public.hackathon_participants for insert with check (auth.uid() = user_id);
create policy "Users can leave hackathons" on public.hackathon_participants for delete using (auth.uid() = user_id);

-- Hackathon submissions: anyone can read, only submitter can insert
create policy "Submissions are viewable by everyone" on public.hackathon_submissions for select using (true);
create policy "Authenticated users can submit" on public.hackathon_submissions for insert with check (auth.uid() = submitted_by);

-- Waitlist: anyone can insert (public signup)
create policy "Anyone can join waitlist" on public.waitlist for insert with check (true);
create policy "Waitlist is not publicly readable" on public.waitlist for select using (false);

-- Function: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, invite_code)
  values (
    new.id,
    lower(replace(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), ' ', '-')) || '-' || substr(new.id::text, 1, 4),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'invite_code'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: run on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function: update likes count
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
end;
$$ language plpgsql security definer;

create trigger on_like_change
  after insert or delete on public.project_likes
  for each row execute procedure public.update_likes_count();

-- Function: update participant count
create or replace function public.update_participant_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.hackathons set participant_count = participant_count + 1 where id = new.hackathon_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.hackathons set participant_count = participant_count - 1 where id = old.hackathon_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_participant_change
  after insert or delete on public.hackathon_participants
  for each row execute procedure public.update_participant_count();

-- Function: update submission count
create or replace function public.update_submission_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.hackathons set submission_count = submission_count + 1 where id = new.hackathon_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.hackathons set submission_count = submission_count - 1 where id = old.hackathon_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_submission_change
  after insert or delete on public.hackathon_submissions
  for each row execute procedure public.update_submission_count();

-- Blog posts
create table public.blog_posts (
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

alter table public.blog_posts enable row level security;
create policy "Published posts are viewable" on public.blog_posts for select using (published = true);

-- Indexes
create index idx_projects_builder on public.projects(builder_id);
create index idx_projects_category on public.projects(category);
create index idx_projects_created on public.projects(created_at desc);
create index idx_hackathons_status on public.hackathons(status);
create index idx_profiles_username on public.profiles(username);
create index idx_blog_published on public.blog_posts(published, published_at desc);
