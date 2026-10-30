import Link from "next/link";
import { SettingsForms } from "@/components/admin/settings-form";
import { AdminHeader, param } from "@/components/admin/ui";
import { requirePage } from "@/lib/auth/session";
import { getSettingsForEdit } from "@/lib/data/admin";
import { cn } from "@/lib/utils";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Site settings" };

const TABS = [
  { key: "homepage", label: "Homepage" },
  { key: "general", label: "Identity & SEO" },
  { key: "contactSocial", label: "Contact & Social" },
  { key: "about", label: "About page" },
  { key: "footer", label: "Footer" },
] as const;

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  await requirePage("settings");
  const [settings, sp] = await Promise.all([getSettingsForEdit(), searchParams]);
  const tab = TABS.find((t) => t.key === param(sp.tab))?.key ?? "homepage";

  return (
    <>
      <AdminHeader title="Site settings" description="Content shown across the public website. Changes go live as soon as you save." />
      <nav aria-label="Settings sections" className="mb-8 flex gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/settings?tab=${t.key}`}
            aria-current={tab === t.key ? "page" : undefined}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              tab === t.key ? "bg-ink text-paper" : "text-ink/70 hover:bg-mist hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <SettingsForms key={tab} tab={tab} settings={settings} />
    </>
  );
}
