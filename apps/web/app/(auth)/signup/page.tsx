import type { Metadata } from 'next';
import Link from 'next/link';
import { TRIAL_DAYS } from '@stryder/constants';

import { Input, Label } from '@/components/ui';

import { signUp } from '../actions';
import { AuthForm } from '../auth-form';
import { GoogleButton } from '../google-button';

export const metadata: Metadata = { title: 'Sign up' };

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="h-px w-12 bg-accent" aria-hidden="true" />
        <h1 className="pt-3 text-xl font-semibold tracking-tight text-primary">
          Bring any plan. Stryder holds you to it.
        </h1>
        <p className="text-sm text-muted">
          {TRIAL_DAYS} days of everything, no card. Then stay free or upgrade.
        </p>
      </div>

      <AuthForm action={signUp} submitLabel="Create account" pendingLabel="Creating account…">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Name</Label>
          <Input id="fullName" name="fullName" type="text" autoComplete="name" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" required>
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="text-xs text-muted">
            At least 8 characters.
          </p>
        </div>
      </AuthForm>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs text-muted">or</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <GoogleButton />

      <p className="text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
