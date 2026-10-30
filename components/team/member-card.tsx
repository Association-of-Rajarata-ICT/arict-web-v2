import { Globe, Mail } from "lucide-react";
import type { PublicMember } from "@/lib/data/public";
import { ACADEMIC_YEAR_LABELS, POSITION_LABELS } from "@/lib/team";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/misc";
import { GithubIcon, LinkedinIcon } from "@/components/ui/social-icons";

type Member = Pick<
  PublicMember,
  "fullName" | "position" | "academicYear" | "image" | "linkedinUrl" | "portfolioUrl" | "githubUrl" | "email" | "bio"
>;

export function MemberLinks({ member, className }: { member: Member; className?: string }) {
  const links = [
    member.linkedinUrl && { href: member.linkedinUrl, label: "LinkedIn", icon: <LinkedinIcon width={15} height={15} /> },
    member.githubUrl && { href: member.githubUrl, label: "GitHub", icon: <GithubIcon width={15} height={15} /> },
    member.portfolioUrl && { href: member.portfolioUrl, label: "Portfolio", icon: <Globe aria-hidden className="size-[15px]" /> },
    member.email && { href: `mailto:${member.email}`, label: "Email", icon: <Mail aria-hidden className="size-[15px]" /> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  if (links.length === 0) return null;
  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {links.map((l) => (
        <li key={l.label}>
          <a
            href={l.href}
            {...(l.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
            aria-label={`${member.fullName} — ${l.label}`}
            className="inline-flex size-8 items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-mist hover:text-ink"
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
      : POSITION_LABELS[member.position];

  if (variant === "compact") {
    return (
      <div className="flex h-full items-start gap-4 rounded-2xl border border-line bg-white p-4 transition-shadow duration-300 hover:shadow-soft">
        <Avatar name={member.fullName} src={member.image} size={56} className="size-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <Heading className="text-[15px] leading-snug font-semibold text-balance text-ink">{member.fullName}</Heading>
          <p className="mt-0.5 text-xs text-muted">{member.position === "committee_member" ? "Committee Member" : role}</p>
          <MemberLinks member={member} className="-ml-2 mt-1.5" />
        </div>
      </div>
    );
  }

  const large = variant === "large";
  return (
    <div className="group flex h-full flex-col items-center rounded-3xl border border-line bg-white p-6 text-center transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgb(0_0_0/0.35)] sm:p-7">
      <div className="relative">
        <Avatar
          name={member.fullName}
          src={member.image}
          size={large ? 128 : 104}
          className={cn("ring-4 ring-white shadow-soft", large ? "size-32" : "size-[104px]")}
        />
        {member.position !== "committee_member" && (
          <span aria-hidden className="absolute right-1 bottom-1 size-3 rounded-full border-2 border-white bg-brand" />
        )}
      </div>
      <Heading className={cn("mt-5 font-semibold tracking-tight text-ink", large ? "text-lg" : "text-base")}>{member.fullName}</Heading>
      <p className="mt-1 text-sm text-brand">{role}</p>
      {large && member.bio && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{member.bio}</p>}
      <MemberLinks member={member} className="mt-auto justify-center pt-4" />
    </div>
  );
}
