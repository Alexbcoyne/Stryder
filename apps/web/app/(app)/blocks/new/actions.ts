'use server';

import { redirect } from 'next/navigation';
import { createBlock, FreeTierBlockLimitError } from '@stryder/api';
import { createServerSupabaseClient } from '@stryder/api/server';

export interface CreateBlockActionState {
  error: string | null;
}

export async function createBlockAction(
  _prevState: CreateBlockActionState,
  formData: FormData,
): Promise<CreateBlockActionState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Your session has expired. Log in again.' };

  let blockId: string;
  try {
    const block = await createBlock(supabase, user.id, {
      name: formData.get('name'),
      sport: formData.get('sport') || undefined,
      goal_event: formData.get('goal_event')?.toString() || undefined,
      goal_date: formData.get('goal_date')?.toString() || undefined,
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
    });
    blockId = block.id;
  } catch (error) {
    if (error instanceof FreeTierBlockLimitError) return { error: error.message };
    if (error instanceof Error) return { error: error.message };
    return { error: 'Could not create that block. Try again.' };
  }

  redirect(`/blocks/${blockId}`);
}
