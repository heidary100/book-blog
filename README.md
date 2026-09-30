# Margins — reading notes

A personal book-notes blog built with Next.js. Each book gets a section with
per-chapter study notes you can visit to revise. Content lives as plain
markdown files with YAML frontmatter — versioned with git, editable in any
editor, and also editable in the browser at `/keystatic`.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other commands:

```bash
npm run build      # regenerate search index (prebuild) + production build
npm run index      # regenerate public/search-index.json only
npm run lint
```

## Where things live

```
content/
  books/<slug>.md            # book entry: metadata + overview
  notes/<book>/<note>.md     # one markdown file per chapter note
public/covers/               # book cover images
public/search-index.json     # generated; do not edit by hand
scripts/extract_epub.py      # epub -> text/TOC/cover (for scaffolding new books)
scripts/build-search-index.mjs
```

### Book frontmatter

```yaml
title: A Philosophy of Software Design
author: John K. Ousterhout
year: 2021
cover: /covers/aposd.jpg
status: reading        # reading | finished | reference
started: 2026-09-30
summary: One-line summary shown on the home page.
```

### Note frontmatter

```yaml
title: Modules Should Be Deep
book: aposd           # must match the book's filename
chapter: 4            # ordering number; use 90+ for appendices
date: 2026-09-30
summary: One-line summary used in lists and search.
tags: [deep-modules, abstractions]
```

Tags are the cross-book "concepts" — the pages at `/tags/[tag]` collect notes
with the same tag across all books. Tags are lowercase-kebab-case
(`deep-modules`, `information-hiding`, `errors`, …).

## Editing

- **In your editor:** edit the markdown files directly; the dev server picks
  changes up immediately.
- **In the browser:** go to `/keystatic` (Keystatic, local storage mode). It edits
  the same files on disk — nothing else to sync.
- **Search:** `public/search-index.json` is rebuilt automatically before every
  production build; after writing a lot in dev, run `npm run index` to refresh.

## Adding your next book

1. **Extract the epub** (optional but handy — gives you the TOC and chapter
   text for scaffolding notes):

   ```bash
   python3 scripts/extract_epub.py <book.epub> .cache/<slug>
   # -> .cache/<slug>/toc.json, .cache/<slug>/pages/*.txt, .cache/<slug>/cover.*
   ```

2. **Create the book entry** at `content/books/<slug>.md` (frontmatter + short
   overview). Put the cover in `public/covers/<slug>.jpg` and set `cover:`.

3. **Create notes** at `content/notes/<slug>/NN-<note-name>.md` — `NN` is the
   chapter number used for ordering. Copy the frontmatter shape above.

4. Run `npm run index` so the new notes show up in search.

## Deployment

`npm run build` produces a fully static site (all pages prerendered), so it
works on any Node host or static-capable platform. Note that `/keystatic` only
works locally (Keystatic local storage mode) — that's intentional: content is
edited at your desk or in the repo, not in production.
