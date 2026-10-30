import "server-only";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "./db";
import { projectImages, projectMembers, projects, projectTechnologies } from "./db/schema";
import type { projectSchema } from "./validations/admin";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type ProjectInput = z.infer<typeof projectSchema>;

/** Inserts or updates a project together with its technologies, contributors and screenshots. */
export async function writeProject(tx: Tx, id: string | null, input: ProjectInput) {
  const { technologies, contributors, screenshots, ...data } = input;
  let projectId = id;
  if (id) {
    const updated = await tx.update(projects).set(data).where(eq(projects.id, id)).returning({ id: projects.id });
    if (!updated.length) throw new Error("not_found");
  } else {
    const [row] = await tx.insert(projects).values(data).returning({ id: projects.id });
    projectId = row!.id;
  }
  const pid = projectId!;

  await tx.delete(projectTechnologies).where(eq(projectTechnologies.projectId, pid));
  if (technologies.length) {
    await tx.insert(projectTechnologies).values(technologies.map((name) => ({ projectId: pid, name })));
  }

  await tx.delete(projectMembers).where(eq(projectMembers.projectId, pid));
  if (contributors.length) {
    await tx.insert(projectMembers).values(contributors.map((c) => ({ projectId: pid, memberName: c.name, role: c.role })));
  }

  await tx.delete(projectImages).where(eq(projectImages.projectId, pid));
  if (screenshots.length) {
    await tx.insert(projectImages).values(
      screenshots.map((imageUrl, i) => ({ projectId: pid, imageUrl, altText: `${data.title} screenshot ${i + 1}`, displayOrder: i })),
    );
  }
  return pid;
}
