import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { archiveProject, deleteProject, setProjectFlag } from "@/actions/admin/projects";
import { ActionButton } from "@/components/admin/action-button";
import { AdminEmpty, AdminHeader, Notice, SearchFilters, StatusBadge, Table, Td, Th, param } from "@/components/admin/ui";
import { LinkButton } from "@/components/ui/button";
import { requirePage } from "@/lib/auth/session";
import { listProjects } from "@/lib/data/admin";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Projects" };

export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  await requirePage("content");
  const sp = await searchParams;
  const q = param(sp.q)?.trim();
  const status = param(sp.status);
  const rows = await listProjects(q, status);

  return (
    <>
      <AdminHeader
        title="Projects"
        description="Published projects appear on /projects. Featured + published projects appear on the homepage."
        actions={
          <LinkButton href="/admin/projects/new" variant="dark" size="sm">
            <Plus aria-hidden className="size-4" /> New project
          </LinkButton>
        }
      />
      <Notice searchParams={sp} />
      <SearchFilters
        q={q}
        placeholder="Search by title or category"
        filters={[
          {
            name: "status",
            label: "All projects",
            value: status,
            options: [
              { value: "published", label: "Published" },
              { value: "draft", label: "Drafts" },
              { value: "featured", label: "Featured" },
              { value: "in_progress", label: "In progress" },
              { value: "completed", label: "Completed" },
              { value: "archived", label: "Archived" },
            ],
          },
        ]}
      />
      {rows.length === 0 ? (
        <AdminEmpty title={q || status ? "No projects match your search." : "No projects yet."} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Project</Th>
              <Th>Year</Th>
              <Th>Status</Th>
              <Th>Visibility</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <Td>
                  <Link href={`/admin/projects/${p.id}`} className="font-medium hover:underline">
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted">{p.category}</p>
                </Td>
                <Td>{p.year}</Td>
                <Td>
                  <StatusBadge status={p.status} />
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    <StatusBadge status={p.published ? "published" : "draft"} label={p.published ? "Published" : "Draft"} />
                    {p.featured && <StatusBadge status="featured" label="Featured" />}
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap items-start justify-end gap-1.5">
                    <ActionButton action={setProjectFlag} fields={{ id: p.id, field: "published", value: String(!p.published) }}>
                      {p.published ? "Unpublish" : "Publish"}
                    </ActionButton>
                    <ActionButton action={setProjectFlag} fields={{ id: p.id, field: "featured", value: String(!p.featured) }}>
                      {p.featured ? "Unfeature" : "Feature"}
                    </ActionButton>
                    <ActionButton action={archiveProject} fields={{ id: p.id, restore: String(p.status === "archived") }}>
                      {p.status === "archived" ? "Restore" : "Archive"}
                    </ActionButton>
                    <ActionButton action={deleteProject} fields={{ id: p.id }} tone="danger" confirm={`Delete “${p.title}” permanently? This cannot be undone.`}>
                      Delete
                    </ActionButton>
                    {p.published && p.status !== "archived" && (
                      <Link href={`/projects/${p.slug}`} target="_blank" className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-mist hover:text-ink" aria-label={`View ${p.title} on the site`}>
                        <ExternalLink className="size-3.5" />
                      </Link>
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
