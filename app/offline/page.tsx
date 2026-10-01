import Link from "next/link";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="font-mono text-sm text-muted">offline</p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight">You&apos;re offline</h1>
      <p className="mt-3 text-muted leading-relaxed">
        This page hasn&apos;t been cached yet. Notes you have visited before are still available —
        they&apos;ll sync the next time you&apos;re online.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md border border-border bg-card px-4 py-2 text-sm hover:border-accent hover:text-accent transition-colors"
      >
        Back to the library
      </Link>
    </div>
  );
}
