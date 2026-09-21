import type { NextConfig } from 'next';

/**
 * Content Security Policy.
 *
 * A starter policy, deliberately tight at the connect/frame level and loose
 * where Next needs it:
 *
 * - `'unsafe-inline'` on script-src is required by Next's inline bootstrap.
 *   Tightening it means moving to nonces, which is worth doing before launch.
 * - connect-src allows Supabase, PostHog and Sentry only. An exfiltration
 *   attempt to anywhere else is blocked by the browser.
 * - frame-ancestors 'none' is the modern X-Frame-Options and is what actually
 *   stops clickjacking.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.posthog.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
  {
    // Two years, subdomains included. Vercel serves HTTPS only.
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Legacy companion to frame-ancestors, for older browsers.
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Nothing in Stryder needs these. Revisit if a share flow ever wants the
    // camera or the clipboard.
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@stryder/api', '@stryder/constants', '@stryder/types', '@stryder/utils'],
  typedRoutes: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
