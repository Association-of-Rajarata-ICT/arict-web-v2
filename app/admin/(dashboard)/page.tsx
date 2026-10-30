import Link from "next/link";
import { ArrowUpRight, CalendarDays, CalendarClock, FolderGit2, History, Inbox, UserPlus, Users } from "lucide-react";
import { AdminHeader, Card, Notice, StatusBadge } from "@/components/admin/ui";
import { can, requirePage } from "@/lib/auth/session";
import { getDashboardStats, getRecentActivity } from "@/lib/data/admin";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard({ searchParams }: PageProps<"/admin">) {
  const user = await requirePage("content");
  const moderation = can(user, "moderation");
  const [stats, activity, sp] = await Promise.all([getDashboardStats(), moderation ? getRecentActivity() : null, searchParams]);

  const tiles = [
    { label: "Total Events", value: stats.totalEvents, href: "/admin/events", icon: CalendarDays },
    { label: "Upcoming Events", value: stats.upcomingEvents, href: "/admin/events", icon: CalendarClock },
    { label: "Published Projects", value: stats.publishedProjects, href: "/admin/projects?status=published", icon: FolderGit2 },
    ...(moderation
      ? [{ label: "Pending Project Submissions", value: stats.pendingSubmissions, href: "/admin/project-submissions?status=pending", icon: Inbox, highlight: stats.pendingSubmissions > 0 }]
      : []),
    { label: "Current Team Members", value: stats.currentMembers, href: "/admin/team", icon: Users, suffix: "/ 20" },
    { label: "Past Committee Terms", value: stats.pastTerms, href: "/admin/team/terms", icon: History },
    ...(moderation
      ? [{ label: "Pending Join Applications", value: stats.pendingJoins, href: "/admin/join-applications?status=pending", icon: UserPlus, highlight: stats.pendingJoins > 0 }]
      : []),
  ];

  return (
    <>
      <AdminHeader title={`Welcome back, ${user.name.split(" ")[0]}`} description="Here's what's happening across ARICT." />
      <Notice searchParams={sp} />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link
              href={t.href}
              className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex size-9 items-center justify-center rounded-xl ${"highlight" in t && t.highlight ? "bg-brand-soft text-brand" : "bg-mist text-ink/70"}`}>
                  <t.icon aria-hidden className="size-4" />
                </span>
                <ArrowUpRight aria-hidden className="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="font-display mt-5 text-3xl font-semibold tracking-tight">
                {t.value}
                {"suffix" in t && t.suffix && <span className="ml-1 text-base font-normal text-muted">{t.suffix}</span>}
              </p>
              <p className="mt-1 text-sm text-muted">{t.label}</p>
            </Link>
          </li>
        ))}
      </ul>

      {activity && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card title="Latest project submissions">
            {activity.subs.length ? (
              <ul className="divide-y divide-line">
                {activity.subs.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                    <Link href={`/admin/project-submissions/${s.id}`} className="min-w-0 hover:underline">
                      <p className="truncate text-sm font-medium">{s.title}</p>
                      <p className="truncate text-xs text-muted">by {s.name}</p>
                    </Link>
                    <StatusBadge status={s.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No submissions yet.</p>
            )}
          </Card>
          <Card title="Latest join applications">
            {activity.joins.length ? (
              <ul className="divide-y divide-line">
                {activity.joins.map((j) => (
                  <li key={j.id} className="flex items-center justify-between gap-3 py-3">
                    <Link href={`/admin/join-applications/${j.id}`} className="min-w-0 hover:underline">
                      <p className="truncate text-sm font-medium">{j.name}</p>
                      <p className="text-xs text-muted">Year {j.year}</p>
                    </Link>
                    <StatusBadge status={j.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No applications yet.</p>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
