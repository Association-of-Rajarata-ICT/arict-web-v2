import Link from "next/link";
import { archiveJoinApplication } from "@/actions/admin/join";
import { ActionButton } from "@/components/admin/action-button";
import { AdminEmpty, AdminHeader, SearchFilters, StatusBadge, Table, Td, Th, param } from "@/components/admin/ui";
import { JOIN_STATUS_OPTIONS } from "@/lib/admin-options";
import { requirePage } from "@/lib/auth/session";
import { listJoinApplications } from "@/lib/data/admin";
import { ACADEMIC_YEAR_LABELS } from "@/lib/team";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Join applications" };

export default async function JoinApplicationsPage({ searchParams }: PageProps<"/admin/join-applications">) {
  await requirePage("moderation");
  const sp = await searchParams;
  const q = param(sp.q)?.trim();
  const status = param(sp.status);
  const year = param(sp.year);
  const rows = await listJoinApplications(q, status, year);

  return (
    <>
      <AdminHeader title="Join applications" description="Membership applications from /join. Archived applications are hidden unless you filter for them." />
      <SearchFilters
        q={q}
        placeholder="Search by name, email or registration number"
        filters={[
          { name: "status", label: "All active", value: status, options: JOIN_STATUS_OPTIONS },
          { name: "year", label: "All years", value: year, options: [1, 2, 3, 4].map((y) => ({ value: String(y), label: ACADEMIC_YEAR_LABELS[y]! })) },
        ]}
      />
      {rows.length === 0 ? (
        <AdminEmpty title={q || status || year ? "No applications match your search." : "No applications yet."} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Applicant</Th>
              <Th>Year / Program</Th>
              <Th>Received</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <Td>
                  <Link href={`/admin/join-applications/${a.id}`} className="font-medium hover:underline">
                    {a.fullName}
                  </Link>
                  <p className="text-xs text-muted">
                    {a.email} · {a.registrationNumber}
                  </p>
                </Td>
                <Td>
                  <p>{ACADEMIC_YEAR_LABELS[a.academicYear]}</p>
                  <p className="text-xs text-muted">{a.degree}</p>
                </Td>
                <Td className="whitespace-nowrap text-muted">{a.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Colombo" })}</Td>
                <Td>
                  <StatusBadge status={a.status} />
                </Td>
                <Td>
                  <div className="flex justify-end">
                    {a.status !== "archived" && (
                      <ActionButton action={archiveJoinApplication} fields={{ id: a.id }}>
                        Archive
                      </ActionButton>
                    )}
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
