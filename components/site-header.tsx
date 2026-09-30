import Link from "next/link";
import { SearchDialog } from "@/components/search-dialog";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-6">
        <Link href="/" className="font-serif text-lg italic tracking-tight hover:text-accent transition-colors">
          Margins
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="rounded-md px-2 py-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            Library
          </Link>
          <Link
            href="/tags"
            className="rounded-md px-2 py-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            Concepts
          </Link>
          <SearchDialog />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
