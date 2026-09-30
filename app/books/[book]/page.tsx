import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook, getBookOverview, getBooks, getNotes } from "@/lib/content";
import { Markdown } from "@/components/markdown";
import { StatusBadge } from "@/components/chips";
import { formatDate } from "@/lib/format";

interface BookPageProps {
  params: Promise<{ book: string }>;
}

export function generateStaticParams() {
  return getBooks().map((b) => ({ book: b.slug }));
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { book } = await params;
  const data = getBook(book);
  if (!data) return { title: "Book not found" };
  return { title: data.title, description: data.summary };
}

export default async function BookPage({ params }: BookPageProps) {
  const { book: bookSlug } = await params;
  const book = getBook(bookSlug);
  if (!book) notFound();

  const notes = getNotes(bookSlug);
  const chapters = notes.filter((n) => n.chapter < 90);
  const appendices = notes.filter((n) => n.chapter >= 90);
  const overview = getBookOverview(bookSlug);

  return (
    <div className="mx-auto max-w-3xl px-6">
      <section className="flex flex-col sm:flex-row gap-6 py-10 border-b border-border">
        {book.cover && (
          <Image
            src={book.cover}
            alt={`Cover of ${book.title}`}
            width={128}
            height={160}
            priority
            className="h-40 w-32 shrink-0 rounded-md border border-border object-cover shadow-sm"
          />
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl tracking-tight">{book.title}</h1>
            <StatusBadge status={book.status} />
          </div>
          <p className="mt-1 text-muted">
            {book.author}
            {book.year ? ` · ${book.year}` : ""}
            {book.started ? ` · started ${formatDate(book.started)}` : ""}
          </p>
          {book.summary && <p className="mt-3 leading-relaxed">{book.summary}</p>}
          <p className="mt-3 text-sm font-mono text-muted">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
        </div>
      </section>

      {overview && (
        <section className="py-8 border-b border-border">
          <Markdown>{overview}</Markdown>
        </section>
      )}

      <section className="py-8">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Chapters</h2>
        <ol className="mt-4 divide-y divide-border border-y border-border">
          {chapters.map((note) => (
            <li key={note.slug}>
              <Link
                href={`/books/${bookSlug}/${note.slug}`}
                className="group flex gap-4 py-3.5 items-baseline"
              >
                <span className="w-8 shrink-0 font-mono text-sm text-muted">
                  {String(note.chapter).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium group-hover:text-accent transition-colors">
                    {note.title}
                  </span>
                  {note.summary && (
                    <span className="mt-0.5 block text-sm text-muted line-clamp-1">
                      {note.summary}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ol>

        {appendices.length > 0 && (
          <>
            <h2 className="mt-10 text-sm font-medium uppercase tracking-wider text-muted">
              Appendices
            </h2>
            <ol className="mt-4 divide-y divide-border border-y border-border">
              {appendices.map((note) => (
                <li key={note.slug}>
                  <Link
                    href={`/books/${bookSlug}/${note.slug}`}
                    className="group flex gap-4 py-3.5 items-baseline"
                  >
                    <span className="w-8 shrink-0 font-mono text-sm text-muted">
                      {String(note.chapter).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium group-hover:text-accent transition-colors">
                        {note.title}
                      </span>
                      {note.summary && (
                        <span className="mt-0.5 block text-sm text-muted line-clamp-1">
                          {note.summary}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </div>
  );
}
