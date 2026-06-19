# Hungarian Mathematics Tutor App — Development Plan

## Context

Hungarian high school students (ages 14–18) face a rigorous national mathematics curriculum (NAT 2020 / Kerettanterv) that culminates in the érettségi (matura) exam. Private tutoring is the dominant supplement — expensive, unscalable, and inaccessible outside major cities. Digital tools available in Hungarian are either low-quality drill apps, static PDF repositories, or global apps (Khan Academy, Photomath) that are English-first and misaligned with the Hungarian curriculum sequence.

**Goal:** Build an adaptive, gamified mathematics tutor web app — web-first with PWA — aligned to the Hungarian NAT 2020 curriculum for grades 9–10 (MVP), expanding to 11–12. Solo developer; B2C freemium targeting students and parents; 3.99 EUR/month subscription.

---

## 1. Hungarian Curriculum Map (NAT 2020 / Kerettanterv)

### Grades 9–10 Core Topic Areas (MVP scope)

The full kerettanterv document is at [oktatas.hu](https://www.oktatas.hu/kozneveles/kerettantervek/2020_nat/kerettanterv_gimn_9_12_evf).

**Grade 9 topics:**
- Number sets: reals, rationals, irrationals, integers
- Algebraic expressions: polynomials, factoring, algebraic fractions
- Linear equations and inequalities (one variable)
- Systems of linear equations (2×2)
- Linear functions: slope, intercept, graph interpretation
- Basic Euclidean geometry: triangles, congruence, quadrilaterals
- Intro probability and descriptive statistics

**Grade 10 topics:**
- Quadratic functions, equations, discriminant
- Quadratic inequalities
- Exponential and power functions
- Arithmetic and geometric sequences; series sums
- Right-triangle trigonometry (sin, cos, tan)
- Circle geometry (Thales, inscribed angles)
- Intro combinatorics (permutations, combinations)
- Intro probability (classical model)
- Vectors in the plane (intro)

**Grade 11–12 (Phase 2/3, not MVP):**
- Calculus: limits, derivatives, integration
- Logarithms
- 3D geometry / coordinate geometry
- Statistics (distributions, normal curve)
- Advanced combinatorics and probability
- Complex number intro (advanced track)

### Érettségi Alignment

The standard matura covers: algebra, functions, geometry, statistics/probability, combinatorics. The advanced matura adds calculus and deeper analysis. The app should tag every problem with its matura relevance to surface exam prep as a premium conversion hook.

### Prerequisite Knowledge Graph (Skills Graph)

Each skill node has prerequisites that must reach mastery threshold (P(know) ≥ 0.80) before unlocking:

```
Real Numbers ──→ Algebraic Expressions ──→ Linear Equations ──→ Linear Functions
                                                  └──→ Systems of Equations
                                                              │
                                              Quadratic Functions ←── Factoring
                                                    └──→ Quadratic Equations
                                                              └──→ Quadratic Inequalities

Geometry Basics ──→ Triangle Congruence ──→ Trigonometry (right triangle)
                          └──→ Similar Triangles
                 ──→ Quadrilaterals ──→ Circle Geometry

Number Sets ──→ Sequences (arithmetic) ──→ Sequences (geometric) ──→ Financial Math

Statistics Intro ──→ Combinatorics ──→ Classical Probability
```

---

## 2. Learning Science Foundation

### Core Pedagogical Principles (research-backed)

**Spaced Repetition** (Ebbinghaus forgetting curve; Kang 2016, hundreds of studies):
- Schedule problem reviews at expanding intervals: 1 → 3 → 7 → 14 → 30 → 90 days
- Implement per-skill review queues. Never let a skill "expire" silently — resurface it
- Implementation: A `reviews` table with `next_due_at` timestamps; pull into daily session

**Interleaved Practice** (Rohrer & Taylor):
- Mixing topics outperforms single-topic blocked drill: **Cohen's d = 0.42 immediate, 0.79 on delayed test**
- After each topic is introduced, daily sessions should mix 60% current topic / 40% previously learned topics
- Students dislike interleaving (feels harder) — this is a "desirable difficulty" that must be explained to users

**Worked Example Effect** (Sweller's Cognitive Load Theory):
- For *novice* learners: show fully worked example before asking them to solve
- For *intermediate* learners: fade the example (show some steps, hide others)
- For *proficient* learners: problem-only, hints on demand
- The app should detect learner level per skill and adjust scaffolding accordingly

**Testing Effect / Retrieval Practice** (Bjork):
- Active recall outperforms re-reading by 2–3× for retention
- Every session starts with a short retrieval warmup on previously learned skills

**Mastery Learning** (Bloom's 2-sigma problem):
- Do not advance to the next skill until the current one reaches mastery threshold (target: P(know) ≥ 0.80)
- This replicates the one-on-one tutoring advantage digitally

**Growth Mindset Framing** (Dweck):
- Frame errors as learning signals, not failures — "You're getting closer" not "Wrong"
- Show progress over time prominently (e.g., "You've improved 34% on quadratic equations this month")
- Avoid red X feedback; use "Try again" or hint-first approach

### Adaptive Engine: Simplified BKT

Use **Bayesian Knowledge Tracing** (Corbett & Anderson, 1994) as the core knowledge model:

Each skill has 4 parameters:
- `p_l0` — initial probability of knowing the skill (prior, ~0.1 for new topic)
- `p_t` — probability of learning from a single attempt (~0.2–0.4)
- `p_g` — probability of guessing correctly when not knowing (~0.2–0.25)
- `p_s` — probability of slipping (error despite knowing) (~0.1)

Update rule after each response:
```
After correct: P(know) = [P(know)×(1-P(s))] / [P(know)×(1-P(s)) + (1-P(know))×P(g)]
After incorrect: P(know) = [P(know)×P(s)] / [P(know)×P(s) + (1-P(know))×(1-P(g))]
New P(know) = updated + (1 - updated) × P(t)
```

Store `p_know` per (user_id, skill_id) in PostgreSQL. Update on every problem attempt.

**Problem Difficulty Selection (IRT-inspired):**
- Target a 70% success rate (Zone of Proximal Development)
- Problems have a `difficulty` score (0.0–1.0). Select problems where estimated P(correct) ≈ 0.70 given current `p_know`
- Seed the problem bank with manually assigned difficulties; refine with user response data over time

### Session Structure

Each daily session (target: 15 minutes):
1. **Warmup** (3 min): 3–5 retrieval questions on previously mastered skills
2. **Focused Practice** (9 min): Current skill, 8–12 problems with adaptive difficulty
3. **Review** (3 min): Due spaced-repetition cards from the review queue
4. **Summary**: XP earned, streak status, next unlock progress

---

## 3. Gamification Design (Research-Backed)

### What the Research Says

Key finding — **secondary school students show the highest gamification effect of any age group** (g = 1.015, 95% CI [0.639, 1.391]; Kurnaz 2025 meta-analysis, 31 studies). This is the best-evidenced demographic for gamification in education.

**Deep vs. shallow gamification** is the critical distinction (Lim & Sanmugam, 2024):
- Deep gamification (narrative, roles, meaningful progression): **increases intrinsic motivation**
- Shallow gamification (raw points/badges on top of existing content): **decreases intrinsic motivation**

**Self-Determination Theory** (Deci & Ryan) says three needs must be met:
1. **Autonomy** — students choose what to practice, when to play, how to customize
2. **Competence** — problems feel achievable but challenging (BKT ZPD targeting)
3. **Relatedness** — social connection via squads, not isolation

### Mechanics to Implement

**1. XP + Mastery Trees (deep progression):**
- Each topic area has a visual "mastery tree" showing the skills graph
- Solving problems earns Topic XP; Topic XP unlocks skills on the tree
- Tree visualized as a glowing constellation/map — not a boring progress bar
- Overall account level drives cosmetic unlocks, not content gates

**2. Streaks — with anxiety mitigation:**
- Daily streak counter with generous mechanics
- **Streak Shield** (free, earned via practice): protects one missed day (reduces churn 21%, Duolingo internal data)
- Never use hearts/lives loss mechanics — research shows this creates anxiety → burnout pathway (β = 0.52, PMC 2026)
- Streak milestones trigger special animations and cosmetic rewards

**3. Avatar Customization (cosmetic-only, never pay-walled):**
- Students have a customizable avatar/character
- All cosmetic unlocks are earned through learning milestones (not purchased)
- 56% of Gen Z prioritize styling their virtual identity (Roblox report, 2025)
- Avatar is visible in squad view — social self-expression drives retention
- Types of unlocks: character styles, color palettes, background "worlds", badge frames

**4. Study Squads (social retention engine):**
- Groups of 3–6 students can form a squad
- Squads have collective XP, weekly squad challenges, and a squad leaderboard
- Research: 61% of users join social groups within 60 days when available; long-term retention driven by social bonds more than individual achievements (Supercell data, arXiv 2017)
- Squad chat is limited to reactions + emoji to keep it safe and GDPR-compliant for minors

**5. Seasonal Progression ("Semester Season"):**
- 8–10 week "seasons" aligned to school semesters
- Each season has a themed visual narrative (e.g., "The Great Equation Quest")
- Seasonal progress track: 30 milestones, all earned via practice (not paid)
- End-of-season cosmetic reward — avatar item, profile banner
- Inspired by Fortnite battle pass structure, but entirely free — no premium battle pass
- Keeps the app feeling fresh; aligns to school calendar

**6. Leaderboards — opt-in, peer-scoped:**
- Squad leaderboard only by default (safe social comparison)
- Optional: school-wide or national leaderboard (opt-in, visible only to opted-in users)
- Progress leaderboard (improvement %) rather than absolute score — prevents discouraging weaker students
- Research: progress leaderboards outperform achievement leaderboards for engagement breadth

**7. Achievement Badges (meaningful, not hollow):**
- Only awarded for genuine learning milestones (first skill mastered, 7-day streak, first squad win)
- NOT awarded for participation alone — "phantom badges" harm motivation
- Displayed on profile, visible to squad members

**8. Daily Quests:**
- 3 daily quests auto-assigned: "Solve 5 quadratic equations", "Help a squad member with a hint"
- Quest variety prevents the ghost effect (gaming easy repetitive tasks for XP)
- Quests rotate daily to maintain novelty

### What to Avoid

| Anti-pattern | Why | Evidence |
|---|---|---|
| Hearts / lives system | Anxiety → motivational burnout | PMC 2026; β = 0.52 |
| Paying for streak freeze | Loss-aversion monetization; breaks trust | Duolingo criticism |
| Pure points/badges (shallow) | Decreases intrinsic motivation | Lim & Sanmugam 2024 |
| "Gaming the system" exploits | Easy XP farming via trivial questions | Alenezi 2023, 87 papers |
| Absolute score leaderboards for beginners | Social comparison → dropout | SDT relatedness need |
| Over-justification trap | Too many extrinsic rewards reduce genuine interest | Deci & Ryan; Frontiers 2024 |

---

## 4. Tech Stack (Solo Developer — Minimize Ops Overhead)

### Stack Overview

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | **Next.js 15** (App Router, TypeScript) | Largest ecosystem; Vercel deployment; PPR for fast page shells |
| UI | **shadcn/ui** + Tailwind CSS | Copy-own components, no runtime CSS-in-JS, fully customizable for gamified UI |
| Animations | **Framer Motion** + **Lottie (.lottie)** | Framer for XP/streak micro-interactions; Lottie for badge reveal animations |
| Math display | **KaTeX** | Synchronous, fast, no reflow — 4.28M weekly downloads |
| Math input | **MathLive** | Mobile virtual keyboard, ARIA-compliant, exports to LaTeX/MathJSON |
| Graphs | **Desmos API** + **GeoGebra** (embed) | Desmos for function plots; GeoGebra for geometry/3D |
| Data fetching | **TanStack Query v5** | Complex dashboards, DevTools, optimistic updates for XP |
| Backend | **Supabase** (all-in-one) | PostgreSQL + Auth + Realtime + Storage + Edge Functions + EU region (Frankfurt) |
| Vector search | **pgvector** (via Supabase) | Semantic search of problem bank; no separate vector DB needed at this scale |
| Caching/RT | **Supabase Realtime** | Leaderboards, squad activity — no Redis ops overhead for solo dev |
| AI orchestration | **LangGraph** + **Anthropic SDK** | Stateful multi-step tutoring dialogues with checkpointing; LangGraph GA since Oct 2025 |
| LLM | **Claude Sonnet 4.6** | 89% AIME 2025; 91.6% multilingual math (MGSM) — critical for Hungarian; strong pedagogical instruction-following |
| AI approach | **RAG (not fine-tuning)** | Curriculum content in pgvector; update knowledge base as curriculum changes without retraining (~$500/mo ops vs $2K–$10K per fine-tuning run) |
| Payments | **Stripe** | Best-in-class, GDPR-compliant, supports EUR, Apple/Google Pay for mobile |
| Hosting | **Vercel** (frontend) + **Supabase** (backend) | Both have EU regions; GDPR data residency satisfied |
| Auth | **Supabase Auth** | Google/Apple SSO + email; built-in support for under-16 GDPR consent flows |
| Mobile | **PWA** (service worker) | Web-first for solo dev; offline problem-solving; push notifications for streaks |
| Error tracking | **Sentry** | Free tier sufficient for MVP |
| Analytics | **PostHog** (self-hosted or EU cloud) | GDPR-compliant, open-source, session recording, feature flags |

### AI Cost Model

Not every interaction triggers an LLM call. AI is used for:
- Dynamic hint generation when static hints are exhausted
- Free-form answer checking (geometry proofs, written explanations)
- Personalized encouragement messages

**Conservative estimate at 1,000 active students:**
- 15% of problem attempts trigger an AI call
- 1,000 students × 20 problems/day × 15% = 3,000 AI calls/day
- Average call: 500 input tokens + 300 output tokens (with 80% cache hit on system prompt + curriculum context)
- Effective cost with caching: ~$0.40/day = **~$12/month per 1,000 students**
- This is well within the margin of a 3.99 EUR/month subscription

**Prompt architecture for cost efficiency:**
- System prompt + Hungarian curriculum context: cached (Anthropic prompt caching, 75% discount)
- Student skill state + problem context: dynamic input
- Response: concise Socratic hint (not full solution)

### Key Supabase Schema Tables

```
users, profiles, subscriptions
skills (id, name, grade, prerequisites[], difficulty_params)
problems (id, skill_id, type, content_latex, solution, hints[], difficulty)
problem_attempts (user_id, problem_id, correct, time_ms, hint_count, created_at)
user_skills (user_id, skill_id, p_know, next_review_at, attempts_total)
xp_events (user_id, amount, reason, created_at)
streaks (user_id, current, longest, last_active_date, shields_available)
squads (id, name, members[], season_xp)
seasons (id, name, start_date, end_date, theme, milestones[])
badges (user_id, badge_type, earned_at)
```

### GDPR Compliance (Critical for Minors)

- Supabase Frankfurt region → EU data residency
- Users under 16: parental consent flow at registration (Hungarian GDPR-K)
- Row Level Security on all tables — users access only their own data
- No behavioral ad targeting
- Squad chat is emoji/reaction only — no free-text from minors stored
- Data export and deletion endpoints (Art. 17/20 GDPR) from day one

---

## 5. Monetization Model

### Freemium Structure

**Free Tier (permanent, no time limit):**
- 5 problems/day per active topic
- Static pre-written hints only
- XP, streaks, badges
- Squad participation (view-only leaderboard)
- 1 season track (cosmetic) per semester

**Premium: 3.99 EUR/month or 29.99 EUR/year (effective ~2.50 EUR/month)**
- Unlimited daily problems
- AI-powered Socratic hints (Claude Sonnet 4.6)
- Full leaderboard participation + squad creation
- Spaced repetition review queue (premium feature — creates daily habit)
- Parent progress dashboard (weekly email report)
- Offline mode (PWA background sync)
- Priority access to new topics
- Downloadable practice sheets (PDF export)

**Why these price points:**
- Hungary PPP adjustment: US $10/month → ~4–5 EUR/month
- Hungarian 27% VAT (highest in EU) is included in displayed price
- Annual plan (29.99 EUR) = same as ~7.5 months monthly → strong incentive for annual commitment
- Comparable: Hungarian private math tutor = 4,000–8,000 HUF (~10–20 EUR) per hour; this is a fraction

### Conversion Funnel

1. Onboarding: 7-day "premium preview" for all new users — full experience
2. Day 8: Limits kick in with a clear, non-aggressive nudge: "You've solved 47 problems this week — unlock unlimited for 3.99 EUR/month"
3. Hook points: AI hint wall ("Stuck? Get AI tutoring — upgrade"), spaced review ("Your quadratic skills are fading — review them in your premium queue"), squad creation ("Create your squad — premium feature")
4. Annual plan push: shown when user has maintained a 14-day streak ("You're committed — save with annual plan")

### Revenue Projections

| Stage | Paying Users | Monthly Revenue |
|---|---|---|
| Launch (month 3) | 100 | ~400 EUR/mo |
| Growth (month 9) | 600 | ~2,400 EUR/mo |
| Year 2 | 3,000 | ~12,000 EUR/mo |
| Breakeven (est.) | ~500 | ~2,000 EUR/mo (covers hosting + AI + Stripe fees) |

### Future Monetization Layers (not MVP)

- **B2B2C school licenses** (Phase 3): Teacher dashboard + class analytics. 299 EUR/school/year or 49 EUR/class/year. Hungarian school procurement cycle is June–August.
- **Matura prep intensive** (seasonal): 14.99 EUR one-time purchase for 30-day exam prep program (timed to April–May érettségi exam period)
- **Content marketplace** (Phase 4): Teachers create and sell problem sets

---

## 6. MVP Scope & Phased Roadmap

### Phase 1 — Core Tutoring Loop (Months 1–4)

**Goal:** Working adaptive tutor for Grade 9 algebra + functions, with core gamification.

Deliverables:
- Auth (Supabase Auth, Google SSO, under-16 parental consent)
- 5 skill areas: Linear equations, Quadratic equations, Linear functions, Algebraic expressions, Number sets
- 50–80 problems per skill, 3 pre-written hint levels per problem
- BKT knowledge model + spaced repetition scheduler
- KaTeX display + MathLive input for equation problems
- Core gamification: XP, streaks (with streak shield), badges, mastery tree visualization
- Basic achievement system (5 meaningful badges)
- Freemium paywall (5 problems/day free) + Stripe checkout
- PWA manifest + service worker (offline problem cache)

**Content creation strategy for solo dev:**
- Seed from past érettségi exams (public domain — Hungarian Education Authority publishes all past exams)
- AI-assisted problem generation (Claude drafts variants from curriculum specs, human reviews before publishing)
- Target: 400–500 problems total at launch

### Phase 2 — Social + Full Grade 9–10 (Months 5–8)

- Complete grades 9–10 curriculum (all topic areas above)
- Avatar customization system with cosmetic unlocks
- Study Squads (formation, collective XP, squad challenges)
- Seasonal progression track (first "semester season")
- Desmos API integration for function graphing problems
- Parent dashboard (weekly email via Resend, progress summary)
- AI hint system via LangGraph + Claude Sonnet 4.6
- RAG pipeline: problem bank embedded in pgvector, curriculum context retrieval

### Phase 3 — Matura Prep + School Tier (Months 9–14)

- Grades 11–12 content (derivatives, integrals, logarithms)
- Matura exam simulation mode (timed, full paper format)
- Teacher dashboard + class management
- School license pricing + procurement flow
- Analytics: class-level mastery heatmaps

---

## 7. Product Architecture Summary

```
User Browser (Next.js 15 PWA)
    │
    ├── Math Display: KaTeX (render) + MathLive (input)
    ├── Graphs: Desmos API embed / GeoGebra embed
    ├── UI: shadcn/ui + Tailwind
    ├── Animations: Framer Motion + Lottie
    ├── State: TanStack Query v5 + Zustand (local session state)
    │
    ▼
Supabase (EU - Frankfurt)
    ├── Auth (Google SSO, email, parental consent flow)
    ├── PostgreSQL: users, skills, problems, attempts, XP, streaks, squads
    ├── pgvector: problem embeddings for semantic retrieval
    ├── Realtime: squad leaderboards, session sync
    ├── Edge Functions: BKT update, XP calculation, hint serving
    └── Storage: Lottie animation files, avatar assets
    │
    ▼
AI Layer (triggered ~15% of problem attempts)
    ├── LangGraph: tutoring dialogue state machine
    │       └── Nodes: retrieve_context → generate_hint → check_answer → encourage
    ├── Claude Sonnet 4.6: math reasoning + Hungarian language hints
    ├── RAG: pgvector retrieves relevant curriculum context + worked examples
    └── Prompt caching: system prompt + curriculum context cached (75% cost reduction)
    │
    ▼
External Services
    ├── Stripe: subscription billing (EUR, Apple/Google Pay)
    ├── Resend: transactional email (parent reports, streak reminders)
    ├── PostHog: GDPR-compliant product analytics (EU cloud)
    └── Sentry: error tracking
```

---

## 8. Verification Plan

**Curriculum alignment:**
- Download the official kerettanterv from oktatas.hu and map every implemented skill to a curriculum reference code
- Have 1–2 Hungarian math teachers review the skill graph and problem bank before launch
- Check against 3 past érettségi exams to verify coverage of tested concepts

**Learning effectiveness:**
- Track mastery rate: % of users who reach P(know) ≥ 0.80 per skill within 2 weeks of starting it (target: >60%)
- Track retention: re-test mastered skills 14 days later — target >70% retention
- A/B test interleaved vs. blocked practice for a subset of users (verify Cohen's d improvement)

**Gamification effectiveness:**
- Day 7 retention target: >20% (above industry mobile app benchmark of 10–20%)
- Day 30 retention target: >8% (above benchmark of 2.5–5%)
- Streak engagement: % of daily-active users maintaining a streak (target: >40%)
- Track conversion from free trial day 7 → paid (target: 3–7%)

**AI quality:**
- Manually audit 50 AI-generated hints per week during early operation
- Track hint acceptance rate: did the student continue after receiving the hint?
- Track AI cost per session and adjust trigger rate if costs exceed $0.50/student/month

**Technical:**
- Supabase RLS policy tests (verify users cannot access other users' data)
- Test GDPR parental consent flow with a simulated under-16 registration
- Lighthouse PWA score: target >90 on Performance, Accessibility, PWA
- Test offline mode: can a student solve 5 problems with no internet?

---

## Key Assumptions & Risks

| Assumption | Risk | Mitigation |
|---|---|---|
| Parents will pay 3.99 EUR/month | Price sensitivity in HU market | Start with a longer free trial; add annual plan; validate with early users |
| Solo dev can produce 400 problems at launch | Content bottleneck | AI-assisted drafting + past érettségi OCR + community contributions later |
| Supabase Edge Functions handle BKT computation efficiently | Latency for real-time updates | Pre-compute BKT async; show optimistic UI updates immediately |
| Claude Sonnet 4.6 understands Hungarian math vocabulary | Language quality gaps | Test 200 Hungarian hint prompts pre-launch; add Hungarian math glossary to RAG context |
| PWA push notifications work for streak reminders | iOS Safari PWA push limitations | Use email as fallback (Resend); native app is Phase 4 |
| Hungarian schools will be reachable in Phase 3 | Long B2B procurement cycles | Start with individual teachers, not IT departments; offer free classroom accounts |

---

*Research sources: Kurnaz 2025 (K-12 gamification meta-analysis), Lim & Sanmugam 2024 (gamification depth), Zeng 2024 (academic performance meta-analysis), Rohrer & Taylor interleaved practice studies, Kang 2016 spaced repetition review, Duolingo internal streak research, Roblox 2025 Digital Expression Report, Pew Research 2024 teen gaming survey, MathTutorBench ETH Zurich 2025, LangGraph production release Oct 2025, RAG vs fine-tuning cost comparison 2025.*
