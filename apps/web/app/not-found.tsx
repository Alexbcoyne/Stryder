import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-start justify-center gap-4 px-4">
      <div className="h-px w-12 bg-accent" aria-hidden="true" />
      <h1 className="text-xl font-semibold tracking-tight text-primary">Nothing scheduled here</h1>
      <p className="text-sm text-muted">
        That page does not exist. Your plan is still where you left it.
      </p>
      <Link href="/dashboard" className="text-sm text-accent hover:underline">
        Back to your dashboard
      </Link>
    </div>
  );
}
