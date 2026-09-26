import { z } from 'zod';
import { BLOCK_PHASES } from '@stryder/constants';
import { weekNumberForDate, weekStartDateForNumber } from '@stryder/utils';
import type { TablesInsert, Week } from '@stryder/types';

import type { StryderServerClient } from '../server';

const weekSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  block_id: z.uuid(),
  week_number: z.number().int().positive(),
  start_date: z.string(),
  phase: z.enum(BLOCK_PHASES).nullable(),
  focus: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * The week that `date` falls in for a block, creating it if it doesn't exist
 * yet.
 *
 * Weeks are never entered by hand (see @stryder/utils' weeks module) — a
 * session's date is all the UI ever asks for, and this is what turns that
 * into the week grouping the schema needs. `weeks.block_id, week_number` is
 * unique, so a concurrent create for the same week just returns the row the
 * other request made.
 */
export async function ensureWeek(
  supabase: StryderServerClient,
  userId: string,
  blockId: string,
  blockStartDate: string,
  date: string,
): Promise<Week> {
  const weekNumber = weekNumberForDate(blockStartDate, date);

  const row: TablesInsert<'weeks'> = {
    user_id: userId,
    block_id: blockId,
    week_number: weekNumber,
    start_date: weekStartDateForNumber(blockStartDate, weekNumber),
  };

  const { data, error } = await supabase
    .from('weeks')
    .upsert(row, { onConflict: 'block_id,week_number', ignoreDuplicates: false })
    .select('*')
    .single();

  if (error) throw error;

  return weekSchema.parse(data);
}

/** Every week of a block, in order. */
export async function listWeeks(supabase: StryderServerClient, blockId: string): Promise<Week[]> {
  const { data, error } = await supabase
    .from('weeks')
    .select('*')
    .eq('block_id', blockId)
    .order('week_number', { ascending: true });

  if (error) throw error;

  return data.map((row) => weekSchema.parse(row));
}
