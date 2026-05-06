# Antry Receipts — Launch Strategy (4–6 weeks)

> Written 2026-05-06 in response to "do research how can I improve Antry … and market it correctly and naturally."
> Pairs with `ANTRY_ROADMAP.md` (the engineering roadmap) and the methodology page at `/receipts/methodology`.
> Source: in-session marketing strategy generated against the merged Receipts product surface.

---

## 1. The core narrative

Considered:

- **A. "Show your receipts."** ✅
- B. "Proof of judgment, not proof of work."
- C. "Anyone can prompt their way to an answer. Antry shows how."
- D. "GitHub showed what you ship. Antry shows how you think."

**Winner: A — "Show your receipts."** Two words. Imperative. A pun that reads as both "prove it" and "the artifact is literally called a Receipt." It does triple duty: tagline, CTA, hashtag. Already on `/briefs` and now on `/`. Use D as the subhead — pair them. C is a bumper for the homepage; it explains, but a tagline shouldn't have to.

---

## 2. Why this idea wins now

Mid-2026 reality: **everyone ships, nobody trusts the artifact.** A working RAG demo is no longer evidence of seniority — Cursor + Claude will ship one in an afternoon for an intern. So hiring managers have quietly inverted: they now want to see the *trace*. Not the repo, the conversation. Not the diff, the dead-ends. Recruiters are already pasting `.cursorrules` and chat exports into screening calls; they just don't have a credible third-party way to capture them. **Antry is the third party.**

What's broken: take-home tests are gameable (paste to GPT-5), live coding is theatre, GitHub history is increasingly AI-coauthored noise. The Receipt fixes this because it's gateway-signed (`/receipts/methodology`) — a builder physically *cannot* fabricate it without signed proof from your gateway. That's a primitive, not a feature.

**Honest moat assessment.** GitHub *could* copy the radar in six months. They won't:
1. It doesn't fit their commit-graph aesthetic.
2. The legal optics of measuring "judgment" are radioactive at scale.
3. They'd need to operate an LLM gateway, which puts them at war with Anthropic/OpenAI billing.

LinkedIn won't because LinkedIn is a credentialing product, not a measurement product — measuring would punish their existing user base.

Your *actual* moat is the antagonist-pair scoring (`src/lib/receipts/types.ts`) and the min-of-quartile composite. Once one well-known company validates it, anyone copying you looks derivative. **Build the moat by publishing the rubric format aggressively** — make Antry the standard the way pgvector became the standard.

**Weak point:** if no Tier-1 company authors a Brief in the first 30 days, the whole thing collapses into a clever indie demo. That's the entire strategic risk. §3 and §5 below are written for that fact.

---

## 3. Launch week (the Receipts-aware version)

The roadmap's Week 5 plan was good for "Antry as a builder community." It's wrong for Receipts. Receipts needs a different sequence: **the Brief is the protagonist, not the platform.**

| When | Where | What |
|---|---|---|
| **T-7 (Tue)** | Blog + X | Publish the methodology essay (already at `/receipts/methodology`). Tweet one chart from it: a real radar with one ugly weak axis, captioned *"the shape of this radar is why min-of-quartile beats averages."* No CTA. Bait curiosity. |
| **T-5 (Thu) 9am ET** | GitHub + r/MachineLearning + r/LocalLLaMA | Drop the rubric format on GitHub as `antry/briefs` repo. README links to methodology page. Post: *"Open YAML schema for measuring how engineers solve LLM tasks — feedback wanted."* Pure community. No product pitch. |
| **T-3 (Sat)** | Resend → 247-person waitlist | Quiet teaser with one screenshot of a Receipt. Headline: *"What we built instead of another job board."* |
| **T-0 Tue 5:01am PT** | **Show HN** | Title: *"Show HN: Antry Receipts — sign every LLM call so you can measure how an engineer thinks."* Lead paragraph is the gateway-signing trick, not the radar. HN respects the technical novelty more than the hiring angle. Link straight to a live Receipt page, not the homepage. |
| **T-0 Tue 8am PT** | X thread (9 tweets) | (1) Receipt screenshot. (2) "GitHub showed what you ship. Antry shows how you think." (3-5) Three real Receipts side-by-side, same Brief, different shapes. (6) The antagonist-pair principle (one diagram). (7) "We measured 47 builders solving the same Brief. Token economy and throughput correlate at -0.62." (8) Launch partner reveal. (9) "Claim a Brief at antry.com/briefs." |
| **T-0 Tue 11am PT** | Indie Hackers | The *founder* economics post. "How I'm betting Antry on a hiring primitive instead of another newsletter." Honest, no gloss. |
| **T-0 Tue 2pm PT** | Latent Space, MLOps Slack, Cursor Discord, Buildspace, AI Engineer Foundation Slack | One paid-in-trust message each, written from scratch. Don't paste the same text. Each takes 10 minutes. Don't link the homepage; link the methodology page. |
| **T+1 Wed** | HN follow-up *comment* | Top 3 surprising findings from the seeded data, posted as a comment on yesterday's thread. Bumps it back up. |
| **T+2 Thu** | Product Hunt | Different audience, lighter angle. Lead image is the radar, not the gateway diagram. Title: *"Antry Receipts — the work portfolio for AI engineers."* Reply within 4 hours; no scheduled responses. |
| **T+5 Sun** | Newsletter Day | Email everyone who claimed a profile that week with their Receipt-shareable link. They post Monday morning — the second wave keeps the launch alive past the first-day spike, which is what kills most launches. |

**Skip:** Reddit r/SideProject (wrong audience), Hacker Noon (decayed), TikTok/IG Reels (no fit), paid PH boost (kills credibility).

---

## 4. The build-in-public engine — 4 rituals, no gimmicks

### Mondays — *The Bottom Quartile*
≤300 words on `/blog`, cross-posted to X. About the lowest-scoring dimension across all Receipts that week and what it teaches. **Not** highlighting builders — highlighting *patterns*. Antry is the only entity on earth that can write this post. **Category-defining content.**

### Wednesdays — *Brief Drop*
Every Wednesday a new Brief goes live. Pre-announce Tuesday night, drop 9am Wednesday, post the company-authored "why we wrote this" excerpt. Predictability builds anticipation; founders should have a Wednesday alarm in their head.

### Fridays — *Receipt of the Week*
Featured Receipt with a real builder's permission. Their words on what they learned, your words on what the radar shows. They retweet, you retweet, the company who authored the Brief retweets. **Three-sided amplification baked in.**

### Monthly — *Methodology Update*
One post per month on a refinement to the rubric (e.g. "we recalibrated Tool-Choice IQ because file_search was being over-credited"). Makes Antry feel like a *measurement institution* rather than a startup. Borrow Stripe Press's tone.

### Do NOT
- Hot takes on AI hiring controversies. Post Receipts, not opinions. Every hot take cheapens the measurement brand.
- Founder face cam, voice notes, podcast circuit. You said no, mean it. Receipts are the avatar.
- "We just hit 1000 users" milestone tweets. Vanity metrics signal weakness when your moat is rigor.
- Reply to every grifter who DMs about partnerships. Time-tax.
- Rebroadcast other AI-hiring tools' news. You're the category, not a participant in it.

---

## 5. The four launch-partner Briefs

You need ONE Tier-1 yes by Day 14 of the build period. The other three are insurance and content. Order to pitch: **Resend → Vercel → indie-hero → Anthropic** — easiest to hardest, so you have proof points before the hardest ask.

### The Resend Brief — Day 1 pitch, signed by Day 5
**What's in it for them:** lowest-friction yes — they're indie-aligned, they retweet builder content, the "transactional email engine" Brief showcases their SDK organically.
**Ask:** Co-authored Brief, Zeno or Rauch retweet.
**Use as:** the proof point for the other three.

### The Vercel Brief — Week 1 pitch (warm intro through Lee Robinson if possible), signed Week 2
**What's in it for them:** Edge runtime evangelism with hard numbers. The existing edge cold-start Brief is already perfect.
**Ask:** Same shape as Resend. Bonus ask: Guillermo retweet at launch.
Vercel says yes to dev-rel things fast. Use this as your fallback if Anthropic delays.

### The shadcn Brief (indie-hero alternative) — DM Week 2, signed Week 3
**Why him over Theo or levelsio:** highest ratio of *respected by builders : zero corporate friction.* Theo's audience would meme-trash it; levelsio is allergic to anything resembling hiring infrastructure. shadcn loves measurement tooling, and his retweet *is* the marketing.
**Ask:** Author one Brief about composing primitives ("Build an agentic UI library that obeys these 4 design tokens"). Shorter, weirder, more shareable than the company Briefs.

### The Anthropic Brief — Week 1 pitch, signed by Week 3, live Week 5 launch day
**What's in it for them:** First-party validation that "judgment > tokens" — exactly the Claude vs. GPT positioning they've been pushing in dev-rel. Your radar literally rewards the things they sell on.
**Ask:** Co-author one Brief on Streaming RAG (already drafted in `demoBriefs[0]`), let Antry use the Anthropic logo as Brief sponsor for 30 days, retweet once at launch.

#### Cold-email template — Anthropic (to dev-rel, not eng):
> Subject: Antry × Anthropic — co-authored AI engineering Brief?
>
> Alex — short pitch. I'm building Antry Receipts, a measurement primitive for AI engineers (link). Every LLM call is gateway-signed; we score 7 dimensions including Token Economy and Tool-Choice IQ. We want Anthropic to author Brief 001: streaming RAG with citation discipline. You write the rubric, we run the measurement infra, the resulting dataset is public. ~3 hours of your time. Public launch May [date]. Worth a 15-minute call?

#### One-pager outline (for any partner):
- **Cover** — Brief title + your logo + partner logo
- **Rubric draft** — copy the YAML from `demoBriefs[0].rubric_json`
- **Sample Receipt** — screenshot a real one
- **What partner provides:** rubric review, retweet at launch
- **What Antry provides:** gateway, signing, hosting, reporting, distribution
- **Legal one-liner** — no partner-specific data leaves the gateway

---

## 6. Content that writes itself (Antry-only data)

| # | Title | Angle | Channel |
|---|---|---|---|
| 1 | "We measured 100 builders solving the same Brief. Token economy and throughput correlate at -0.62." | Antagonist principle with real data | HN + X thread |
| 2 | "The radar shape that always wins" | Visual gallery of high-composite Receipts | X thread |
| 3 | "Why most engineers fail Tool-Choice IQ" | grep-before-tokens taxonomy with annotated traces | Blog longform |
| 4 | "Recovery Index: the single best predictor of senior judgment" | One-dimension deep-dive with hold-out validation | Blog + LinkedIn |
| 5 | "What 47 RAG attempts taught us about citation discipline" | Specific to Anthropic Brief 001 | Co-published with Anthropic |
| 6 | "The $0.18 RAG agent vs. the $4.20 RAG agent — same accuracy" | Cost vs. composite scatter from real Receipts | HN |
| 7 | "Spend-vs-Judgment curves of the top 10% builders" | Convex spending profile evidence | X thread |
| 8 | "Why we deprecated the average from our composite score" | Methodology post — institutional voice | Blog |
| 9 | "The six dimensions that LLMs grade themselves badly on" | LLM-as-judge calibration data | AI Engineer Slack |
| 10 | "We invalidated 12% of Receipts in our first month — here's what we caught" | Anti-cheat transparency report | Blog + HN |
| 11 | "What Brief difficulty actually means: data from 4 difficulty tiers" | Calibration post | Blog |
| 12 | "Hiring 100 AI engineers with Receipts: what changed" | Customer story, six months out | Blog + LinkedIn |

Posts 1, 6, 7, 10 are HN-bait; queue them for slow weeks.

---

## 7. The flywheel

```
builder claims profile
  → solves Brief
    → mints Receipt
      → shares Receipt to LinkedIn/X
        → friend sees radar
          → curiosity → claims profile → loops
```

Parallel loop:

```
company posts Brief
  → high-composite Receipts surface
    → company DMs builder
      → hire happens
        → company writes case study
          → next company posts Brief
```

### Leverage points (priority order)
1. **Sharing friction at mint time.** When a Receipt is signed, the very next screen is a one-click share with a custom OG image of the radar. The `/api/og` work serves this directly. If sharing requires three clicks, the loop dies.
2. **Inbound from companies → builder DMs.** Build the recruiter-side messaging by Week 3, not Week 8. The hiring side is the loop's monetization, not its accelerator — but a builder needs to see *one* "company X messaged you about your Receipt" notification or the system feels lifeless.
3. **Brief authorship as social object.** Every new Brief is a launch moment because companies promote *their* Brief.

### Flywheel-working metric
**400+ minted Receipts per month, with median composite ≥65 and ≥30% public visibility.**

- 400 is enough to power weekly "we measured N builders" content
- 65 median means the rubric isn't gamed-down
- 30% public is the share-rate that makes the network effect visible

**Don't track waitlist size after Week 5. Don't track signups. Mints/month is the only number that matters.**

---

## 8. Kill-or-keep — the existing roadmap

| Roadmap stage | Verdict | Why |
|---|---|---|
| Week 1 — Foundation (OG, Resend, robots/sitemap, Sentry, Plausible) | **Keep all of it** | Receipts changes nothing; makes it more valuable. Good link unfurls matter 10× more for Receipt URLs. |
| Week 2 — Antry Card (`/claim-card`) | **Keep, reframe** | No longer the launch hero. It's the onboarding ramp *to* Receipts. Builder claims a profile in 5s → immediately sees "your profile is empty without a Receipt — try Brief 001." |
| Week 3 — Seeded `/discover` with 50 projects | **Partial kill** | Don't seed 50 generic projects; seed 30 *Receipts*. Run 30 trusted builders through one of the four launch Briefs in private mode before public launch. A discover page full of radars is a 10× better screenshot than a discover page full of project cards. |
| Week 4 — Antathon #001 | **Postpone to Week 8** | Antathons compete with Briefs for builder attention. After Receipts has traction, the Antathon becomes "build something in 48 hours, mint a Receipt for it" — a feature of Receipts, not a parallel track. |
| Week 5 — Public launch sequence | **Replace entirely** with §3 above | The roadmap's launch was for a community product. Receipts is a measurement product; the sequence has to lead with the technical novelty (signed gateway), not the community angle. |
| Week 6 — Build Log content engine | **Keep but swap** | Mondays/Thursdays remain. Add the four §4 rituals on top — they don't conflict. |

### What's missing from the existing roadmap
- **Anti-cheat narrative.** Receipts only matter if it's not gameable. Publish your invalidation rate as a recurring transparency report.
- **Methodology versioning ritual.** Publish v1.0 of the rubric on launch day. Every change after gets a semver bump and a post.
- **Company-facing pricing surface.** Even pre-revenue, `/for-companies` should exist with a clear "post a Brief" CTA. Right now Briefs is one-sided.

---

## 9. Anti-patterns

1. **Don't make the Receipt gameable for shareability.** Tempting to expose vanity metrics ("highest token economy this week!"). Don't. The composite score and the radar shape are the only two surfaces. The moment you optimize one axis socially, builders optimize that axis behaviorally, and the rubric dies.
2. **Don't pay for traffic, ever.** Paid acquisition on a measurement product reads as "we paid for the leaderboard." Even retargeting will smell wrong. Organic only.
3. **Don't promise hiring outcomes you can't deliver.** Until 5+ real hires through Receipts, the homepage says "measurement primitive," not "get hired." Don't position Antry as a hiring marketplace until you can name three companies that hired through it.
4. **Don't ship a Builder leaderboard.** Public ranking of humans is the wrong primitive — it turns the network into a status game and kills the dataset's integrity. **Rank Briefs (most-attempted, hardest), not builders.**
5. **Don't expose the antagonist math too cleanly.** The methodology page is honest, but don't publish the exact composite weights as a copy-pasteable formula. Builders will optimize against it within 48 hours of publication. **Rotate the weights quarterly without announcement.**

---

## 10. One piece of uncommon advice

**Ship the failure modes before you ship the success stories.**

Every other launch leads with their best Receipt. Don't. Lead with the worst-scoring public Receipt — annotated, anonymized, with a kind explanation of what the radar shows and why it failed. Frame it: *"This is what makes Receipts honest. We don't hide the bottom quartile."*

This does four things at once that nothing else does:
- Establishes anti-gaming credibility before anyone can accuse you of gaming.
- Trains the audience to read the radar quickly (people learn faster from wrong answers than right ones).
- Creates social safety for builders to mint imperfect Receipts (which is most of them, which is your volume).
- Inverts the entire AI-hiring discourse, which is currently saturated with humblebrag success stories.

The rest of the category sells aspiration. **Sell honesty.** In 2026, after two years of LinkedIn-flavored AI thought leadership, honesty is the sharpest possible wedge. Your build-in-public posture (`AGENTS.md`, the `building-antry-with-ai` blog post) already leans this direction — push it further than feels comfortable.

That's the contrarian bet: **the public failure case is the most viral asset you have**, and Antry is the only company that can credibly publish one.

---

## Quick links

- Roadmap: `ANTRY_ROADMAP.md`
- Methodology page (live): `/receipts/methodology`
- Briefs gallery: `/briefs`
- Receipt artifact: `/receipts/rc_mara_anthropic_001`
- Public verifier: `/api/v1/receipts/[id]/verify`
