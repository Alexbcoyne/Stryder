/**
 * Sanitise a `next=` redirect target.
 *
 * Only same-site absolute paths are allowed, so a crafted link can never bounce
 * a freshly signed-in user to another origin. Rejected: absolute URLs,
 * protocol-relative URLs (`//evil.test`), backslash variants that some clients
 * normalise to slashes, and anything with a control character in it.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = '/dashboard',
): string {
  if (typeof value !== 'string' || value.length === 0) return fallback;

  // Control characters can be used to smuggle a second header or to break the
  // parsing assumptions below.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;

  if (!value.startsWith('/')) return fallback;

  // `//host` and `/\host` are both treated as protocol-relative by browsers.
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback;

  return value;
}
