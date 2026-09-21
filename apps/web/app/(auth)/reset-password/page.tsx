import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@stryder/api/server';

import { Input, Label } from '@/components/ui';

import { updatePassword } from '../actions';
import { AuthForm } from '../auth-form';

export const metadata: Metadata = { title: 'Set a new password' };

/**
 * Reached through the emailed link, which lands on /auth/callback first and
 * arrives here with a session already established. Without that session there
 * is nothing to update, so send the user back to request a fresh link.
 */
export default async function ResetPasswordPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/forgot-password');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="h-px w-12 bg-accent" aria-hidden="true" />
        <h1 className="pt-3 text-xl font-semibold tracking-tight text-primary">
          Set a new password
        </h1>
        <p className="text-sm text-muted">Then you are straight back to your plan.</p>
      </div>

      <AuthForm action={updatePassword} submitLabel="Save password" pendingLabel="Saving…">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" required>
            New password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword" required>
            Confirm new password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
      </AuthForm>
    </div>
  );
}
