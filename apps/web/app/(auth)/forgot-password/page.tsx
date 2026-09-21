import type { Metadata } from 'next';
import Link from 'next/link';

import { Input, Label } from '@/components/ui';

import { requestPasswordReset } from '../actions';
import { AuthForm } from '../auth-form';

export const metadata: Metadata = { title: 'Forgot password' };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const sent = (await searchParams).sent === '1';

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-px w-12 bg-accent" aria-hidden="true" />
        <h1 className="text-xl font-semibold tracking-tight text-primary">Check your email</h1>
        <p className="text-sm text-muted">
          If that address has a Stryder account, a reset link is on its way. The link expires in an
          hour.
        </p>
        <Link href="/login" className="text-sm text-accent hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="h-px w-12 bg-accent" aria-hidden="true" />
        <h1 className="pt-3 text-xl font-semibold tracking-tight text-primary">Reset password</h1>
        <p className="text-sm text-muted">We will email you a link to set a new one.</p>
      </div>

      <AuthForm action={requestPasswordReset} submitLabel="Send reset link" pendingLabel="Sending…">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
      </AuthForm>

      <Link href="/login" className="text-sm text-muted hover:text-primary">
        Back to log in
      </Link>
    </div>
  );
}
