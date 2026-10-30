import type { Event } from "../db/schema";
import type { SiteSettings } from "../settings";
import { SITE, SITE_URL, absoluteUrl } from "../site";
import { toIsoInColombo } from "../utils";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    alternateName: SITE.fullName,
    url: `${SITE_URL}/`,
  };
}

export function organizationJsonLd(settings: SiteSettings) {
  const sameAs = Object.values(settings.social).filter((v): v is string => !!v);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE.name,
    alternateName: SITE.fullName,
    url: `${SITE_URL}/`,
    logo: absoluteUrl("/icon-512.png"),
    image: absoluteUrl(settings.general.logo || "/brand/arict-logo.png"),
    description: settings.general.description,
    ...(settings.contact.email ? { email: settings.contact.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: SITE.university,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

const EVENT_STATUS: Record<Event["status"], string> = {
  scheduled: "https://schema.org/EventScheduled",
  postponed: "https://schema.org/EventPostponed",
  cancelled: "https://schema.org/EventCancelled",
  completed: "https://schema.org/EventScheduled",
  archived: "https://schema.org/EventScheduled",
};

export function eventJsonLd(event: Event) {
  const online = /online|zoom|teams|meet|virtual/i.test(event.location ?? "");
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.excerpt,
    url: absoluteUrl(`/events/${event.slug}`),
    startDate: toIsoInColombo(event.startDate, event.startTime),
    ...(event.endDate || event.endTime
      ? { endDate: toIsoInColombo(event.endDate ?? event.startDate, event.endTime) }
      : {}),
    eventStatus: EVENT_STATUS[event.status],
    eventAttendanceMode: online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    ...(event.coverImage ? { image: [absoluteUrl(event.coverImage)] } : {}),
    location: online
      ? { "@type": "VirtualLocation", url: event.registrationUrl ?? absoluteUrl(`/events/${event.slug}`) }
      : {
          "@type": "Place",
          name: event.location || SITE.university,
          address: {
            "@type": "PostalAddress",
            streetAddress: event.location || SITE.university,
            addressLocality: "Mihintale",
            addressCountry: "LK",
          },
        },
    organizer: {
      "@type": "Organization",
      name: event.organizer || SITE.name,
      url: `${SITE_URL}/`,
    },
  };
}
