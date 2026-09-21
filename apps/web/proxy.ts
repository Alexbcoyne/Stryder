import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@stryder/api/middleware';

/** Routes inside `(app)`. Everything here requires a session. */
const PROTECTED_PREFIXES = ['/dashboard', '/settings'];

/** Auth pages a signed-in user has no reason to see. */
const AUTH_PREFIXES = ['/login', '/signup'];

function startsWithAny(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Runs before every matched request.
 *
 * Next 16 renamed the `middleware` file convention to `proxy`; the function
 * must be the default export or be named `proxy`.
 */
export async function proxy(request: NextRequest) {
  // Refreshes the session cookie. Server Components cannot write cookies, so
  // this is the only place a rotating refresh token can be kept alive.
  const { response, userId } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!userId && startsWithAny(pathname, PROTECTED_PREFIXES)) {
    const login = request.nextUrl.clone();
    login.pathname = '/login';
    login.search = '';
    // Remember where they were headed, but only ever as a same-site path.
    login.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  if (userId && startsWithAny(pathname, AUTH_PREFIXES)) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = '/dashboard';
    dashboard.search = '';
    return NextResponse.redirect(dashboard);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files. Without a matcher this
     * would run on every request including _next/static, so the negative
     * lookahead matters. The session still has to be refreshed on public
     * pages, so the matcher is deliberately broad and the redirect decisions
     * above are what scope the protection.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
