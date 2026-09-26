'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Session } from '@stryder/types';

import { Button, Panel } from '@/components/ui';

import { editSessionAction, type BoardActionState } from './actions';
import { SessionFields } from './session-fields';

const INITIAL: BoardActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full">
      {pending ? 'Saving…' : 'Save changes'}
    </Button>
  );
}

export function EditSessionPanel({
  session,
  minDate,
  maxDate,
}: {
  session: Session;
  minDate: string;
  maxDate: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(editSessionAction, INITIAL);
  const [date, setDate] = useState(session.scheduled_date);

  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (!state.error) setOpen(false);
  }

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Panel
        open={open}
        onClose={() => setOpen(false)}
        title={`Edit: ${session.title ?? session.session_type}`}
      >
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="block_id" value={session.block_id} />
          <input type="hidden" name="session_id" value={session.id} />

          <SessionFields
            minDate={minDate}
            maxDate={maxDate}
            date={date}
            onDateChange={setDate}
            defaultSessionType={session.session_type}
            defaultTitle={session.title ?? ''}
            defaultIntensity={session.intensity ?? ''}
            defaultDurationMin={session.planned_duration_min}
            defaultDistanceM={session.planned_distance_m}
          />

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
