import { notFound } from "next/navigation";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { AdminHeader } from "@/components/admin/ui";
import { AnnouncementPopup } from "@/components/announcements/announcement-popup";
import { toPublicAnnouncement } from "@/lib/announcements";
import { requirePage } from "@/lib/auth/session";
import { getAnnouncementForEdit, isUuid } from "@/lib/data/admin";

export const instant = false;
export const metadata = { title: "Edit announcement" };

export default async function EditAnnouncementPage({ params }: PageProps<"/admin/announcements/[id]">) {
  await requirePage("content");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const announcement = await getAnnouncementForEdit(id);
  if (!announcement) notFound();

  return (
    <>
      <AdminHeader title={announcement.title} description={announcement.published ? "Published in the visitor popup." : "Draft — only visible to your team."}
        back={{ href: "/admin/announcements", label: "Ads & News" }} actions={<AnnouncementPopup items={[toPublicAnnouncement(announcement)]} preview />} />
      <AnnouncementForm announcement={announcement} />
    </>
  );
}
