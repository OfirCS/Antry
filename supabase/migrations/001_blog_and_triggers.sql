-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
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

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are viewable" ON public.blog_posts FOR SELECT USING (published = true);
CREATE INDEX idx_blog_published ON public.blog_posts(published, published_at DESC);

-- Participant count trigger (missing)
CREATE OR REPLACE FUNCTION public.update_participant_count()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.hackathons SET participant_count = participant_count + 1 WHERE id = NEW.hackathon_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.hackathons SET participant_count = participant_count - 1 WHERE id = OLD.hackathon_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_participant_change
  AFTER INSERT OR DELETE ON public.hackathon_participants
  FOR EACH ROW EXECUTE PROCEDURE public.update_participant_count();

-- Submission count trigger (missing)
CREATE OR REPLACE FUNCTION public.update_submission_count()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.hackathons SET submission_count = submission_count + 1 WHERE id = NEW.hackathon_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.hackathons SET submission_count = submission_count - 1 WHERE id = OLD.hackathon_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_submission_change
  AFTER INSERT OR DELETE ON public.hackathon_submissions
  FOR EACH ROW EXECUTE PROCEDURE public.update_submission_count();
