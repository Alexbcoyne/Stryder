'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { SPORT_LABELS, SPORTS } from '@stryder/constants';

import { Button, Input, Label, Select } from '@/components/ui';

import { createBlockAction, type CreateBlockActionState } from './actions';

const INITIAL: CreateBlockActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} className="w-full">
      {pending ? 'Creating…' : 'Create block'}
    </Button>
  );
}

export function CreateBlockForm() {
  const [state, formAction] = useActionState(createBlockAction, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" required>
          Name
        </Label>
        <Input id="name" name="name" placeholder="Dublin Marathon" required maxLength={120} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sport">Sport</Label>
        <Select id="sport" name="sport" defaultValue="other">
          {SPORTS.map((sport) => (
            <option key={sport} value={sport}>
              {SPORT_LABELS[sport]}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date" required>
            Starts
          </Label>
          <Input id="start_date" name="start_date" type="date" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end_date" required>
            Ends
          </Label>
          <Input id="end_date" name="end_date" type="date" required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="goal_event">Goal event</Label>
        <Input id="goal_event" name="goal_event" placeholder="Optional" maxLength={120} />
      </div>

      {state.error ? (
        <p role="alert" className="border-l-2 border-error py-1 pl-3 text-sm text-error">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
