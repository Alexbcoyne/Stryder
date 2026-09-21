'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui';

import { signInWithGoogle, type AuthActionState } from './actions';

const INITIAL: AuthActionState = { error: null };

export function GoogleButton({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signInWithGoogle, INITIAL);

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction}>
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <Button type="submit" variant="secondary" size="lg" loading={pending} className="w-full">
          Continue with Google
        </Button>
      </form>
      {state.error ? (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
