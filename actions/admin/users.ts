"use server";

import bcrypt from "bcryptjs";
import { and, count, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { fieldErrorsFrom, formToObject, type ActionState } from "@/lib/validations/common";
import { userSchema } from "@/lib/validations/admin";
import { adminAction, fail, isUniqueViolation, ok } from "./_helpers";

export async function createUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("users", async () => {
    const parsed = userSchema.safeParse(formToObject(formData));
    if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrorsFrom(parsed.error));
    const { password, ...data } = parsed.data;
    try {
      await db.insert(users).values({ ...data, passwordHash: await bcrypt.hash(password, 12) });
    } catch (error) {
      if (isUniqueViolation(error)) return fail("An account with this email already exists.", { email: "Email already in use." });
      throw error;
    }
    return ok(`Account created for ${data.email}. Share the password with them securely.`);
  });
}

async function otherActiveSuperAdmins(excludeId: string) {
  const [{ n }] = await db
    .select({ n: count() })
    .from(users)
    .where(and(eq(users.role, "super_admin"), eq(users.active, true), ne(users.id, excludeId)));
  return n;
}

const updateSchema = z.object({
  id: z.uuid(),
  role: z.enum(["super_admin", "admin", "editor"]).optional(),
  active: z.enum(["true", "false"]).optional(),
});

export async function updateUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("users", async (me) => {
    const parsed = updateSchema.safeParse(formToObject(formData));
    if (!parsed.success) return fail("Invalid request.");
    const { id, role, active } = parsed.data;

    const [target] = await db.select({ role: users.role, active: users.active }).from(users).where(eq(users.id, id));
    if (!target) return fail("User not found.");
    const losingSuperAdmin = target.role === "super_admin" && target.active && ((role && role !== "super_admin") || active === "false");
    if (losingSuperAdmin && (await otherActiveSuperAdmins(id)) === 0) {
      return fail("There must always be at least one active Super Admin.");
    }
    if (id === me.id && active === "false") return fail("You can't deactivate your own account.");

    await db
      .update(users)
      .set({ ...(role ? { role } : {}), ...(active ? { active: active === "true" } : {}) })
      .where(eq(users.id, id));
    return ok("User updated.");
  });
}

export async function resetPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction("users", async () => {
    const id = z.uuid().safeParse(formData.get("id"));
    if (!id.success) return fail("Invalid request.");
    const password = String(formData.get("password") ?? "");
    if (password.length < 10) return fail("Password must be at least 10 characters.", { password: "At least 10 characters." });
    const updated = await db
      .update(users)
      .set({ passwordHash: await bcrypt.hash(password, 12) })
      .where(eq(users.id, id.data))
      .returning({ id: users.id });
    return updated.length ? ok("Password updated.") : fail("User not found.");
  });
}
