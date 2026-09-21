import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  /** Reads as a starting line, not an absence: "Your block starts here". */
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * An empty state is an invitation. The rule above the title marks a start
 * line — the structure carries the meaning, not decoration.
 */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-start gap-3 py-10', className)}>
      <div className="h-px w-12 bg-accent" aria-hidden="true" />
      <h2 className="text-lg font-semibold tracking-tight text-primary">{title}</h2>
      {description ? <p className="max-w-prose text-sm text-muted">{description}</p> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
