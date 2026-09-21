/**
 * Framework-agnostic exports only.
 *
 * The client factories live behind subpath exports so that server-only code
 * never gets pulled into a browser bundle by accident:
 *
 *   import { createClient } from '@stryder/api/client';       // browser
 *   import { createServerSupabaseClient } from '@stryder/api/server';
 *   import { createAdminClient } from '@stryder/api/admin';   // service role
 *   import { updateSession } from '@stryder/api/middleware';
 */

export { effectiveTier, hasTier, trialDaysRemaining } from './entitlements';
export { getProfile, updateProfile, type ProfileUpdate } from './queries/profile';
