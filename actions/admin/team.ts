"use server";

import { and, asc, count, eq, max, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/data/admin";
import { teamMembers, teamTerms } from "@/lib/db/schema";
import { invalidate } from "@/lib/revalidate";
import { ACADEMIC_YEAR_LABELS, COMMITTEE_LIMIT_PER_YEAR, POSITION_LABELS, isExecutive, isSingleHolderPosition, memberSection } from "@/lib/team";
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
    return ok(id ? "Term saved." : "Term created.");
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

    // Typed-in positions are no longer offered; only members who already have one keep it.
    if (data.position === "other") {
      const [current] = id ? await db.select({ position: teamMembers.position }).from(teamMembers).where(eq(teamMembers.id, id)) : [];
      if (current?.position !== "other") return fail("Choose a position from the list.", { position: "Choose a position from the list." });
    }

    try {
      const result = await db.transaction(async (tx) => {
        // Lock the term row so concurrent saves can't exceed the limits.
        const [term] = await tx.select({ id: teamTerms.id }).from(teamTerms).where(eq(teamTerms.id, data.teamTermId)).for("update");
        if (!term) return fail("Choose a valid committee term.", { teamTermId: "Choose a committee term." });

        const others = id ? ne(teamMembers.id, id) : undefined;
        if (isSingleHolderPosition(data.position)) {
          const [holder] = await tx
            .select({ name: teamMembers.fullName })
            .from(teamMembers)
            .where(and(eq(teamMembers.teamTermId, data.teamTermId), eq(teamMembers.position, data.position), others))
            .limit(1);
          if (holder) {
            const msg = `${POSITION_LABELS[data.position]} is already held by ${holder.name} in this term.`;
            return fail(msg, { position: msg });
          }
        } else if (!isExecutive(data.position)) {
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

        // New members, and members moved to another section, go to the end of their section.
        const [{ last }] = await tx
          .select({ last: max(teamMembers.displayOrder) })
          .from(teamMembers)
          .where(eq(teamMembers.teamTermId, data.teamTermId));
        const endOfList = (last ?? -1) + 1;

        if (id) {
          const [current] = await tx
            .select({ teamTermId: teamMembers.teamTermId, position: teamMembers.position, academicYear: teamMembers.academicYear })
            .from(teamMembers)
            .where(eq(teamMembers.id, id));
          if (!current) return fail("This member no longer exists.");
          const moved = current.teamTermId !== data.teamTermId || memberSection(current) !== memberSection(data);
          await tx
            .update(teamMembers)
            .set(moved ? { ...data, displayOrder: endOfList } : data)
            .where(eq(teamMembers.id, id));
          return ok("Member saved.");
        }
        await tx.insert(teamMembers).values({ ...data, displayOrder: endOfList });
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
    return ok("Member added.");
  });
}

/**
 * Saves the order of a term's members from the "order" fields (member IDs, top to bottom).
 * Sections stay fixed on the public page, so only the order within each section matters.
 * Members missing from the list (e.g. added meanwhile) keep their place after the listed ones.
 */
export async function saveMemberOrder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("content", async () => {
    const termId = String(formData.get("termId") ?? "");
    const ids = formData.getAll("order").map(String);
    if (!isUuid(termId) || ids.length === 0 || ids.length > 500 || !ids.every(isUuid) || new Set(ids).size !== ids.length) {
      return fail("Couldn't read the new order. Refresh the page and try again.");
    }

    const rows = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(eq(teamMembers.teamTermId, termId))
      .orderBy(asc(teamMembers.displayOrder));
    const listed = new Set(ids);
    const order = [...ids, ...rows.map((r) => r.id).filter((id) => !listed.has(id))];

    await db.execute(sql`
      update ${teamMembers} set display_order = v.ord - 1
      from unnest(array[${sql.join(order.map((id) => sql`${id}`), sql`, `)}]::uuid[]) with ordinality as v(id, ord)
      where ${teamMembers.id} = v.id and ${teamMembers.teamTermId} = ${termId}
    `);
    invalidate("team");
    return ok("Display order saved.");
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
