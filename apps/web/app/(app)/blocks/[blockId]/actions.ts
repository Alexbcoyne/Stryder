'use server';

import { revalidatePath } from 'next/cache';
import {
  createSession,
  deleteSession,
  logSession,
  updateSession,
  updateSessionStatus,
} from '@stryder/api';
import { createServerSupabaseClient } from '@stryder/api/server';

export interface BoardActionState {
  error: string | null;
}

async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Your session has expired. Log in again.');
  return { supabase, userId: user.id };
}

export async function addSessionAction(
  _prevState: BoardActionState,
  formData: FormData,
): Promise<BoardActionState> {
  const blockId = formData.get('block_id')?.toString();
  try {
    const { supabase, userId } = await requireUser();
    await createSession(supabase, userId, {
      block_id: blockId,
      scheduled_date: formData.get('scheduled_date'),
      session_type: formData.get('session_type'),
      title: formData.get('title')?.toString() || undefined,
      intensity: formData.get('intensity')?.toString() || undefined,
      planned_duration_min: formData.get('planned_duration_min')?.toString() || undefined,
      planned_distance_m: formData.get('planned_distance_m')?.toString() || undefined,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not add that session.' };
  }

  if (blockId) revalidatePath(`/blocks/${blockId}`);
  return { error: null };
}

export async function editSessionAction(
  _prevState: BoardActionState,
  formData: FormData,
): Promise<BoardActionState> {
  const blockId = formData.get('block_id')?.toString();
  try {
    const { supabase, userId } = await requireUser();
    await updateSession(supabase, userId, {
      session_id: formData.get('session_id'),
      block_id: blockId,
      scheduled_date: formData.get('scheduled_date'),
      session_type: formData.get('session_type'),
      title: formData.get('title')?.toString() || undefined,
      intensity: formData.get('intensity')?.toString() || undefined,
      planned_duration_min: formData.get('planned_duration_min')?.toString() || undefined,
      planned_distance_m: formData.get('planned_distance_m')?.toString() || undefined,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not save that session.' };
  }

  if (blockId) revalidatePath(`/blocks/${blockId}`);
  return { error: null };
}

export async function logSessionAction(
  _prevState: BoardActionState,
  formData: FormData,
): Promise<BoardActionState> {
  const blockId = formData.get('block_id')?.toString();
  try {
    const { supabase, userId } = await requireUser();
    await logSession(supabase, userId, {
      session_id: formData.get('session_id'),
      actual_duration_min: formData.get('actual_duration_min')?.toString() || undefined,
      actual_distance_m: formData.get('actual_distance_m')?.toString() || undefined,
      rpe: formData.get('rpe')?.toString() || undefined,
      notes: formData.get('notes')?.toString() || undefined,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not log that session.' };
  }

  if (blockId) revalidatePath(`/blocks/${blockId}`);
  return { error: null };
}

export async function markSessionAction(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const sessionId = formData.get('session_id')?.toString();
  const blockId = formData.get('block_id')?.toString();
  const status = formData.get('status')?.toString();

  if (!sessionId || (status !== 'skipped' && status !== 'missed' && status !== 'planned')) {
    throw new Error('Invalid status update.');
  }

  await updateSessionStatus(supabase, sessionId, status);
  if (blockId) revalidatePath(`/blocks/${blockId}`);
}

export async function removeSessionAction(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const sessionId = formData.get('session_id')?.toString();
  const blockId = formData.get('block_id')?.toString();

  if (!sessionId) throw new Error('Missing session id.');

  await deleteSession(supabase, sessionId);
  if (blockId) revalidatePath(`/blocks/${blockId}`);
}
