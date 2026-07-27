# Restoring backend services

This deployment runs in **demo mode**: no Supabase, Stripe, or Anthropic
credentials are configured. The app serves static in-memory content so the
UI and learning logic can be reviewed end to end without a backend.

Demo mode is not a separate build — it is a single runtime check in
[`lib/demo/config.ts`](../../lib/demo/config.ts):

```ts
export const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL;
```

Every integration point branches on that flag, so restoring a service is
mostly a matter of setting its environment variables.

## Supabase (database + auth)

Set in Vercel → Settings → Environment Variables, for **every** environment
you want live (Production, Preview, Development):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Setting `NEXT_PUBLIC_SUPABASE_URL` flips `DEMO_MODE` to `false`, and these
paths switch back to real queries automatically:

- `app/app/layout.tsx`, `app/app/dashboard/page.tsx`, `app/app/skills/page.tsx`,
  `app/app/profile/page.tsx`, `app/app/pricing/page.tsx`,
  `app/app/practice/[skillId]/page.tsx`
- `app/actions/session.ts` (`submitAnswer`, `updateStreak`, `getSkillState`)
- `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, `app/auth/callback/route.ts`

> `NEXT_PUBLIC_*` values are inlined at **build time**. Changing them requires a
> redeploy, not just a restart — and setting them on the wrong environment is a
> common cause of a preview URL behaving differently from production.

### Route protection

The auth gate is **not** restored by env vars alone — it was removed from the
build. To bring it back, copy [`proxy.ts.disabled`](./proxy.ts.disabled) to the
project root as `proxy.ts`.

Restore it as `proxy.ts`, **not** `middleware.ts`. Next.js 16 deprecated the
`middleware` convention; it still deploys as an Edge Function on Vercel, where
the `@supabase/ssr` import failed to bundle and crashed every request with
`MIDDLEWARE_INVOCATION_FAILED`. The `proxy` convention defaults to the Node.js
runtime and does not have that problem.

Until then, `/app/*` routes are reachable without signing in — intended for
demo review only, and must be restored before any real user data exists.

## Stripe (payments)

```
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_MONTHLY
STRIPE_PRICE_ANNUAL
```

`app/api/stripe/checkout/route.ts` and `app/api/stripe/webhook/route.ts`
construct their Stripe client lazily inside the request handler and return
`503` while the keys are absent. No code change is needed — add the keys and
the endpoints activate.

## Anthropic (AI hints)

```
ANTHROPIC_API_KEY
```

`app/api/ai-hint/route.ts` falls back to the problem's own pre-written hint
text while this is unset. With the key present it calls Claude for a Socratic
hint as designed.

## Demo content

`lib/demo/data.ts` holds the demo skills and problems, and keeps session
progress (BKT mastery, XP, streaks) in a module-level object. That state is
per-instance and resets on redeploy or cold start — fine for review, and
entirely bypassed once Supabase is connected.
