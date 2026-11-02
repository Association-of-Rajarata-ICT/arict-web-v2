import { AnnouncementForm } from "@/components/admin/announcement-form";
import { AdminHeader } from "@/components/admin/ui";
import { requirePage } from "@/lib/auth/session";

export const instant = false;
export const metadata = { title: "New announcement" };

export default async function NewAnnouncementPage() {
  await requirePage("content");
  return (
    <>
      <AdminHeader title="New announcement" back={{ href: "/admin/announcements", label: "Ads & News" }} />
      <AnnouncementForm />
    </>
  );
}
