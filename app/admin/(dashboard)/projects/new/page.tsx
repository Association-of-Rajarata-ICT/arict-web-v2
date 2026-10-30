import { cacheLife } from "next/cache";
import { ProjectForm } from "@/components/admin/project-form";
import { AdminHeader } from "@/components/admin/ui";
import { requirePage } from "@/lib/auth/session";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "New project" };

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export default async function NewProjectPage() {
  await requirePage("content");
  return (
    <>
      <AdminHeader title="New project" back={{ href: "/admin/projects", label: "Projects" }} />
      <ProjectForm project={{ year: await currentYear() }} />
    </>
  );
}
