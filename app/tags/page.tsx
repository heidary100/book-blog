import type { Metadata } from "next";
import Link from "next/link";
import { getTagMap, formatTag } from "@/lib/content";

export const metadata: Metadata = {
  title: "Concepts",
  description: "Browse notes by concept across books",
};

export default function TagsPage() {
  const tagMap = getTagMap();
  const tags = [...tagMap.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-serif text-3xl tracking-tight">Concepts</h1>
      <p className="mt-2 text-muted">
        Ideas grouped across books — the threads worth revisiting together.
      </p>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {tags.map(([tag, notes]) => (
          <li key={tag}>
            <Link
              href={`/tags/${tag}`}
              className="group flex items-baseline justify-between gap-4 py-3"
            >
              <span className="font-medium capitalize group-hover:text-accent transition-colors">
                {formatTag(tag)}
              </span>
              <span className="text-sm font-mono text-muted">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {tags.length === 0 && <p className="mt-8 text-sm text-muted">No tags yet.</p>}
    </div>
  );
}
