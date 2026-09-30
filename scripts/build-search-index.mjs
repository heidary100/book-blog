import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const BOOKS_DIR = path.join(ROOT, "content", "books");
const NOTES_DIR = path.join(ROOT, "content", "notes");

function mdToText(md) {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/[*_~]+/g, "")
    .replace(/^\s*[-+*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);
}

function readBooks() {
  const books = new Map();
  if (!fs.existsSync(BOOKS_DIR)) return books;
  for (const f of fs.readdirSync(BOOKS_DIR)) {
    if (!f.endsWith(".md")) continue;
    const slug = f.replace(/\.md$/, "");
    const { data } = matter(fs.readFileSync(path.join(BOOKS_DIR, f), "utf8"));
    books.set(slug, data);
  }
  return books;
}

function collectNotes(bookSlug) {
  const dir = path.join(NOTES_DIR, bookSlug);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
}

const books = readBooks();
const items = [];

for (const [bookSlug, bookData] of books) {
  for (const f of collectNotes(bookSlug)) {
    const slug = f.replace(/\.md$/, "");
    const { data, content } = matter(fs.readFileSync(path.join(NOTES_DIR, bookSlug, f), "utf8"));
    items.push({
      book: bookSlug,
      bookTitle: typeof bookData.title === "string" ? bookData.title : bookSlug,
      slug,
      title: typeof data.title === "string" ? data.title : slug,
      chapter: typeof data.chapter === "number" ? data.chapter : 999,
      summary: typeof data.summary === "string" ? data.summary : "",
      tags: Array.isArray(data.tags) ? data.tags.filter((t) => typeof t === "string") : [],
      text: mdToText(content),
    });
  }
}

const outPath = path.join(ROOT, "public", "search-index.json");
fs.writeFileSync(outPath, JSON.stringify(items));
console.log(`search index: ${items.length} notes -> ${path.relative(ROOT, outPath)}`);
