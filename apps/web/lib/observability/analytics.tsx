'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

import { clientEnv } from '@/lib/env/client';

/**
 * PostHog.
 *
 * Rules, in order of importance:
 *
 *  1. It initialises only when NEXT_PUBLIC_POSTHOG_KEY is set. No key, no
 *     network calls, no cookies, nothing.
 *  2. It runs cookieless (`persistence: 'memory'`) until a consent banner
 *     exists. Switch to 'localStorage+cookie' in the same change that ships
 *     consent, not before.
 *  3. Users are identified by their Supabase user id and nothing else. No
 *     email, no name, no IP. GDPR, non-negotiable rule 5.
 *  4. Event properties carry no personal data and never any plan content:
 *     no session titles, descriptions, notes or imported plan text.
 */

let initialised = false;

function analyticsEnabled(): boolean {
  return Boolean(clientEnv.NEXT_PUBLIC_POSTHOG_KEY);
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!analyticsEnabled() || initialised) return;

    const key = clientEnv.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
      api_host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
      // Cookieless until consent exists.
      persistence: 'memory',
      disable_session_recording: true,
      autocapture: false,
      capture_pageview: true,
      // Do not let PostHog collect the IP address.
      ip: false,
      // Property blocklist as a backstop against accidental PII in an event.
      property_denylist: ['$ip', 'email', 'full_name', 'name', 'description', 'notes', 'title'],
    });

    initialised = true;
  }, []);

  return <>{children}</>;
}

/** Identify by Supabase user id only. Never pass an email or a name. */
export function identify(userId: string): void {
  if (!analyticsEnabled() || !initialised) return;
  posthog.identify(userId);
}

export function resetIdentity(): void {
  if (!analyticsEnabled() || !initialised) return;
  posthog.reset();
}

/**
 * Track a product event.
 *
 * `properties` must contain counts, ids, enums and booleans only — never free
 * text from an athlete's plan.
 */
export function track(event: string, properties?: Record<string, string | number | boolean>): void {
  if (!analyticsEnabled() || !initialised) return;
  posthog.capture(event, properties);
}
