import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { archiveEvent, deleteEvent, setEventFlag } from "@/actions/admin/events";
import { ActionButton } from "@/components/admin/action-button";
import { AdminEmpty, AdminHeader, Notice, SearchFilters, StatusBadge, Table, Td, Th, param } from "@/components/admin/ui";
import { LinkButton } from "@/components/ui/button";
import { requirePage } from "@/lib/auth/session";
import { listEvents } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Events" };

export default async function AdminEventsPage({ searchParams }: PageProps<"/admin/events">) {
  await requirePage("content");
  const sp = await searchParams;
  const q = param(sp.q)?.trim();
  const status = param(sp.status);
  const rows = await listEvents(q, status);

  return (
    <>
      <AdminHeader
        title="Events"
        description="Create, publish and manage ARICT events."
        actions={
          <LinkButton href="/admin/events/new" variant="dark" size="sm">
            <Plus aria-hidden className="size-4" /> New event
          </LinkButton>
        }
      />
      <Notice searchParams={sp} />
      <SearchFilters
        q={q}
        placeholder="Search by title or venue"
        filters={[
          {
            name: "status",
            label: "All events",
            value: status,
            options: [
              { value: "published", label: "Published" },
              { value: "draft", label: "Drafts" },
              { value: "scheduled", label: "Scheduled" },
              { value: "postponed", label: "Postponed" },
              { value: "cancelled", label: "Cancelled" },
              { value: "completed", label: "Completed" },
              { value: "archived", label: "Archived" },
            ],
          },
        ]}
      />
      {rows.length === 0 ? (
        <AdminEmpty
          title={q || status ? "No events match your search." : "No events yet."}
          action={<LinkButton href="/admin/events/new" variant="dark" size="sm">Create the first event</LinkButton>}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Event</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th>Visibility</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <Td>
                  <Link href={`/admin/events/${e.id}`} className="font-medium hover:underline">
                    {e.title}
                  </Link>
                  <p className="text-xs text-muted">{e.category}</p>
                </Td>
                <Td className="whitespace-nowrap">{formatDate(e.startDate)}</Td>
                <Td>
                  <StatusBadge status={e.status} />
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    <StatusBadge status={e.published ? "published" : "draft"} label={e.published ? "Published" : "Draft"} />
                    {e.featured && <StatusBadge status="featured" label="Featured" />}
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap items-start justify-end gap-1.5">
                    <ActionButton action={setEventFlag} fields={{ id: e.id, field: "published", value: String(!e.published) }}>
                      {e.published ? "Unpublish" : "Publish"}
                    </ActionButton>
                    <ActionButton action={setEventFlag} fields={{ id: e.id, field: "featured", value: String(!e.featured) }}>
                      {e.featured ? "Unfeature" : "Feature"}
                    </ActionButton>
                    <ActionButton action={archiveEvent} fields={{ id: e.id, restore: String(e.status === "archived") }}>
                      {e.status === "archived" ? "Restore" : "Archive"}
                    </ActionButton>
                    <ActionButton action={deleteEvent} fields={{ id: e.id }} tone="danger" confirm={`Delete “${e.title}” permanently? This cannot be undone.`}>
                      Delete
                    </ActionButton>
                    {e.published && e.status !== "archived" && (
                      <Link href={`/events/${e.slug}`} target="_blank" className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-mist hover:text-ink" aria-label={`View ${e.title} on the site`}>
                        <ExternalLink className="size-3.5" />
                      </Link>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
