import Link from "next/link";
import { getBooks, getNotes, getRecentNotes, getTagMap } from "@/lib/content";
import { BookCard } from "@/components/book-card";
import { NoteListItem } from "@/components/note-list-item";
import { TagChip } from "@/components/chips";

export default function HomePage() {
  const books = getBooks();
  const recent = getRecentNotes(6);
  const tagMap = getTagMap();
  const topTags = [...tagMap.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 12);

  return (
    <div className="mx-auto max-w-3xl px-6">
      <section className="py-14 border-b border-border">
        <h1 className="font-serif text-4xl sm:text-5xl tracking-tight">
          Notes in the <span className="italic text-accent">margins</span>
        </h1>
        <p className="mt-4 max-w-xl text-muted leading-relaxed">
          A quiet corner of the web where I keep what books teach me — chapter by chapter — so
          future-me can find and revise it.
        </p>
      </section>

      <section className="py-10 border-b border-border">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Library</h2>
        <div className="mt-5 space-y-4">
          {books.map((book) => (
            <BookCard key={book.slug} book={book} noteCount={getNotes(book.slug).length} />
          ))}
          {books.length === 0 && (
            <p className="text-sm text-muted">No books yet — add one in the admin UI.</p>
          )}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="py-10 border-b border-border">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
              Recently updated
            </h2>
            <Link href="/tags" className="text-sm text-accent hover:underline underline-offset-4">
              Browse by concept →
            </Link>
          </div>
          <div className="mt-6 space-y-8">
            {recent.map((note) => (
              <NoteListItem key={`${note.book}-${note.slug}`} note={note} />
            ))}
          </div>
        </section>
      )}

      {topTags.length > 0 && (
        <section className="py-10">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Concepts</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {topTags.map(([tag, notes]) => (
              <TagChip key={tag} tag={tag} count={notes.length} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
