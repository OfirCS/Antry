-- ============================================================
-- Antry Seed Data
-- ============================================================
-- This file contains demo/development seed data.
--
-- Usage:
--   1. First run schema.sql (or the migration) to create tables
--   2. Then run this file: psql -f supabase/seed.sql
--   Or paste into the Supabase SQL editor.
--
-- NOTE: Profile IDs are fixed UUIDs for development/demo purposes.
-- In production, profiles are auto-created by the auth trigger.
-- These IDs do NOT correspond to real auth.users entries —
-- if you need them to work with auth, create matching auth.users first
-- or temporarily disable the foreign key on profiles.
-- ============================================================

-- ── Profiles (Builders) ──────────────────────────────────

INSERT INTO public.profiles (id, username, full_name, bio, gradient, skills, github_url, twitter_url, website_url, created_at) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'marachen', 'Mara Chen', 'AI engineer obsessed with autonomous agents. Previously at DeepMind. I build things that think.', 'linear-gradient(135deg, #27272a 0%, #09090b 100%)', ARRAY['Python', 'LangChain', 'TypeScript', 'RAG', 'Multi-agent systems'], 'marachen', 'marachenai', 'marachen.dev', '2026-01-15T00:00:00Z'),
  ('a1000000-0000-0000-0000-000000000002', 'jaketorres', 'Jake Torres', 'Full-stack builder. I ship fast and break conventions. Currently exploring real-time collaboration.', 'linear-gradient(135deg, #404040 0%, #171717 100%)', ARRAY['React', 'Next.js', 'Node.js', 'WebSockets', 'Postgres'], 'jaketorres', 'jake_ships', NULL, '2026-01-22T00:00:00Z'),
  ('a1000000-0000-0000-0000-000000000003', 'aishapatel', 'Aisha Patel', 'Design engineer who believes interfaces should feel like art. Bridging aesthetics and engineering.', 'linear-gradient(135deg, #374151 0%, #111827 100%)', ARRAY['React', 'Figma', 'Three.js', 'Framer Motion', 'CSS'], 'aishapatel', 'aisha_designs', 'aishapatel.design', '2026-02-01T00:00:00Z'),
  ('a1000000-0000-0000-0000-000000000004', 'leokim', 'Leo Kim', 'Systems thinker. I make infrastructure invisible and developer tools delightful.', 'linear-gradient(135deg, #334155 0%, #0f172a 100%)', ARRAY['Go', 'Rust', 'Terraform', 'Kubernetes', 'CLI'], 'leokim', NULL, NULL, '2026-02-10T00:00:00Z'),
  ('a1000000-0000-0000-0000-000000000005', 'sofiarivera', 'Sofia Rivera', 'ML engineer turning research papers into products people actually use. Data is my medium.', 'linear-gradient(135deg, #18181b 0%, #000000 100%)', ARRAY['Python', 'PyTorch', 'FastAPI', 'Pandas', 'Streamlit'], 'sofiarivera', 'sofia_ml', 'sofiarivera.io', '2026-02-18T00:00:00Z'),
  ('a1000000-0000-0000-0000-000000000006', 'omarhassan', 'Omar Hassan', 'Mobile-first builder. If it does not work on a phone, it does not work. Cross-platform everything.', 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)', ARRAY['React Native', 'Swift', 'Kotlin', 'Firebase', 'Expo'], 'omarhassan', 'omar_builds', NULL, '2026-03-01T00:00:00Z'),
  ('a1000000-0000-0000-0000-000000000007', 'ofirsela', 'Ofir Sela', 'Founder of Antry. Obsessed with creating the platform where builders are discovered by what they ship, not what they say.', 'linear-gradient(135deg, #262626 0%, #171717 100%)', ARRAY['Next.js', 'TypeScript', 'Supabase', 'Product', 'AI Agents'], 'OfirCS', 'ofirsela', NULL, '2026-01-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ── Hackathons ───────────────────────────────────────────

INSERT INTO public.hackathons (id, title, theme, description, status, start_date, end_date, prizes, sponsors, participant_count, submission_count) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Build with AI Agents', 'Autonomous agents that solve real problems', 'Design and build an AI agent that autonomously solves a real-world problem. From code review to customer support to data analysis — show us what agents can do when given the right tools. Judged on creativity, technical depth, and real-world utility.', 'upcoming', '2026-04-05', '2026-04-07', '[{"place":"1st","reward":"$5,000"},{"place":"2nd","reward":"$2,500"},{"place":"3rd","reward":"$1,000"},{"place":"Best solo ant","reward":"$500"}]'::jsonb, ARRAY['Anthropic', 'Vercel', 'Supabase'], 0, 0),
  ('b1000000-0000-0000-0000-000000000002', 'Ship in 48 Hours', 'From zero to deployed in a single weekend', 'The ultimate speed challenge. Build and deploy a complete product in 48 hours. No pre-built code allowed. Judged on polish, functionality, and how fast you shipped. Bonus points for solo ants.', 'active', '2026-03-22', '2026-03-24', '[{"place":"1st","reward":"$3,000"},{"place":"2nd","reward":"$1,500"},{"place":"Best design","reward":"$750"}]'::jsonb, ARRAY['Vercel', 'Neon'], 47, 12),
  ('b1000000-0000-0000-0000-000000000003', 'Open Source Sprint', 'Build something the colony can use forever', 'Create an open-source tool, library, or framework that solves a common developer pain point. Must be published on GitHub with proper documentation, CI, and a README that makes contributors want to jump in.', 'completed', '2026-02-15', '2026-02-17', '[{"place":"1st","reward":"$2,000"},{"place":"2nd","reward":"$1,000"},{"place":"Most stars (30 days)","reward":"$500"}]'::jsonb, ARRAY['GitHub', 'Cloudflare'], 83, 34)
ON CONFLICT (id) DO NOTHING;

-- ── Projects ─────────────────────────────────────────────

INSERT INTO public.projects (id, builder_id, title, tagline, description, category, tech_stack, demo_url, source_url, gradient, build_time, likes_count, created_at) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Sentinel', 'AI code reviewer that catches what linters miss', 'Sentinel is an autonomous code review agent that analyzes pull requests for logic errors, security vulnerabilities, and architectural anti-patterns. It integrates with GitHub Actions and provides inline suggestions with explanations. Built with a multi-agent pipeline: one agent reads the diff, another checks against project conventions, and a third synthesizes the review.', 'ai-agents', ARRAY['Python', 'LangChain', 'Claude API', 'GitHub Actions', 'FastAPI'], 'https://sentinel-demo.vercel.app', 'https://github.com/marachen/sentinel', 'linear-gradient(135deg, #262626 0%, #171717 100%)', '3 weeks', 142, '2026-02-20T00:00:00Z'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Flowstate', 'Collaborative whiteboard that thinks with you', 'A real-time collaborative whiteboard with AI-powered features: auto-layout for messy diagrams, smart grouping, and an assistant that can generate wireframes from text descriptions. Supports unlimited canvas, sticky notes, drawing tools, and live cursors. Built for distributed teams that think visually.', 'web-apps', ARRAY['Next.js', 'WebSockets', 'Canvas API', 'Postgres', 'Liveblocks'], 'https://flowstate.app', 'https://github.com/jaketorres/flowstate', 'linear-gradient(135deg, #404040 0%, #171717 100%)', '5 weeks', 98, '2026-03-01T00:00:00Z'),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'Chrono', 'Time tracking from the terminal, finally done right', 'A beautiful CLI time tracker that respects your workflow. Start/stop timers with simple commands, auto-detect project context from git, generate invoices in PDF, and sync with popular project management tools. Includes a TUI dashboard with charts built entirely in the terminal.', 'tools', ARRAY['Go', 'Bubble Tea', 'SQLite', 'Lip Gloss'], 'https://chrono-cli.dev', NULL, 'linear-gradient(135deg, #334155 0%, #0f172a 100%)', '2 weeks', 76, '2026-02-28T00:00:00Z'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'Palette', 'AI color systems that actually look good', 'Generate complete design system color palettes from a single seed color or a mood description. Palette understands color theory, accessibility contrast ratios, and modern design trends. Export to Figma, Tailwind config, CSS variables, or Swift. Used by 2,000+ designers.', 'design', ARRAY['React', 'Three.js', 'WebGL', 'Framer Motion', 'Vercel'], 'https://palette.aishapatel.design', NULL, 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)', '10 days', 231, '2026-02-14T00:00:00Z'),
  ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'Nomad', 'Your AI travel planner that learns your vibe', 'Nomad builds personalized travel itineraries by learning your preferences over time. Tell it what you liked about past trips, and it suggests destinations, restaurants, and activities that match your style. Integrates with Google Maps, fetches real-time prices, and exports clean PDF itineraries.', 'ai-agents', ARRAY['Python', 'FastAPI', 'Claude API', 'Streamlit', 'Supabase'], 'https://nomad-travel.vercel.app', NULL, 'linear-gradient(135deg, #262626 0%, #171717 100%)', '4 weeks', 89, '2026-03-10T00:00:00Z'),
  ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 'Pulse', 'Real-time health metrics on your wrist and screen', 'A cross-platform health dashboard that syncs with Apple Watch, Fitbit, and Garmin. Visualizes heart rate, sleep, activity, and nutrition data in beautiful real-time charts. Includes AI insights that spot patterns in your data and suggest lifestyle adjustments.', 'mobile', ARRAY['React Native', 'Expo', 'HealthKit', 'D3.js', 'Firebase'], 'https://pulse-health.app', NULL, 'linear-gradient(135deg, #404040 0%, #171717 100%)', '6 weeks', 64, '2026-03-05T00:00:00Z'),
  ('c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'Scribe', 'Voice notes to structured docs in seconds', 'Record a voice memo and Scribe turns it into clean, structured documentation. It understands context, adds formatting, creates code blocks from verbal descriptions, and organizes content into sections. Perfect for capturing architecture decisions on the go.', 'ai-agents', ARRAY['TypeScript', 'Whisper API', 'Claude API', 'Next.js', 'Vercel'], 'https://scribe-ai.vercel.app', 'https://github.com/marachen/scribe', 'linear-gradient(135deg, #334155 0%, #0f172a 100%)', '2 weeks', 117, '2026-03-08T00:00:00Z'),
  ('c1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004', 'Terraform Studio', 'Visual infrastructure as code, no YAML required', 'Drag-and-drop cloud architecture builder that generates production-ready Terraform configurations. Supports AWS, GCP, and Azure. Auto-detects resource dependencies, estimates monthly costs, and validates configurations before you apply. Makes infrastructure visual for the first time.', 'tools', ARRAY['React', 'Go', 'Terraform', 'D3.js', 'Docker'], 'https://tf-studio.dev', NULL, 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)', '8 weeks', 203, '2026-01-30T00:00:00Z'),
  ('c1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000003', 'Mood', 'Music that matches how you feel, not what is trending', 'An emotion-aware music player that curates playlists based on your current mood, time of day, and listening history. Uses facial expression analysis (optional) and text input to understand your emotional state. Features a stunning 3D audio visualizer.', 'design', ARRAY['React', 'Web Audio API', 'Three.js', 'Spotify API', 'TensorFlow.js'], 'https://mood-player.vercel.app', NULL, 'linear-gradient(135deg, #262626 0%, #171717 100%)', '3 weeks', 156, '2026-03-12T00:00:00Z'),
  ('c1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002', 'Relay', 'API mocking that keeps up with your schema', 'A smart API mock server that auto-generates realistic fake data from your OpenAPI spec. Supports GraphQL and REST. Hot-reloads when your spec changes. Includes a dashboard to inspect mock responses and simulate error states for frontend testing.', 'tools', ARRAY['Node.js', 'Express', 'Faker.js', 'OpenAPI', 'Docker'], 'https://relay-mock.dev', 'https://github.com/jaketorres/relay', 'linear-gradient(135deg, #404040 0%, #171717 100%)', '10 days', 88, '2026-02-05T00:00:00Z'),
  ('c1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000001', 'Aether', 'Multi-agent orchestration made simple', 'A framework for building multi-agent AI systems with a simple declarative API. Define agents, their tools, and communication patterns in YAML. Aether handles orchestration, state management, and observability. Includes a real-time dashboard showing agent interactions.', 'ai-agents', ARRAY['Python', 'Claude API', 'Redis', 'React', 'WebSockets'], 'https://aether-agents.dev', 'https://github.com/marachen/aether', 'linear-gradient(135deg, #334155 0%, #0f172a 100%)', '6 weeks', 184, '2026-01-20T00:00:00Z'),
  ('c1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000007', 'Wealthy', 'AI-powered financial pathfinder for smart investing', 'Wealthy is an AI-powered financial tool that helps users navigate investment decisions with a smart Pathfinder feature. It analyzes market trends, personal risk profiles, and financial goals to create personalized investment strategies. Features include real-time portfolio tracking, AI-driven insights, and an intuitive dashboard.', 'ai-agents', ARRAY['Next.js', 'TypeScript', 'AI Agents', 'Supabase', 'Tailwind CSS'], 'https://cap.so/s/9evpv4n3m2vpcgg', NULL, 'linear-gradient(135deg, #404040 0%, #171717 100%)', '4 weeks', 47, '2026-03-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ── Hackathon Participants ───────────────────────────────
-- Based on antathonIds in mock data:
-- Mara Chen (b1): h1, h3
-- Jake Torres (b2): h2
-- Aisha Patel (b3): h2, h3
-- Leo Kim (b4): h3
-- Sofia Rivera (b5): h1
-- Omar Hassan (b6): (none)
-- Ofir Sela (b7): (none)

INSERT INTO public.hackathon_participants (user_id, hackathon_id) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003'),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002'),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002'),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003'),
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003'),
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ── Hackathon Submissions ────────────────────────────────
-- Projects with antathonId in mock data:
-- Flowstate (p2) -> h2 (Ship in 48 Hours)
-- Chrono (p3) -> h3 (Open Source Sprint)
-- Palette (p4) -> h3 (Open Source Sprint)
-- Mood (p9) -> h2 (Ship in 48 Hours)

INSERT INTO public.hackathon_submissions (hackathon_id, project_id, submitted_by) VALUES
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- ── Project Likes ────────────────────────────────────────
-- Some sample likes to demonstrate the feature

INSERT INTO public.project_likes (user_id, project_id) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002'),
  ('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002'),
  ('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000008'),
  ('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000008'),
  ('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000008'),
  ('a1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000011'),
  ('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000011'),
  ('a1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000011'),
  ('a1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000008'),
  ('a1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000011')
ON CONFLICT DO NOTHING;

-- ── Blog Posts ───────────────────────────────────────────

INSERT INTO public.blog_posts (slug, title, excerpt, content, category, read_time, published, published_at) VALUES
  (
    'why-we-built-antry',
    'Why we built Antry',
    'Resumes are broken. We asked: what if builders could be discovered by what they ship, not what they say? Here''s the story behind Antry.',
    '<p>The hiring process is fundamentally broken. Resumes are static documents that tell you what someone claims they did, not what they can actually build. Cover letters are formulaic. Technical interviews test puzzle-solving under artificial pressure, not real-world building ability.</p>

<p>We started Antry because we believed there had to be a better way. What if instead of reading about someone''s experience, you could <strong>watch them build</strong>? What if every developer had a living portfolio that showed not just what they built, but how fast they shipped, what tools they chose, and what trade-offs they made?</p>

<h2>The inspiration</h2>

<p>The idea crystallized when we saw what Wealthsimple did in Canada. They ran a campaign asking people to build something instead of sending a resume. The results were extraordinary — they found talent they never would have discovered through traditional hiring channels. Builders who had no formal CS degree but could ship beautiful, functional products in days.</p>

<p>Antry is the permanent infrastructure for this approach. We named it after the ant — a tiny creature that collaborates with others to build structures thousands of times its own size, and does it fast. That''s what our builders do. They come together in hackathons, in teams, in open source, and build things bigger than any one person could.</p>

<h2>What makes us different</h2>

<p>Every builder on Antry has a bento-style profile that shows their work at a glance: live demos, tech stacks, build times, hackathon results, and peer validation through likes. Companies don''t need to read resumes — they can click a demo and see the product run in 3 minutes. That tells you more than a 30-minute technical interview ever could.</p>',
    'Story',
    '5 min',
    true,
    '2026-03-15T10:00:00Z'
  ),
  (
    'anatomy-of-a-great-builder-profile',
    'Anatomy of a great builder profile',
    'We analyzed the top-performing profiles on Antry. Here are the 5 things they all have in common — and how to apply them to yours.',
    '<p>After watching hundreds of builder profiles get created on Antry, we noticed a clear pattern. The profiles that attract the most attention from companies and fellow builders all share five key characteristics. Here''s what we found.</p>

<h2>1. A sharp tagline</h2>

<p>The best profiles have a one-liner that immediately communicates what makes the builder unique. Not "Full-stack developer" — that tells you nothing. Instead: "I build real-time collaboration tools that scale to millions." Specific, confident, and memorable.</p>

<h2>2. Live demos, not screenshots</h2>

<p>Every top profile links to working demos. Not mockups, not Figma prototypes — actual deployed applications that you can click through. This is the single most important differentiator. When a company can see your product running live, the conversation changes entirely from "can you build this?" to "when can you start?"</p>

<h2>3. Visible build times</h2>

<p>Speed matters. The best builders proudly display how long each project took. "Built in 10 days" next to a polished CLI tool tells a story of velocity and focus. Companies love seeing builders who can go from zero to deployed in a sprint.</p>

<h2>4. Hackathon track records</h2>

<p>Participating in Antathons — our timed hackathons — adds a competitive dimension to your profile. It shows you can perform under pressure, make quick decisions, and ship something meaningful in a constrained timeframe. Companies specifically look for this.</p>

<h2>5. A diverse but coherent tech stack</h2>

<p>The best profiles show range without losing focus. A builder who knows Python, React, and infrastructure tools shows they can think across the full stack. But each project in their portfolio reinforces a clear narrative about who they are as a builder.</p>',
    'Guide',
    '6 min',
    true,
    '2026-03-05T10:00:00Z'
  ),
  (
    'hackathons-that-matter',
    'Hackathons that actually matter',
    'Most hackathons end with abandoned repos. Antathons are different — here''s how we designed hackathons where projects survive past Sunday.',
    '<p>We''ve all been there. You spend a weekend at a hackathon, build something cool, present it to judges, maybe win a prize — and then the project dies. The repo goes stale. The demo link breaks. All that energy and creativity just... evaporates.</p>

<p>When we designed Antathons (our hackathon format), we wanted to solve this exact problem. We asked: what if hackathon projects actually survived? What if the act of competing in a hackathon permanently enriched your builder profile instead of being a one-time event?</p>

<h2>How Antathons work differently</h2>

<p>First, every submission lives on your Antry profile forever. When you build something during an Antathon, it becomes a verified project in your portfolio — complete with the hackathon badge, the theme you built for, and proof that you shipped under time pressure. Companies can see this context when they browse your profile.</p>

<p>Second, we designed the themes to produce genuinely useful projects. Instead of gimmicky prompts like "build something with our API," we focus on real problems: "Build an open-source tool that solves a common developer pain point" or "Build an AI agent that autonomously solves a real-world problem." These themes produce projects worth continuing.</p>

<h2>The results so far</h2>

<p>Our "Open Source Sprint" hackathon produced 34 submissions, and over half of them are still actively maintained on GitHub. Several have crossed 100 stars. That''s the kind of outcome we''re optimizing for — not just weekend projects, but the beginning of something real.</p>',
    'Product',
    '4 min',
    true,
    '2026-02-28T10:00:00Z'
  ),
  (
    'ai-scout-agent',
    'Meet Scout: the AI that knows every builder',
    'We built an AI agent that can search builders by skill, construct teams, compare profiles, and find demos — all through natural language.',
    '<p>Traditional talent search is painful. You type keywords into a search box, scroll through pages of results, click into profiles one by one, and try to mentally compare candidates. It''s slow, imprecise, and exhausting.</p>

<p>Scout is our answer to this problem. It''s an AI agent that understands the entire Antry platform — every builder, every project, every hackathon result — and can answer natural language questions about it.</p>

<h2>What Scout can do</h2>

<p>Ask Scout "Find me 3 builders who know both AI and React, and have shipped at least 2 projects" and it will search the platform, evaluate profiles, and return a curated shortlist with reasoning for each recommendation. It understands skills, build velocity, hackathon performance, and project quality.</p>

<p>You can also ask comparative questions: "Compare Mara Chen and Jake Torres — who would be better for a real-time collaboration project?" Scout will analyze their portfolios, tech stacks, and shipped work to give you an informed comparison.</p>

<h2>How it works under the hood</h2>

<p>Scout is built on a multi-step pipeline. First, it parses your natural language query into structured search parameters. Then it queries our builder database with those parameters. Finally, it synthesizes the results into a human-readable response with specific evidence from each builder''s profile. The entire interaction takes seconds, not hours.</p>',
    'Product',
    '3 min',
    true,
    '2026-02-20T10:00:00Z'
  ),
  (
    'the-future-of-hiring',
    'The future of hiring is show, don''t tell',
    'Why every company will evaluate candidates by their shipped work within 5 years, and what that means for builders and recruiters alike.',
    '<p>A quiet revolution is happening in hiring. The companies that are winning the talent war aren''t the ones with the fanciest job descriptions or the most rounds of interviews. They''re the ones who figured out how to evaluate people by their actual work.</p>

<p>Wealthsimple proved it in Canada. Shopify has been doing it quietly for years. And dozens of startups we talk to are moving away from traditional interviews entirely. The pattern is clear: the future of hiring is "show, don''t tell."</p>

<h2>Why this shift is happening now</h2>

<p>Three forces are converging. First, AI has dramatically lowered the barrier to building. Someone with an idea and access to Claude or GPT can ship a functional product in days. This means there are more builders than ever, and the traditional resume can''t capture what makes them special.</p>

<p>Second, the nature of work has changed. Companies don''t need someone who can write a binary search from memory. They need someone who can take a vague product idea, break it into technical decisions, build it, deploy it, and iterate based on feedback. The only way to evaluate that is to see them do it.</p>

<p>Third, platforms like Antry now make it possible. For the first time, builders have a place to showcase their work in a structured, discoverable way. Companies can browse live demos instead of reading bullet points. They can see build times, tech choices, and hackathon results — all the signals that actually predict building ability.</p>

<h2>What this means for builders</h2>

<p>If you''re a builder, start shipping publicly. Every project you deploy, every hackathon you compete in, every demo you put live — it all compounds into a portfolio that speaks louder than any resume. The builders who embrace this shift now will have an enormous advantage in the years to come.</p>',
    'Industry',
    '5 min',
    true,
    '2026-02-10T10:00:00Z'
  )
ON CONFLICT (slug) DO NOTHING;
