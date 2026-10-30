import { EventsExplorer } from "@/components/events/events-explorer";
import { PageHero } from "@/components/ui/misc";
import { getPublicEvents } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Events",
  description:
    "Workshops, seminars, hackathons and talks by ARICT at Rajarata University of Sri Lanka. See upcoming events and look back at past ones.",
  path: "/events",
});

export default async function EventsPage() {
  const events = await getPublicEvents();
  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Learn, build and connect at ARICT events."
        description="Workshops, seminars, competitions and hackathons that help Rajarata students grow their skills and their network."
        crumbs={[{ name: "Home", path: "/" }, { name: "Events", path: "/events" }]}
      />
      <EventsExplorer events={events} />
    </>
  );
}
