import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders a disabled button with a waiting label. */
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-contrast hover:brightness-110 border border-accent',
  secondary: 'bg-card text-primary border border-strong hover:bg-hover',
  ghost: 'bg-transparent text-muted border border-transparent hover:bg-hover hover:text-primary',
  danger: 'bg-transparent text-error border border-error/60 hover:bg-error/10',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

/** Shared with LinkButton, so an `<a>` styled as a button never drifts from a real one. */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md'): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded font-medium',
    'transition-colors duration-150',
    variants[variant],
    sizes[size],
  );
}

/**
 * Transitions are colour-only and fast: they show the control responding,
 * nothing more. No scale, no glow.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={cn(
        buttonClasses(variant, size),
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
