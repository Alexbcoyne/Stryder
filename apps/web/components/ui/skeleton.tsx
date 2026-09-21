import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

/**
 * A loading placeholder. It pulses opacity only — enough to read as "not ready
 * yet" without shimmer or gradient sweeps.
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded bg-hover', className)}
      {...props}
    />
  );
}
