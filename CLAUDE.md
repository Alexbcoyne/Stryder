# CLAUDE.md

Guidance for Claude Code and for any engineer picking this repo up.

## What Stryder is

Athletes load the training plan they are **already following** — an iCal feed, a
PDF, or entered by hand. Stryder tracks compliance against it automatically and
sends one AI coaching summary on Monday morning.

**Bring any plan. Stryder holds you to it.**

## What Stryder is not

- **Not a plan generator.** We never write a plan for anyone.
- **Not a fitness tracker.** Strava and friends measure the session; we measure
  whether the plan is being followed.
- **Not a social network.** No feeds, followers, likes or comments. Sharing
  happens outside the product, through generated image cards.

The only planned exception is **Stryder Stories**: curated, opt-in, editorial
comeback stories. Post-MVP and out of scope — but do not build anything that
blocks it. In particular, keep `(marketing)` separate from `(app)`.

## Non-negotiable rules

1. **Plan content is private.** Session descriptions, imported plan text, week
   notes and coach notes are never visible to other athletes or third parties.
   Coaches (later) see compliance metrics only.
2. **RLS on every table**, enforced in the database, not just in app code.
3. **Tier gating in the database and server code**, never only in the frontend.
   Use `public.effective_tier()` / `effectiveTier()`, never `users.tier`.
4. **Secrets never reach the client.** The service role key and every future API
   key are server-only. Admin modules carry `import 'server-only'`. Commit
   `.env.example` only, never a filled-in env file.
5. **EU data residency and GDPR.** Supabase EU West. Cascade deletes so a user's
   data can be removed completely. No personal data to analytics or error
   tracking.
6. **No mid-week pushes to athletes.** The Monday summary is the only proactive
   touchpoint. If you are adding a notification, the answer is almost certainly
   no. The summary is an Athlete-tier entitlement: free users get it during the
   30-day trial only, which is exactly `effective_tier() <> 'free'`.
7. **Share compliance, never content.** No plan content, session descriptions or
   Strava data in any shareable output. `ComplianceMetrics` in `@stryder/types`
   is the only shape allowed to leave an athlete's own context.
8. **Strict TypeScript.** No `any` (lint error). Validate all external input
   with Zod.

## Repo map

```
apps/web/            Next.js 16 App Router
  proxy.ts           Session refresh + route protection (Next 16's middleware)
  app/(marketing)/   Reserved, empty. Public surface — keep it separate.
  app/(auth)/        login, signup, forgot-password, reset-password
  app/(app)/         Authenticated: dashboard, settings
  app/auth/callback/ OAuth + email link code exchange
  components/ui/     Base components. Tokens only, never raw hex.
  lib/env/           Zod-validated environment (client.ts / server.ts)
  lib/observability/ PostHog + Sentry, both off unless configured
packages/api/        Supabase client factories and typed queries
packages/constants/  Sports, session types, tiers, pricing, score bands
packages/types/      Generated DB types + domain types
packages/utils/      Pure logic. scoreBand() today; compliance engine later.
supabase/migrations/ Schema, RLS, triggers
supabase/tests/      pgTAP RLS tests
supabase/functions/  Edge Functions (empty — Monday summary lands here)
docs/DECISIONS.md    Every decision not specified by the brief
```

## Commands

```bash
pnpm install
pnpm dev             # all apps
pnpm check           # typecheck + lint + test — run before every commit
pnpm build
pnpm format

pnpm db:start        # local Supabase (needs Docker)
pnpm db:reset        # re-apply all migrations from scratch
pnpm db:test         # pgTAP RLS suite
pnpm db:types        # regenerate packages/types/src/database.ts
```

## Code conventions

- **Imports:** `@/*` inside `apps/web`, `@stryder/*` across packages.
  `@stryder/api` client factories are subpath imports — `/client` for the
  browser, `/server` for RLS-bound server code, `/admin` for the service role.
- **Never import `@stryder/api/admin` from anything a browser can reach.** It
  bypasses RLS. Scope every admin query by `user_id` yourself.
- **Enum columns** are CHECK constraints, not Postgres enums, so rows arrive as
  `string`. Narrow them with Zod at the edge (`packages/api/src/queries`), never
  with a cast in a component.
- **The enum lists in `@stryder/constants` mirror the database CHECK
  constraints.** Change both in the same commit.
- **Server actions** validate with Zod and return `{ error }` rather than
  throwing. Auth errors stay generic — never reveal whether an account exists.
- **Money** is integer cents. **Scores** are whole numbers; `scoreBand()` floors
  rather than rounds, so a score is never flattered.

## Design rules

Structured over atmospheric. Precise over glowing.

- **No** radial glows, decorative gradients, starfields, fade-up-on-scroll, or
  grids of identical cards differentiated only by colour.
- Geometry, rules, spacing and tabular numerals carry the design. A hairline
  rule is the house device — it marks starts, active states and section breaks.
- **Motion is functional only**: it shows state changing. The panel slide is
  the only entry animation. Always respect `prefers-reduced-motion`.
- **Mobile-first.** Bottom bar on mobile, side rail on desktop, from one nav
  list.
- **WCAG AA contrast and visible focus.** The global `:focus-visible` outline is
  never removed.
- **Tokens only.** Every colour comes from a CSS variable in `globals.css`. No
  hex in a component.
- **Score colours belong to the score.** Use `ScoreBadge`; never reuse a band
  colour for generic success or error state.
- Empty states read as a starting line, not an absence: "Your block starts
  here."

## Not yet built (leave clean seams, build nothing)

Strava, iCal and Google Calendar import, Claude API calls, Stripe, PWA, Web
Push, badge award logic, coach and squad features, shareable cards, Stryder
Stories, native mobile.
