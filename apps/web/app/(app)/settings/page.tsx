import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { effectiveTier, getProfile, trialDaysRemaining } from '@stryder/api';
import { createServerSupabaseClient } from '@stryder/api/server';
import { TIER_PRICING } from '@stryder/constants';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

import { signOut } from '../../(auth)/actions';
import { TimezoneForm } from './timezone-form';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const profile = await getProfile(supabase, user.id);
  if (!profile) redirect('/login');

  const tier = effectiveTier(profile);
  const trialDays = trialDaysRemaining(profile);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight text-primary">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <Badge tone={tier === 'free' ? 'neutral' : 'accent'}>{TIER_PRICING[tier].label}</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs tracking-wide text-muted uppercase">Email</span>
            <span className="text-sm text-primary">{profile.email}</span>
          </div>

          {trialDays !== null ? (
            <div className="flex flex-col gap-1">
              <span className="text-xs tracking-wide text-muted uppercase">Trial</span>
              <span className="text-sm text-primary">
                <span className="font-mono tabular-nums" data-metric>
                  {trialDays}
                </span>{' '}
                {trialDays === 1 ? 'day' : 'days'} left
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <TimezoneForm timezone={profile.timezone} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signOut}>
            <Button type="submit" variant="danger" size="sm">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
