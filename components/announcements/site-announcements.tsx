import { getPublicAnnouncements } from "@/lib/data/public";
import { AnnouncementPopup } from "./announcement-popup";

export async function SiteAnnouncements() {
  const items = await getPublicAnnouncements();
  return items.length ? <AnnouncementPopup items={items} /> : null;
}
