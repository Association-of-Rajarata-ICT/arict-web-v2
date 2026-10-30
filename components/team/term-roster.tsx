import type { PublicMember } from "@/lib/data/public";
import { ACADEMIC_YEAR_LABELS, COMMITTEE_LIMIT_PER_YEAR, COMMITTEE_YEARS, groupTerm } from "@/lib/team";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/motion/reveal";
import { MemberCard } from "./member-card";

/** Full committee layout: leadership, executive committee and year-wise committee members. */
export function TermRoster({ members, current }: { members: PublicMember[]; current: boolean }) {
  const { executive, committee } = groupTerm(members);
  const leaders = executive.filter((m) => m.position === "president" || m.position === "vice_president");
  const otherExec = executive.filter((m) => m.position !== "president" && m.position !== "vice_president");
  const prefix = current ? "Current " : "";

  return (
    <div className="space-y-24">
      {leaders.length > 0 && (
        <section aria-labelledby="leadership-heading">
          <FadeUp>
            <p className="eyebrow">Leadership</p>
            <h2 id="leadership-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {prefix}Leadership
            </h2>
          </FadeUp>
          <StaggerContainer className="mt-10 grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
            {leaders.map((m) => (
              <StaggerItem key={m.id}>
                <MemberCard member={m} variant="large" />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {otherExec.length > 0 && (
        <section aria-labelledby="executive-heading">
          <FadeUp>
            <p className="eyebrow">Executive Committee</p>
            <h2 id="executive-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {prefix}Executive Committee
            </h2>
          </FadeUp>
          <StaggerContainer className="mt-10 grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 lg:grid-cols-3">
            {otherExec.map((m) => (
              <StaggerItem key={m.id}>
                <MemberCard member={m} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {COMMITTEE_YEARS.map((year) => {
        const list = committee[year];
        if (list.length === 0) return null;
        const label = ACADEMIC_YEAR_LABELS[year];
        return (
          <section key={year} aria-labelledby={`committee-${year}-heading`}>
            <FadeUp className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Committee Members</p>
                <h2 id={`committee-${year}-heading`} className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {prefix}
                  {label} Committee Members
                </h2>
              </div>
              <span className="text-sm text-muted">
                {list.length} / {COMMITTEE_LIMIT_PER_YEAR}
              </span>
            </FadeUp>
            <StaggerContainer className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((m) => (
                <StaggerItem key={m.id}>
                  <MemberCard member={m} variant="compact" />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        );
      })}
    </div>
  );
}
