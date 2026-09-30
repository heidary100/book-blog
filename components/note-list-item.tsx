import Link from "next/link";
import type { NoteWithBook } from "@/lib/content";
import { noteHref } from "@/lib/content";
import { TagChip } from "@/components/chips";
import { formatDate } from "@/lib/format";

export function NoteListItem({ note, showBook = true }: { note: NoteWithBook; showBook?: boolean }) {
  return (
    <article className="group">
      <Link href={noteHref(note)} className="block">
        <h3 className="font-medium leading-snug group-hover:text-accent transition-colors">
          {note.title}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {showBook && (
            <>
              <span className="font-serif italic">{note.bookTitle}</span>
              {" · "}
              {note.chapter < 90 ? `Chapter ${note.chapter}` : "Appendix"}
              {" · "}
            </>
          )}
          {note.date ? formatDate(note.date) : ""}
        </p>
        {note.summary && <p className="mt-1.5 line-clamp-2 text-sm">{note.summary}</p>}
      </Link>
      {note.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}
    </article>
  );
}
