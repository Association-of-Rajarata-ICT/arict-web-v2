import type { TeamPosition } from "./db/schema";
import { OTHER_TEXT_MAX_LENGTH } from "./form-options";

export const EXECUTIVE_POSITIONS = [
  "president",
  "vice_president",
  "secretary",
  "vice_secretary",
  "senior_treasurer",
  "junior_treasurer",
  "editor",
  "junior_editor",
] as const satisfies readonly TeamPosition[];

export const POSITION_LABELS: Record<TeamPosition, string> = {
  president: "President",
  vice_president: "Vice President",
  secretary: "Secretary",
  vice_secretary: "Vice Secretary",
  senior_treasurer: "Senior Treasurer",
  junior_treasurer: "Junior Treasurer",
  editor: "Editor",
  junior_editor: "Junior Editor",
  committee_member: "Committee Member",
  other: "Other",
};

/** Longest title for an "Other" position (only on members saved with one; no longer offered). */
export const CUSTOM_POSITION_MAX_LENGTH = OTHER_TEXT_MAX_LENGTH;

/** The title shown for a member: the typed-in title for "Other" positions. */
export function positionLabel(m: { position: TeamPosition; customPosition?: string | null }) {
  return m.position === "other" ? m.customPosition || POSITION_LABELS.other : POSITION_LABELS[m.position];
}

export const POSITION_ORDER: Record<TeamPosition, number> = Object.fromEntries(
  [...EXECUTIVE_POSITIONS, "other", "committee_member"].map((p, i) => [p, i]),
) as Record<TeamPosition, number>;

/** How many members the homepage Team section shows. */
export const HOME_TEAM_LIMIT = 4;

/** Shown on the homepage when no member is ticked "Feature on homepage". */
export const LEADERSHIP_POSITIONS: TeamPosition[] = [
  "president",
  "vice_president",
  "secretary",
  "senior_treasurer",
];

/** Committee years in display order: senior students first. */
export const COMMITTEE_YEARS = [3, 2, 1] as const;
export const COMMITTEE_LIMIT_PER_YEAR = 4;

export const ACADEMIC_YEAR_LABELS: Record<number, string> = {
  1: "1st Year",
  2: "2nd Year",
  3: "3rd Year",
  4: "4th Year",
};

/** academicYear value for members who aren't students (e.g. lecturers); described in customYear. */
export const OTHER_YEAR = 0;
export const CUSTOM_YEAR_MAX_LENGTH = OTHER_TEXT_MAX_LENGTH;

/** The year shown for a member: the typed-in text (e.g. "Senior Lecturer") for "Other". */
export function yearLabel(m: { academicYear: number; customYear?: string | null }) {
  return m.academicYear === OTHER_YEAR ? m.customYear || "Other" : ACADEMIC_YEAR_LABELS[m.academicYear];
}

/** Executive roles, including custom "Other" roles: shown in the Executive Committee, any academic year. */
export function isExecutive(position: TeamPosition) {
  return position !== "committee_member";
}

/** Fixed executive positions can be held by only one member per term; custom roles can repeat. */
export function isSingleHolderPosition(position: TeamPosition) {
  return (EXECUTIVE_POSITIONS as readonly TeamPosition[]).includes(position);
}

/** Sections of the public Team page, in page order. Admins set the order of members within each one. */
export const TEAM_SECTIONS = [
  { id: "leadership", label: "Leadership" },
  { id: "executive", label: "Executive Committee" },
  { id: "year-3", label: "3rd Year Committee Members" },
  { id: "year-2", label: "2nd Year Committee Members" },
  { id: "year-1", label: "1st Year Committee Members" },
] as const;

export type TeamSectionId = (typeof TEAM_SECTIONS)[number]["id"];

const SECTION_RANK: Record<string, number> = Object.fromEntries(TEAM_SECTIONS.map((s, i) => [s.id, i]));

export function memberSection(m: { position: TeamPosition; academicYear: number }): TeamSectionId {
  if (m.position === "president" || m.position === "vice_president") return "leadership";
  if (isExecutive(m.position)) return "executive";
  return `year-${m.academicYear}` as TeamSectionId;
}

type Sortable = { position: TeamPosition; academicYear: number; displayOrder: number; fullName: string };

/** Section first, then the admin-set display order; position and name break ties. */
export function sortMembers<T extends Sortable>(members: T[]) {
  const rank = (m: T) => SECTION_RANK[memberSection(m)] ?? TEAM_SECTIONS.length;
  return [...members].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      a.displayOrder - b.displayOrder ||
      POSITION_ORDER[a.position] - POSITION_ORDER[b.position] ||
      a.fullName.localeCompare(b.fullName),
  );
}

export function groupTerm<T extends Sortable>(members: T[]) {
  const sorted = sortMembers(members);
  return {
    executive: sorted.filter((m) => isExecutive(m.position)),
    committee: Object.fromEntries(
      COMMITTEE_YEARS.map((y) => [
        y,
        sorted.filter((m) => m.position === "committee_member" && m.academicYear === y),
      ]),
    ) as Record<(typeof COMMITTEE_YEARS)[number], T[]>,
  };
}
