import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import type { EventCard as EventCardData } from "@/lib/data/public";
import { cn, dateParts, formatTimeRange } from "@/lib/utils";
import { Pill } from "@/components/ui/misc";
import { CoverFallback } from "@/components/ui/cover-fallback";

const STATUS_PILL: Partial<Record<EventCardData["status"], { label: string; tone: "warning" | "neutral" }>> = {
  postponed: { label: "Postponed", tone: "warning" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export function EventCard({
  event,
  headingLevel = "h3",
  className,
}: {
  event: Omit<EventCardData, "isUpcoming">;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const { day, month, year } = dateParts(event.startDate);
  const Heading = headingLevel;
  const status = STATUS_PILL[event.status];
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white transition-[box-shadow,transform,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-black/10 hover:shadow-[0_24px_50px_-28px_rgb(0_0_0/0.35)]",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-mist">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <CoverFallback label={event.category} />
        )}
        <div className="absolute top-4 left-4 flex min-w-14 flex-col items-center rounded-2xl bg-white/95 px-3 py-2 text-center shadow-soft backdrop-blur">
          <span className="font-display text-xl leading-none font-semibold tracking-tight text-ink">{day}</span>
          <span className="mt-1 text-[10px] font-semibold tracking-[0.14em] text-brand uppercase">{month}</span>
          <span className="sr-only">{year}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Pill>{event.category}</Pill>
          {status && <Pill tone={status.tone}>{status.label}</Pill>}
        </div>
        <Heading className="mt-4 text-xl leading-snug font-semibold tracking-tight text-ink">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {event.title}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{event.excerpt}</p>
        <dl className="mt-5 space-y-2 text-sm text-ink/75">
          {event.startTime && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Time</dt>
              <Clock aria-hidden className="size-4 text-muted" />
              <dd>{formatTimeRange(event.startTime, event.endTime)}</dd>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Venue</dt>
              <MapPin aria-hidden className="size-4 shrink-0 text-muted" />
              <dd className="line-clamp-1">{event.location}</dd>
            </div>
          )}
        </dl>
        <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-ink">
          View Event
          <ArrowUpRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  );
}
