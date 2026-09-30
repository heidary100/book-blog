import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const BOOKS_DIR = path.join(ROOT, "content", "books");
const NOTES_DIR = path.join(ROOT, "content", "notes");

export type BookStatus = "reading" | "finished" | "reference";

export interface Book {
  slug: string;
  title: string;
  author: string;
  year?: number;
  cover?: string;
  status: BookStatus;
  started?: string;
  summary: string;
}

export interface NoteMeta {
  slug: string; // "01-introduction"
  book: string; // "aposd"
  title: string;
  chapter: number; // ordering number; appendices use 90+
  date?: string;
  summary?: string;
  tags: string[];
}

export interface Note extends NoteMeta {
  content: string;
}

export interface NoteWithBook extends NoteMeta {
  bookTitle: string;
  bookCover?: string;
}

function readMarkdownFile(filePath: string): { data: Record<string, unknown>; content: string } {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { data, content };
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function asBook(slug: string, data: Record<string, unknown>): Book {
  return {
    slug,
    title: asString(data.title, slug),
    author: asString(data.author),
    year: typeof data.year === "number" ? data.year : undefined,
    cover: asString(data.cover) || undefined,
    status: (asString(data.status, "reading") as BookStatus) ?? "reading",
    started: asString(data.started) || undefined,
    summary: asString(data.summary),
  };
}

export function getBooks(): Book[] {
  if (!fs.existsSync(BOOKS_DIR)) return [];
  return fs
    .readdirSync(BOOKS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const { data } = readMarkdownFile(path.join(BOOKS_DIR, f));
      return asBook(slug, data);
    })
    .sort((a, b) => (b.started ?? "").localeCompare(a.started ?? ""));
}

export function getBook(slug: string): Book | null {
  const file = path.join(BOOKS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data } = readMarkdownFile(file);
  return asBook(slug, data);
}

export function getBookOverview(slug: string): string {
  const file = path.join(BOOKS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return "";
  return readMarkdownFile(file).content.trim();
}

function asNote(book: string, slug: string, data: Record<string, unknown>): NoteMeta {
  return {
    slug,
    book,
    title: asString(data.title, slug),
    chapter: typeof data.chapter === "number" ? data.chapter : 999,
    date: asString(data.date) || undefined,
    summary: asString(data.summary) || undefined,
    tags: asStringArray(data.tags),
  };
}

export function getNotes(book: string): NoteMeta[] {
  const dir = path.join(NOTES_DIR, book);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const { data } = readMarkdownFile(path.join(dir, f));
      return asNote(book, slug, data);
    })
    .sort((a, b) => a.chapter - b.chapter);
}

export function getNote(book: string, note: string): Note | null {
  const file = path.join(NOTES_DIR, book, `${note}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = readMarkdownFile(file);
  return { ...asNote(book, note, data), content: content.trim() };
}

export function getPrevNext(
  book: string,
  chapter: number
): { prev: NoteMeta | null; next: NoteMeta | null } {
  const notes = getNotes(book);
  const idx = notes.findIndex((n) => n.chapter === chapter);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? notes[idx - 1] : null,
    next: idx < notes.length - 1 ? notes[idx + 1] : null,
  };
}

export function getAllNotes(): NoteWithBook[] {
  return getBooks().flatMap((book) =>
    getNotes(book.slug).map((note) => ({
      ...note,
      bookTitle: book.title,
      bookCover: book.cover,
    }))
  );
}

export function getRecentNotes(limit = 8): NoteWithBook[] {
  return getAllNotes()
    .map((n) => ({ ...n }))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.chapter - a.chapter)
    .slice(0, limit);
}

export function getTagMap(): Map<string, NoteWithBook[]> {
  const map = new Map<string, NoteWithBook[]>();
  for (const note of getAllNotes()) {
    for (const tag of note.tags) {
      const list = map.get(tag) ?? [];
      list.push(note);
      map.set(tag, list);
    }
  }
  return map;
}

export function getTaggedNotes(tag: string): NoteWithBook[] {
  return getTagMap().get(tag) ?? [];
}

export function noteHref(note: NoteMeta): string {
  return `/books/${note.book}/${note.slug}`;
}

export function formatTag(tag: string): string {
  return tag.replace(/-/g, " ");
}
