export interface NavItem {
  href: string;
  label: string;
  /** Short label for the mobile bottom bar. */
  short: string;
}

/**
 * The authenticated navigation. One list, rendered as a bottom bar on mobile
 * and a side rail on desktop, so the two can never drift apart.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', short: 'Today' },
  { href: '/settings', label: 'Settings', short: 'Settings' },
];
