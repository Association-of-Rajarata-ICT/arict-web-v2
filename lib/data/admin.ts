import "server-only";
import { and, asc, count, desc, eq, ilike, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "../db";
import {
  eventImages,
  events,
  joinApplications,
  projectImages,
  projectMembers,
  projects,
  projectSubmissions,
  projectTechnologies,
  siteSettings,
  teamMembers,
  teamTerms,
  users,
  type JoinStatus,
  type SubmissionStatus,
} from "../db/schema";
import { resolveSettings } from "../settings";
import { sortMembers } from "../team";
import { todayInColombo } from "../utils";
import { upcomingCondition } from "./public";

/* Uncached reads for the admin area. Every caller must already have checked permissions. */

const like = (q: string) => `%${q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;

export async function getDashboardStats() {
  const today = todayInColombo();
  const [[ev], [up], [pp], [ps], [cm], [pt], [pj]] = await Promise.all([
    db.select({ n: count() }).from(events).where(ne(events.status, "archived")),
    db.select({ n: count() }).from(events).where(and(eq(events.published, true), upcomingCondition(today))),
    db.select({ n: count() }).from(projects).where(and(eq(projects.published, true), ne(projects.status, "archived"))),
    db.select({ n: count() }).from(projectSubmissions).where(inArray(projectSubmissions.status, ["pending", "under_review"])),
    db
      .select({ n: count() })
      .from(teamMembers)
      .innerJoin(teamTerms, eq(teamMembers.teamTermId, teamTerms.id))
      .where(eq(teamTerms.isCurrent, true)),
    db.select({ n: count() }).from(teamTerms).where(eq(teamTerms.isCurrent, false)),
    db.select({ n: count() }).from(joinApplications).where(eq(joinApplications.status, "pending")),
  ]);
  return {
    totalEvents: ev!.n,
    upcomingEvents: up!.n,
    publishedProjects: pp!.n,
    pendingSubmissions: ps!.n,
    currentMembers: cm!.n,
    pastTerms: pt!.n,
    pendingJoins: pj!.n,
  };
}

export async function getRecentActivity() {
  const [subs, joins] = await Promise.all([
    db
      .select({ id: projectSubmissions.id, title: projectSubmissions.title, name: projectSubmissions.submitterName, status: projectSubmissions.status, at: projectSubmissions.submittedAt })
      .from(projectSubmissions)
      .orderBy(desc(projectSubmissions.submittedAt))
      .limit(5),
    db
      .select({ id: joinApplications.id, name: joinApplications.fullName, year: joinApplications.academicYear, status: joinApplications.status, at: joinApplications.createdAt })
      .from(joinApplications)
      .orderBy(desc(joinApplications.createdAt))
      .limit(5),
  ]);
  return { subs, joins };
}

/* ------------------------------------------------------------------ events */

export async function listEvents(q?: string, status?: string) {
  const where: SQL[] = [];
  if (q) where.push(or(ilike(events.title, like(q)), ilike(events.location, like(q)))!);
  if (status === "published") where.push(eq(events.published, true));
  else if (status === "draft") where.push(eq(events.published, false));
  else if (status) where.push(eq(events.status, status as typeof events.$inferSelect.status));
  return db
    .select()
    .from(events)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(events.startDate));
}

export async function getEventForEdit(id: string) {
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) return null;
  const images = await db.select().from(eventImages).where(eq(eventImages.eventId, id)).orderBy(asc(eventImages.displayOrder));
  return { ...event, images };
}

export async function getEventCategories() {
  const rows = await db.selectDistinct({ c: events.category }).from(events).orderBy(asc(events.category));
  return rows.map((r) => r.c);
}

/* ---------------------------------------------------------------- projects */

export async function listProjects(q?: string, status?: string) {
  const where: SQL[] = [];
  if (q) where.push(or(ilike(projects.title, like(q)), ilike(projects.category, like(q)))!);
  if (status === "published") where.push(eq(projects.published, true));
  else if (status === "draft") where.push(eq(projects.published, false));
  else if (status === "featured") where.push(eq(projects.featured, true));
  else if (status) where.push(eq(projects.status, status as typeof projects.$inferSelect.status));
  return db
    .select()
    .from(projects)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(projects.updatedAt));
}

export async function getProjectForEdit(id: string) {
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return null;
  const [techs, members, images, [submission]] = await Promise.all([
    db.select({ name: projectTechnologies.name }).from(projectTechnologies).where(eq(projectTechnologies.projectId, id)).orderBy(asc(projectTechnologies.name)),
    db.select().from(projectMembers).where(eq(projectMembers.projectId, id)),
    db.select().from(projectImages).where(eq(projectImages.projectId, id)).orderBy(asc(projectImages.displayOrder)),
    db
      .select({ id: projectSubmissions.id, title: projectSubmissions.title })
      .from(projectSubmissions)
      .where(eq(projectSubmissions.acceptedProjectId, id))
      .limit(1),
  ]);
  return { ...project, technologies: techs.map((t) => t.name), members, images, submission: submission ?? null };
}

/* ------------------------------------------------------------- submissions */

export async function listSubmissions(q?: string, status?: string) {
  const where: SQL[] = [];
  if (q)
    where.push(
      or(
        ilike(projectSubmissions.title, like(q)),
        ilike(projectSubmissions.submitterName, like(q)),
        ilike(projectSubmissions.submitterEmail, like(q)),
      )!,
    );
  if (status) where.push(eq(projectSubmissions.status, status as SubmissionStatus));
  return db
    .select({
      id: projectSubmissions.id,
      title: projectSubmissions.title,
      category: projectSubmissions.category,
      submitterName: projectSubmissions.submitterName,
      submitterEmail: projectSubmissions.submitterEmail,
      status: projectSubmissions.status,
      submittedAt: projectSubmissions.submittedAt,
      acceptedProjectId: projectSubmissions.acceptedProjectId,
    })
    .from(projectSubmissions)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(projectSubmissions.submittedAt));
}

export async function getSubmission(id: string) {
  const [row] = await db
    .select({ submission: projectSubmissions, reviewerName: users.name })
    .from(projectSubmissions)
    .leftJoin(users, eq(projectSubmissions.reviewedBy, users.id))
    .where(eq(projectSubmissions.id, id))
    .limit(1);
  return row ? { ...row.submission, reviewerName: row.reviewerName } : null;
}

/* -------------------------------------------------------------------- team */

export async function listTerms() {
  return db
    .select({
      id: teamTerms.id,
      title: teamTerms.title,
      year: teamTerms.year,
      startDate: teamTerms.startDate,
      endDate: teamTerms.endDate,
      isCurrent: teamTerms.isCurrent,
      description: teamTerms.description,
      memberCount: sql<number>`count(${teamMembers.id})::int`,
    })
    .from(teamTerms)
    .leftJoin(teamMembers, eq(teamMembers.teamTermId, teamTerms.id))
    .groupBy(teamTerms.id)
    .orderBy(desc(teamTerms.year));
}

export async function getTerm(id: string) {
  const [term] = await db.select().from(teamTerms).where(eq(teamTerms.id, id)).limit(1);
  return term ?? null;
}

export async function getTermMembers(termId: string) {
  return sortMembers(await db.select().from(teamMembers).where(eq(teamMembers.teamTermId, termId)));
}

export async function getMember(id: string) {
  const [m] = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  return m ?? null;
}

/* ------------------------------------------------------- join applications */

export async function listJoinApplications(q?: string, status?: string, year?: string) {
  const where: SQL[] = [];
  if (q)
    where.push(
      or(
        ilike(joinApplications.fullName, like(q)),
        ilike(joinApplications.email, like(q)),
        ilike(joinApplications.registrationNumber, like(q)),
      )!,
    );
  if (status) where.push(eq(joinApplications.status, status as JoinStatus));
  else where.push(ne(joinApplications.status, "archived"));
  if (year && /^[1-4]$/.test(year)) where.push(eq(joinApplications.academicYear, Number(year)));
  return db
    .select()
    .from(joinApplications)
    .where(and(...where))
    .orderBy(desc(joinApplications.createdAt));
}

export async function getJoinApplication(id: string) {
  const [row] = await db.select().from(joinApplications).where(eq(joinApplications.id, id)).limit(1);
  return row ?? null;
}

/* ---------------------------------------------------------------- settings */

export async function getSettingsForEdit() {
  const rows = await db.select().from(siteSettings);
  return resolveSettings(Object.fromEntries(rows.map((r) => [r.key, r.value])));
}

/* ------------------------------------------------------------------- users */

export async function listUsers() {
  return db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, createdAt: users.createdAt })
    .from(users)
    .orderBy(asc(users.name));
}

export const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
