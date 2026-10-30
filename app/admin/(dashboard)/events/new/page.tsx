import { EventForm } from "@/components/admin/event-form";
import { AdminHeader } from "@/components/admin/ui";
import { requirePage } from "@/lib/auth/session";
import { getEventCategories } from "@/lib/data/admin";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "New event" };

export default async function NewEventPage() {
  await requirePage("content");
  const categories = await getEventCategories();
  return (
    <>
      <AdminHeader title="New event" back={{ href: "/admin/events", label: "Events" }} />
      <EventForm categories={categories} />
    </>
  );
}
