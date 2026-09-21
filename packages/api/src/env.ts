/**
 * Supabase connection details.
 *
 * `apps/web` validates its environment with Zod at boot (see
 * `apps/web/lib/env`), so by the time these run the values are already known
 * good. These reads are a backstop for any other consumer — an Edge Function,
 * a script — so a missing variable fails loudly rather than producing a client
 * pointed at `undefined`.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export function supabaseUrl(): string {
  return required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function supabaseAnonKey(): string {
  return required('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Server-only. Bypasses Row Level Security, so it must never be imported into
 * anything that reaches the browser — `./admin` enforces that with
 * `import 'server-only'`.
 */
export function supabaseServiceRoleKey(): string {
  return required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
}
