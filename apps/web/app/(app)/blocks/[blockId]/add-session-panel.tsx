'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button, Panel } from '@/components/ui';

import { addSessionAction, type BoardActionState } from './actions';
import { SessionFields } from './session-fields';

const INITIAL: BoardActionState = { error: null };

/** Today in the browser's own local date, not UTC. */
function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Today if it falls inside the block, otherwise whichever edge is closer. */
function defaultSessionDate(minDate: string, maxDate: string): string {
  const today = todayIso();
  if (today < minDate) return minDate;
  if (today > maxDate) return maxDate;
  return today;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full">
      {pending ? 'Adding…' : 'Add session'}
    </Button>
  );
}

export function AddSessionPanel({
  blockId,
  minDate,
  maxDate,
}: {
  blockId: string;
  minDate: string;
  maxDate: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addSessionAction, INITIAL);
  // Defaulted so adding "today's session" — the common case — needs no date
  // picker interaction at all.
  const [date, setDate] = useState(() => defaultSessionDate(minDate, maxDate));

  // Close the panel once a submission succeeds. Comparing against the last
  // seen state during render (not in an effect) is React's own pattern for
  // reacting to a state change without an extra render round-trip.
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (!state.error) setOpen(false);
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Add session
      </Button>
      <Panel open={open} onClose={() => setOpen(false)} title="Add session">
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="block_id" value={blockId} />

          <SessionFields minDate={minDate} maxDate={maxDate} date={date} onDateChange={setDate} />

          {state.error ? (
            <p role="alert" className="border-l-2 border-error py-1 pl-3 text-sm text-error">
              {state.error}
            </p>
          ) : null}

          <SubmitButton />
        </form>
      </Panel>
    </>
  );
}
