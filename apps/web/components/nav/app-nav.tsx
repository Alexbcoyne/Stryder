'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

import { NAV_ITEMS } from './nav-items';

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Bottom bar on mobile. Mobile-first: this is the primary navigation. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-default bg-card md:hidden"
    >
      <ul className="flex">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-14 flex-col items-center justify-center gap-1 text-xs font-medium',
                  'transition-colors duration-150',
                  active ? 'text-accent' : 'text-muted hover:text-primary',
                )}
              >
                {/* The active marker is a rule, not a pill or a glow. */}
                <span
                  aria-hidden="true"
                  className={cn('h-px w-6', active ? 'bg-accent' : 'bg-transparent')}
                />
                {item.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Side rail on desktop. */
export function SideRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="hidden w-56 shrink-0 border-r border-default md:flex md:flex-col"
    >
      <div className="border-b border-default px-5 py-5">
        <span className="font-display text-sm font-semibold tracking-[0.2em] text-primary uppercase">
          Stryder
        </span>
      </div>
      <ul className="flex flex-col py-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 border-l-2 px-5 py-2.5 text-sm font-medium',
                  'transition-colors duration-150',
                  active
                    ? 'border-accent text-primary'
                    : 'border-transparent text-muted hover:bg-hover hover:text-primary',
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
