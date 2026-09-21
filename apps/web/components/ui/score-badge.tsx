import { scoreBandOrNull } from '@stryder/utils';

import { cn } from '@/lib/cn';

export interface ScoreBadgeProps {
  /** Stryder Score, 0-100. Null renders the "no score yet" state. */
  score: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  /** Show the band name beside the number. */
  showLabel?: boolean;
  className?: string;
}

const sizes = {
  sm: { value: 'text-lg', label: 'text-xs' },
  md: { value: 'text-3xl', label: 'text-xs' },
  lg: { value: 'text-5xl', label: 'text-sm' },
} as const;

/**
 * The Stryder Score, coloured by its band.
 *
 * Band colours come from `scoreBand()` via the CSS custom property it names,
 * so the score never picks up a semantic success/error colour and the mapping
 * lives in exactly one place.
 */
export function ScoreBadge({ score, size = 'md', showLabel = true, className }: ScoreBadgeProps) {
  const band = scoreBandOrNull(score);
  const scale = sizes[size];

  if (!band) {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <span className={cn('font-mono text-muted tabular-nums', scale.value)} data-metric>
          --
        </span>
        {showLabel ? (
          <span className={cn('font-medium tracking-tight text-muted', scale.label)}>
            No score yet
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span
        className={cn('font-mono leading-none font-semibold tabular-nums', scale.value)}
        style={{ color: `var(${band.cssVar})` }}
        data-metric
        aria-label={`Stryder Score ${Math.floor(score ?? 0)}, ${band.label}`}
      >
        {Math.floor(score ?? 0)}
      </span>
      {showLabel ? (
        <span
          className={cn('font-medium tracking-tight', scale.label)}
          style={{ color: `var(${band.cssVar})` }}
        >
          {band.label}
        </span>
      ) : null}
    </div>
  );
}
