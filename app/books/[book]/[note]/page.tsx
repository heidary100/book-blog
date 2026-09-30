import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook, getBooks, getNote, getNotes, getPrevNext, noteHref } from "@/lib/content";
import { Markdown } from "@/components/markdown";
import { TagChip } from "@/components/chips";
import { formatDate } from "@/lib/format";

interface NotePageProps {
  params: Promise<{ book: string; note: string }>;
}

export function generateStaticParams() {
  return getBooks().flatMap((book) =>
    getNotes(book.slug).map((note) => ({ book: book.slug, note: note.slug }))
  );
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { book, note } = await params;
  const data = getNote(book, note);
  if (!data) return { title: "Note not found" };
  return { title: data.title, description: data.summary };
}

export default async function NotePage({ params }: NotePageProps) {
  const { book: bookSlug, note: noteSlug } = await params;
  const book = getBook(bookSlug);
  const note = getNote(bookSlug, noteSlug);
  if (!book || !note) notFound();

  const { prev, next } = getPrevNext(bookSlug, note.chapter);

  return (
    <div className="mx-auto max-w-3xl px-6">
      <nav className="pt-8 text-sm text-muted">
        <Link href={`/books/${bookSlug}`} className="font-serif italic hover:text-accent transition-colors">
          {book.title}
        </Link>
        <span className="mx-2">/</span>
        <span>{note.chapter < 90 ? `Chapter ${note.chapter}` : "Appendix"}</span>
      </nav>

      <header className="mt-4 pb-6 border-b border-border">
        <h1 className="font-serif text-3xl sm:text-4xl tracking-tight">{note.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          {note.date && <time dateTime={note.date}>{formatDate(note.date)}</time>}
          {note.tags.length > 0 && (
            <span className="flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </span>
          )}
        </div>
        {note.summary && <p className="mt-4 text-muted leading-relaxed">{note.summary}</p>}
      </header>

      <article className="py-8">
        <Markdown>{note.content}</Markdown>
      </article>

      <nav className="grid gap-3 border-t border-border py-8 sm:grid-cols-2">
        {prev ? (
          <Link
            href={noteHref(prev)}
            className="group rounded-lg border border-border bg-card p-4 hover:border-accent transition-colors"
          >
            <span className="block text-xs uppercase tracking-wider text-muted">Previous</span>
            <span className="mt-1 block font-medium group-hover:text-accent transition-colors">
              {prev.chapter < 90 ? `${prev.chapter}. ` : ""}
              {prev.title}
            </span>
          </Link>
        ) : (
          <span aria-hidden />
        )}
        {next && (
          <Link
            href={noteHref(next)}
            className="group rounded-lg border border-border bg-card p-4 text-right sm:text-right hover:border-accent transition-colors"
          >
            <span className="block text-xs uppercase tracking-wider text-muted">Next</span>
            <span className="mt-1 block font-medium group-hover:text-accent transition-colors">
              {next.chapter < 90 ? `${next.chapter}. ` : ""}
              {next.title}
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}
