import { notFound } from "next/navigation";
import { TermForm } from "@/components/admin/team-forms";
import { AdminHeader, Card } from "@/components/admin/ui";
import { LinkButton } from "@/components/ui/button";
import { requirePage } from "@/lib/auth/session";
import { getTerm, isUuid } from "@/lib/data/admin";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Edit term" };

export default async function EditTermPage({ params }: PageProps<"/admin/team/terms/[id]">) {
  await requirePage("content");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const term = await getTerm(id);
  if (!term) notFound();
  return (
    <>
      <AdminHeader
        title={term.title}
        description={term.isCurrent ? "Current committee" : "Historical committee"}
        back={{ href: "/admin/team/terms", label: "Committee terms" }}
        actions={
          <LinkButton href={`/admin/team?term=${term.id}`} variant="outline" size="sm">
            Manage members
          </LinkButton>
        }
      />
      <Card>
        <TermForm term={term} />
      </Card>
    </>
  );
}
