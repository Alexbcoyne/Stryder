# Stryder

**Bring any plan. Stryder holds you to it.**

Athletes load the training plan they are already following — an iCal feed, a
PDF, or entered by hand. Stryder tracks compliance against it automatically and
sends one AI coaching summary on Monday morning.

Stryder is not a plan generator, not a fitness tracker, and not a social
network. See [`CLAUDE.md`](./CLAUDE.md) for what that means in practice, and
[`docs/DECISIONS.md`](./docs/DECISIONS.md) for every decision behind the code.

---

## What is in this repo today

This is the foundation. It gets you a running, authenticated shell on a secured
database — and nothing more:

- Turborepo monorepo (pnpm workspaces), strict TypeScript, ESLint, Prettier, CI
- Supabase schema for the eight core tables, with Row Level Security on every
  one of them and a pgTAP suite proving it
- Email/password and Google sign-in, protected routes, automatic profile
  creation with a 30-day reverse trial
- Design tokens, fonts, base components, and a `/dashboard` that is deliberately
  just an empty state

Strava, iCal import, the Monday summary, Stripe, badges, coach features and
share cards are all later sessions.

---

## Requirements

| Tool         | Version           | Notes                                |
| ------------ | ----------------- | ------------------------------------ |
| Node         | 22 (see `.nvmrc`) | 20.11+ works                         |
| pnpm         | 10+               | `corepack enable`                    |
| Docker       | any recent        | Only for local Supabase              |
| Supabase CLI | latest            | `brew install supabase/tap/supabase` |

---

## Local setup

```bash
git clone <this repo> && cd stryder
corepack enable
pnpm install

# The running app reads its env file from apps/web, not the repo root —
# copy the template there and fill it in (see below).
cp .env.example apps/web/.env.local
```

### Option A — against your hosted Supabase project

Fill `apps/web/.env.local` from **Supabase dashboard → Project Settings → API**:

> Use the plain **Project URL** (`https://<ref>.supabase.co`), not the REST
> API URL some dashboard pages show with `/rest/v1/` on the end.

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Push the migrations to it:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

> The project must be in an **EU West** region. EU data residency is a
> non-negotiable requirement, not a preference.

### Option B — against a local Supabase (Docker)

```bash
pnpm db:start     # prints your local URL and keys — paste them into apps/web/.env.local
pnpm db:reset     # apply every migration from scratch
pnpm db:test      # run the pgTAP RLS suite
```

### Run it

```bash
pnpm dev          # http://localhost:3000
```

Sign up at `/signup`. A `public.users` row is created automatically with a
30-day trial; you land on `/dashboard`.

---

## Google OAuth setup

**1. Google Cloud Console** → _APIs & Services_ → _Credentials_ → _Create
credentials_ → _OAuth client ID_ → _Web application_.

Authorised redirect URI — this is Supabase's callback, not your app's:

| Environment | URI                                                  |
| ----------- | ---------------------------------------------------- |
| Hosted      | `https://<project-ref>.supabase.co/auth/v1/callback` |
| Local       | `http://127.0.0.1:54321/auth/v1/callback`            |

**2. Supabase** → _Authentication_ → _Providers_ → _Google_. Enable it and paste
the client ID and secret.

For local development, put them in `apps/web/.env.local` instead —
`supabase/config.toml` reads them from the environment:

```
SUPABASE_AUTH_GOOGLE_CLIENT_ID=<client id>
SUPABASE_AUTH_GOOGLE_SECRET=<client secret>
```

**3. Supabase** → _Authentication_ → _URL Configuration_. Set the site URL and
add `<your app url>/auth/callback` to the redirect allow list. Add the Vercel
preview URL pattern too if you use previews.

Apple and Strava sign-in are later phases.

---

## Environment variables

Everything lives in `.env.example`, which is the only env file in git. Anything
prefixed `NEXT_PUBLIC_` is **inlined into the browser bundle and is therefore
public** — never put a secret behind that prefix.

| Variable                                | Required | Purpose                                                |
| --------------------------------------- | -------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`              | yes      | Supabase project URL                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`         | yes      | Anon key. Always subject to RLS.                       |
| `SUPABASE_SERVICE_ROLE_KEY`             | yes      | **Bypasses RLS. Server-only.**                         |
| `NEXT_PUBLIC_APP_URL`                   | yes      | The app's own origin. No domain is hardcoded anywhere. |
| `NEXT_PUBLIC_POSTHOG_KEY`               | no       | Analytics stays completely off without it              |
| `NEXT_PUBLIC_POSTHOG_HOST`              | no       | Defaults to EU cloud                                   |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | no       | Error tracking stays off without it                    |

Missing or malformed required variables fail at boot with a message naming
them — `apps/web/lib/env` validates both schemas with Zod.

---

## Commands

```bash
pnpm dev            # run everything
pnpm check          # typecheck + lint + test. Run before committing.
pnpm build
pnpm format

pnpm db:start       # local Supabase
pnpm db:reset       # re-apply all migrations
pnpm db:test        # pgTAP RLS suite
pnpm db:types       # regenerate packages/types/src/database.ts
```

---

## Repo layout

```
apps/web/            Next.js 16 App Router
packages/api/        Supabase client factories and typed queries
packages/constants/  Sports, session types, tiers, pricing, score bands
packages/types/      Database types + domain types
packages/utils/      Pure logic (scoreBand today, compliance engine later)
supabase/            Migrations, pgTAP tests, Edge Functions
docs/                Decision log
```

## Deployment

Vercel, auto-deploying from `main` with a preview per branch. Set every required
variable in the Vercel project, and add each preview URL to the Supabase
redirect allow list.

CI runs on every pull request: typecheck, lint, format check, unit tests, build,
plus a separate job that resets the database from the migrations and runs the
pgTAP suite.
