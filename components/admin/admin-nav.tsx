"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FolderGit2,
  Inbox,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  X,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NavKey = "dashboard" | "events" | "projects" | "submissions" | "team" | "terms" | "join" | "settings" | "users";

const ITEMS: { key: NavKey; href: string; label: string; icon: typeof CalendarDays }[] = [
  { key: "dashboard", href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { key: "events", href: "/admin/events", label: "Events", icon: CalendarDays },
  { key: "projects", href: "/admin/projects", label: "Projects", icon: FolderGit2 },
  { key: "submissions", href: "/admin/project-submissions", label: "Project Submissions", icon: Inbox },
  { key: "team", href: "/admin/team", label: "Team Members", icon: Users },
  { key: "terms", href: "/admin/team/terms", label: "Committee Terms", icon: History },
  { key: "join", href: "/admin/join-applications", label: "Join Applications", icon: UserPlus },
  { key: "settings", href: "/admin/settings", label: "Site Settings", icon: Settings },
  { key: "users", href: "/admin/users", label: "Admin Users", icon: ShieldCheck },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/team") return pathname === "/admin/team" || /^\/admin\/team\/(?!terms)/.test(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ allowed, pathname, onNavigate }: { allowed: NavKey[]; pathname: string | null; onNavigate?: () => void }) {
  return (
    <ul className="space-y-0.5">
      {ITEMS.filter((i) => allowed.includes(i.key)).map(({ key, href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={key}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-ink text-paper" : "text-ink/70 hover:bg-mist hover:text-ink",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function WithPath({ allowed, onNavigate }: { allowed: NavKey[]; onNavigate?: () => void }) {
  return <NavList allowed={allowed} pathname={usePathname()} onNavigate={onNavigate} />;
}

export function AdminNav({ allowed }: { allowed: NavKey[] }) {
  return (
    <Suspense fallback={<NavList allowed={allowed} pathname={null} />}>
      <WithPath allowed={allowed} />
    </Suspense>
  );
}

export function MobileAdminNav({ allowed }: { allowed: NavKey[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        aria-label={open ? "Close admin menu" : "Open admin menu"}
        className="inline-flex size-10 items-center justify-center rounded-full hover:bg-mist"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <nav id="admin-mobile-nav" aria-label="Admin" className="absolute inset-x-0 top-full z-40 border-b border-line bg-surface p-3 shadow-soft">
          <Suspense fallback={<NavList allowed={allowed} pathname={null} />}>
            <WithPath allowed={allowed} onNavigate={() => setOpen(false)} />
          </Suspense>
        </nav>
      )}
    </div>
  );
}
