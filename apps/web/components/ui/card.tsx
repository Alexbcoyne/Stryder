import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export type CardProps = HTMLAttributes<HTMLDivElement>;

/**
 * A surface with a rule around it. Cards are distinguished by content and
 * structure, never by being the same box in a different colour.
 */
export function Card({ className, ...props }: CardProps) {
  return <div className={cn('rounded-lg border border-default bg-card', className)} {...props} />;
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 border-b border-default p-4',
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-sm font-semibold tracking-tight text-primary', className)} {...props} />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('p-4', className)} {...props} />;
}
