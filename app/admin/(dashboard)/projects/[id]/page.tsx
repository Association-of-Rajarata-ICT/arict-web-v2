import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ProjectForm } from "@/components/admin/project-form";
import { AdminHeader, Notice } from "@/components/admin/ui";
import { can, requirePage } from "@/lib/auth/session";
import { getProjectForEdit, isUuid } from "@/lib/data/admin";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params, searchParams }: PageProps<"/admin/projects/[id]">) {
  const user = await requirePage("content");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [project, sp] = await Promise.all([getProjectForEdit(id), searchParams]);
  if (!project) notFound();

  return (
    <>
      <AdminHeader
        title={project.title}
        description={
          <>
            {project.published ? "Published" : "Draft — not visible on the public site"}
            {project.submission && can(user, "moderation") && (
              <>
                {" · "}
                <Link className="underline" href={`/admin/project-submissions/${project.submission.id}`}>
                  Created from a public submission
                </Link>
              </>
            )}
          </>
        }
        back={{ href: "/admin/projects", label: "Projects" }}
        actions={
          project.published && project.status !== "archived" ? (
            <Link href={`/projects/${project.slug}`} target="_blank" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-medium hover:bg-mist">
              View on site <ExternalLink aria-hidden className="size-3.5" />
            </Link>
          ) : undefined
        }
      />
      <Notice searchParams={sp} />
      <ProjectForm
        project={{
          ...project,
          contributors: project.members.map((m) => ({ name: m.memberName, role: m.role })),
          screenshots: project.images.map((i) => i.imageUrl),
        }}
      />
    </>
  );
}
