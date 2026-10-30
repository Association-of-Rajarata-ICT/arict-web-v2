"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };

/** Search box plus select filters. Purely presentational; state lives in the parent. */
export function FilterBar({
  query,
  onQuery,
  searchLabel,
  filters,
  onReset,
  resultLabel,
  className,
}: {
  query: string;
  onQuery: (v: string) => void;
  searchLabel: string;
  filters: { id: string; label: string; value: string; options: FilterOption[]; onChange: (v: string) => void }[];
  onReset?: () => void;
  resultLabel?: string;
  className?: string;
}) {
  const active = query !== "" || filters.some((f) => f.value !== "");
  return (
    <div className={cn("flex flex-col gap-3 rounded-3xl border border-line bg-white p-3 shadow-soft sm:flex-row sm:items-center", className)}>
      <div className="relative flex-1">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
        <label htmlFor="filter-search" className="sr-only">
          {searchLabel}
        </label>
        <input
          id="filter-search"
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={searchLabel}
          maxLength={100}
          className="h-11 w-full rounded-2xl bg-mist pr-4 pl-11 text-ink outline-none placeholder:text-muted/80 focus:ring-2 focus:ring-ink/10"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex">
        {filters.map((f) => (
          <div key={f.id} className="relative">
            <label htmlFor={`filter-${f.id}`} className="sr-only">
              {f.label}
            </label>
            <select
              id={`filter-${f.id}`}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="h-11 w-full appearance-none rounded-2xl border border-line bg-white pr-9 pl-4 text-sm text-ink outline-none focus:ring-2 focus:ring-ink/10 sm:w-auto"
            >
              <option value="">{f.label}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="m6 8 4 4 4-4" />
            </svg>
          </div>
        ))}
      </div>
      {active && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl px-4 text-sm font-medium text-ink/70 hover:bg-mist hover:text-ink"
        >
          <X aria-hidden className="size-4" /> Clear
        </button>
      )}
      {resultLabel && (
        <p className="sr-only" role="status" aria-live="polite">
          {resultLabel}
        </p>
      )}
    </div>
  );
}

/** Reads/writes filter state in the URL without navigation, so filtered views are shareable. */
export function readQuery(keys: string[]) {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(keys.map((k) => [k, params.get(k) ?? ""]));
}

export function writeQuery(values: Record<string, string>) {
  const params = new URLSearchParams(window.location.search);
  for (const [k, v] of Object.entries(values)) {
    if (v) params.set(k, v);
    else params.delete(k);
  }
  const qs = params.toString();
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
}
