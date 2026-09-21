import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Marks the field invalid and wires it to the message element. */
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid = false, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-10 w-full rounded border bg-background px-3 text-sm text-primary',
        'placeholder:text-muted',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid ? 'border-error' : 'border-strong hover:border-accent/50',
        className,
      )}
      {...props}
    />
  );
});
