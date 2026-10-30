import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

/* ----------------------------------------------------------------------------
 * Enums
 * ------------------------------------------------------------------------- */

export const userRole = pgEnum("user_role", ["super_admin", "admin", "editor"]);

export const eventStatus = pgEnum("event_status", [
  "scheduled",
  "postponed",
  "cancelled",
  "completed",
  "archived",
]);

export const projectStatus = pgEnum("project_status", ["in_progress", "completed", "archived"]);

export const submissionStatus = pgEnum("submission_status", [
  "pending",
  "under_review",
  "accepted",
  "rejected",
  "needs_changes",
]);

export const joinStatus = pgEnum("join_status", [
  "pending",
  "reviewing",
  "accepted",
  "rejected",
  "archived",
]);

export const teamPosition = pgEnum("team_position", [
  "president",
  "vice_president",
  "secretary",
  "vice_secretary",
  "senior_treasurer",
  "junior_treasurer",
  "editor",
  "junior_editor",
  "committee_member",
]);

/* ----------------------------------------------------------------------------
 * Users (admin accounts)
 * ------------------------------------------------------------------------- */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    image: text("image"),
    role: userRole("role").notNull().default("editor"),
    passwordHash: text("password_hash").notNull(),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_unique").on(sql`lower(${t.email})`)],
);

/* ----------------------------------------------------------------------------
 * Events
 * ------------------------------------------------------------------------- */

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    excerpt: varchar("excerpt", { length: 320 }).notNull(),
    content: text("content").notNull().default(""),
    coverImage: text("cover_image"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    startTime: time("start_time"),
    endTime: time("end_time"),
    location: varchar("location", { length: 200 }),
    organizer: varchar("organizer", { length: 160 }),
    registrationUrl: text("registration_url"),
    status: eventStatus("status").notNull().default("scheduled"),
    category: varchar("category", { length: 60 }).notNull().default("Workshop"),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("events_slug_unique").on(t.slug),
    index("events_published_start_idx").on(t.published, t.startDate),
    index("events_category_idx").on(t.category),
  ],
);

export const eventImages = pgTable(
  "event_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    altText: varchar("alt_text", { length: 200 }).notNull().default(""),
    caption: varchar("caption", { length: 240 }),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("event_images_event_idx").on(t.eventId, t.displayOrder)],
);

/* ----------------------------------------------------------------------------
 * Team
 * ------------------------------------------------------------------------- */

export const teamTerms = pgTable(
  "team_terms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 120 }).notNull(),
    year: integer("year").notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    isCurrent: boolean("is_current").notNull().default(false),
    description: text("description"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("team_terms_year_unique").on(t.year),
    // Only one term can be current at a time.
    uniqueIndex("team_terms_single_current").on(t.isCurrent).where(sql`${t.isCurrent} = true`),
  ],
);

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamTermId: uuid("team_term_id")
      .notNull()
      .references(() => teamTerms.id, { onDelete: "restrict" }),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    position: teamPosition("position").notNull(),
    academicYear: integer("academic_year").notNull(),
    image: text("image"),
    bio: varchar("bio", { length: 400 }),
    linkedinUrl: text("linkedin_url"),
    portfolioUrl: text("portfolio_url"),
    githubUrl: text("github_url"),
    email: varchar("email", { length: 254 }),
    displayOrder: integer("display_order").notNull().default(0),
    featuredOnHome: boolean("featured_on_home").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    index("team_members_term_idx").on(t.teamTermId, t.displayOrder),
    // Each executive position may be held by only one member per term.
    uniqueIndex("team_members_exec_unique")
      .on(t.teamTermId, t.position)
      .where(sql`${t.position} <> 'committee_member'`),
  ],
);

/* ----------------------------------------------------------------------------
 * Projects
 * ------------------------------------------------------------------------- */

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    excerpt: varchar("excerpt", { length: 320 }).notNull(),
    content: text("content").notNull().default(""),
    coverImage: text("cover_image"),
    githubUrl: text("github_url"),
    liveUrl: text("live_url"),
    videoUrl: text("video_url"),
    year: integer("year").notNull(),
    category: varchar("category", { length: 60 }).notNull(),
    status: projectStatus("status").notNull().default("completed"),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("projects_slug_unique").on(t.slug),
    index("projects_published_idx").on(t.published, t.featured, t.year),
  ],
);

export const projectTechnologies = pgTable(
  "project_technologies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 40 }).notNull(),
  },
  (t) => [
    uniqueIndex("project_tech_unique").on(t.projectId, t.name),
    index("project_tech_name_idx").on(t.name),
  ],
);

export const projectMembers = pgTable(
  "project_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    teamMemberId: uuid("team_member_id").references(() => teamMembers.id, {
      onDelete: "set null",
    }),
    memberName: varchar("member_name", { length: 120 }).notNull(),
    role: varchar("role", { length: 80 }),
  },
  (t) => [index("project_members_project_idx").on(t.projectId)],
);

export const projectImages = pgTable(
  "project_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    altText: varchar("alt_text", { length: 200 }).notNull().default(""),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("project_images_project_idx").on(t.projectId, t.displayOrder)],
);

/* ----------------------------------------------------------------------------
 * Project submissions (public, moderated)
 * ------------------------------------------------------------------------- */

export const projectSubmissions = pgTable(
  "project_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 160 }).notNull(),
    slugCandidate: varchar("slug_candidate", { length: 180 }).notNull(),
    shortDescription: varchar("short_description", { length: 320 }).notNull(),
    fullDescription: text("full_description").notNull(),
    category: varchar("category", { length: 60 }).notNull(),
    technologies: text("technologies").array().notNull().default(sql`'{}'::text[]`),
    projectYear: integer("project_year").notNull(),
    coverImage: text("cover_image"),
    screenshots: text("screenshots").array().notNull().default(sql`'{}'::text[]`),
    githubUrl: text("github_url"),
    liveUrl: text("live_url"),
    portfolioUrl: text("portfolio_url"),
    linkedinUrl: text("linkedin_url"),
    videoUrl: text("video_url"),
    teamMembers: text("team_members").array().notNull().default(sql`'{}'::text[]`),
    submitterName: varchar("submitter_name", { length: 120 }).notNull(),
    submitterEmail: varchar("submitter_email", { length: 254 }).notNull(),
    status: submissionStatus("status").notNull().default("pending"),
    adminNotes: text("admin_notes"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    acceptedProjectId: uuid("accepted_project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (t) => [
    index("project_submissions_status_idx").on(t.status, t.submittedAt),
    index("project_submissions_email_idx").on(t.submitterEmail),
  ],
);

/* ----------------------------------------------------------------------------
 * Join applications
 * ------------------------------------------------------------------------- */

export const joinApplications = pgTable(
  "join_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    registrationNumber: varchar("registration_number", { length: 40 }).notNull(),
    academicYear: integer("academic_year").notNull(),
    degree: varchar("degree", { length: 120 }).notNull(),
    interests: text("interests").array().notNull().default(sql`'{}'::text[]`),
    skills: text("skills").notNull(),
    reason: text("reason").notNull(),
    linkedinUrl: text("linkedin_url"),
    githubUrl: text("github_url"),
    status: joinStatus("status").notNull().default("pending"),
    adminNotes: text("admin_notes"),
    ...timestamps,
  },
  (t) => [
    index("join_applications_status_idx").on(t.status, t.createdAt),
    index("join_applications_email_idx").on(t.email),
  ],
);

/* ----------------------------------------------------------------------------
 * Site settings (one JSON document per section)
 * ------------------------------------------------------------------------- */

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/* ----------------------------------------------------------------------------
 * Rate limiting for public forms and uploads
 * ------------------------------------------------------------------------- */

export const rateLimitHits = pgTable(
  "rate_limit_hits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 128 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("rate_limit_hits_key_idx").on(t.key, t.createdAt)],
);

export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type EventImage = typeof eventImages.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectSubmission = typeof projectSubmissions.$inferSelect;
export type TeamTerm = typeof teamTerms.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type JoinApplication = typeof joinApplications.$inferSelect;
export type UserRole = (typeof userRole.enumValues)[number];
export type TeamPosition = (typeof teamPosition.enumValues)[number];
export type SubmissionStatus = (typeof submissionStatus.enumValues)[number];
export type JoinStatus = (typeof joinStatus.enumValues)[number];
export type EventStatus = (typeof eventStatus.enumValues)[number];
export type ProjectStatus = (typeof projectStatus.enumValues)[number];
