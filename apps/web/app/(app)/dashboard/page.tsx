import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getActiveBlock, getProfile } from '@stryder/api';
import { createServerSupabaseClient } from '@stryder/api/server';
import { SPORT_LABELS } from '@stryder/constants';

import { Card, CardContent, CardHeader, CardTitle, EmptyState, LinkButton } from '@/components/ui';

export const metadata: Metadata = { title: 'Dashboard' };

/**
 * The dashboard shows the athlete's active block, or an invitation to create
 * one. Compliance tracking, the Stryder Score and streaks are later work —
 * this only proves a block exists and links to it.
 */
export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await getProfile(supabase, user.id);
  if (!profile) redirect('/login');

  const activeBlock = await getActiveBlock(supabase);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-xl font-semibold tracking-tight text-primary">Dashboard</h1>

      {activeBlock ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{activeBlock.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {SPORT_LABELS[activeBlock.sport]} · {activeBlock.start_date} → {activeBlock.end_date}
            </p>
            <LinkButton href={`/blocks/${activeBlock.id}`} size="sm">
              Open block
            </LinkButton>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="Your block starts here."
          description="Load the plan you are already following — a calendar feed, a PDF, or entered by hand — and Stryder will track every session against it from day one."
          action={<LinkButton href="/blocks/new">Add your plan</LinkButton>}
        />
      )}
    </div>
  );
}
