import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@stryder/types';

import { supabaseServiceRoleKey, supabaseUrl } from './env';

/**
 * Service-role Supabase client. BYPASSES ROW LEVEL SECURITY.
 *
 * Rules for using this module:
 *
 *   1. Server-only. The `server-only` import above makes a client bundle that
 *      reaches it fail the build rather than leak the key.
 *   2. Scope every query by user_id yourself — RLS is not there to catch you.
 *   3. Reach for it only where the client genuinely cannot do the work:
 *      writing weekly_summaries and badges, and admin/backfill scripts.
 *      Anything a signed-in athlete does about their own data belongs on the
 *      RLS-protected client in `./server`.
 */
export function createAdminClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
