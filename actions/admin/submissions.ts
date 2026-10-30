"use server";

import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { projectSubmissions } from "@/lib/db/schema";
import { writeProject } from "@/lib/project-writes";
import { invalidate } from "@/lib/revalidate";
import { fieldErrorsFrom, formToObject, type ActionState } from "@/lib/validations/common";
import { projectSchema, submissionReviewSchema } from "@/lib/validations/admin";
import { adminAction, fail, isUniqueViolation, ok } from "./_helpers";

/** Updates a submission's review status (except "accepted", which goes through acceptSubmission). */
export async function reviewSubmission(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("moderation", async (user) => {
    const parsed = submissionReviewSchema.safeParse(formToObject(formData));
    if (!parsed.success) return fail("Please check the form.", fieldErrorsFrom(parsed.error));
    const { id, status, adminNotes } = parsed.data;

    const [current] = await db.select({ status: projectSubmissions.status }).from(projectSubmissions).where(eq(projectSubmissions.id, id)).limit(1);
    if (!current) return fail("Submission not found.");
    if (status === "accepted" && current.status !== "accepted") {
      return fail("Use “Accept & create project” below to accept a submission.");
    }

    await db
      .update(projectSubmissions)
      .set({ status, adminNotes, reviewedAt: new Date(), reviewedBy: user.id })
      .where(eq(projectSubmissions.id, id));
    return ok("Review saved.");
  });
}

/**
 * Accepts a submission: validates the (admin-edited) project data, creates a
 * regular project that stays UNPUBLISHED, and links it to the submission.
 */
export async function acceptSubmission(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("moderation", async (user) => {
    const submissionId = String(formData.get("submissionId") ?? "");
    const raw = formToObject(formData, ["screenshots"]);
    const parsed = projectSchema.safeParse({ ...raw, published: "false", featured: "false" });
    if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrorsFrom(parsed.error));

    let projectId: string;
    try {
      projectId = await db.transaction(async (tx) => {
        const [submission] = await tx
          .select({ id: projectSubmissions.id })
          .from(projectSubmissions)
          .where(and(eq(projectSubmissions.id, submissionId), isNull(projectSubmissions.acceptedProjectId)))
          .for("update")
          .limit(1);
        if (!submission) throw new Error("already_accepted");

        const pid = await writeProject(tx, null, { ...parsed.data, published: false, featured: false });
        await tx
          .update(projectSubmissions)
          .set({ status: "accepted", acceptedProjectId: pid, reviewedAt: new Date(), reviewedBy: user.id })
          .where(eq(projectSubmissions.id, submissionId));
        return pid;
      });
    } catch (error) {
      if (isUniqueViolation(error)) return fail("That slug is already used by another project.", { slug: "Choose a different slug." });
      if (error instanceof Error && error.message === "already_accepted") return fail("This submission has already been accepted or no longer exists.");
      throw error;
    }
    invalidate("projects");
    redirect(`/admin/projects/${projectId}?saved=Submission+accepted.+The+project+is+an+unpublished+draft+%E2%80%94+review+it+and+publish+when+ready.`);
  });
}
