import Link from "next/link";
import Image from "next/image";
import type { Book } from "@/lib/content";
import { StatusBadge } from "@/components/chips";

export function BookCard({ book, noteCount }: { book: Book; noteCount: number }) {
  return (
    <Link
      href={`/books/${book.slug}`}
      className="group flex gap-5 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
    >
      {book.cover && (
        <Image
          src={book.cover}
          alt={`Cover of ${book.title}`}
          width={84}
          height={105}
          className="h-[105px] w-[84px] shrink-0 rounded-md border border-border object-cover"
        />
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="font-serif text-lg leading-snug group-hover:text-accent transition-colors">
            {book.title}
          </h3>
          <StatusBadge status={book.status} />
        </div>
        <p className="mt-0.5 text-sm text-muted">
          {book.author}
          {book.year ? ` · ${book.year}` : ""}
        </p>
        {book.summary && <p className="mt-2 line-clamp-2 text-sm">{book.summary}</p>}
        <p className="mt-2 text-xs font-mono text-muted">
          {noteCount} {noteCount === 1 ? "note" : "notes"}
        </p>
      </div>
    </Link>
  );
}
