import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight">This page is missing</h1>
      <p className="mt-3 text-muted">The note you are looking for does not exist (yet).</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md border border-border bg-card px-4 py-2 text-sm hover:border-accent hover:text-accent transition-colors"
      >
        Back to the library
      </Link>
    </div>
  );
}
