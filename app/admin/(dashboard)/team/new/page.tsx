import { MemberForm } from "@/components/admin/team-forms";
import { AdminEmpty, AdminHeader, param } from "@/components/admin/ui";
import { LinkButton } from "@/components/ui/button";
import { requirePage } from "@/lib/auth/session";
import { listTerms } from "@/lib/data/admin";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Add member" };

export default async function NewMemberPage({ searchParams }: PageProps<"/admin/team/new">) {
  await requirePage("content");
  const [terms, sp] = await Promise.all([listTerms(), searchParams]);
  const termId = param(sp.term) ?? terms.find((t) => t.isCurrent)?.id ?? terms[0]?.id;
  return (
    <>
      <AdminHeader title="Add team member" back={{ href: termId ? `/admin/team?term=${termId}` : "/admin/team", label: "Team members" }} />
      {terms.length === 0 ? (
        <AdminEmpty title="Create a committee term first" action={<LinkButton href="/admin/team/terms" variant="dark" size="sm">Manage terms</LinkButton>} />
      ) : (
        <MemberForm terms={terms} defaultTermId={termId} />
      )}
    </>
  );
}
