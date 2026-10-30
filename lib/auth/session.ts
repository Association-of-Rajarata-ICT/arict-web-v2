import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, type UserRole } from "../db/schema";
import { auth } from "./index";

export type Permission = "content" | "moderation" | "settings" | "users";

export const PERMISSIONS: Record<Permission, UserRole[]> = {
  // Events, Projects, Team
  content: ["super_admin", "admin", "editor"],
  // Project submissions, Join applications
  moderation: ["super_admin", "admin"],
  // Site settings and homepage content
  settings: ["super_admin", "admin"],
  // Admin accounts
  users: ["super_admin"],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
};

export type AdminUser = { id: string; name: string; email: string; role: UserRole; image: string | null };

/**
 * Data Access Layer: resolves the signed-in admin from the session and re-reads
 * their role from the database, so deactivated accounts and role changes apply
 * immediately rather than when the JWT expires.
 */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  // Session reads are per-request; tell Cache Components before Auth.js touches crypto.
  await connection();
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return null;
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, image: users.image, active: users.active })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (!user || !user.active) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image };
});

export function can(user: Pick<AdminUser, "role"> | null, permission: Permission) {
  return !!user && PERMISSIONS[permission].includes(user.role);
}

/** For admin pages: redirects to login, or to the dashboard if the role is insufficient. */
export async function requirePage(permission: Permission = "content") {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  if (!can(user, permission)) redirect("/admin?denied=1");
  return user;
}

export class AuthorizationError extends Error {
  constructor(message = "You don't have permission to do that.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/** For Server Actions and Route Handlers: throws instead of redirecting. */
export async function requirePermission(permission: Permission) {
  const user = await getAdmin();
  if (!user) throw new AuthorizationError("Your session has expired. Please sign in again.");
  if (!can(user, permission)) throw new AuthorizationError();
  return user;
}
