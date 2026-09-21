import * as Sentry from '@sentry/nextjs';

import { sentryDsn, sharedSentryOptions } from '@/lib/observability/sentry';

/** Browser error tracking. A no-op unless a DSN is configured. */
const dsn = sentryDsn();

if (dsn) {
  Sentry.init({ dsn, ...sharedSentryOptions });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
