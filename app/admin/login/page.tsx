import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/auth/session";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo withTagline className="w-56" />
        </div>
        <div className="mt-10 rounded-3xl border border-line bg-surface p-7 shadow-soft">
          <h1 className="text-xl font-semibold tracking-tight">Sign in to ARICT Admin</h1>
          <p className="mt-1 text-sm text-muted">For committee members with an admin account.</p>
          <LoginForm next={typeof next === "string" ? next : ""} />
        </div>
      </div>
    </main>
  );
}
