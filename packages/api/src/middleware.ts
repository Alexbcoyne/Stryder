import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@stryder/types';

import { supabaseAnonKey, supabaseUrl } from './env';

export interface SessionRefreshResult {
  /** The response to return, carrying any refreshed auth cookies. */
  response: NextResponse;
  /** The signed-in user's id, or null when there is no valid session. */
  userId: string | null;
}

/**
 * Refresh the Supabase session on an incoming request.
 *
 * Server Components cannot write cookies, so the middleware is the one place
 * that can keep a rotating refresh token alive. Call this on every matched
 * request and return the response it hands back, cookies intact.
 */
export async function updateSession(request: NextRequest): Promise<SessionRefreshResult> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do not remove: this call is what refreshes the session, and going to the
  // auth server (rather than reading the cookie) is what makes the result
  // trustworthy for the redirect decision in the middleware.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, userId: user?.id ?? null };
}
