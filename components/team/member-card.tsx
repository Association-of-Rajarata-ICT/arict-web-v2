import Image from "next/image";
import { Globe } from "lucide-react";
import type { PublicMember } from "@/lib/data/public";
import { ACADEMIC_YEAR_LABELS, positionLabel } from "@/lib/team";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/misc";
import { LinkedinIcon } from "@/components/ui/social-icons";

type Member = Pick<
  PublicMember,
  "fullName" | "position" | "customPosition" | "academicYear" | "image" | "linkedinUrl" | "portfolioUrl"
>;

export function MemberLinks({ member, className }: { member: Member; className?: string }) {
  const links = [
    member.linkedinUrl && { href: member.linkedinUrl, label: "LinkedIn", icon: <LinkedinIcon width={15} height={15} /> },
    member.portfolioUrl && { href: member.portfolioUrl, label: "Portfolio", icon: <Globe aria-hidden className="size-[15px]" /> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  if (links.length === 0) return null;
  return (
    <ul aria-label={`${member.fullName} links`} className={cn("flex max-w-full flex-wrap items-center gap-0.5 rounded-xl bg-ink p-1 text-paper shadow-soft", className)}>
      {links.map((l) => (
        <li key={l.label}>
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.fullName} — ${l.label}`}
            className="inline-flex size-8 items-center justify-center rounded-lg text-paper/80 transition-colors hover:bg-paper/15 hover:text-paper"
          >
            {l.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function MemberCard({
  member,
  variant = "default",
  headingLevel = "h3",
}: {
  member: Member;
  variant?: "default" | "large" | "compact";
  headingLevel?: "h3" | "h4";
}) {
  const Heading = headingLevel;
  const role =
    member.position === "committee_member"
      ? `${ACADEMIC_YEAR_LABELS[member.academicYear]} Committee Member`
      : positionLabel(member);

  const large = variant === "large";
  const compact = variant === "compact";
  const year = ACADEMIC_YEAR_LABELS[member.academicYear];

  return (
    <article className={cn(
      "group mx-auto flex h-full w-full min-w-0 flex-col rounded-3xl border border-line/70 bg-surface p-2.5 shadow-[0_16px_35px_-20px_rgb(0_0_0/0.25),0_4px_10px_-6px_rgb(0_0_0/0.08)] transition-[box-shadow,transform] duration-300 hover:shadow-float motion-safe:hover:-translate-y-1 dark:shadow-[0_16px_35px_-20px_rgb(0_0_0/0.7)]",
      large ? "max-w-xs" : compact ? "max-w-[16.25rem]" : "max-w-[17.5rem]",
    )}>
      {/* Photo first, filling the whole frame. Anchored toward the top so faces stay
          in view when a photo's shape differs from the frame. */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.125rem] bg-mist">
        {member.image ? (
          <Image
            src={member.image}
            alt={`Portrait of ${member.fullName}`}
            fill
            sizes={large ? "(min-width: 380px) 298px, calc(100vw - 56px)" : compact ? "238px" : "258px"}
            className="object-cover object-[center_20%] transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-mist to-line/70">
            <Avatar name={member.fullName} size={large ? 96 : 80} className="ring-4 ring-surface/60" />
          </div>
        )}
      </div>

      {/* Then the name and details */}
      <div className="px-1.5 pt-4 text-center">
        <Heading className={cn("leading-tight font-semibold tracking-tight break-words text-balance text-ink", large ? "text-xl" : compact ? "text-base" : "text-lg")}>
          {member.fullName}
        </Heading>
        <p className="mt-1.5 text-xs leading-snug font-medium text-brand">{role}</p>
      </div>
      <div className="flex flex-1 flex-col px-1.5 pt-3 pb-1.5">
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          {year && (
            <div>
              <p className="text-[11px] text-muted">Academic year</p>
              <p className="mt-0.5 text-xs font-medium text-ink">{year}</p>
            </div>
          )}
          <MemberLinks member={member} className="ml-auto" />
        </div>
      </div>
    </article>
  );
}
