import { notFound } from "next/navigation";
import { MemberForm } from "@/components/admin/team-forms";
import { AdminHeader } from "@/components/admin/ui";
import { requirePage } from "@/lib/auth/session";
import { getMember, isUuid, listTerms } from "@/lib/data/admin";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Edit member" };

export default async function EditMemberPage({ params }: PageProps<"/admin/team/[id]">) {
  await requirePage("content");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [member, terms] = await Promise.all([getMember(id), listTerms()]);
  if (!member) notFound();
  return (
    <>
      <AdminHeader title={member.fullName} back={{ href: `/admin/team?term=${member.teamTermId}`, label: "Team members" }} />
      <MemberForm member={member} terms={terms} />
    </>
  );
}
