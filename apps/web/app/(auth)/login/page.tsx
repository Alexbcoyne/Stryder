import type { Metadata } from 'next';
import Link from 'next/link';

import { Input, Label } from '@/components/ui';
import { safeRedirectPath } from '@stryder/utils';

import { signIn } from '../actions';
import { AuthForm } from '../auth-form';
import { GoogleButton } from '../google-button';

export const metadata: Metadata = { title: 'Log in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeRedirectPath((await searchParams).next);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="h-px w-12 bg-accent" aria-hidden="true" />
        <h1 className="pt-3 text-xl font-semibold tracking-tight text-primary">Welcome back</h1>
        <p className="text-sm text-muted">Pick up where your plan left off.</p>
      </div>

      <AuthForm action={signIn} submitLabel="Log in" pendingLabel="Logging in…" next={next}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password" required>
              Password
            </Label>
            <Link href="/forgot-password" className="text-xs text-muted hover:text-primary">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
      </AuthForm>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs text-muted">or</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <GoogleButton next={next} />

      <p className="text-sm text-muted">
        New here?{' '}
        <Link href="/signup" className="text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
