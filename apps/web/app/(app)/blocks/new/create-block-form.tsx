'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { SPORT_LABELS, SPORTS } from '@stryder/constants';

import { Button, DateField, Input, Label, Select } from '@/components/ui';
import { cn } from '@/lib/cn';

import { createBlockAction, type CreateBlockActionState } from './actions';

const INITIAL: CreateBlockActionState = { error: null };

/** Today in the browser's own local date, not UTC — what a date picker's "today" should mean. */
function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysIso(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DURATION_PRESETS = [4, 8, 12, 16, 20] as const;

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

  // Defaulted to today so the common case — starting a block now — needs no
  // date-picker interaction at all. The two calendar pickers are the
  // exception path, not the first thing you have to touch.
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(addDaysIso(todayIso(), 12 * 7 - 1));
  const [activePreset, setActivePreset] = useState<number | null>(12);

  function applyPreset(weeks: number) {
    setEndDate(addDaysIso(startDate, weeks * 7 - 1));
    setActivePreset(weeks);
  }

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

      <div className="flex flex-col gap-1.5">
        <Label>Length</Label>
        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map((weeks) => (
            <button
              key={weeks}
              type="button"
              onClick={() => applyPreset(weeks)}
              className={cn(
                'rounded border px-3 py-1.5 text-sm font-medium transition-colors duration-150',
                activePreset === weeks
                  ? 'border-accent bg-accent text-accent-contrast'
                  : 'border-strong text-muted hover:border-accent/50 hover:text-primary',
              )}
            >
              {weeks} weeks
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">Sets the end date for you — both stay editable below.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date" required>
            Starts
          </Label>
          <DateField
            id="start_date"
            name="start_date"
            required
            value={startDate}
            onChange={(event) => {
              const next = event.target.value;
              setStartDate(next);
              // Keep the chosen length rather than the raw end date, so
              // moving the start date doesn't quietly shrink or stretch the
              // block.
              if (activePreset) setEndDate(addDaysIso(next, activePreset * 7 - 1));
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end_date" required>
            Ends
          </Label>
          <DateField
            id="end_date"
            name="end_date"
            required
            min={startDate}
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              // A hand-picked end date is no longer "one of the presets".
              setActivePreset(null);
            }}
          />
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
