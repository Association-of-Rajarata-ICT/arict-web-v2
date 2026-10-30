"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import type { ActionState } from "@/lib/validations/common";

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, message: "Enter your email and password.", at: Date.now() };

  const next = String(formData.get("next") ?? "");
  const redirectTo = next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";

  try {
    await signIn("credentials", { email, password, redirectTo });
    return { ok: true, at: Date.now() };
  } catch (error) {
    if (error instanceof AuthError) {
      const code = (error as AuthError & { code?: string }).code;
      return {
        ok: false,
        message: code === "rate_limited" ? "Too many sign-in attempts. Please wait 15 minutes and try again." : "Incorrect email or password.",
        at: Date.now(),
      };
    }
    throw error; // successful sign-in redirects by throwing
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
