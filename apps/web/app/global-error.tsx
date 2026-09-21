'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

/**
 * Last-resort boundary: catches errors in the root layout itself, so it has to
 * render its own <html> and cannot rely on tokens or components.
 */
export default function GlobalError({ error }: { error: globalThis.Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          background: '#0F1117',
          color: '#F5F5F0',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          minHeight: '100dvh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Something broke</h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Reload the page. If it keeps happening, let us know.
          </p>
        </div>
      </body>
    </html>
  );
}
