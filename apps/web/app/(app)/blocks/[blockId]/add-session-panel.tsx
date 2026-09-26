'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  INTENSITIES,
  INTENSITY_LABELS,
  SESSION_TYPE_LABELS,
  SESSION_TYPES,
} from '@stryder/constants';

import { Button, Input, Label, Panel, Select } from '@/components/ui';

import { addSessionAction, type BoardActionState } from './actions';

const INITIAL: BoardActionState = { error: null };

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
      <Button onClick={() => setOpen(true)}>Add session</Button>
      <Panel open={open} onClose={() => setOpen(false)} title="Add session">
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="block_id" value={blockId} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="scheduled_date" required>
              Date
            </Label>
            <Input
              id="scheduled_date"
              name="scheduled_date"
              type="date"
              min={minDate}
              max={maxDate}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="session_type" required>
              Type
            </Label>
            <Select id="session_type" name="session_type" defaultValue="run" required>
              {SESSION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {SESSION_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Optional — e.g. 6x800m" maxLength={120} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="intensity">Intensity</Label>
            <Select id="intensity" name="intensity" defaultValue="">
              <option value="">Not set</option>
              {INTENSITIES.map((intensity) => (
                <option key={intensity} value={intensity}>
                  {INTENSITY_LABELS[intensity]}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="planned_duration_min">Duration (min)</Label>
              <Input id="planned_duration_min" name="planned_duration_min" type="number" min={0} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="planned_distance_m">Distance (m)</Label>
              <Input id="planned_distance_m" name="planned_distance_m" type="number" min={0} />
            </div>
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
