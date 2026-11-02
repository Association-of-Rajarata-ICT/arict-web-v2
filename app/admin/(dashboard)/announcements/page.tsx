import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteAnnouncement, setAnnouncementPublished } from "@/actions/admin/announcements";
import { ActionButton } from "@/components/admin/action-button";
import { AdminEmpty, AdminHeader, Notice, SearchFilters, StatusBadge, Table, Td, Th, param } from "@/components/admin/ui";
import { AnnouncementPopup } from "@/components/announcements/announcement-popup";
import { LinkButton } from "@/components/ui/button";
import { ANNOUNCEMENT_KIND_LABELS, toPublicAnnouncement } from "@/lib/announcements";
import { requirePage } from "@/lib/auth/session";
import { listAnnouncements } from "@/lib/data/admin";

export const instant = false;
export const metadata = { title: "Ads & News" };

export default async function AnnouncementsPage({ searchParams }: PageProps<"/admin/announcements">) {
  await requirePage("content");
  const sp = await searchParams;
  const q = param(sp.q)?.trim();
  const status = param(sp.status);
  const rows = await listAnnouncements(q, status);

  return (
    <>
      <AdminHeader title="Ads & News" description="Publish news and advertisements in the visitor popup. Visitors can dismiss it for their current browser session."
        actions={<LinkButton href="/admin/announcements/new" variant="dark" size="sm"><Plus aria-hidden className="size-4" /> New announcement</LinkButton>} />
      <Notice searchParams={sp} />
      <SearchFilters q={q} placeholder="Search announcements" filters={[{ name: "status", label: "All announcements", value: status, options: [{ value: "published", label: "Published" }, { value: "draft", label: "Drafts" }] }]} />
      {rows.length === 0 ? (
        <AdminEmpty title={q || status ? "No announcements match your search." : "No ads or news yet."}
          description="Create a draft, preview it, and publish when it is ready."
          action={<LinkButton href="/admin/announcements/new" variant="dark" size="sm">Create announcement</LinkButton>} />
      ) : (
        <Table>
          <thead><tr><Th>Announcement</Th><Th>Type</Th><Th>Order</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <Td>
                  <Link href={`/admin/announcements/${row.id}`} className="font-medium hover:underline">{row.title}</Link>
                  <p className="mt-1 max-w-sm line-clamp-2 text-xs text-muted">{row.message}</p>
                </Td>
                <Td>{ANNOUNCEMENT_KIND_LABELS[row.kind]}</Td>
                <Td>{row.displayOrder}</Td>
                <Td><StatusBadge status={row.published ? "published" : "draft"} /></Td>
                <Td>
                  <div className="flex flex-wrap items-start justify-end gap-1.5">
                    <AnnouncementPopup items={[toPublicAnnouncement(row)]} preview />
                    <Link href={`/admin/announcements/${row.id}`} className="inline-flex h-8 items-center rounded-lg border border-line px-3 text-xs font-medium hover:bg-mist">Edit</Link>
                    <ActionButton action={setAnnouncementPublished} fields={{ id: row.id, published: String(!row.published) }}>{row.published ? "Unpublish" : "Publish"}</ActionButton>
                    <ActionButton action={deleteAnnouncement} fields={{ id: row.id }} tone="danger" confirm={`Delete “${row.title}” permanently? This cannot be undone.`}>Delete</ActionButton>
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
