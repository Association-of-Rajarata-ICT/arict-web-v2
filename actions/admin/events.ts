"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eventImages, events } from "@/lib/db/schema";
import { invalidate } from "@/lib/revalidate";
import { fieldErrorsFrom, formToObject, type ActionState } from "@/lib/validations/common";
import { eventSchema } from "@/lib/validations/admin";
import { adminAction, fail, isUniqueViolation, ok } from "./_helpers";

export async function saveEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const id = String(formData.get("id") ?? "");
    const parsed = eventSchema.safeParse(formToObject(formData, ["images"]));
    if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrorsFrom(parsed.error));
    const { images, ...data } = parsed.data;
    const alts = String(formData.get("imageAltText") ?? "").split("\n");

    try {
      const eventId = await db.transaction(async (tx) => {
        let eid = id;
        if (id) {
          const updated = await tx.update(events).set(data).where(eq(events.id, id)).returning({ id: events.id });
          if (!updated.length) throw new Error("not_found");
        } else {
          const [row] = await tx.insert(events).values(data).returning({ id: events.id });
          eid = row!.id;
        }
        await tx.delete(eventImages).where(eq(eventImages.eventId, eid));
        if (images.length) {
          await tx.insert(eventImages).values(
            images.map((imageUrl, i) => ({
              eventId: eid,
              imageUrl,
              altText: (alts[i] ?? "").trim().slice(0, 200) || `${data.title} photo ${i + 1}`,
              displayOrder: i,
            })),
          );
        }
        return eid;
      });
      invalidate("events");
      if (!id) redirect(`/admin/events/${eventId}?saved=Event+created.`);
      return ok("Event saved.");
    } catch (error) {
      if (isUniqueViolation(error)) return fail("That slug is already used by another event.", { slug: "Choose a different slug." });
      if (error instanceof Error && error.message === "not_found") return fail("This event no longer exists.");
      throw error;
    }
  });
}

const idOf = (fd: FormData) => String(fd.get("id") ?? "");

export async function setEventFlag(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const field = String(formData.get("field"));
    const value = formData.get("value") === "true";
    if (field !== "published" && field !== "featured") return fail("Unknown field.");
    await db.update(events).set({ [field]: value }).where(eq(events.id, idOf(formData)));
    invalidate("events");
    return ok();
  });
}

export async function archiveEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const restore = formData.get("restore") === "true";
    await db
      .update(events)
      .set(restore ? { status: "completed" } : { status: "archived", featured: false })
      .where(eq(events.id, idOf(formData)));
    invalidate("events");
    return ok();
  });
}

export async function deleteEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    await db.delete(events).where(eq(events.id, idOf(formData)));
    invalidate("events");
    return ok("Event deleted.");
  });
}
