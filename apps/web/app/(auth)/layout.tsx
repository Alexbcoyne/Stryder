import Link from 'next/link';

/**
 * The unauthenticated shell.
 *
 * Deliberately plain: a rule, a wordmark and the form. No hero, no gradient,
 * no artwork — the structure is the design.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-default px-4 py-5 md:px-6">
        <Link
          href="/login"
          className="font-display text-sm font-semibold tracking-[0.2em] text-primary uppercase"
        >
          Stryder
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-10 md:items-center md:py-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
