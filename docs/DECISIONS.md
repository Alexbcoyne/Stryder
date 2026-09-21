# Decision log

Every decision made while building that the brief did not specify, plus the
conflicts it resolved.

No questions are currently open. Anything added here that needs a founder call
goes under a new "Open" heading at the top.

Format: **Decision** — what was chosen, why, and what would change it.

---

## Settled by the founder

### D-01 Accent colour: amber — SETTLED 21 Sep 2026

`--accent` stays amber `#F0A500` for the app UI. The brand's neon green
`#39FF14` is not promoted to the app accent.

This also keeps the score system clean: `#39FF14` is the Elite band colour, and
a colour that means "you are crushing it" should not also mean "this is a
button".

Implemented: `--accent` in `apps/web/app/globals.css`. Nothing else to do.

### D-02 Free tier gets no Monday summary — SETTLED 21 Sep 2026

The Monday summary is an **Athlete-tier entitlement**. Free users get it during
their 30-day reverse trial and then it stops. It is not a "first one free"
teaser and there is no ongoing free allowance.

The database already expresses this exactly: `public.effective_tier()` returns
`athlete` for a free user with an open trial and `free` once it expires. So the
Edge Function's filter is simply:

```sql
where public.effective_tier(u.id) <> 'free'
```

No extra column, no extra flag, no date arithmetic in the function. When the
trial lapses the same query stops selecting that athlete on its own.

**For the session that builds the summary:** the athlete still keeps their
dashboard, their compliance tracking and their score. Only the proactive Monday
touchpoint stops. Losing the summary is what the upgrade prompt hangs off.

### D-03 Third-party tokens: application-level encryption — SETTLED 21 Sep 2026

Strava and Google access/refresh tokens are encrypted **by our own code** before
they are written, and decrypted after they are read. Supabase Vault was
considered and rejected.

**Why not Vault.** Vault defends against someone walking off with the storage —
a stolen disk or backup. It defends poorly against the breach a product this
size actually suffers: a leaked service role key. Anything holding that key can
ask Vault to decrypt for it, because the safe and its key live in the same
system. Application-level encryption keeps the key in a different system
entirely (Vercel env / Edge Function secret), so a stolen database is inert
without it.

**Shape for the integration session — do not build this yet:**

- AES-256-GCM. Key from `TOKEN_ENCRYPTION_KEY` (32 bytes, base64), server-only,
  never `NEXT_PUBLIC_`.
- Store `v1:<key_id>:<iv>:<authTag>:<ciphertext>` in a single `text` column.
  The key id prefix is what makes rotation possible later without a flag day:
  decrypt with whichever key the row names, re-encrypt with the current one on
  next write.
- One module, `packages/api/src/crypto/tokens.ts`, carrying `import
'server-only'`. Every read and write of a token goes through it — nothing
  else touches the column. GCM's auth tag means tampering fails loudly rather
  than silently decrypting to garbage.
- Never log a token, plaintext or ciphertext, and never let one reach a client
  component. Strava data is also covered by non-negotiable rule 7, so it never
  appears in shareable output either.

**Accepted cost.** Key rotation and key custody are ours. Losing the key costs
every athlete a Strava reconnect — irritating, not destructive, because the
tokens were never the data, only the means of fetching it.

Token columns still do not exist. They arrive with the integration migration,
alongside this module and its tests.

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

### D-24 Session type list — CONFIRMED 21 Sep 2026

The Technical Spec was not available in this session (`/docs` did not exist), so
the enumerated lists were built from the values named in the brief plus the
obvious basics, and then confirmed by the founder:

`run, ride, swim, brick, gym, hyrox, rugby_training, gaa_training, match,
mobility, physio, rest, other`

Sports: `running, triathlon, cycling, swimming, hyrox, rugby, gaa, strength,
other`.

Adding a value later is a one-line migration plus the matching constant.
Removing or renaming one needs a data migration, because existing sessions will
be using it — so add rather than prune.

### D-24a `session_type` is assigned by Stryder, never typed by the athlete — SETTLED 21 Sep 2026

The athlete never gets a free-text field that lands in `session_type`. This is
what keeps `run` / `Run` / `runnign` from becoming three different things and
every downstream feature — colours, icons, the compliance engine's handling of
`rest` — from having to guess.

Consequences for the sessions that build plan import and manual entry:

- **Manual entry**: a select, populated from `SESSION_TYPES` in
  `@stryder/constants`. Never a text input.
- **Import (iCal / PDF / Strava)**: the importer maps whatever the source says
  onto a known type. Anything it cannot map confidently becomes `other` — it
  never invents a type, and it never fails the import over a word it does not
  recognise.
- **Nothing is lost.** `sessions.title` and `sessions.description` already hold
  the athlete's own wording verbatim. `session_type` is the structured facet
  Stryder reasons about; the title is the human one they read. A session can be
  typed `run` and still be titled "Tuesday hills, dreading it".
- **The mapping table belongs in code, not the database** — put it beside the
  importer so it can grow without a migration, and log unmapped source strings
  (the string alone, never the surrounding plan text) so the list can be
  extended on evidence.

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
