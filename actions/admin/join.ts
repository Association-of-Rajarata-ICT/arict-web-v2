"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { joinApplications } from "@/lib/db/schema";
import { fieldErrorsFrom, formToObject, type ActionState } from "@/lib/validations/common";
import { joinReviewSchema } from "@/lib/validations/admin";
import { adminAction, fail, ok } from "./_helpers";

export async function reviewJoinApplication(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("moderation", async () => {
    const parsed = joinReviewSchema.safeParse(formToObject(formData));
    if (!parsed.success) return fail("Please check the form.", fieldErrorsFrom(parsed.error));
    const { id, status, adminNotes } = parsed.data;
    const updated = await db
      .update(joinApplications)
      .set({ status, adminNotes })
      .where(eq(joinApplications.id, id))
      .returning({ id: joinApplications.id });
    return updated.length ? ok("Application updated.") : fail("Application not found.");
  });
}

export async function archiveJoinApplication(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("moderation", async () => {
    await db.update(joinApplications).set({ status: "archived" }).where(eq(joinApplications.id, String(formData.get("id") ?? "")));
    return ok("Application archived.");
  });
}
