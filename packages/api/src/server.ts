import 'server-only';

import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@stryder/types';

import { supabaseAnonKey, supabaseUrl } from './env';

export type StryderServerClient = SupabaseClient<Database>;

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 *
 * Uses the anon key and the caller's session cookies, so every query is still
 * subject to Row Level Security — this is not an escape hatch. For work that
 * genuinely has to bypass RLS (Edge Functions writing weekly summaries), use
 * `./admin`.
 *
 * Create one per request; never cache it across requests.
 */
export async function createServerSupabaseClient(): Promise<StryderServerClient> {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. The middleware refreshes the
          // session on every request, so this is safe to ignore here.
        }
      },
    },
  });
}

/**
 * The signed-in user, or null.
 *
 * Always goes to Supabase Auth rather than trusting the session cookie, so the
 * result can be relied on for authorisation decisions.
 */
export async function getSessionUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
