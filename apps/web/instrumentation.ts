import * as Sentry from '@sentry/nextjs';

import { sentryDsn, sharedSentryOptions } from '@/lib/observability/sentry';

/**
 * Server and edge runtime error tracking.
 *
 * A no-op unless a DSN is configured, so local development and CI send
 * nothing anywhere.
 */
export async function register() {
  const dsn = sentryDsn();
  if (!dsn) return;

  Sentry.init({ dsn, ...sharedSentryOptions });
}

export const onRequestError = Sentry.captureRequestError;
