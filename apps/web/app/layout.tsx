import type { Metadata, Viewport } from 'next';

import { fontVariables } from '@/lib/fonts';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Stryder',
    template: '%s · Stryder',
  },
  description: 'Bring any plan. Stryder holds you to it.',
  // No hardcoded domain: the canonical URL comes from the environment.
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
};

export const viewport: Viewport = {
  themeColor: '#0F1117',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh bg-background text-primary antialiased">{children}</body>
    </html>
  );
}
