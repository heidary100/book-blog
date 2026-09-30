"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";

interface SearchItem {
  book: string;
  bookTitle: string;
  slug: string;
  title: string;
  chapter: number;
  summary?: string;
  tags: string[];
  text: string;
}

interface Result extends SearchItem {
  href: string;
}

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const indexRef = useRef<Fuse<SearchItem> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const loadIndex = useCallback(async () => {
    if (indexRef.current) return;
    const res = await fetch("/search-index.json");
    const items: SearchItem[] = await res.json();
    indexRef.current = new Fuse(items, {
      keys: [
        { name: "title", weight: 4 },
        { name: "summary", weight: 2 },
        { name: "tags", weight: 2 },
        { name: "text", weight: 1 },
      ],
      includeScore: true,
      threshold: 0.35,
      ignoreLocation: true,
    });
  }, []);

  const openDialog = useCallback(() => {
    setOpen(true);
    loadIndex().catch(() => {});
  }, [loadIndex]);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        openDialog();
      }
      if (e.key === "Escape") closeDialog();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openDialog, closeDialog]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!indexRef.current || !query.trim()) {
      setResults([]);
      return;
    }
    const hits = indexRef.current.search(query, { limit: 12 });
    setResults(
      hits.map((h) => ({
        ...h.item,
        href: `/books/${h.item.book}/${h.item.slug}`,
      }))
    );
    setActive(0);
  }, [query]);

  const go = useCallback(
    (href: string) => {
      closeDialog();
      router.push(href);
    },
    [closeDialog, router]
  );

  function onKeyDownInDialog(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      go(results[active].href);
    }
  }

  useEffect(() => {
    listRef.current?.querySelectorAll("li")[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted hover:text-foreground hover:border-muted transition-colors"
        aria-label="Search notes"
      >
        <SearchIcon />
        <span className="hidden sm:inline">Search notes</span>
        <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-background px-1.5 font-mono text-[11px] text-muted">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 p-4 pt-[12vh]"
          onClick={closeDialog}
          role="presentation"
        >
          <div
            className="mx-auto w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKeyDownInDialog}
            role="dialog"
            aria-modal="true"
            aria-label="Search notes"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <SearchIcon />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, ideas, tags…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
              <kbd className="h-5 items-center rounded border border-border px-1.5 font-mono text-[11px] text-muted hidden sm:inline-flex">
                esc
              </kbd>
            </div>
            {results.length > 0 ? (
              <ul ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
                {results.map((r, i) => (
                  <li key={`${r.book}-${r.slug}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(r.href)}
                      className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                        i === active ? "bg-accent-soft" : ""
                      }`}
                    >
                      <span className="block text-sm font-medium">{r.title}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {r.bookTitle}
                        {r.chapter < 90 ? ` · Chapter ${r.chapter}` : " · Appendix"}
                        {r.summary ? ` — ${truncate(r.summary, 110)}` : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-center text-sm text-muted">
                {query.trim()
                  ? "No notes match that search."
                  : "Search across every chapter note by title, summary, tag, or content."}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n).trimEnd()}…` : s;
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
