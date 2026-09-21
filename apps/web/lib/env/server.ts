import 'server-only';

import { z } from 'zod';

/**
 * Server environment.
 *
 * Validated once, at module load, so a missing or malformed variable fails the
 * boot rather than surfacing as a confusing runtime error later.
 *
 * Anything in here is server-only. It must never be imported from a Client
 * Component — `import 'server-only'` above turns that into a build error.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  /** Bypasses Row Level Security. Server-only, always. */
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // --- Optional: observability -------------------------------------------
  SENTRY_DSN: z.string().url().optional(),

  // --- Optional: later integrations --------------------------------------
  // Left optional so the foundation runs without them. Make one required in
  // the same commit that starts using it.
  ANTHROPIC_API_KEY: z.string().optional(),
  /** 32 bytes, base64. Encrypts Strava/Google tokens at rest (D-03). */
  TOKEN_ENCRYPTION_KEY: z.string().optional(),
  STRAVA_CLIENT_ID: z.string().optional(),
  STRAVA_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
});

const parsed = serverSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  throw new Error(
    `Invalid server environment:\n${details}\n\nCopy .env.example to .env.local and fill in the missing values.`,
  );
}

export const serverEnv = parsed.data;
