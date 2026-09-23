import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@stryder/api/server';

/**
 * The bare root address.
 *
 * There is no marketing home page yet — (marketing) stays reserved and empty
 * per the brief — so this just sends visitors somewhere real rather than
 * 404ing: signed-in athletes to their dashboard, everyone else to log in.
 */
export default async function RootPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? '/dashboard' : '/login');
}
