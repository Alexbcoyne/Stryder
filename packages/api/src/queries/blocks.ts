import { z } from 'zod';
import { BLOCK_STATUSES, PLAN_SOURCES, SPORTS } from '@stryder/constants';
import type { Block, TablesInsert } from '@stryder/types';

import type { StryderServerClient } from '../server';

const blockSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  name: z.string(),
  sport: z.enum(SPORTS),
  goal_event: z.string().nullable(),
  goal_date: z.string().nullable(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.enum(BLOCK_STATUSES),
  source: z.enum(PLAN_SOURCES),
  created_at: z.string(),
  updated_at: z.string(),
});

/** Every block the caller owns, most recently created first. */
export async function listBlocks(supabase: StryderServerClient): Promise<Block[]> {
  const { data, error } = await supabase
    .from('training_blocks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((row) => blockSchema.parse(row));
}

/**
 * The caller's single `active` block, or null.
 *
 * A free-tier athlete can only ever have one, but the query does not assume
 * that — it just takes the most recently created active block, which is also
 * correct for paid tiers that may run several at once.
 */
export async function getActiveBlock(supabase: StryderServerClient): Promise<Block | null> {
  const { data, error } = await supabase
    .from('training_blocks')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return blockSchema.parse(data);
}

export async function getBlock(
  supabase: StryderServerClient,
  blockId: string,
): Promise<Block | null> {
  const { data, error } = await supabase
    .from('training_blocks')
    .select('*')
    .eq('id', blockId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return blockSchema.parse(data);
}

const createBlockSchema = z
  .object({
    name: z.string().trim().min(1, 'Give your block a name.').max(120),
    sport: z.enum(SPORTS).default('other'),
    goal_event: z.string().trim().max(120).nullish(),
    goal_date: z.iso.date().nullish(),
    start_date: z.iso.date({ message: 'Pick a start date.' }),
    end_date: z.iso.date({ message: 'Pick an end date.' }),
  })
  .refine((value) => value.end_date >= value.start_date, {
    message: 'The end date has to be on or after the start date.',
    path: ['end_date'],
  });

export type CreateBlockInput = z.input<typeof createBlockSchema>;

/**
 * Thrown when the free tier's one-active-block limit blocks a create.
 *
 * The database enforces this limit regardless (non-negotiable rule 3), but a
 * raw Postgres error is not something to show an athlete — this turns it into
 * a message the UI can render directly.
 */
export class FreeTierBlockLimitError extends Error {
  constructor() {
    super(
      'Free tier is limited to one active training block. Archive the current block or upgrade.',
    );
    this.name = 'FreeTierBlockLimitError';
  }
}

/** Create a block for the caller. Always starts `active`, sourced `manual`. */
export async function createBlock(
  supabase: StryderServerClient,
  userId: string,
  input: unknown,
): Promise<Block> {
  const parsed = createBlockSchema.parse(input);

  const row: TablesInsert<'training_blocks'> = {
    user_id: userId,
    name: parsed.name,
    sport: parsed.sport,
    goal_event: parsed.goal_event ?? null,
    goal_date: parsed.goal_date ?? null,
    start_date: parsed.start_date,
    end_date: parsed.end_date,
    status: 'active',
    source: 'manual',
  };

  const { data, error } = await supabase.from('training_blocks').insert(row).select('*').single();

  if (error) {
    // Postgres error 23514 = check_violation, raised by the free-tier trigger.
    if (error.code === '23514' && error.message.includes('Free tier is limited')) {
      throw new FreeTierBlockLimitError();
    }
    throw error;
  }

  return blockSchema.parse(data);
}

/** Archive a block, freeing up the free tier's one-active-block slot. */
export async function archiveBlock(supabase: StryderServerClient, blockId: string): Promise<Block> {
  const { data, error } = await supabase
    .from('training_blocks')
    .update({ status: 'archived' })
    .eq('id', blockId)
    .select('*')
    .single();

  if (error) throw error;

  return blockSchema.parse(data);
}
