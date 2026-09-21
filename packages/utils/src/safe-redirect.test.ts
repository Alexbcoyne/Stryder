import { describe, expect, it } from 'vitest';

import { safeRedirectPath } from './safe-redirect';

describe('safeRedirectPath', () => {
  it('keeps same-site paths', () => {
    expect(safeRedirectPath('/dashboard')).toBe('/dashboard');
    expect(safeRedirectPath('/settings?tab=account')).toBe('/settings?tab=account');
    expect(safeRedirectPath('/blocks/123#week-2')).toBe('/blocks/123#week-2');
  });

  it('falls back when there is nothing to redirect to', () => {
    expect(safeRedirectPath(null)).toBe('/dashboard');
    expect(safeRedirectPath(undefined)).toBe('/dashboard');
    expect(safeRedirectPath('')).toBe('/dashboard');
  });

  it('uses the caller-supplied fallback', () => {
    expect(safeRedirectPath(null, '/login')).toBe('/login');
  });

  it.each([
    'https://evil.test',
    'http://evil.test/dashboard',
    '//evil.test',
    '//evil.test/dashboard',
    '/\\evil.test',
    'javascript:alert(1)',
    'dashboard',
    '../dashboard',
  ])('rejects off-site target %s', (target) => {
    expect(safeRedirectPath(target)).toBe('/dashboard');
  });

  it('rejects control characters', () => {
    expect(safeRedirectPath('/dashboard\nLocation: https://evil.test')).toBe('/dashboard');
    expect(safeRedirectPath('/dash\u0000board')).toBe('/dashboard');
  });

  it('rejects values that are not strings at runtime', () => {
    expect(safeRedirectPath(42 as unknown as string)).toBe('/dashboard');
  });
});
