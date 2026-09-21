'use server';

import { revalidatePath } from 'next/cache';
import { updateProfile } from '@stryder/api';
import { createServerSupabaseClient } from '@stryder/api/server';

export interface SettingsActionState {
  error: string | null;
  saved: boolean;
}

/**
 * Update the signed-in athlete's timezone.
 *
 * The user id comes from the auth server, never from the form, and the update
 * is scoped to it — RLS would reject anything else anyway, but the server code
 * does not lean on that.
 */
export async function updateTimezone(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Your session has expired. Log in again.', saved: false };

  try {
    await updateProfile(supabase, user.id, { timezone: formData.get('timezone')?.toString() });
  } catch {
    return { error: 'That timezone could not be saved.', saved: false };
  }

  revalidatePath('/settings');
  return { error: null, saved: true };
}
