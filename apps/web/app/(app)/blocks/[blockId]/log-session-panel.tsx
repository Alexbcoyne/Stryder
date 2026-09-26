'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button, Input, Label, Panel } from '@/components/ui';

import { logSessionAction, type BoardActionState } from './actions';

const INITIAL: BoardActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full">
      {pending ? 'Saving…' : 'Save'}
    </Button>
  );
}

export function LogSessionPanel({
  sessionId,
  blockId,
  label,
}: {
  sessionId: string;
  blockId: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(logSessionAction, INITIAL);

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
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Log
      </Button>
      <Panel open={open} onClose={() => setOpen(false)} title={`Log: ${label}`}>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="block_id" value={blockId} />
          <input type="hidden" name="session_id" value={sessionId} />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="actual_duration_min">Duration (min)</Label>
              <Input id="actual_duration_min" name="actual_duration_min" type="number" min={0} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="actual_distance_m">Distance (m)</Label>
              <Input id="actual_distance_m" name="actual_distance_m" type="number" min={0} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rpe">RPE (1-10)</Label>
            <Input id="rpe" name="rpe" type="number" min={1} max={10} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="How did it feel?" maxLength={2000} />
          </div>

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
