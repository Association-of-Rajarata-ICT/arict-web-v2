"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { announcements } from "@/lib/db/schema";
import { invalidate } from "@/lib/revalidate";
import { announcementSchema } from "@/lib/validations/announcements";
import { fieldErrorsFrom, formToObject, type ActionState } from "@/lib/validations/common";
import { adminAction, fail, ok } from "./_helpers";

export async function saveAnnouncement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const id = String(formData.get("id") ?? "");
    if (id && !z.uuid().safeParse(id).success) return fail("Invalid announcement.");
    const parsed = announcementSchema.safeParse(formToObject(formData));
    if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrorsFrom(parsed.error));

    if (id) {
      const updated = await db.update(announcements).set(parsed.data).where(eq(announcements.id, id)).returning({ id: announcements.id });
      if (!updated.length) return fail("This announcement no longer exists.");
    } else {
      await db.insert(announcements).values(parsed.data);
    }
    invalidate("announcements");
    return ok(parsed.data.published ? "Announcement published. Visitors will see it in the popup." : "Draft saved. Publish it when you are ready.");
  });
}

export async function setAnnouncementPublished(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const parsed = z.object({ id: z.uuid(), published: z.enum(["true", "false"]) }).safeParse(formToObject(formData));
    if (!parsed.success) return fail("Invalid request.");
    const updated = await db.update(announcements)
      .set({ published: parsed.data.published === "true" })
      .where(eq(announcements.id, parsed.data.id)).returning({ id: announcements.id });
    if (!updated.length) return fail("This announcement no longer exists.");
    invalidate("announcements");
    return ok(parsed.data.published === "true" ? "Announcement published." : "Announcement unpublished.");
  });
}

export async function deleteAnnouncement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const id = z.uuid().safeParse(formData.get("id"));
    if (!id.success) return fail("Invalid announcement.");
    const deleted = await db.delete(announcements).where(eq(announcements.id, id.data)).returning({ id: announcements.id });
    if (!deleted.length) return fail("This announcement no longer exists.");
    invalidate("announcements");
    return ok("Announcement deleted.");
  });
}
