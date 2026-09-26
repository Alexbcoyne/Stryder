/**
 * Placeholder mark: three ascending bars, pure geometry, no gradient or
 * glow. There is no source logo file in the repo — swap this for the real
 * asset whenever one exists. Uses currentColor so `className="text-accent"`
 * (or any text colour) tints it.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <rect x="2" y="14" width="4" height="8" />
      <rect x="10" y="8" width="4" height="14" />
      <rect x="18" y="2" width="4" height="20" />
    </svg>
  );
}
