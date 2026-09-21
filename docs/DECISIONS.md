# Decision log

Every decision made while building that the brief did not specify, plus the
conflicts it resolved and the questions still open.

Format: **Decision** — what was chosen, why, and what would change it.

---

## Open — needs a founder decision

### D-01 Accent colour: amber or neon green

The Technical Spec uses amber `#F0A500` for the app UI; the brand (logo,
landing page) uses neon green `#39FF14`. Amber sits behind `--accent` for now,
as the brief directs.

This needs resolving before the marketing site is built, because the two
surfaces will sit side by side. Note that `#39FF14` is also the Elite score
colour — using it as the accent would collide with the score system, which is
an argument for keeping amber in-app.

**Changing it is a one-line edit** to `--accent` in `apps/web/app/globals.css`.

### D-02 Free-tier Monday summary

Sources disagree: one says free users get the first summary only, another says
none at all. Not needed until the summary ships, but it has to be settled
before the Edge Function is written, because it decides whether the function
filters on tier.

### D-03 Strava / Google token encryption

`public.users` deliberately has **no** Strava or Google token columns yet, per
the brief. They arrive with the integration migration once we choose between:

- **Supabase Vault** — encryption at rest managed by Supabase, keys never in
  app code. Preferred unless it turns out to be awkward from Edge Functions.
- **Application-level encryption** — more control, more key management.

Do not add token columns until this is decided.

---

## Resolved conflicts between sources

These follow the brief's Section 12 and are implemented as stated.

| Topic            | Decision                                             | Loser             |
| ---------------- | ---------------------------------------------------- | ----------------- |
| Annual pricing   | Athlete €64/yr, Coach €470/yr (Decision Log, 31 Aug) | Spec's €59        |
| Share cards      | Satori                                               | html2canvas       |
| Score bands      | 90 / 80 / 65 with the four-colour system             | Spec §8's 75 / 60 |
| Semantic colours | success `#3FB950`, error `#F85149`                   | Spec §17          |

---

## Stack

### D-10 Next.js 16.3

Approved explicitly. The brief specified Next 14, which is two majors behind and
off active support. Next 16.3 with React 19.3.

### D-11 Tailwind CSS v4

v4's CSS-first `@theme` model matches the requirement that tokens live in
`globals.css` and are mapped into the Tailwind theme — in v3 the tokens would
have had to be duplicated into a JS config. No `tailwind.config.js` exists;
`@theme inline` in `globals.css` is the theme.

### D-12 TypeScript 5.9.3, pinned exactly

Not the new 7.x line. Pinned rather than ranged so every machine and CI agree
on what typechecks.

### D-13 `proxy.ts`, not `middleware.ts`

Next 16 renamed the `middleware` file convention to `proxy` and warns on the
old one. `apps/web/proxy.ts` uses the new convention: same `NextRequest` in,
same `config.matcher`, function named `proxy`.

The convention was confirmed against the docs Next ships inside the package
(`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`)
rather than guessed — nextjs.org is blocked by the network egress proxy in the
environment this was built in. That local copy is the fastest way to check a
Next 16 API that predates your assumptions.

Note the docs' warning that a proxy may be deployed to the CDN edge separately
from the render path, so it must not rely on shared module state. Ours does
not: it reads the request and returns a response.

### D-14 ESLint flat config at the repo root, run outside Turbo

One `eslint.config.mjs` lints the whole monorepo via `pnpm lint`, rather than a
config plus plugin dependencies in every package. Turbo still owns build,
typecheck and test.

### D-15 PostHog and Sentry installed but inert

Both are wired up and both no-op unless their key/DSN is set, so local
development and CI send nothing anywhere. Sentry's `withSentryConfig()` source
map upload is deliberately **not** enabled: it needs an auth token in CI. Add
it when the token exists.

PostHog runs with `persistence: 'memory'` (cookieless), autocapture and session
recording off, `ip: false`, and a property denylist as a backstop. Switch
persistence only in the same change that ships a consent banner.

---

## Database

### D-20 `user_id` is denormalised onto `weeks` and `sessions`

Both tables carry `user_id` as well as `block_id`, so every RLS policy is a
single-column comparison with no join or subquery. The `assert_block_owner()`
trigger keeps it consistent with the parent block's owner, so a client cannot
park a row under another athlete's block.

### D-21 CHECK constraints, not Postgres enums

Enumerated columns are `text` with a CHECK constraint. Adding a value is a
one-line migration instead of an `ALTER TYPE`, and the values round-trip as
plain strings. The cost is that generated types see `string`, which is why
`packages/api` narrows rows with Zod at the edge.

The lists in `@stryder/constants` mirror these constraints and must be changed
in the same commit.

### D-22 `FORCE ROW LEVEL SECURITY` is not used

Supabase's `postgres` role carries `BYPASSRLS`, so forcing adds no protection
against the table owner, while it silently breaks `SECURITY DEFINER` helpers
owned by a role without that attribute. RLS is enabled on every table; forcing
it is not.

### D-23 The free-tier block limit fires on UPDATE as well as INSERT

The brief specifies a BEFORE INSERT trigger. It also fires on UPDATE, otherwise
a free user could insert two blocks as drafts and flip the second to `active`.
The trigger excludes the row being updated from its own count. It also fails
closed: an unknown effective tier is treated as `free`.

### D-24 Session type list

The Technical Spec was not available in this session (`/docs` did not exist), so
the enumerated lists were built from the values named in the brief plus the
obvious basics:

`run, ride, swim, brick, gym, hyrox, rugby_training, gaa_training, match,
mobility, physio, rest, other`

Sports: `running, triathlon, cycling, swimming, hyrox, rugby, gaa, strength,
other`.

**Check these against the spec.** Adding a value is a one-line migration plus
the matching constant; removing one needs a data migration.

### D-25 `session_logs.session_id` is nullable

So an unplanned session can be logged later without a schema change. Every log
still carries `user_id`, which is what RLS keys on.

### D-26 Database types are hand-written for now

`packages/types/src/database.ts` was written by hand in the exact shape
`supabase gen types` emits, because Docker is unavailable in the environment
this foundation was built in. Run `pnpm db:types` on a machine with Docker to
replace it with the genuine article; the file is excluded from lint and
formatting for that reason.

---

## Web

### D-30 `safeRedirectPath()` lives in `@stryder/utils`

An open redirect in the OAuth callback is worth a test suite, and `apps/web`
has no test runner in this foundation. It rejects absolute, protocol-relative,
backslash and control-character targets.

### D-31 Auth errors are deliberately vague

Sign-in reports "that email and password combination did not work" regardless
of cause, and the password reset flow always reports success. Both prevent
account enumeration.

### D-32 CSP allows `'unsafe-inline'` and `'unsafe-eval'` on scripts

Next's inline bootstrap requires it. Tightening this means moving to nonces,
which is worth doing before launch but needs a middleware change and would have
been unverifiable here. `connect-src` is tight — Supabase, PostHog and Sentry
only — which is the control that actually limits exfiltration.

### D-33 `/settings` edits timezone only

Email changes need a verification flow and password changes need re-auth;
neither was in scope. Timezone is there because it decides when an athlete's
Monday is, which the weekly summary will be scheduled against.

### D-34 No `apps/web` test runner yet

Vitest runs in `packages/utils`. Component and E2E testing (Playwright) is a
later session, per the brief. Pure logic worth testing should live in
`@stryder/utils`, which is also where the compliance engine goes.
