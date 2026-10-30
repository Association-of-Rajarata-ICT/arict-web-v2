import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ChevronLeft aria-hidden className="size-4" /> {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ children, className, title, description }: { children: ReactNode; className?: string; title?: string; description?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-surface p-5 sm:p-6", className)}>
      {title && <h2 className="text-base font-semibold">{title}</h2>}
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className={cn(title && "mt-5")}>{children}</div>
    </section>
  );
}

const STATUS_TONES: Record<string, string> = {
  pending: "bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25 text-amber-800 border-amber-200",
  under_review: "bg-sky-50 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/25 text-sky-800 border-sky-200",
  reviewing: "bg-sky-50 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/25 text-sky-800 border-sky-200",
  accepted: "bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 border-emerald-200",
  rejected: "bg-red-50 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/25 text-red-700 dark:text-red-400 border-red-200",
  needs_changes: "bg-orange-50 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/25 text-orange-800 border-orange-200",
  archived: "bg-mist text-muted border-line",
  published: "bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 border-emerald-200",
  draft: "bg-mist text-muted border-line",
  featured: "bg-brand-soft text-brand border-brand/15",
  current: "bg-ink text-paper border-ink",
  scheduled: "bg-sky-50 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/25 text-sky-800 border-sky-200",
  postponed: "bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25 text-amber-800 border-amber-200",
  cancelled: "bg-red-50 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/25 text-red-700 dark:text-red-400 border-red-200",
  completed: "bg-mist text-ink/70 border-line",
  in_progress: "bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25 text-amber-800 border-amber-200",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap", STATUS_TONES[status] ?? STATUS_TONES.draft)}>
      {label ?? status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
    </span>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm [&_tbody_tr:last-child_td]:border-b-0">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn("border-b border-line bg-mist/60 px-4 py-3 text-xs font-semibold tracking-wide text-muted uppercase", className)}>{children}</th>;
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b border-line px-4 py-3 align-middle", className)}>{children}</td>;
}

export function AdminEmpty({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <p className="font-semibold">{title}</p>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** GET form for search + filters; works without JavaScript. */
export function SearchFilters({
  q,
  placeholder,
  filters = [],
  hidden = {},
}: {
  q?: string;
  placeholder: string;
  filters?: { name: string; label: string; value?: string; options: { value: string; label: string }[] }[];
  hidden?: Record<string, string>;
}) {
  return (
    <form role="search" className="mb-6 flex flex-col gap-3 sm:flex-row">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <div className="relative flex-1">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
        <label htmlFor="admin-q" className="sr-only">
          Search
        </label>
        <input
          id="admin-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={placeholder}
          maxLength={100}
          className="h-10 w-full rounded-xl border border-line bg-surface pr-3 pl-10 text-sm outline-none focus:border-ink/40 focus:ring-4 focus:ring-ink/5"
        />
      </div>
      {filters.map((f) => (
        <div key={f.name}>
          <label htmlFor={`admin-${f.name}`} className="sr-only">
            {f.label}
          </label>
          <select
            id={`admin-${f.name}`}
            name={f.name}
            defaultValue={f.value ?? ""}
            className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-ink/40 sm:w-auto"
          >
            <option value="">{f.label}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      <button type="submit" className="h-10 rounded-xl bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft">
        Apply
      </button>
    </form>
  );
}

export function Notice({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const saved = searchParams.saved;
  const denied = searchParams.denied;
  if (!saved && !denied) return null;
  return (
    <div
      role="status"
      className={cn(
        "mb-6 rounded-xl border px-4 py-3 text-sm",
        denied ? "border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25 text-amber-800" : "border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25 text-emerald-800",
      )}
    >
      {denied ? "You don't have permission to open that page." : typeof saved === "string" && saved.length > 1 ? saved : "Changes saved."}
    </div>
  );
}

export function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}
