import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import { AdminNav, MobileAdminNav, type NavKey } from "@/components/admin/admin-nav";
import { Logo } from "@/components/layout/logo";
import { Avatar } from "@/components/ui/misc";
import { can, requirePage, ROLE_LABELS } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: LayoutProps<"/admin">) {
  const user = await requirePage("content");
  const allowed: NavKey[] = ["dashboard", "events", "projects", "team", "terms"];
  if (can(user, "moderation")) allowed.push("submissions", "join");
  if (can(user, "settings")) allowed.push("settings");
  if (can(user, "users")) allowed.push("users");

  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-line bg-white lg:flex lg:flex-col">
        <div className="sticky top-0 flex h-svh flex-col p-5">
          <Link href="/admin" className="flex items-center gap-2 px-2 py-2" aria-label="ARICT Admin dashboard">
            <Logo className="h-5" />
            <span className="rounded-md bg-mist px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-muted uppercase">Admin</span>
          </Link>
          <nav aria-label="Admin" className="mt-8 flex-1 overflow-y-auto">
            <AdminNav allowed={allowed} />
          </nav>
          <div className="border-t border-line pt-4">
            <div className="flex items-center gap-3 px-2">
              <Avatar name={user.name} src={user.image} size={36} className="size-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted">{ROLE_LABELS[user.role]}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/" target="_blank" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-line text-xs font-medium hover:bg-mist">
                View site <ExternalLink aria-hidden className="size-3.5" />
              </Link>
              <form action={logout}>
                <button type="submit" className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-line text-xs font-medium hover:bg-mist">
                  Sign out <LogOut aria-hidden className="size-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="relative flex h-16 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
          <Link href="/admin" aria-label="ARICT Admin dashboard">
            <Logo className="h-[18px]" />
          </Link>
          <div className="flex items-center gap-1">
            <form action={logout}>
              <button type="submit" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-mist" aria-label="Sign out">
                <LogOut className="size-4" />
              </button>
            </form>
            <MobileAdminNav allowed={allowed} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
