'use client';

import { useActionState } from 'react';

import { Button, Input, Label } from '@/components/ui';

import { updateTimezone, type SettingsActionState } from './actions';

const INITIAL: SettingsActionState = { error: null, saved: false };

/**
 * Timezone decides when Monday morning is for this athlete, which is what the
 * weekly summary is scheduled against.
 */
export function TimezoneForm({ timezone }: { timezone: string }) {
  const [state, formAction, pending] = useActionState(updateTimezone, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="timezone">Timezone</Label>
        <Input
          id="timezone"
          name="timezone"
          defaultValue={timezone}
          required
          aria-describedby="timezone-hint"
        />
        <p id="timezone-hint" className="text-xs text-muted">
          An IANA name such as Europe/Dublin. Your Monday summary arrives on your Monday.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" variant="secondary" loading={pending}>
          {pending ? 'Saving…' : 'Save'}
        </Button>
        {state.saved ? (
          <span role="status" className="text-xs text-success">
            Saved
          </span>
        ) : null}
        {state.error ? (
          <span role="alert" className="text-xs text-error">
            {state.error}
          </span>
        ) : null}
      </div>
    </form>
  );
}
