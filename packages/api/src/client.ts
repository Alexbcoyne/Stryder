'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@stryder/types';

import { supabaseAnonKey, supabaseUrl } from './env';

export type StryderClient = SupabaseClient<Database>;

/**
 * Supabase client for browser code.
 *
 * Uses the anon key and is always subject to Row Level Security. Safe to call
 * repeatedly — `@supabase/ssr` returns the same instance per browser context.
 */
export function createClient(): StryderClient {
  return createBrowserClient<Database>(supabaseUrl(), supabaseAnonKey());
}
