import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteMember, toggleMemberFeatured } from "@/actions/admin/team";
import { ActionButton } from "@/components/admin/action-button";
import { AdminEmpty, AdminHeader, Card, Notice, StatusBadge, Table, Td, Th, param } from "@/components/admin/ui";
import { LinkButton } from "@/components/ui/button";
import { Avatar } from "@/components/ui/misc";
import { requirePage } from "@/lib/auth/session";
import { getTermMembers, listTerms } from "@/lib/data/admin";
import { ACADEMIC_YEAR_LABELS, COMMITTEE_LIMIT_PER_YEAR, COMMITTEE_YEARS, EXECUTIVE_POSITIONS, POSITION_LABELS } from "@/lib/team";
import { cn } from "@/lib/utils";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Team members" };

export default async function AdminTeamPage({ searchParams }: PageProps<"/admin/team">) {
  await requirePage("content");
  const sp = await searchParams;
  const terms = await listTerms();
  const selected = terms.find((t) => t.id === param(sp.term)) ?? terms.find((t) => t.isCurrent) ?? terms[0];

  if (!selected) {
    return (
      <>
        <AdminHeader title="Team members" />
        <AdminEmpty
          title="Create a committee term first"
          description="Every member belongs to a committee term (for example “2026/27 Committee”)."
          action={<LinkButton href="/admin/team/terms" variant="dark" size="sm">Manage terms</LinkButton>}
        />
      </>
    );
  }

  const members = await getTermMembers(selected.id);
  const byPosition = new Map(members.map((m) => [m.position, m]));
  const committeeCount = (y: number) => members.filter((m) => m.position === "committee_member" && m.academicYear === y).length;

  return (
    <>
      <AdminHeader
        title="Team members"
        description="Each term has 8 executive positions and 4 committee seats for each of 1st, 2nd and 3rd year."
        actions={
          <>
            <LinkButton href="/admin/team/terms" variant="outline" size="sm">
              Manage terms
            </LinkButton>
            <LinkButton href={`/admin/team/new?term=${selected.id}`} variant="dark" size="sm">
              <Plus aria-hidden className="size-4" /> Add member
            </LinkButton>
          </>
        }
      />
      <Notice searchParams={sp} />

      <nav aria-label="Committee terms" className="mb-6 flex flex-wrap gap-2">
        {terms.map((t) => (
          <Link
            key={t.id}
            href={`/admin/team?term=${t.id}`}
            aria-current={t.id === selected.id ? "page" : undefined}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium",
              t.id === selected.id ? "border-ink bg-ink text-paper" : "border-line bg-surface hover:bg-mist",
            )}
          >
            {t.title}
            {t.isCurrent && <span className={cn("size-1.5 rounded-full", t.id === selected.id ? "bg-surface" : "bg-brand")} aria-label="current" />}
          </Link>
        ))}
      </nav>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <Card title="Executive Committee" description={`${EXECUTIVE_POSITIONS.filter((p) => byPosition.has(p)).length}/8 filled`} className="lg:col-span-2">
          <ul className="grid gap-2 sm:grid-cols-2">
            {EXECUTIVE_POSITIONS.map((p) => {
              const m = byPosition.get(p);
              return (
                <li key={p} className="flex items-center justify-between gap-3 rounded-xl bg-mist/70 px-3 py-2 text-sm">
                  <span className="text-muted">{POSITION_LABELS[p]}</span>
                  {m ? (
                    <Link href={`/admin/team/${m.id}`} className="truncate font-medium hover:underline">
                      {m.fullName}
                    </Link>
                  ) : (
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Vacant</span>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
        <Card title="Committee capacity">
          <ul className="space-y-3">
            {COMMITTEE_YEARS.map((y) => {
              const n = committeeCount(y);
              return (
                <li key={y}>
                  <div className="flex justify-between text-sm">
                    <span>{ACADEMIC_YEAR_LABELS[y]}</span>
                    <span className={cn("font-medium tabular-nums", n >= COMMITTEE_LIMIT_PER_YEAR && "text-emerald-700 dark:text-emerald-400")}>
                      {n}/{COMMITTEE_LIMIT_PER_YEAR}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-ink" style={{ width: `${(n / COMMITTEE_LIMIT_PER_YEAR) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {members.length === 0 ? (
        <AdminEmpty title="No members in this term yet." action={<LinkButton href={`/admin/team/new?term=${selected.id}`} variant="dark" size="sm">Add the first member</LinkButton>} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Member</Th>
              <Th>Position</Th>
              <Th>Year</Th>
              <Th>Order</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={m.fullName} src={m.image} size={36} className="size-9 shrink-0" />
                    <div>
                      <Link href={`/admin/team/${m.id}`} className="font-medium hover:underline">
                        {m.fullName}
                      </Link>
                      {m.featuredOnHome && (
                        <div className="mt-0.5">
                          <StatusBadge status="featured" label="On homepage" />
                        </div>
                      )}
                    </div>
                  </div>
                </Td>
                <Td>{POSITION_LABELS[m.position]}</Td>
                <Td>{ACADEMIC_YEAR_LABELS[m.academicYear]}</Td>
                <Td className="tabular-nums text-muted">{m.displayOrder}</Td>
                <Td>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <ActionButton action={toggleMemberFeatured} fields={{ id: m.id, value: String(!m.featuredOnHome) }}>
                      {m.featuredOnHome ? "Remove from homepage" : "Feature on homepage"}
                    </ActionButton>
                    <ActionButton action={deleteMember} fields={{ id: m.id }} tone="danger" confirm={`Remove ${m.fullName} from ${selected.title}?`}>
                      Remove
                    </ActionButton>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
