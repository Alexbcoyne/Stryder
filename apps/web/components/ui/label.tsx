import type { LabelHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Adds the required marker. Use it whenever the field is required. */
  required?: boolean;
}

export function Label({ className, required = false, children, ...props }: LabelProps) {
  return (
    <label
      className={cn('block text-sm font-medium tracking-tight text-primary', className)}
      {...props}
    >
      {children}
      {required ? (
        <span className="ml-1 text-accent" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}
