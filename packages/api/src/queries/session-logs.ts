import { z } from 'zod';
import { LOG_SOURCES } from '@stryder/constants';
import type { SessionLog, TablesInsert } from '@stryder/types';

import type { StryderServerClient } from '../server';

const sessionLogSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  session_id: z.uuid().nullable(),
  completed_at: z.string(),
  actual_duration_min: z.number().int().nullable(),
  actual_distance_m: z.number().int().nullable(),
  rpe: z.number().int().min(1).max(10).nullable(),
  notes: z.string().nullable(),
  source: z.enum(LOG_SOURCES),
  created_at: z.string(),
  updated_at: z.string(),
});

const logSessionSchema = z.object({
  session_id: z.uuid(),
  actual_duration_min: z.coerce.number().int().min(0).nullish(),
  actual_distance_m: z.coerce.number().int().min(0).nullish(),
  rpe: z.coerce.number().int().min(1, 'RPE is 1-10.').max(10, 'RPE is 1-10.').nullish(),
  notes: z.string().trim().max(2000).nullish(),
});

export type LogSessionInput = z.input<typeof logSessionSchema>;

/**
 * Log a completed session and mark it `completed` in one call.
 *
 * Two writes against two RLS-protected tables, not one database transaction —
 * `@supabase/supabase-js` has no client-side transaction support. If the
 * second write fails the log still exists and the session is still
 * `planned`; the caller can retry marking it complete without re-logging.
 */
export async function logSession(
  supabase: StryderServerClient,
  userId: string,
  input: unknown,
): Promise<SessionLog> {
  const parsed = logSessionSchema.parse(input);

  const row: TablesInsert<'session_logs'> = {
    user_id: userId,
    session_id: parsed.session_id,
    actual_duration_min: parsed.actual_duration_min ?? null,
    actual_distance_m: parsed.actual_distance_m ?? null,
    rpe: parsed.rpe ?? null,
    notes: parsed.notes ?? null,
    source: 'manual',
  };

  const { data, error } = await supabase.from('session_logs').insert(row).select('*').single();
  if (error) throw error;

  const { error: statusError } = await supabase
    .from('sessions')
    .update({ status: 'completed' })
    .eq('id', parsed.session_id);
  if (statusError) throw statusError;

  return sessionLogSchema.parse(data);
}
