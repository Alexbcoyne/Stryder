'use client';

import { useRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

import { Input } from './input';

export type DateFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * A date input with one visible calendar trigger.
 *
 * Plain `<input type="date">` still lets you type a date directly — every
 * browser supports that — but Chrome's own calendar icon is easy to miss
 * inside a styled field. This adds an explicit, larger button that opens the
 * same native picker via `showPicker()`, and hides the browser's own icon so
 * there's only one target instead of two overlapping ones.
 */
export function DateField({ className, ...props }: DateFieldProps) {
  const ref = useRef<HTMLInputElement>(null);

  function openPicker() {
    const el = ref.current;
    if (!el) return;

    // showPicker() isn't in every browser yet, and can throw without a
    // direct user gesture — falling back to a focus at least puts the
    // caret where typing works.
    const withPicker = el as HTMLInputElement & { showPicker?: () => void };
    if (typeof withPicker.showPicker === 'function') {
      try {
        withPicker.showPicker();
        return;
      } catch {
        // fall through to focus below
      }
    }
    el.focus();
  }

  return (
    <div className="relative">
      <Input ref={ref} type="date" className={cn('pr-10', className)} {...props} />
      <button
        type="button"
        onClick={openPicker}
        tabIndex={-1}
        aria-label="Open calendar"
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted transition-colors duration-150 hover:text-accent"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-4 w-4"
        >
          <rect x="2.5" y="4" width="15" height="13.5" rx="1" />
          <path d="M2.5 8h15M6.5 2.5v3M13.5 2.5v3" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
