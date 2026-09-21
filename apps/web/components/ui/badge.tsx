import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'accent' | 'success' | 'error' | 'warning';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  neutral: 'border-strong text-muted',
  accent: 'border-accent/50 text-accent',
  success: 'border-success/50 text-success',
  error: 'border-error/50 text-error',
  warning: 'border-warning/50 text-warning',
};

/**
 * A small outlined label. For the Stryder Score use ScoreBadge instead: score
 * colours belong to the score and must not be reused for generic state.
 */
export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium tracking-tight',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
