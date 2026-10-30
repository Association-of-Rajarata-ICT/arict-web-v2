import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { EventForm } from "@/components/admin/event-form";
import { AdminHeader, Notice } from "@/components/admin/ui";
import { requirePage } from "@/lib/auth/session";
import { getEventCategories, getEventForEdit, isUuid } from "@/lib/data/admin";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Edit event" };

export default async function EditEventPage({ params, searchParams }: PageProps<"/admin/events/[id]">) {
  await requirePage("content");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [event, categories, sp] = await Promise.all([getEventForEdit(id), getEventCategories(), searchParams]);
  if (!event) notFound();

  return (
    <>
      <AdminHeader
        title={event.title}
        description={event.published ? "Published" : "Draft — not visible on the public site"}
        back={{ href: "/admin/events", label: "Events" }}
        actions={
          event.published && event.status !== "archived" ? (
            <Link href={`/events/${event.slug}`} target="_blank" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-medium hover:bg-mist">
              View on site <ExternalLink aria-hidden className="size-3.5" />
            </Link>
          ) : undefined
        }
      />
      <Notice searchParams={sp} />
      <EventForm event={event} categories={categories} />
    </>
  );
}
