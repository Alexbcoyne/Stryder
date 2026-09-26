import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { effectiveTier, getActiveBlock, getProfile } from '@stryder/api';
import { createServerSupabaseClient } from '@stryder/api/server';

import { Card, CardContent, EmptyState } from '@/components/ui';

import { CreateBlockForm } from './create-block-form';

export const metadata: Metadata = { title: 'Add your plan' };

export default async function NewBlockPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await getProfile(supabase, user.id);
  if (!profile) redirect('/login');

  const tier = effectiveTier(profile);
  const activeBlock = await getActiveBlock(supabase);

  // The database enforces this regardless — this is just a better message
  // than a raw constraint violation would give a free-tier athlete.
  if (tier === 'free' && activeBlock) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <EmptyState
          title="You already have a block running."
          description={`The free tier holds one active block at a time. Archive "${activeBlock.name}" first, or upgrade to run more than one.`}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="flex flex-col gap-1 pb-6">
        <div className="h-px w-12 bg-accent" aria-hidden="true" />
        <h1 className="pt-3 text-xl font-semibold tracking-tight text-primary">Add your plan</h1>
        <p className="text-sm text-muted">
          Just the shape of it for now — when it starts, when it ends, what it's for. Sessions come
          next.
        </p>
      </div>

      <Card>
        <CardContent>
          <CreateBlockForm />
        </CardContent>
      </Card>
    </div>
  );
}
