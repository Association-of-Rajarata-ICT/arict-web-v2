import { redirect } from "next/navigation";
import { TeamOrderEditor } from "@/components/admin/team-order";
import { TermTabs } from "@/components/admin/term-tabs";
import { AdminEmpty, AdminHeader, param } from "@/components/admin/ui";
import { LinkButton } from "@/components/ui/button";
import { requirePage } from "@/lib/auth/session";
import { getTermMembers, listTerms } from "@/lib/data/admin";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Team display order" };

export default async function TeamOrderPage({ searchParams }: PageProps<"/admin/team/order">) {
  await requirePage("content");
  const sp = await searchParams;
  const terms = await listTerms();
  const selected = terms.find((t) => t.id === param(sp.term)) ?? terms.find((t) => t.isCurrent) ?? terms[0];
  if (!selected) redirect("/admin/team");

  const members = await getTermMembers(selected.id);

  return (
    <>
      <AdminHeader
        title="Display order"
        description="Set the order members appear in on the public Team page. Sections stay in the same place; drag members or use the arrows to reorder them within a section."
        back={{ href: `/admin/team?term=${selected.id}`, label: "Team members" }}
      />
      <TermTabs terms={terms} selectedId={selected.id} basePath="/admin/team/order" />
      {members.length === 0 ? (
        <AdminEmpty
          title="No members in this term yet."
          action={<LinkButton href={`/admin/team/new?term=${selected.id}`} variant="dark" size="sm">Add the first member</LinkButton>}
        />
      ) : (
        <TeamOrderEditor key={selected.id} termId={selected.id} members={members} />
      )}
    </>
  );
}
