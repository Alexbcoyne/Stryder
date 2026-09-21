'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

import { Button } from '@/components/ui';

/**
 * Route-level error boundary.
 *
 * Shows what went wrong without leaking anything: the message is fixed copy
 * and the digest is the only identifier surfaced.
 */
export default function Error({
  error,
  reset,
}: {
  error: globalThis.Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-start justify-center gap-4 px-4">
      <div className="h-px w-12 bg-error" aria-hidden="true" />
      <h1 className="text-xl font-semibold tracking-tight text-primary">Something broke</h1>
      <p className="text-sm text-muted">
        That one is on us, not on your training. Try again — if it keeps happening, let us know.
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted" data-metric>
          Reference: {error.digest}
        </p>
      ) : null}
      <Button onClick={reset} variant="secondary">
        Try again
      </Button>
    </div>
  );
}
