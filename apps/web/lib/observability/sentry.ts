import type { NodeOptions } from '@sentry/nextjs';

/**
 * Shared Sentry options.
 *
 * Sentry initialises only when a DSN is set, and is configured so that no
 * personal data leaves the app:
 *
 *  - sendDefaultPii is off, so no IP address, cookies or request headers.
 *  - beforeSend strips the user object down to an id, and drops request data
 *    that could carry plan content.
 *
 * Source map upload is deliberately not wired up: that needs a Sentry auth
 * token in CI. Add withSentryConfig() when you add the token.
 */
export const sharedSentryOptions = {
  tracesSampleRate: 0.1,
  sendDefaultPii: false,

  beforeSend(event) {
    // Identify by user id only — no email, username or IP.
    if (event.user) {
      event.user = event.user.id ? { id: String(event.user.id) } : {};
    }

    // Request bodies and query strings can carry plan content. Neither is
    // worth the risk.
    if (event.request) {
      delete event.request.data;
      delete event.request.cookies;
      delete event.request.query_string;
      delete event.request.headers;
    }

    return event;
  },
} satisfies Partial<NodeOptions>;

export function sentryDsn(): string | undefined {
  return process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;
}
