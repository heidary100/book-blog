import type { Metadata } from "next";
import { getTaggedNotes, getTagMap, formatTag } from "@/lib/content";
import { NoteListItem } from "@/components/note-list-item";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return [...getTagMap().keys()].map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  return { title: formatTag(tag), description: `Notes tagged "${formatTag(tag)}"` };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const notes = getTaggedNotes(tag);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm text-muted">Concept</p>
      <h1 className="mt-1 font-serif text-3xl capitalize tracking-tight">{formatTag(tag)}</h1>
      <p className="mt-2 text-sm font-mono text-muted">
        {notes.length} {notes.length === 1 ? "note" : "notes"}
      </p>
      <div className="mt-8 space-y-8">
        {notes.map((note) => (
          <NoteListItem key={`${note.book}-${note.slug}`} note={note} />
        ))}
      </div>
    </div>
  );
}
