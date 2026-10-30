import "server-only";
import { AuthorizationError, requirePermission, type AdminUser, type Permission } from "@/lib/auth/session";
import type { ActionState } from "@/lib/validations/common";

export const ok = (message?: string): ActionState => ({ ok: true, message, at: Date.now() });
export const fail = (message: string, fieldErrors?: Record<string, string>): ActionState => ({
  ok: false,
  message,
  fieldErrors,
  at: Date.now(),
});

/** Postgres unique-violation (23505), unwrapping Drizzle's error cause. */
export function isUniqueViolation(error: unknown, constraint?: string) {
  const e = (error as { cause?: { code?: string; constraint_name?: string } })?.cause ?? (error as { code?: string; constraint_name?: string });
  return e?.code === "23505" && (!constraint || e.constraint_name === constraint);
}

/** Next.js redirect()/notFound() throw special errors that must propagate. */
function isNavigationError(error: unknown) {
  const digest = (error as { digest?: unknown })?.digest;
  return typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK"));
}

/**
 * Runs an admin mutation after verifying the caller's permission server-side,
 * converting failures into a safe ActionState (never raw database errors).
 */
export async function adminAction(
  permission: Permission,
  run: (user: AdminUser) => Promise<ActionState>,
): Promise<ActionState> {
  try {
    const user = await requirePermission(permission);
    return await run(user);
  } catch (error) {
    if (isNavigationError(error)) throw error;
    if (error instanceof AuthorizationError) return fail(error.message);
    console.error("Admin action failed", error);
    return fail("Something went wrong while saving. Please try again.");
  }
}
