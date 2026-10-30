"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { teamMembers, teamTerms } from "@/lib/db/schema";
import { invalidate } from "@/lib/revalidate";
import { ACADEMIC_YEAR_LABELS, COMMITTEE_LIMIT_PER_YEAR, POSITION_LABELS, isExecutive } from "@/lib/team";
import { fieldErrorsFrom, formToObject, type ActionState } from "@/lib/validations/common";
import { teamMemberSchema, teamTermSchema } from "@/lib/validations/admin";
import { adminAction, fail, isUniqueViolation, ok } from "./_helpers";

/* ------------------------------------------------------------------ terms */

export async function saveTerm(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const id = String(formData.get("id") ?? "");
    const parsed = teamTermSchema.safeParse(formToObject(formData));
    if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrorsFrom(parsed.error));
    try {
      if (id) {
        await db.update(teamTerms).set(parsed.data).where(eq(teamTerms.id, id));
      } else {
        await db.insert(teamTerms).values(parsed.data);
      }
    } catch (error) {
      if (isUniqueViolation(error)) return fail("A term for that year already exists.", { year: "Choose a different year." });
      throw error;
    }
    invalidate("team");
    if (!id) redirect("/admin/team/terms?saved=Term+created.");
    return ok("Term saved.");
  });
}

/**
 * Makes a term current. The previous current term automatically becomes
 * historical; no members or records are changed or removed.
 */
export async function setCurrentTerm(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const id = String(formData.get("id") ?? "");
    await db.transaction(async (tx) => {
      const [term] = await tx.select({ id: teamTerms.id }).from(teamTerms).where(eq(teamTerms.id, id)).for("update");
      if (!term) throw new Error("not_found");
      await tx.update(teamTerms).set({ isCurrent: false }).where(and(eq(teamTerms.isCurrent, true), ne(teamTerms.id, id)));
      await tx.update(teamTerms).set({ isCurrent: true }).where(eq(teamTerms.id, id));
    });
    invalidate("team");
    return ok("Current term updated.");
  });
}

/** Only empty terms can be deleted, so team history is never removed by accident. */
export async function deleteTerm(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const id = String(formData.get("id") ?? "");
    const [{ n }] = await db.select({ n: count() }).from(teamMembers).where(eq(teamMembers.teamTermId, id));
    if (n > 0) return fail("This term has members. Remove them first — committee history is never deleted automatically.");
    const [term] = await db.select({ isCurrent: teamTerms.isCurrent }).from(teamTerms).where(eq(teamTerms.id, id));
    if (term?.isCurrent) return fail("You can't delete the current term. Make another term current first.");
    await db.delete(teamTerms).where(eq(teamTerms.id, id));
    invalidate("team");
    return ok("Term deleted.");
  });
}

/* ---------------------------------------------------------------- members */

export async function saveMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const id = String(formData.get("id") ?? "");
    const parsed = teamMemberSchema.safeParse(formToObject(formData));
    if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrorsFrom(parsed.error));
    const data = parsed.data;

    if (!isExecutive(data.position) && (data.academicYear < 1 || data.academicYear > 3)) {
      return fail("Committee members must be 1st, 2nd or 3rd year.", { academicYear: "Choose 1st, 2nd or 3rd year." });
    }

    try {
      const result = await db.transaction(async (tx) => {
        // Lock the term row so concurrent saves can't exceed the limits.
        const [term] = await tx.select({ id: teamTerms.id }).from(teamTerms).where(eq(teamTerms.id, data.teamTermId)).for("update");
        if (!term) return fail("Choose a valid committee term.", { teamTermId: "Choose a committee term." });

        const others = id ? ne(teamMembers.id, id) : undefined;
        if (isExecutive(data.position)) {
          const [holder] = await tx
            .select({ name: teamMembers.fullName })
            .from(teamMembers)
            .where(and(eq(teamMembers.teamTermId, data.teamTermId), eq(teamMembers.position, data.position), others))
            .limit(1);
          if (holder) {
            const msg = `${POSITION_LABELS[data.position]} is already held by ${holder.name} in this term.`;
            return fail(msg, { position: msg });
          }
        } else {
          const [{ n }] = await tx
            .select({ n: count() })
            .from(teamMembers)
            .where(
              and(
                eq(teamMembers.teamTermId, data.teamTermId),
                eq(teamMembers.position, "committee_member"),
                eq(teamMembers.academicYear, data.academicYear),
                others,
              ),
            );
          if (n >= COMMITTEE_LIMIT_PER_YEAR) {
            const msg = `The ${ACADEMIC_YEAR_LABELS[data.academicYear]} committee is full (${COMMITTEE_LIMIT_PER_YEAR}/${COMMITTEE_LIMIT_PER_YEAR}).`;
            return fail(msg, { academicYear: msg });
          }
        }

        if (id) {
          const updated = await tx.update(teamMembers).set(data).where(eq(teamMembers.id, id)).returning({ id: teamMembers.id });
          if (!updated.length) return fail("This member no longer exists.");
          return ok("Member saved.");
        }
        await tx.insert(teamMembers).values(data);
        return null;
      });
      if (result) {
        if (result.ok) invalidate("team");
        return result;
      }
    } catch (error) {
      if (isUniqueViolation(error)) return fail("That position is already filled in this term.", { position: "Position already filled." });
      throw error;
    }
    invalidate("team");
    redirect(`/admin/team?term=${data.teamTermId}&saved=Member+added.`);
  });
}

export async function deleteMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    await db.delete(teamMembers).where(eq(teamMembers.id, String(formData.get("id") ?? "")));
    invalidate("team");
    return ok("Member removed.");
  });
}

export async function toggleMemberFeatured(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    await db
      .update(teamMembers)
      .set({ featuredOnHome: formData.get("value") === "true" })
      .where(eq(teamMembers.id, String(formData.get("id") ?? "")));
    invalidate("team");
    return ok();
  });
}
