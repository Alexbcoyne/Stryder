import { redirect } from 'next/navigation';
import { getProfile, trialDaysRemaining } from '@stryder/api';
import { createServerSupabaseClient } from '@stryder/api/server';

import { BottomNav, SideRail } from '@/components/nav/app-nav';
import { Badge } from '@/components/ui';

/**
 * The authenticated shell.
 *
 * Middleware already redirects unauthenticated requests, but the check is
 * repeated here so a route can never render without a session even if the
 * matcher changes.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const profile = await getProfile(supabase, user.id);
  const trialDays = profile ? trialDaysRemaining(profile) : null;

  return (
    <div className="flex min-h-dvh">
      <SideRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-default px-4 py-3 md:px-6">
          <span className="font-display text-sm font-semibold tracking-[0.2em] text-primary uppercase md:hidden">
            Stryder
          </span>
          <div className="ml-auto flex items-center gap-3">
            {trialDays !== null ? (
              <Badge tone="accent">
                Trial · {trialDays} {trialDays === 1 ? 'day' : 'days'} left
              </Badge>
            ) : null}
            <span className="max-w-[12rem] truncate text-xs text-muted">{profile?.email}</span>
          </div>
        </header>

        {/* Bottom padding clears the mobile nav bar. */}
        <main className="flex-1 px-4 pt-6 pb-20 md:px-6 md:pb-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
