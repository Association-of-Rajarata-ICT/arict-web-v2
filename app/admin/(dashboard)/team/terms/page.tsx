import Link from "next/link";
import { deleteTerm, setCurrentTerm } from "@/actions/admin/team";
import { ActionButton } from "@/components/admin/action-button";
import { TermForm } from "@/components/admin/team-forms";
import { AdminEmpty, AdminHeader, Card, Notice, StatusBadge, Table, Td, Th } from "@/components/admin/ui";
import { requirePage } from "@/lib/auth/session";
import { listTerms } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Committee terms" };

export default async function TermsPage({ searchParams }: PageProps<"/admin/team/terms">) {
  await requirePage("content");
  const [terms, sp] = await Promise.all([listTerms(), searchParams]);

  return (
    <>
      <AdminHeader
        title="Committee terms"
        description="Only one term is current. Making a new term current moves the previous one into Past Committees — no history is deleted."
        back={{ href: "/admin/team", label: "Team members" }}
      />
      <Notice searchParams={sp} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div>
          {terms.length === 0 ? (
            <AdminEmpty title="No terms yet" description="Create the first committee term using the form." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Term</Th>
                  <Th>Period</Th>
                  <Th>Members</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {terms.map((t) => (
                  <tr key={t.id}>
                    <Td>
                      <Link href={`/admin/team/terms/${t.id}`} className="font-medium hover:underline">
                        {t.title}
                      </Link>
                      <div className="mt-0.5 flex gap-1.5">
                        <span className="text-xs text-muted">{t.year}</span>
                        {t.isCurrent && <StatusBadge status="current" label="Current" />}
                      </div>
                    </Td>
                    <Td className="text-muted">
                      {t.startDate ? formatDate(t.startDate, { month: "short", year: "numeric" }) : "—"} – {t.endDate ? formatDate(t.endDate, { month: "short", year: "numeric" }) : "—"}
                    </Td>
                    <Td>
                      <Link href={`/admin/team?term=${t.id}`} className="tabular-nums hover:underline">
                        {t.memberCount} / 20
                      </Link>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {!t.isCurrent && (
                          <ActionButton
                            action={setCurrentTerm}
                            fields={{ id: t.id }}
                            tone="primary"
                            confirm={`Make “${t.title}” the current committee? The current term will move to Past Committees.`}
                          >
                            Set current
                          </ActionButton>
                        )}
                        {!t.isCurrent && t.memberCount === 0 && (
                          <ActionButton action={deleteTerm} fields={{ id: t.id }} tone="danger" confirm={`Delete the empty term “${t.title}”?`}>
                            Delete
                          </ActionButton>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
        <Card title="New term">
          <TermForm />
        </Card>
      </div>
    </>
  );
}
