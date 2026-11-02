import type { Announcement } from "./db/schema";

export const ANNOUNCEMENT_KIND_LABELS = {
  news: "News",
  advertisement: "Advertisement",
} as const;

type PopupFields = Pick<Announcement, "id" | "title" | "kind" | "message" | "image" | "imageAlt" | "linkLabel" | "linkUrl" | "updatedAt">;
export type PublicAnnouncement = Omit<PopupFields, "updatedAt"> & { updatedAt: string };

export function toPublicAnnouncement(row: PopupFields): PublicAnnouncement {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    message: row.message,
    image: row.image,
    imageAlt: row.imageAlt,
    linkLabel: row.linkLabel,
    linkUrl: row.linkUrl,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function announcementSignature(items: PublicAnnouncement[]) {
  return items.map((item) => `${item.id}:${item.updatedAt}`).join("|");
}
