"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import type { EventCard as EventCardData } from "@/lib/data/public";
import { formatDateRange, formatTimeRange } from "@/lib/utils";
import { FilterBar, readQuery, writeQuery } from "@/components/ui/filter-bar";
import { EmptyState, Pill } from "@/components/ui/misc";
import { CoverFallback } from "@/components/ui/cover-fallback";
import { EventCard } from "./event-card";

const EASE = [0.16, 1, 0.3, 1] as const;

export function EventsExplorer({ events }: { events: EventCardData[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const hydrated = useRef(false);

  useEffect(() => {
    const q = readQuery(["q", "category", "year"]);
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate filters from the URL once */
    setQuery(q.q!);
    setCategory(q.category!);
    setYear(q.year!);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    writeQuery({ q: query, category, year });
  }, [query, category, year]);

  const categories = useMemo(() => [...new Set(events.map((e) => e.category))].sort(), [events]);
  const years = useMemo(() => [...new Set(events.map((e) => e.startDate.slice(0, 4)))].sort().reverse(), [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter(
      (e) =>
        (!category || e.category === category) &&
        (!year || e.startDate.startsWith(year)) &&
        (!q || `${e.title} ${e.excerpt} ${e.location ?? ""} ${e.category}`.toLowerCase().includes(q)),
    );
  }, [events, query, category, year]);

  const upcoming = filtered.filter((e) => e.isUpcoming).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = filtered.filter((e) => !e.isUpcoming);
  const filtering = query !== "" || category !== "" || year !== "";
  const featured = filtering ? null : (upcoming.find((e) => e.featured) ?? upcoming[0] ?? null);
  const upcomingRest = featured ? upcoming.filter((e) => e.id !== featured.id) : upcoming;

  const reset = () => {
    setQuery("");
    setCategory("");
    setYear("");
  };

  return (
    <div className="container-page py-14 sm:py-20">
      <FilterBar
        query={query}
        onQuery={setQuery}
        searchLabel="Search events"
        filters={[
          { id: "category", label: "All categories", value: category, onChange: setCategory, options: categories.map((c) => ({ value: c, label: c })) },
          { id: "year", label: "All years", value: year, onChange: setYear, options: years.map((y) => ({ value: y, label: y })) },
        ]}
        onReset={reset}
        resultLabel={`${filtered.length} event${filtered.length === 1 ? "" : "s"} found`}
      />

      {featured && (
        <section aria-labelledby="featured-event-heading" className="mt-14">
          <h2 id="featured-event-heading" className="eyebrow">
            Featured event
          </h2>
          <FeaturedEvent event={featured} />
        </section>
      )}

      <section aria-labelledby="upcoming-heading" className="mt-16">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="upcoming-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Upcoming events
          </h2>
          <span className="text-sm text-muted">{upcoming.length}</span>
        </div>
        <EventGrid events={upcomingRest} emptyLabel={featured ? "No other upcoming events right now." : filtering ? "No upcoming events match your filters." : "No upcoming events right now — check back soon."} />
      </section>

      <section aria-labelledby="past-heading" className="mt-20">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="past-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Past events
          </h2>
          <span className="text-sm text-muted">{past.length}</span>
        </div>
        <EventGrid events={past} emptyLabel={filtering ? "No past events match your filters." : "Past events will appear here."} />
      </section>

      {filtering && filtered.length === 0 && (
        <div className="mt-10 text-center">
          <button type="button" onClick={reset} className="text-sm font-medium underline underline-offset-4">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

function EventGrid({ events, emptyLabel }: { events: EventCardData[]; emptyLabel: string }) {
  if (events.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState icon={<CalendarDays className="size-7" />} title={emptyLabel} />
      </div>
    );
  }
  return (
    <motion.ul layout className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {events.map((e) => (
          <motion.li
            key={e.id}
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <EventCard event={e} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}

function FeaturedEvent({ event }: { event: EventCardData }) {
  return (
    <article className="group relative mt-5 grid overflow-hidden rounded-[2rem] border border-line bg-white lg:grid-cols-2">
      <div className="relative aspect-[16/10] overflow-hidden bg-mist lg:aspect-auto lg:min-h-[380px]">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 600px, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <CoverFallback label={event.category} />
        )}
      </div>
      <div className="flex flex-col justify-center p-7 sm:p-10">
        <div className="flex flex-wrap gap-2">
          <Pill tone="brand">{event.category}</Pill>
          {event.status === "postponed" && <Pill tone="warning">Postponed</Pill>}
        </div>
        <h3 className="mt-5 text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {event.title}
          </Link>
        </h3>
        <p className="mt-3 leading-relaxed text-muted">{event.excerpt}</p>
        <dl className="mt-6 grid gap-2.5 text-sm text-ink/80">
          <div className="flex items-center gap-2.5">
            <dt className="sr-only">Date</dt>
            <CalendarDays aria-hidden className="size-4 text-muted" />
            <dd>{formatDateRange(event.startDate, event.endDate)}</dd>
          </div>
          {event.startTime && (
            <div className="flex items-center gap-2.5">
              <dt className="sr-only">Time</dt>
              <Clock aria-hidden className="size-4 text-muted" />
              <dd>{formatTimeRange(event.startTime, event.endTime)}</dd>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2.5">
              <dt className="sr-only">Venue</dt>
              <MapPin aria-hidden className="size-4 text-muted" />
              <dd>{event.location}</dd>
            </div>
          )}
        </dl>
        <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium">
          View Event <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
