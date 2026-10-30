"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { writeProject } from "@/lib/project-writes";
import { invalidate } from "@/lib/revalidate";
import { fieldErrorsFrom, formToObject, type ActionState } from "@/lib/validations/common";
import { projectSchema } from "@/lib/validations/admin";
import { adminAction, fail, isUniqueViolation, ok } from "./_helpers";

export async function saveProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const id = String(formData.get("id") ?? "") || null;
    const parsed = projectSchema.safeParse(formToObject(formData, ["screenshots"]));
    if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrorsFrom(parsed.error));
    try {
      const projectId = await db.transaction((tx) => writeProject(tx, id, parsed.data));
      invalidate("projects");
      if (!id) redirect(`/admin/projects/${projectId}?saved=Project+created.`);
      return ok("Project saved.");
    } catch (error) {
      if (isUniqueViolation(error)) return fail("That slug is already used by another project.", { slug: "Choose a different slug." });
      if (error instanceof Error && error.message === "not_found") return fail("This project no longer exists.");
      throw error;
    }
  });
}

const idOf = (fd: FormData) => String(fd.get("id") ?? "");

export async function setProjectFlag(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const field = String(formData.get("field"));
    const value = formData.get("value") === "true";
    if (field !== "published" && field !== "featured") return fail("Unknown field.");
    await db.update(projects).set({ [field]: value }).where(eq(projects.id, idOf(formData)));
    invalidate("projects");
    return ok();
  });
}

export async function archiveProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const restore = formData.get("restore") === "true";
    await db
      .update(projects)
      .set(restore ? { status: "completed" } : { status: "archived", featured: false })
      .where(eq(projects.id, idOf(formData)));
    invalidate("projects");
    return ok();
  });
}

export async function deleteProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    await db.delete(projects).where(eq(projects.id, idOf(formData)));
    invalidate("projects");
    return ok("Project deleted.");
  });
}
