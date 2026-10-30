import Link from "next/link";
import { AdminEmpty, AdminHeader, SearchFilters, StatusBadge, Table, Td, Th, param } from "@/components/admin/ui";
import { SUBMISSION_STATUS_OPTIONS } from "@/lib/admin-options";
import { requirePage } from "@/lib/auth/session";
import { listSubmissions } from "@/lib/data/admin";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Project submissions" };

export default async function SubmissionsPage({ searchParams }: PageProps<"/admin/project-submissions">) {
  await requirePage("moderation");
  const sp = await searchParams;
  const q = param(sp.q)?.trim();
  const status = param(sp.status);
  const rows = await listSubmissions(q, status);

  return (
    <>
      <AdminHeader title="Project submissions" description="Projects shared by students through the public “Share your Project” form. Nothing is published automatically." />
      <SearchFilters q={q} placeholder="Search by title, submitter name or email" filters={[{ name: "status", label: "All statuses", value: status, options: SUBMISSION_STATUS_OPTIONS }]} />
      {rows.length === 0 ? (
        <AdminEmpty title={q || status ? "No submissions match your search." : "No project submissions yet."} description="New submissions from /projects/submit will appear here." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Project</Th>
              <Th>Submitter</Th>
              <Th>Submitted</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <Td>
                  <Link href={`/admin/project-submissions/${s.id}`} className="font-medium hover:underline">
                    {s.title}
                  </Link>
                  <p className="text-xs text-muted">{s.category}</p>
                </Td>
                <Td>
                  <p>{s.submitterName}</p>
                  <p className="text-xs text-muted">{s.submitterEmail}</p>
                </Td>
                <Td className="whitespace-nowrap text-muted">{s.submittedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Colombo" })}</Td>
                <Td>
                  <StatusBadge status={s.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
