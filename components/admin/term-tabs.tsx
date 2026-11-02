import Link from "next/link";
import { cn } from "@/lib/utils";

/** Committee term switcher for the team admin pages. */
export function TermTabs({
  terms,
  selectedId,
  basePath,
}: {
  terms: { id: string; title: string; isCurrent: boolean }[];
  selectedId: string;
  basePath: string;
}) {
  return (
    <nav aria-label="Committee terms" className="mb-6 flex flex-wrap gap-2">
      {terms.map((t) => (
        <Link
          key={t.id}
          href={`${basePath}?term=${t.id}`}
          aria-current={t.id === selectedId ? "page" : undefined}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium",
            t.id === selectedId ? "border-ink bg-ink text-paper" : "border-line bg-surface hover:bg-mist",
          )}
        >
          {t.title}
          {t.isCurrent && <span className={cn("size-1.5 rounded-full", t.id === selectedId ? "bg-surface" : "bg-brand")} aria-label="current" />}
        </Link>
      ))}
    </nav>
  );
}
