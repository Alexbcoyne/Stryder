import Link, { type LinkProps } from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

import { buttonClasses, type ButtonSize, type ButtonVariant } from './button';

export interface LinkButtonProps
  extends LinkProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** A styled `<a>` for navigation that should look like a Button — a real link, not a click handler. */
export function LinkButton({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: LinkButtonProps) {
  return <Link className={cn(buttonClasses(variant, size), className)} {...props} />;
}
