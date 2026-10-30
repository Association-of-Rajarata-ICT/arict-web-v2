import "server-only";
import { and, asc, desc, eq, gte, inArray, ne, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "../db";
import {
  eventImages,
  events,
  projectImages,
  projectMembers,
  projects,
  projectTechnologies,
  siteSettings,
  teamMembers,
  teamTerms,
} from "../db/schema";
import { resolveSettings } from "../settings";
import { LEADERSHIP_POSITIONS, sortMembers } from "../team";
import { todayInColombo } from "../utils";

/*
 * Public, cacheable reads. Every function is tagged so admin mutations can
 * invalidate exactly what changed (see lib/revalidate.ts).
 */

export const TAGS = {
  settings: "settings",
  events: "events",
  projects: "projects",
  team: "team",
} as const;

/* ---------------------------------------------------------------- settings */

export async function getSiteSettings() {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.settings);
  const rows = await db.select().from(siteSettings);
  return resolveSettings(Object.fromEntries(rows.map((r) => [r.key, r.value])));
}

/* ------------------------------------------------------------------ events */

const visibleEvent = and(eq(events.published, true), ne(events.status, "archived"));

const eventCardFields = {
  id: events.id,
  title: events.title,
  slug: events.slug,
  excerpt: events.excerpt,
  coverImage: events.coverImage,
  startDate: events.startDate,
  endDate: events.endDate,
  startTime: events.startTime,
  endTime: events.endTime,
  location: events.location,
  category: events.category,
  status: events.status,
  featured: events.featured,
};

export type EventCard = Awaited<ReturnType<typeof getPublicEvents>>[number];

/** An event is upcoming until its last day has passed (Sri Lanka time). */
function upcomingCondition(today: string) {
  return and(
    gte(sql`coalesce(${events.endDate}, ${events.startDate})`, today),
    inArray(events.status, ["scheduled", "postponed"]),
  );
}

export async function getUpcomingEvents(limit = 3) {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.events);
  const today = todayInColombo();
  return db
    .select(eventCardFields)
    .from(events)
    .where(and(visibleEvent, upcomingCondition(today)))
    .orderBy(asc(events.startDate), asc(events.startTime))
    .limit(limit);
}

/** All published events, split into upcoming and past. */
export async function getPublicEvents() {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.events);
  const today = todayInColombo();
  const rows = await db
    .select({
      ...eventCardFields,
      isUpcoming: sql<boolean>`(coalesce(${events.endDate}, ${events.startDate}) >= ${today} and ${events.status} in ('scheduled','postponed'))`,
    })
    .from(events)
    .where(visibleEvent)
    .orderBy(desc(events.startDate));
  return rows;
}

export async function getEventBySlug(slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.events);
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), visibleEvent))
    .limit(1);
  if (!event) return null;
  const images = await db
    .select()
    .from(eventImages)
    .where(eq(eventImages.eventId, event.id))
    .orderBy(asc(eventImages.displayOrder));
  const today = todayInColombo();
  const isUpcoming =
    (event.endDate ?? event.startDate) >= today && ["scheduled", "postponed"].includes(event.status);
  return { ...event, images, isUpcoming };
}

export async function getRelatedEvents(eventId: string, category: string, limit = 3) {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.events);
  return db
    .select(eventCardFields)
    .from(events)
    .where(and(visibleEvent, ne(events.id, eventId)))
    .orderBy(sql`(${events.category} = ${category}) desc`, desc(events.startDate))
    .limit(limit);
}

export async function getPublishedEventSlugs() {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.events);
  return db
    .select({ slug: events.slug, updatedAt: events.updatedAt })
    .from(events)
    .where(visibleEvent)
    .orderBy(desc(events.startDate));
}

/* ---------------------------------------------------------------- projects */

const visibleProject = and(eq(projects.published, true), ne(projects.status, "archived"));

async function attachTechnologies<T extends { id: string }>(rows: T[]) {
  if (rows.length === 0) return [] as (T & { technologies: string[] })[];
  const techs = await db
    .select({ projectId: projectTechnologies.projectId, name: projectTechnologies.name })
    .from(projectTechnologies)
    .where(
      inArray(
        projectTechnologies.projectId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(projectTechnologies.name));
  return rows.map((r) => ({
    ...r,
    technologies: techs.filter((t) => t.projectId === r.id).map((t) => t.name),
  }));
}

const projectCardFields = {
  id: projects.id,
  title: projects.title,
  slug: projects.slug,
  excerpt: projects.excerpt,
  coverImage: projects.coverImage,
  githubUrl: projects.githubUrl,
  liveUrl: projects.liveUrl,
  year: projects.year,
  category: projects.category,
  status: projects.status,
  featured: projects.featured,
};

export type ProjectCard = Awaited<ReturnType<typeof getPublicProjects>>[number];

export async function getFeaturedProjects(limit = 3) {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.projects);
  const rows = await db
    .select(projectCardFields)
    .from(projects)
    .where(and(visibleProject, eq(projects.featured, true)))
    .orderBy(desc(projects.year), desc(projects.updatedAt))
    .limit(limit);
  return attachTechnologies(rows);
}

export async function getPublicProjects() {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.projects);
  const rows = await db
    .select(projectCardFields)
    .from(projects)
    .where(visibleProject)
    .orderBy(desc(projects.featured), desc(projects.year), asc(projects.title));
  return attachTechnologies(rows);
}

export async function getProjectBySlug(slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.projects);
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), visibleProject))
    .limit(1);
  if (!project) return null;
  const [techs, members, images] = await Promise.all([
    db
      .select({ name: projectTechnologies.name })
      .from(projectTechnologies)
      .where(eq(projectTechnologies.projectId, project.id))
      .orderBy(asc(projectTechnologies.name)),
    db
      .select({
        name: projectMembers.memberName,
        role: projectMembers.role,
        linkedinUrl: teamMembers.linkedinUrl,
        githubUrl: teamMembers.githubUrl,
        portfolioUrl: teamMembers.portfolioUrl,
      })
      .from(projectMembers)
      .leftJoin(teamMembers, eq(projectMembers.teamMemberId, teamMembers.id))
      .where(eq(projectMembers.projectId, project.id)),
    db
      .select()
      .from(projectImages)
      .where(eq(projectImages.projectId, project.id))
      .orderBy(asc(projectImages.displayOrder)),
  ]);
  return { ...project, technologies: techs.map((t) => t.name), members, images };
}

export async function getRelatedProjects(projectId: string, category: string, limit = 3) {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.projects);
  const rows = await db
    .select(projectCardFields)
    .from(projects)
    .where(and(visibleProject, ne(projects.id, projectId)))
    .orderBy(sql`(${projects.category} = ${category}) desc`, desc(projects.year))
    .limit(limit);
  return attachTechnologies(rows);
}

export async function getPublishedProjectSlugs() {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.projects);
  return db
    .select({ slug: projects.slug, updatedAt: projects.updatedAt })
    .from(projects)
    .where(visibleProject)
    .orderBy(desc(projects.year));
}

/* -------------------------------------------------------------------- team */

const memberFields = {
  id: teamMembers.id,
  fullName: teamMembers.fullName,
  position: teamMembers.position,
  academicYear: teamMembers.academicYear,
  image: teamMembers.image,
  bio: teamMembers.bio,
  linkedinUrl: teamMembers.linkedinUrl,
  portfolioUrl: teamMembers.portfolioUrl,
  githubUrl: teamMembers.githubUrl,
  email: teamMembers.email,
  displayOrder: teamMembers.displayOrder,
  featuredOnHome: teamMembers.featuredOnHome,
};

export type PublicMember = Awaited<ReturnType<typeof termMembers>>[number];

async function termMembers(termId: string) {
  const rows = await db.select(memberFields).from(teamMembers).where(eq(teamMembers.teamTermId, termId));
  return sortMembers(rows);
}

export async function getCurrentTerm() {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.team);
  const [term] = await db.select().from(teamTerms).where(eq(teamTerms.isCurrent, true)).limit(1);
  if (!term) return null;
  return { ...term, members: await termMembers(term.id) };
}

export async function getTermWithMembers(year: number) {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.team);
  const [term] = await db.select().from(teamTerms).where(eq(teamTerms.year, year)).limit(1);
  if (!term) return null;
  return { ...term, members: await termMembers(term.id) };
}

/** Historical (non-current) terms that have at least one member. */
export async function getPastTerms() {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.team);
  return db
    .select({
      id: teamTerms.id,
      title: teamTerms.title,
      year: teamTerms.year,
      startDate: teamTerms.startDate,
      endDate: teamTerms.endDate,
      description: teamTerms.description,
      memberCount: sql<number>`count(${teamMembers.id})::int`,
      updatedAt: teamTerms.updatedAt,
    })
    .from(teamTerms)
    .innerJoin(teamMembers, eq(teamMembers.teamTermId, teamTerms.id))
    .where(eq(teamTerms.isCurrent, false))
    .groupBy(teamTerms.id)
    .orderBy(desc(teamTerms.year));
}

export async function getHomeTeam(mode: "featured" | "leadership") {
  "use cache";
  cacheLife("content");
  cacheTag(TAGS.team);
  const [term] = await db
    .select({ id: teamTerms.id })
    .from(teamTerms)
    .where(eq(teamTerms.isCurrent, true))
    .limit(1);
  if (!term) return [];
  const featured = await db
    .select(memberFields)
    .from(teamMembers)
    .where(and(eq(teamMembers.teamTermId, term.id), eq(teamMembers.featuredOnHome, true)));
  if (mode === "featured" && featured.length > 0) return sortMembers(featured).slice(0, 4);
  const leaders = await db
    .select(memberFields)
    .from(teamMembers)
    .where(and(eq(teamMembers.teamTermId, term.id), inArray(teamMembers.position, LEADERSHIP_POSITIONS)));
  return sortMembers(leaders);
}

// Shared with the admin dashboard so both use the same "upcoming" rule.
export { upcomingCondition };
