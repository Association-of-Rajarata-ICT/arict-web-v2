import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, ExternalLink, MapPin, User } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/motion/reveal";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { LinkButton, buttonClasses } from "@/components/ui/button";
import { Pill, Skeleton } from "@/components/ui/misc";
import { RichText } from "@/components/ui/rich-text";
import { ShareActions } from "@/components/ui/share-actions";
import { getEventBySlug, getPublishedEventSlugs, getRelatedEvents } from "@/lib/data/public";
import { eventJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/site";
import { formatDateRange, formatTimeRange } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getPublishedEventSlugs();
  // Cache Components requires at least one param; unknown slugs render on demand.
  return slugs.length ? slugs.map(({ slug }) => ({ slug })) : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found", robots: { index: false } };
  return pageMetadata({
    title: event.title,
    description: event.excerpt,
    path: `/events/${event.slug}`,
    image: event.coverImage,
    type: "article",
  });
}

const STATUS_LABEL = {
  scheduled: null,
  postponed: "Postponed",
  cancelled: "Cancelled",
  completed: "Completed",
  archived: null,
} as const;

export default function EventPage({ params }: PageProps<"/events/[slug]">) {
  return (
    <Suspense fallback={<EventSkeleton />}>
      <EventDetail params={params} />
    </Suspense>
  );
}

async function EventDetail({ params }: Pick<PageProps<"/events/[slug]">, "params">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  const related = await getRelatedEvents(event.id, event.category);
  const url = absoluteUrl(`/events/${event.slug}`);
  const statusLabel = STATUS_LABEL[event.status];

  return (
    <>
      <JsonLd data={eventJsonLd(event)} />
      <article>
        <header className="bg-gradient-to-b from-mist to-white pt-32 pb-12 sm:pt-36">
          <div className="container-page">
            <Breadcrumbs
              items={[
                { name: "Home", path: "/" },
                { name: "Events", path: "/events" },
                { name: event.title, path: `/events/${event.slug}` },
              ]}
            />
            <FadeUp className="mt-8 max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <Pill tone="brand">{event.category}</Pill>
                {event.isUpcoming ? <Pill tone="success">Upcoming</Pill> : <Pill>Past event</Pill>}
                {statusLabel && <Pill tone={event.status === "postponed" ? "warning" : "neutral"}>{statusLabel}</Pill>}
              </div>
              <h1 className="mt-5 text-4xl leading-[1.06] font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
                {event.title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted">{event.excerpt}</p>
            </FadeUp>
          </div>
        </header>

        {event.coverImage && (
          <FadeUp className="container-page">
            <div className="relative aspect-[16/8] overflow-hidden rounded-[2rem] bg-mist">
              <Image src={event.coverImage} alt={`${event.title} cover image`} fill loading="eager" fetchPriority="high" sizes="(min-width: 1280px) 1180px, 100vw" className="object-cover" />
            </div>
          </FadeUp>
        )}

        <div className="container-page grid gap-12 py-14 lg:grid-cols-12 lg:gap-16 lg:py-20">
          <div className="lg:col-span-8">
            {event.content ? <RichText text={event.content} /> : <p className="text-muted">More details will be announced soon.</p>}

            {event.images.length > 0 && (
              <section aria-labelledby="event-photos-heading" className="mt-14">
                <h2 id="event-photos-heading" className="text-2xl font-semibold tracking-tight">
                  Photos
                </h2>
                <StaggerContainer className="mt-6 grid gap-4 sm:grid-cols-2">
                  {event.images.map((img) => (
                    <StaggerItem key={img.id}>
                      <figure>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist">
                          <Image src={img.imageUrl} alt={img.altText} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                        </div>
                        {img.caption && <figcaption className="mt-2 text-sm text-muted">{img.caption}</figcaption>}
                      </figure>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </section>
            )}

            <div className="mt-14 border-t border-line pt-8">
              <ShareActions url={url} title={event.title} />
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-3xl border border-line bg-white p-6 shadow-soft">
              <h2 className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">Event details</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <Detail icon={<CalendarDays className="size-4" />} label="Date" value={formatDateRange(event.startDate, event.endDate)} />
                {event.startTime && <Detail icon={<Clock className="size-4" />} label="Time" value={formatTimeRange(event.startTime, event.endTime)} />}
                {event.location && <Detail icon={<MapPin className="size-4" />} label="Venue" value={event.location} />}
                <Detail icon={<User className="size-4" />} label="Organizer" value={event.organizer || "ARICT"} />
              </dl>
              {event.registrationUrl && event.isUpcoming && event.status !== "cancelled" && (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses({ variant: "primary", size: "lg", className: "mt-7 w-full" })}
                >
                  Register now <ExternalLink aria-hidden className="size-4" />
                </a>
              )}
              <LinkButton href="/events" variant="outline" size="md" className="mt-3 w-full">
                All events
              </LinkButton>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-events-heading" className="border-t border-line bg-mist py-20">
          <div className="container-page">
            <h2 id="related-events-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              More ARICT events
            </h2>
            <StaggerContainer className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((e) => (
                <StaggerItem key={e.id}>
                  <EventCard event={e} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}
    </>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span aria-hidden className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-mist text-ink/70">
        {icon}
      </span>
      <div>
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="mt-0.5 font-medium text-ink">{value}</dd>
      </div>
    </div>
  );
}

function EventSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading event" className="container-page pt-36 pb-20">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-8 h-14 w-full max-w-2xl" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      <Skeleton className="mt-12 aspect-[16/8] w-full rounded-[2rem]" />
    </div>
  );
}
