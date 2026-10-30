import type { TeamPosition } from "./db/schema";

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
};

export const POSITION_ORDER: Record<TeamPosition, number> = Object.fromEntries(
  [...EXECUTIVE_POSITIONS, "committee_member"].map((p, i) => [p, i]),
) as Record<TeamPosition, number>;

/** Leadership shown at the top of the team page and (by default) on the homepage. */
export const LEADERSHIP_POSITIONS: TeamPosition[] = [
  "president",
  "vice_president",
  "secretary",
  "senior_treasurer",
];

export const COMMITTEE_YEARS = [1, 2, 3] as const;
export const COMMITTEE_LIMIT_PER_YEAR = 4;

export const ACADEMIC_YEAR_LABELS: Record<number, string> = {
  1: "1st Year",
  2: "2nd Year",
  3: "3rd Year",
  4: "4th Year",
};

export function isExecutive(position: TeamPosition) {
  return position !== "committee_member";
}

type Sortable = { position: TeamPosition; displayOrder: number; fullName: string };

export function sortMembers<T extends Sortable>(members: T[]) {
  return [...members].sort(
    (a, b) =>
      POSITION_ORDER[a.position] - POSITION_ORDER[b.position] ||
      a.displayOrder - b.displayOrder ||
      a.fullName.localeCompare(b.fullName),
  );
}

export function groupTerm<T extends Sortable & { academicYear: number }>(members: T[]) {
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
