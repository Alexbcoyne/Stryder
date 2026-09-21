import { TIER_RANK, type Tier } from '@stryder/constants';
import type { Profile } from '@stryder/types';

/**
 * The tier a profile actually gets, accounting for the 30-day reverse trial.
 *
 * Mirrors `public.effective_tier(uuid)` in the database. The database is the
 * enforcement point; this exists so server code can branch on entitlements
 * without a round trip. Never gate solely in the frontend.
 */
export function effectiveTier(profile: Pick<Profile, 'tier' | 'trial_ends_at'>): Tier {
  if (profile.tier !== 'free') return profile.tier;
  if (!profile.trial_ends_at) return 'free';

  return new Date(profile.trial_ends_at).getTime() > Date.now() ? 'athlete' : 'free';
}

/** Whether a profile's effective tier meets or exceeds `required`. */
export function hasTier(profile: Pick<Profile, 'tier' | 'trial_ends_at'>, required: Tier): boolean {
  return TIER_RANK[effectiveTier(profile)] >= TIER_RANK[required];
}

/** Whole days left in the reverse trial, or null when no trial is running. */
export function trialDaysRemaining(profile: Pick<Profile, 'tier' | 'trial_ends_at'>): number | null {
  if (profile.tier !== 'free' || !profile.trial_ends_at) return null;

  const msRemaining = new Date(profile.trial_ends_at).getTime() - Date.now();
  if (msRemaining <= 0) return null;

  return Math.ceil(msRemaining / 86_400_000);
}
