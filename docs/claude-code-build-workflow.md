# Claude Code Build Workflow — Hungarian Math Tutor App

This is the session-by-session guide for using Claude Code to implement the math tutor app
described in `app-plan.md`.

---

## Before You Start: Project Bootstrap

### 1. Create a fresh GitHub repository
Name it `math-tutor-hu`. Initialize with a README. This is a brand-new project —
not connected to the solana-bot repo.

### 2. Create a Supabase project
At supabase.com: new project → region: **Frankfurt (EU West)** → note the project URL,
anon key, and service role key. GDPR data residency requires EU region.

### 3. Open a new Claude Code session connected to the new repo
In Claude Code on the web: create a new project pointing to `math-tutor-hu`.

### 4. The first thing Claude Code should do in Session 1 is create CLAUDE.md

---

## CLAUDE.md Template (paste this into your first prompt)

Tell Claude Code to create `/CLAUDE.md` with:

```markdown
# Math Tutor HU — Project Context

## What this is
Adaptive math tutoring web app for Hungarian high school students (grades 9–10 MVP,
expanding to 11–12). B2C freemium. Solo developer.

## Tech Stack
- Frontend: Next.js 15 (App Router, TypeScript), shadcn/ui, Tailwind CSS
- Math: KaTeX (display), MathLive (input), Desmos API (graphs)
- Animations: Framer Motion, Lottie
- Backend: Supabase (PostgreSQL + Auth + Realtime + Storage + Edge Functions)
- Vector search: pgvector (via Supabase)
- AI: Claude Sonnet 4.6 via Anthropic SDK, LangGraph for dialogue orchestration
- AI approach: RAG (not fine-tuning) — curriculum content in pgvector
- Payments: Stripe
- Hosting: Vercel (frontend) + Supabase (backend, EU Frankfurt)
- Analytics: PostHog (EU cloud, GDPR-compliant)

## Key architectural decisions
- Supabase all-in-one for solo dev (not separate Redis, separate auth service, etc.)
- BKT (Bayesian Knowledge Tracing) as Supabase Edge Function
- Deep gamification only — no hearts/lives, no shallow badge spam
- GDPR: under-16 parental consent at registration; RLS on all tables; emoji-only squad chat

## Environment variables needed
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_DESMOS_API_KEY=
POSTHOG_KEY=

## Dev commands
npm run dev          # Next.js dev server (localhost:3000)
npx supabase start   # Local Supabase (Docker required)
npx supabase db push # Apply migrations
npx supabase gen types typescript --local > src/types/supabase.ts

## Testing
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright e2e tests
npm run type-check   # tsc --noEmit

## Hungarian curriculum reference
Full kerettanterv (NAT 2020) at: https://www.oktatas.hu/kozneveles/kerettantervek/2020_nat/kerettanterv_gimn_9_12_evf
Grades 9–10 MVP topics: linear functions, quadratic equations, algebra,
sequences, basic geometry, trigonometry, combinatorics, probability

## BKT parameters per skill
p_l0 (prior): 0.10, p_t (learn rate): 0.25, p_g (guess): 0.20, p_s (slip): 0.10
Mastery threshold: p_know >= 0.80
Target success rate per session: 0.70 (ZPD)
```

---

## Session Breakdown

Each session below is a self-contained Claude Code prompt. Sessions build on each other;
push to GitHub at the end of every session.

---

### Session 1 — Project Scaffold (1–2 hours)

**Goal:** Working Next.js app with Supabase wired up, deployed to Vercel preview.

**Prompt:**
```
Scaffold a Next.js 15 App Router project called math-tutor-hu with TypeScript,
Tailwind CSS, and ESLint. Then:

1. Install and configure shadcn/ui (use the 'new-york' style, zinc base color)
2. Install: @supabase/supabase-js @supabase/ssr framer-motion katex mathlive
   @anthropic-ai/sdk @langchain/langgraph stripe @stripe/stripe-js posthog-js
3. Create .env.local with all variables from CLAUDE.md (empty values)
4. Create src/lib/supabase/client.ts and server.ts using @supabase/ssr pattern
5. Create a simple homepage at app/page.tsx that shows "Math Tutor HU" and a
   "Get Started" button
6. Set up Supabase CLI: npx supabase init, create supabase/migrations/ folder
7. Verify: npm run type-check passes, npm run dev starts successfully
```

**End of session:** Commit all, push to main, verify Vercel preview deploys.

---

### Session 2 — Database Schema (2–3 hours)

**Goal:** All Supabase tables created with RLS policies. TypeScript types generated.

**Prompt:**
```
Create Supabase migrations for the full database schema described in CLAUDE.md.
Create these tables in order (respecting foreign keys):

1. profiles (id uuid FK users.id, display_name, grade int, birth_year int,
   parent_email text, consent_given_at timestamptz, avatar_config jsonb,
   subscription_status text default 'free', subscription_expires_at timestamptz)

2. skills (id uuid, name text, name_hu text, grade int, topic_area text,
   prerequisites uuid[], difficulty_params jsonb, description_hu text,
   sort_order int)

3. problems (id uuid, skill_id uuid FK skills, type text CHECK IN
   ('fill_number','equation_input','multiple_choice','guided_steps'),
   content_latex text, solution_latex text, solution_numeric numeric,
   hints jsonb (array of {level:1|2|3, text_hu:text}),
   difficulty float CHECK 0.0-1.0, matura_relevant bool, created_at timestamptz)

4. user_skills (user_id uuid FK profiles, skill_id uuid FK skills,
   p_know float default 0.10, attempts_total int default 0,
   attempts_correct int default 0, next_review_at timestamptz,
   mastered_at timestamptz, PRIMARY KEY (user_id, skill_id))

5. problem_attempts (id uuid, user_id uuid, problem_id uuid, correct bool,
   time_ms int, hint_count int, ai_hint_used bool, created_at timestamptz)

6. xp_events (id uuid, user_id uuid, amount int, reason text, created_at timestamptz)

7. streaks (user_id uuid PK FK profiles, current int default 0, longest int default 0,
   last_active_date date, shields_available int default 0)

8. squads (id uuid, name text, invite_code text UNIQUE, season_xp int default 0,
   created_at timestamptz)

9. squad_members (squad_id uuid FK squads, user_id uuid FK profiles,
   joined_at timestamptz, PRIMARY KEY (squad_id, user_id))

10. seasons (id uuid, name text, start_date date, end_date date,
    theme jsonb, milestones jsonb)

11. badges (id uuid, user_id uuid FK profiles, badge_type text, earned_at timestamptz)

For each table create RLS policies:
- profiles: user can read/update their own row
- user_skills: user can read/update their own rows
- problem_attempts: user can insert their own, read their own
- xp_events: user can insert their own, read their own
- streaks: user can read/update their own
- squads: members can read their squad
- squad_members: user can read their squad's members
- All admin operations via service_role key only (bypasses RLS)
- problems and skills: readable by all authenticated users

After creating migrations, run: npx supabase gen types typescript --local > src/types/supabase.ts
Verify: npx supabase db push succeeds with no errors.
```

**End of session:** Commit migrations + generated types. Push.

---

### Session 3 — Auth + GDPR Flow (2 hours)

**Goal:** Working login/signup with Google SSO, under-16 parental consent gate.

**Prompt:**
```
Implement authentication using Supabase Auth with these requirements:

1. Google OAuth provider (configure in Supabase dashboard — add placeholder redirect URLs)
2. Email/password as fallback
3. Signup flow collects: display_name, grade (9/10/11/12), birth_year
4. If birth_year indicates user is under 16: show a parental consent step that
   collects parent_email and sends a consent email (use Supabase Edge Function
   or Resend later — for now just store parent_email and set
   consent_given_at = null as pending)
5. Create middleware.ts for Next.js App Router that protects /app/* routes
6. Create /login page, /signup page with the birth year + grade collection
7. Create /auth/callback route for OAuth redirect handling
8. After login, redirect to /app/dashboard
9. Create a basic /app/dashboard page that shows the user's display_name and grade

Use @supabase/ssr for server-side session handling. Follow the Next.js App Router
pattern with createServerClient in Server Components and createBrowserClient in
Client Components.

Verify: full signup → login → dashboard flow works end to end.
```

**End of session:** Commit. Push.

---

### Session 4 — Math Rendering Components (2 hours)

**Goal:** Reusable math display and input components working on desktop and mobile.

**Prompt:**
```
Create the math rendering component library in src/components/math/:

1. MathDisplay.tsx — renders LaTeX string using KaTeX
   - Props: latex: string, displayMode?: boolean (block vs inline)
   - Handle KaTeX render errors gracefully (show raw text on error)
   - Export both inline and block variants as named exports

2. MathInput.tsx — interactive math input using MathLive
   - Props: value: string, onChange: (latex: string) => void,
     placeholder?: string, readOnly?: boolean
   - Show the MathLive virtual keyboard on mobile (detect touch device)
   - Export LaTeX value on change
   - Style to match shadcn/ui input appearance

3. GraphEmbed.tsx — Desmos graphing calculator embed
   - Props: expressions: DesmosExpression[], height?: number,
     readOnly?: boolean
   - Lazy load the Desmos script (only load when component mounts)
   - Expose a ref for programmatic control

4. ProblemDisplay.tsx — renders a full problem
   - Props: problem: Problem (from src/types/supabase.ts)
   - Renders content_latex using MathDisplay
   - Shows problem type badge (multiple choice / fill number / equation)
   - For multiple_choice: renders options as clickable cards
   - For fill_number: renders a simple number input
   - For equation_input: renders MathInput component

Create a test page at /test-math that renders examples of each component type.
Verify: all components render correctly on desktop and on a 390px wide mobile viewport.
```

**End of session:** Commit. Push.

---

### Session 5 — BKT Engine + Spaced Repetition (3 hours)

**Goal:** Working adaptive problem selection and knowledge tracking.

**Prompt:**
```
Implement the Bayesian Knowledge Tracing engine as a Supabase Edge Function
and a Next.js Server Action.

1. Create supabase/functions/update-knowledge/index.ts
   Implements BKT update formula:
   - After correct: P(know) = [P(know)×(1-P(s))] / [P(know)×(1-P(s)) + (1-P(know))×P(g)]
   - After incorrect: P(know) = [P(know)×P(s)] / [P(know)×P(s) + (1-P(know))×(1-P(g))]
   - Then apply learning: new_p_know = updated_p_know + (1 - updated_p_know) × P(t)
   - Parameters: p_s=0.10, p_g=0.20, p_t=0.25 (use skill's difficulty_params if present)
   - If p_know >= 0.80 and mastered_at is null: set mastered_at = now()
   - Calculate next_review_at using spaced repetition:
     mastery < 0.40: review in 1 day
     0.40–0.60: review in 3 days
     0.60–0.80: review in 7 days
     0.80–0.90: review in 14 days
     >= 0.90: review in 30 days
   - Update user_skills table with new p_know and next_review_at
   - Insert a problem_attempts row
   - Award XP: correct=10+(difficulty×10), incorrect=2 (effort points)
   - Insert xp_event row

2. Create src/lib/problem-selection.ts (server-side)
   selectNextProblem(userId, skillId):
   - Fetch user's p_know for the skill
   - Target p_correct ≈ 0.70 → select problem where difficulty ≈ p_know × 1.2
     (slightly above current ability)
   - Exclude problems attempted correctly in last 24h
   - Return problem id

   buildDailySession(userId):
   - 3 warmup problems: skills with next_review_at <= now(), sorted by p_know asc
   - 8 practice problems: current active skill (lowest p_know not yet mastered)
   - 3 review problems: mastered skills with next_review_at <= now()
   - Return ordered list of {problem_id, phase: 'warmup'|'practice'|'review'}

3. Create src/app/actions/session.ts (Next.js Server Actions)
   - submitAnswer(problemId, userAnswer, timeMs): calls Edge Function, returns {correct, xpEarned, newPKnow}
   - startSession(userId): calls buildDailySession, returns session plan
   - getSkillState(userId, skillId): returns current p_know, mastered_at, next_review_at

Verify with a simple test: simulate 10 correct answers on a skill starting at p_know=0.10,
log the p_know progression. Should reach 0.80 in approximately 8–12 correct answers.
```

**End of session:** Commit. Push.

---

### Session 6 — Seed Content: Grade 9 Problem Bank (3–4 hours)

**Goal:** 300+ problems across 5 Grade 9 skill areas, ready to serve.

**Prompt:**
```
Create seed data for the Grade 9 problem bank. Use Supabase migrations or a
seed script at supabase/seed.sql.

First, insert the skills for Grade 9 (name_hu is the Hungarian name):
1. real-numbers: "Valós számok" — grade 9, prerequisites: []
2. algebraic-expressions: "Algebrai kifejezések" — grade 9, prerequisites: [real-numbers]
3. linear-equations: "Lineáris egyenletek" — grade 9, prerequisites: [algebraic-expressions]
4. linear-functions: "Lineáris függvények" — grade 9, prerequisites: [linear-equations]
5. systems-of-equations: "Egyenletrendszerek" — grade 9, prerequisites: [linear-equations]
6. basic-geometry: "Alapgeometria" — grade 9, prerequisites: []
7. statistics-intro: "Alapstatisztika" — grade 9, prerequisites: [real-numbers]

For each skill, create at minimum 40 problems with:
- Mix of types: fill_number (50%), equation_input (30%), multiple_choice (20%)
- 3 difficulty tiers: easy (0.2–0.4), medium (0.5–0.7), hard (0.8–0.95)
- 3-level hints in Hungarian (hint 1: direction, hint 2: approach, hint 3: near-solution)
- matura_relevant: true for problems likely to appear on érettségi

Example problem format (linear-equations, fill_number):
content_latex: "Oldd meg az egyenletet: $3x + 7 = 22$"
solution_numeric: 5
hints: [
  {level: 1, text_hu: "Rendezd az egyenletet: az összes x-et tartalmazó tagot vond a bal oldalra."},
  {level: 2, text_hu: "Vonjuk le mindkét oldalból 7-et: $3x = 15$"},
  {level: 3, text_hu: "Osszuk el mindkét oldalt 3-mal: $x = 5$"}
]

Generate the full SQL INSERT statements for all 280+ problems.

After seeding: verify count with SELECT COUNT(*) FROM problems GROUP BY skill_id;
```

**Parallel agent opportunity:** While seeding Grade 9, spawn a second agent to
create Grade 10 skills (quadratic-equations, quadratic-functions, sequences-arithmetic,
sequences-geometric, trigonometry-right, circle-geometry, combinatorics-intro) with
their prerequisite connections.

**End of session:** Commit seed files. Push.

---

### Session 7 — Core Learning Loop UI (3–4 hours)

**Goal:** A student can complete a full daily session — problem display, answer
submission, feedback, XP animation.

**Prompt:**
```
Build the core learning loop UI at /app/practice/[skillId].

1. Session initialization: call startSession() Server Action on page load,
   store session plan in component state

2. PracticeSession component (client):
   - Progress bar: "Problem 4 of 14" with phase label (Warmup / Practice / Review)
   - Display current problem using ProblemDisplay component
   - Answer submission:
     * fill_number: number input + Submit button
     * equation_input: MathInput + Submit button
     * multiple_choice: radio cards, auto-submit on selection
   - On submit: call submitAnswer() Server Action
   - Show feedback:
     * Correct: green glow, XP pop animation using Framer Motion
       (+10 XP floats up and fades), encouraging message in Hungarian
     * Incorrect: show hint level 1 automatically, "Próbáld újra!" button
     * After 2 incorrect: show hint level 2
     * After 3 incorrect: show hint level 3 + "Mutatom a megoldást" (show solution)
   - "Next problem" button appears after answer (or solution view)

3. SessionSummary component:
   - Shown after all 14 problems complete
   - Total XP earned with big animated number
   - Skills improved: sparkline of p_know before → after per skill
   - Streak status: "🔥 5 napos sorozat!" (5-day streak)
   - CTA: "Holnap folytatom" (Tomorrow I continue) + share button

4. XP and streak update:
   - After session completes: update streaks table
   - If current date > last_active_date + 1 day: reset streak to 0, check shield
   - If current date = last_active_date + 1 day: increment streak
   - Award streak shield at 3, 7, 14, 30 day milestones

All UI text must be in Hungarian. Create a src/lib/i18n/hu.ts file with all string
constants so they're easy to find and edit.

Verify: complete a full 14-problem session manually, confirm XP is recorded in
xp_events table, p_know updates in user_skills.
```

**End of session:** Commit. Push.

---

### Session 8 — Gamification Layer (2–3 hours)

**Goal:** Mastery tree, badges, and streak UI are visible and motivating.

**Run two agents in parallel for this session:**

**Agent A prompt:**
```
Build the Mastery Tree visualization at /app/skills.

Using React Flow (install: @xyflow/react) or a custom SVG implementation:
- Render the skill prerequisite graph as a visual constellation/map
- Each skill node shows: name in Hungarian, progress ring (p_know as %), lock icon if prerequisites not met
- Color coding: grey (locked), blue (in progress, p_know 0.1–0.79), gold (mastered, p_know >= 0.80)
- Clicking an unlocked skill navigates to /app/practice/[skillId]
- Animate the connection lines between skills with a subtle pulse effect (Framer Motion)
- The map scrolls/zooms on mobile

Fetch user_skills data for the logged-in user to show real progress.
```

**Agent B prompt:**
```
Implement the badge system and streak display.

1. Create src/lib/badges.ts — define all badge types:
   FIRST_SKILL_MASTERED, STREAK_7, STREAK_30, SQUAD_FIRST_WIN,
   PERFECT_SESSION (14/14 correct), COMEBACK (solved after 3 wrong in a row),
   EARLY_BIRD (practiced before 8am), NIGHT_OWL (practiced after 10pm),
   GRADE9_COMPLETE (all Grade 9 skills mastered), MATURA_READY

2. Create a badge check function: checkAndAwardBadges(userId, event)
   - event types: 'skill_mastered', 'session_complete', 'streak_updated'
   - Check eligibility and insert into badges table if not already awarded
   - Return newly earned badges (to show celebration animation)

3. Create BadgeDisplay component:
   - Shows earned badges as circular icons on the profile page
   - Locked badges shown as grey silhouettes with tooltip in Hungarian
   - Badge earned animation: Lottie animation + "Új kitüntetés!" (New badge!) toast

4. Create StreakDisplay component:
   - Shows flame icon + current streak number
   - Streak shield indicator (shield icon if shields_available > 0)
   - Milestone markers at 3, 7, 14, 30 days on a progress line

Place StreakDisplay in the app header (visible on all /app/* pages).
BadgeDisplay at /app/profile.
```

**End of session:** Merge both agents' work. Commit. Push.

---

### Session 9 — AI Tutoring with LangGraph (3–4 hours)

**Goal:** AI-powered hints via Claude Sonnet 4.6, triggered after 3 failed static hints.

**Prompt:**
```
Implement the AI tutoring system using LangGraph and Claude Sonnet 4.6.

1. Create src/lib/ai/tutoring-graph.ts — LangGraph state machine:

Nodes:
- retrieve_context: fetch the relevant skill description, worked example, and
  3 similar problems from pgvector (semantic search on problem content)
- generate_hint: call Claude Sonnet 4.6 with Socratic prompt — never give the
  full answer, guide the student to the next step
- check_output: verify the hint doesn't contain the solution; if it does, regenerate
- log_usage: record the AI call in a ai_hint_log table

State:
{ problem: Problem, student_attempts: string[], previous_hints: string[],
  curriculum_context: string, hint_output: string }

Edges: retrieve_context → generate_hint → check_output → (loop if output invalid | done)

2. System prompt for Claude (in Hungarian):
"Te egy segítőkész matematikatanár vagy magyar középiskolások számára.
A feladatod: NE add meg a megoldást! Helyette tegyél fel irányító kérdéseket
vagy adj egy következő lépésre vonatkozó tippet. Legyen tömör (max 2 mondat).
Figyelj a tanuló korábbi hibáira."

3. Embed the Grade 9 curriculum context into pgvector:
- For each skill, create a text embedding of: skill description + 3 worked examples
- Store in a curriculum_embeddings table: (id, skill_id, content, embedding vector(1536))
- At query time: embed the current problem, find top-3 similar curriculum chunks

4. Create a Next.js Route Handler at app/api/ai-hint/route.ts:
- Requires authentication (validate session)
- Rate limit: 20 AI hints per user per day (free), unlimited (premium)
- Check rate limit against ai_hint_log table
- Run the LangGraph tutoring graph
- Return the hint text

5. Update PracticeSession component to show "AI segítség" (AI help) button
   after the 3rd static hint is shown. Button calls /api/ai-hint.
   Show a typing animation while waiting (Framer Motion).

Verify: test with a quadratic equation problem, confirm Claude returns a
hint in Hungarian that guides without spoiling.
```

**End of session:** Commit. Push.

---

### Session 10 — Stripe Payments + Freemium Gate (2 hours)

**Prompt:**
```
Implement the Stripe freemium subscription system.

1. Create Stripe products in dashboard:
   - "Premium Monthly": 3.99 EUR/month recurring
   - "Premium Annual": 29.99 EUR/year recurring
   (Hungarian 27% VAT — use Stripe Tax with tax-inclusive pricing)

2. Create app/api/stripe/checkout/route.ts:
   - Create Stripe Checkout Session with customer email pre-filled
   - success_url: /app/dashboard?upgraded=true
   - cancel_url: /app/pricing

3. Create app/api/stripe/webhook/route.ts:
   - Handle checkout.session.completed: update subscription_status = 'premium'
   - Handle customer.subscription.deleted: set subscription_status = 'free'
   - Verify Stripe webhook signature

4. Enforce freemium limits:
   - In startSession(): if free user AND problems_today >= 5, return {limited: true}
   - In /api/ai-hint: if free user AND ai_hints_today >= 3, return 403
   - Squad creation: require premium

5. Create /app/pricing page with monthly and annual pricing cards.

6. Create inline upgrade prompt component for when free users hit limits.

Verify: complete a test checkout using Stripe test mode cards.
```

**End of session:** Commit. Push.

---

### Session 11 — PWA + Parent Dashboard (2 hours)

**Run two agents in parallel.**

**Agent A:** PWA setup — manifest.json, service worker caching daily session problems,
offline fallback, install banner ("Telepítsd az alkalmazást!"), Background Sync for
queued answer submissions.

**Agent B:** Parent dashboard at `/parent/[token]` via magic link JWT — weekly summary,
skills overview, 7-day activity chart. Weekly email via Resend (pg_cron Edge Function,
every Sunday 10:00 CET).

**End of session:** Commit. Push.

---

### Session 12 — Study Squads (2 hours)

**Prompt:**
```
Implement Study Squads: create/join via 6-char invite_code, squad view with
collective season XP, progress leaderboard (improvement % not absolute),
weekly squad challenge. Emoji-reaction system only (no free text — GDPR/minors).
Supabase Realtime for live XP updates. pg_cron Edge Function resets weekly on Monday,
awards "Hét bajnoka" badge to top XP earner.
```

**End of session:** Commit. Push.

---

### Session 13 — Seasonal Content + Avatar Cosmetics (2 hours)

**Prompt:**
```
Implement the first semester season "Egyenletek Kora" (start/end dates aligned to
current school semester). 30 milestone progress track on dashboard. Avatar cosmetic
system: avatar_config JSON in profiles, /app/profile/avatar editor, user_cosmetics
table for inventory. Daily quest cards (3 quests, reset each day, stored as JSON).
Dark mode toggle via shadcn/ui dark mode.
```

**End of session:** Commit. Push.

---

### Session 14 — Testing, Accessibility, Performance (2 hours)

**Prompt:**
```
Full quality audit:
1. Playwright + axe-core accessibility tests for /login, /app/dashboard, /app/practice/[skillId]
2. KaTeX: wrap all math in <span role="math" aria-label="...">
3. GDPR: /settings/privacy with data delete + export (Art. 17/20); verify RLS blocks cross-user reads
4. Lighthouse: target Performance ≥ 85, Accessibility ≥ 95, PWA ≥ 90
5. Vitest unit tests: BKT update (4 state transitions), selectNextProblem, buildDailySession, checkAndAwardBadges
```

**End of session:** Commit. Push. Tag as v0.1.0.

---

## Claude Code Tips for This Project

### Write effective session prompts
- Always reference CLAUDE.md ("as described in CLAUDE.md")
- Name the exact files/functions to create — don't leave it open-ended
- Include a "Verify:" step so Claude Code can confirm the work
- Specify Hungarian for all UI strings explicitly

### Use parallel agents for independent work
Sessions 8, 11, and 13 explicitly split into parallel agents. Other opportunities:
- Session 6: Grade 9 and Grade 10 seed content in parallel
- Session 14: Unit tests and accessibility tests in parallel

### Between sessions
- Always push to GitHub before closing a session (remote env is ephemeral)
- Run `npm run type-check` at end of each session — fix all TypeScript errors
- Check Supabase dashboard to confirm DB changes took effect

### Recommended `.claude/settings.json`
```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npx supabase *)",
      "Bash(npx tsx *)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git push *)"
    ]
  }
}
```

### MCP servers to add to this Claude Code project
1. **Supabase MCP** — query the DB directly from Claude Code during debugging
2. **GitHub MCP** — use for PR creation after each phase

### When Claude Code gets stuck
- Migration failed → `npx supabase db reset` and retry
- TypeScript error on generated types → re-run `npx supabase gen types typescript --local`
- KaTeX not rendering → check CSS import in layout.tsx (`import 'katex/dist/katex.min.css'`)
- Stripe webhook not firing → `stripe listen --forward-to localhost:3000/api/stripe/webhook`

---

## Phase Completion Checklist

- [ ] Session 1: Next.js scaffold + Supabase wired + Vercel preview
- [ ] Session 2: Database schema + RLS + TypeScript types
- [ ] Session 3: Auth flow + GDPR consent gate
- [ ] Session 4: Math components (KaTeX, MathLive, Desmos)
- [ ] Session 5: BKT engine + spaced repetition
- [ ] Session 6: Grade 9 problem bank (280+ problems)
- [ ] Session 7: Core learning loop UI (practice session flow)
- [ ] Session 8: Mastery tree + badges + streaks
- [ ] Session 9: AI tutoring with LangGraph + Claude
- [ ] Session 10: Stripe payments + freemium gate
- [ ] Session 11: PWA + parent dashboard
- [ ] Session 12: Study squads + Realtime
- [ ] Session 13: Seasonal content + avatar cosmetics
- [ ] Session 14: Testing, accessibility, GDPR, Lighthouse
