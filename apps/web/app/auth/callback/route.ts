import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@stryder/api/server';

import { safeRedirectPath } from '@stryder/utils';

/**
 * OAuth and email-link callback.
 *
 * Exchanges the one-time code for a session, then sends the user on. The
 * destination is sanitised to a same-site path so the callback cannot be used
 * as an open redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = safeRedirectPath(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
