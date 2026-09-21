import type { Metadata } from 'next';

import { Button, EmptyState } from '@/components/ui';

export const metadata: Metadata = { title: 'Dashboard' };

/**
 * Placeholder dashboard.
 *
 * Block creation, the macro/meso board, session logging and the Stryder Score
 * are all later sessions. This page exists to prove the authenticated shell
 * renders — do not grow it into the real dashboard by accident.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-xl font-semibold tracking-tight text-primary">Dashboard</h1>

      <EmptyState
        title="Your block starts here."
        description="Load the plan you are already following — a calendar feed, a PDF, or entered by hand — and Stryder will track every session against it from day one."
        action={
          <Button disabled title="Block creation lands in the next session">
            Add your plan
          </Button>
        }
      />
    </div>
  );
}
