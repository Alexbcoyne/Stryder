import { z } from 'zod';
import { TIERS, USER_ROLES } from '@stryder/constants';
import type { Profile, TablesUpdate } from '@stryder/types';

import type { StryderServerClient } from '../server';

/**
 * Rows come back with enumerated columns typed as plain `string`, because the
 * database enforces them with CHECK constraints rather than Postgres enums.
 * Parsing here is the single place that narrowing happens, so nothing
 * downstream has to cast.
 */
const profileSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  role: z.enum(USER_ROLES),
  tier: z.enum(TIERS),
  trial_ends_at: z.string().nullable(),
  stripe_customer_id: z.string().nullable(),
  ical_feed_urls: z.array(z.string()),
  timezone: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * The signed-in athlete's own profile.
 *
 * RLS means this can only ever return the caller's row; `userId` is here to
 * make the query explicit, not to grant access to anyone else's.
 */
export async function getProfile(
  supabase: StryderServerClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return profileSchema.parse(data);
}

const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(1).max(120).nullish(),
  timezone: z.string().trim().min(1).max(64).optional(),
});

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

/** Update the caller's own profile. Input is validated before it reaches the database. */
export async function updateProfile(
  supabase: StryderServerClient,
  userId: string,
  input: unknown,
): Promise<Profile> {
  const parsed = profileUpdateSchema.parse(input);

  // Built key by key so an absent field is left alone rather than written as
  // null, and so no unexpected column can ride along in the patch.
  const patch: TablesUpdate<'users'> = {};
  if (parsed.full_name !== undefined) patch.full_name = parsed.full_name;
  if (parsed.timezone !== undefined) patch.timezone = parsed.timezone;

  if (Object.keys(patch).length === 0) {
    const current = await getProfile(supabase, userId);
    if (!current) throw new Error('Profile not found');
    return current;
  }

  const { data, error } = await supabase
    .from('users')
    .update(patch)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw error;

  return profileSchema.parse(data);
}
