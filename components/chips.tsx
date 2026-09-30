import Link from "next/link";
import { formatTag } from "@/lib/content";

export function TagChip({ tag, count }: { tag: string; count?: number }) {
  return (
    <Link
      href={`/tags/${tag}`}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted hover:border-accent hover:text-accent transition-colors"
    >
      {formatTag(tag)}
      {typeof count === "number" && <span className="font-mono text-[10px]">{count}</span>}
    </Link>
  );
}

const STATUS_LABELS: Record<string, string> = {
  reading: "Reading",
  finished: "Finished",
  reference: "Reference",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
