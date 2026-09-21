'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui';

import type { AuthActionState } from './actions';

const INITIAL: AuthActionState = { error: null };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" loading={pending} className="w-full">
      {pending ? pendingLabel : label}
    </Button>
  );
}

export interface AuthFormProps {
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  submitLabel: string;
  pendingLabel: string;
  children: React.ReactNode;
  /** Hidden `next` value carried through sign-in. */
  next?: string;
}

/**
 * Shared form wrapper: runs a server action, shows its error and disables the
 * submit button while it is in flight.
 */
export function AuthForm({ action, submitLabel, pendingLabel, children, next }: AuthFormProps) {
  const [state, formAction] = useActionState(action, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {children}

      {state.error ? (
        <p role="alert" className="border-l-2 border-error py-1 pl-3 text-sm text-error">
          {state.error}
        </p>
      ) : null}

      <SubmitButton label={submitLabel} pendingLabel={pendingLabel} />
    </form>
  );
}
