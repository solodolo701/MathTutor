@AGENTS.md
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Math Tutor HU — Project Context

## What this is
Adaptive math tutoring web app for Hungarian high school students (grades 9–10 MVP,
expanding to 11–12). B2C freemium. Solo developer.

## Tech Stack
- Frontend: Next.js 16 (App Router, TypeScript), shadcn/ui, Tailwind CSS
- Math: KaTeX (display), MathLive (input)
- Animations: Framer Motion
- Backend: Supabase (PostgreSQL + Auth + Realtime + Storage + Edge Functions)
- Vector search: pgvector (via Supabase)
- AI: Claude Sonnet 4.6 via Anthropic SDK
- Payments: Stripe (dahlia API version)
- Hosting: Vercel (frontend) + Supabase (backend, EU Frankfurt)

## Key architectural decisions
- Supabase all-in-one for solo dev (not separate Redis, separate auth service, etc.)
- BKT (Bayesian Knowledge Tracing) in lib/bkt.ts + server actions
- Deep gamification only — no hearts/lives, no shallow badge spam
- GDPR: under-16 parental consent at registration; RLS on all tables; emoji-only squad chat
- Database types in types/supabase.ts (manually maintained, not generated)

## Environment variables needed
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MONTHLY=
STRIPE_PRICE_ANNUAL=

## Dev commands
npm run dev          # Next.js dev server (localhost:3000)
npm run type-check   # tsc --noEmit

## File structure (key files)
- app/page.tsx               — Landing page
- app/(auth)/login/page.tsx  — Login page
- app/(auth)/signup/page.tsx — Signup with GDPR parental consent
- app/auth/callback/route.ts — OAuth callback
- app/app/layout.tsx         — Protected app shell with nav
- app/app/dashboard/page.tsx — Main dashboard
- app/app/skills/page.tsx    — Skill tree
- app/app/practice/[skillId]/page.tsx — Practice session loader
- app/app/practice/[skillId]/PracticeSession.tsx — Practice UI (client)
- app/app/profile/page.tsx   — Profile + badges
- app/app/pricing/page.tsx   — Pricing page
- app/actions/session.ts     — Server actions: submitAnswer, updateStreak
- app/api/ai-hint/route.ts   — AI tutoring endpoint (Claude)
- app/api/stripe/checkout/route.ts  — Stripe checkout
- app/api/stripe/webhook/route.ts   — Stripe webhook handler
- lib/bkt.ts                 — Bayesian Knowledge Tracing engine
- lib/problem-selection.ts   — Problem selection + session building
- lib/badges.ts              — Badge award logic
- lib/supabase/client.ts     — Browser Supabase client
- lib/supabase/server.ts     — Server Supabase client
- lib/i18n/hu.ts             — All Hungarian UI strings
- types/supabase.ts          — Database type definitions
- components/math/           — KaTeX display + problem components
- supabase/migrations/001_initial_schema.sql — Full DB schema
- supabase/seed.sql          — Grade 9+10 problem bank seed data

## Hungarian curriculum reference
Full kerettanterv (NAT 2020) at: https://www.oktatas.hu/kozneveles/kerettantervek/2020_nat/kerettanterv_gimn_9_12_evf
Grades 9–10 MVP topics: linear functions, quadratic equations, algebra,
sequences, basic geometry, trigonometry, combinatorics, probability

## BKT parameters per skill
p_l0 (prior): 0.10, p_t (learn rate): 0.25, p_g (guess): 0.20, p_s (slip): 0.10
Mastery threshold: p_know >= 0.80
Target success rate per session: 0.70 (ZPD)

## Phase 1 session checklist (completed)
- [x] Session 1: Next.js 16 scaffold, packages installed, CLAUDE.md
- [x] Session 2: Full database schema + RLS + TypeScript types
- [x] Session 3: Auth flow + GDPR parental consent (under-16 gate)
- [x] Session 4: KaTeX math display + ProblemDisplay component
- [x] Session 5: BKT engine + spaced repetition scheduler
- [x] Session 6: Grade 9+10 problem bank seed SQL (280+ problems)
- [x] Session 7: Core learning loop UI (practice session flow)
- [ ] Session 8: Mastery tree + badges + streaks (badges done, tree partial)
- [ ] Session 9: AI tutoring endpoint (structure done, needs testing)
- [ ] Session 10: Stripe payments (structure done, needs Stripe config)
