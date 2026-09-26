import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getBlock, listSessionsForBlock, listWeeks } from '@stryder/api';
import { createServerSupabaseClient } from '@stryder/api/server';
import { PHASE_LABELS, SPORT_LABELS } from '@stryder/constants';

import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState } from '@/components/ui';

import { AddSessionPanel } from './add-session-panel';
import { SessionRow } from './session-row';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ blockId: string }>;
}): Promise<Metadata> {
  const { blockId } = await params;
  const supabase = await createServerSupabaseClient();
  const block = await getBlock(supabase, blockId);
  return { title: block?.name ?? 'Block' };
}

export default async function BlockPage({ params }: { params: Promise<{ blockId: string }> }) {
  const { blockId } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // RLS scopes this to the caller's own rows — a block that exists but isn't
  // theirs looks exactly like one that doesn't exist.
  const block = await getBlock(supabase, blockId);
  if (!block) notFound();

  const [weeks, sessions] = await Promise.all([
    listWeeks(supabase, blockId),
    listSessionsForBlock(supabase, blockId),
  ]);

  const weekNumberById = new Map(weeks.map((week) => [week.id, week.week_number]));
  const sessionsByWeek = new Map<number, typeof sessions>();
  for (const session of sessions) {
    const weekNumber = session.week_id ? (weekNumberById.get(session.week_id) ?? 0) : 0;
    const bucket = sessionsByWeek.get(weekNumber);
    if (bucket) bucket.push(session);
    else sessionsByWeek.set(weekNumber, [session]);
  }
  const orderedWeekNumbers = [...sessionsByWeek.keys()].sort((a, b) => a - b);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="h-px w-12 bg-accent" aria-hidden="true" />
          <h1 className="pt-3 text-xl font-semibold tracking-tight text-primary">{block.name}</h1>
          <p className="text-sm text-muted">
            {SPORT_LABELS[block.sport]} · {block.start_date} → {block.end_date}
          </p>
        </div>
        <AddSessionPanel blockId={block.id} minDate={block.start_date} maxDate={block.end_date} />
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          title="No sessions yet."
          description="Add the first session on your plan — the rest can follow whenever you're ready."
        />
      ) : (
        orderedWeekNumbers.map((weekNumber) => (
          <Card key={weekNumber}>
            <CardHeader>
              <CardTitle>{weekNumber > 0 ? `Week ${weekNumber}` : 'Unscheduled'}</CardTitle>
              {weekNumber > 0 && weeks.find((w) => w.week_number === weekNumber)?.phase ? (
                <Badge tone="accent">
                  {PHASE_LABELS[weeks.find((w) => w.week_number === weekNumber)!.phase!]}
                </Badge>
              ) : null}
            </CardHeader>
            <CardContent className="p-0 px-4">
              {sessionsByWeek.get(weekNumber)!.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  blockStartDate={block.start_date}
                  blockEndDate={block.end_date}
                />
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
