'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createServerSupabaseClient } from '@stryder/api/server';

import { safeRedirectPath } from '@stryder/utils';

/**
 * Auth server actions.
 *
 * Every action validates its input with Zod before it reaches Supabase, and
 * returns a plain `{ error }` shape rather than throwing, so the forms can show
 * the message without a client-side Supabase call.
 */

export interface AuthActionState {
  error: string | null;
}

const emailSchema = z.email({ message: 'Enter a valid email address.' });
const passwordSchema = z
  .string()
  .min(8, { message: 'Use at least 8 characters.' })
  .max(72, { message: 'Passwords are limited to 72 characters.' });

const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Check the details you entered.';
}

/** The app's own origin, for OAuth and email redirect URLs. Never hardcoded. */
async function appOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, '');

  const host = (await headers()).get('host') ?? 'localhost:3000';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  // Deliberately generic: distinguishing "no such account" from "wrong
  // password" tells an attacker which emails are registered.
  if (error) return { error: 'That email and password combination did not work.' };

  revalidatePath('/', 'layout');
  redirect(safeRedirectPath(formData.get('next')?.toString()));
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema
    .extend({ fullName: z.string().trim().min(1).max(120).optional() })
    .safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      fullName: formData.get('fullName')?.toString() || undefined,
    });

  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createServerSupabaseClient();
  const origin = await appOrigin();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      // The database trigger reads full_name from here when it creates the
      // public.users row and opens the 30-day trial.
      ...(parsed.data.fullName ? { data: { full_name: parsed.data.fullName } } : {}),
    },
  });

  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signInWithGoogle(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createServerSupabaseClient();
  const origin = await appOrigin();
  const next = safeRedirectPath(formData.get('next')?.toString());

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) return { error: 'Could not start Google sign-in. Try again.' };

  redirect(data.url);
}

export async function requestPasswordReset(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) return { error: 'Enter a valid email address.' };

  const supabase = await createServerSupabaseClient();
  const origin = await appOrigin();

  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
  });

  // Always reports success: whether an address has an account is not something
  // an unauthenticated caller gets to learn.
  redirect('/forgot-password?sent=1');
}

export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = passwordSchema.safeParse(formData.get('password'));
  if (!parsed.success) return { error: firstError(parsed.error) };

  if (formData.get('password') !== formData.get('confirmPassword')) {
    return { error: 'Those passwords do not match.' };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });

  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut(): Promise<never> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  redirect('/login');
}
