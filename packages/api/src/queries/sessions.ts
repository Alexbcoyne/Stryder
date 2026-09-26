import { z } from 'zod';
import { INTENSITIES, SESSION_STATUSES, SESSION_TYPES } from '@stryder/constants';
import type { Session, TablesInsert } from '@stryder/types';

import type { StryderServerClient } from '../server';

import { getBlock } from './blocks';
import { ensureWeek } from './weeks';

const sessionSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  block_id: z.uuid(),
  week_id: z.uuid().nullable(),
  scheduled_date: z.string(),
  session_type: z.enum(SESSION_TYPES),
  title: z.string().nullable(),
  description: z.string().nullable(),
  intensity: z.enum(INTENSITIES).nullable(),
  planned_duration_min: z.number().int().nullable(),
  planned_distance_m: z.number().int().nullable(),
  status: z.enum(SESSION_STATUSES),
  position: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

/** Every session in a block, in date order — the shape the board renders. */
export async function listSessionsForBlock(
  supabase: StryderServerClient,
  blockId: string,
): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('block_id', blockId)
    .order('scheduled_date', { ascending: true })
    .order('position', { ascending: true });

  if (error) throw error;

  return data.map((row) => sessionSchema.parse(row));
}

const createSessionSchema = z.object({
  block_id: z.uuid(),
  scheduled_date: z.iso.date({ message: 'Pick a date.' }),
  session_type: z.enum(SESSION_TYPES, { message: 'Pick a session type.' }),
  title: z.string().trim().max(120).nullish(),
  description: z.string().trim().max(2000).nullish(),
  intensity: z.enum(INTENSITIES).nullish(),
  planned_duration_min: z.coerce.number().int().min(0).nullish(),
  planned_distance_m: z.coerce.number().int().min(0).nullish(),
});

export type CreateSessionInput = z.input<typeof createSessionSchema>;

/**
 * Add a session to a block. `session_type` is a fixed choice from
 * `SESSION_TYPES` — the athlete's own wording goes in `title`/`description`,
 * never into the type itself (see CLAUDE.md).
 *
 * The session's week is derived from `scheduled_date` and created on demand,
 * so the caller never has to think about weeks at all.
 */
export async function createSession(
  supabase: StryderServerClient,
  userId: string,
  input: unknown,
): Promise<Session> {
  const parsed = createSessionSchema.parse(input);

  const block = await getBlock(supabase, parsed.block_id);
  if (!block) throw new Error('Training block not found.');

  if (parsed.scheduled_date < block.start_date || parsed.scheduled_date > block.end_date) {
    throw new Error("That date falls outside the block's start and end dates.");
  }

  const week = await ensureWeek(
    supabase,
    userId,
    block.id,
    block.start_date,
    parsed.scheduled_date,
  );

  const row: TablesInsert<'sessions'> = {
    user_id: userId,
    block_id: block.id,
    week_id: week.id,
    scheduled_date: parsed.scheduled_date,
    session_type: parsed.session_type,
    title: parsed.title ?? null,
    description: parsed.description ?? null,
    intensity: parsed.intensity ?? null,
    planned_duration_min: parsed.planned_duration_min ?? null,
    planned_distance_m: parsed.planned_distance_m ?? null,
  };

  const { data, error } = await supabase.from('sessions').insert(row).select('*').single();

  if (error) throw error;

  return sessionSchema.parse(data);
}

/** Set a session's status directly — used for "Skip" and "Missed", which need no log entry. */
export async function updateSessionStatus(
  supabase: StryderServerClient,
  sessionId: string,
  status: Extract<Session['status'], 'skipped' | 'missed' | 'planned'>,
): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .update({ status })
    .eq('id', sessionId)
    .select('*')
    .single();

  if (error) throw error;

  return sessionSchema.parse(data);
}

export async function deleteSession(
  supabase: StryderServerClient,
  sessionId: string,
): Promise<void> {
  const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
  if (error) throw error;
}
