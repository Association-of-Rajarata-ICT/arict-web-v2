import {
  CalendarDays,
  Code2,
  Cpu,
  FolderGit2,
  Globe,
  GraduationCap,
  Lightbulb,
  Rocket,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { EventCard as EventCardData, ProjectCard as ProjectCardData, PublicMember } from "@/lib/data/public";
import type { SiteSettings } from "@/lib/settings";
import { AnimatedCounter } from "@/components/motion/effects";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/motion/reveal";
import { ArrowLink, LinkButton } from "@/components/ui/button";
import { EmptyState, SectionHeading } from "@/components/ui/misc";
import { EventCard } from "@/components/events/event-card";
import { ProjectCard } from "@/components/projects/project-card";
import { MemberCard } from "@/components/team/member-card";

const ICONS: Record<SiteSettings["whatWeDo"]["items"][number]["icon"], LucideIcon> = {
  calendar: CalendarDays,
  folder: FolderGit2,
  users: Users,
  lightbulb: Lightbulb,
  code: Code2,
  rocket: Rocket,
  trophy: Trophy,
  graduation: GraduationCap,
  cpu: Cpu,
  globe: Globe,
};

export function AboutPreview({ about, stats }: { about: SiteSettings["aboutPreview"]; stats: SiteSettings["stats"] }) {
  return (
    <section id="about" aria-labelledby="about-heading" className="py-24 sm:py-32">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-16">
        <FadeUp className="lg:col-span-7">
          {about.eyebrow && <p className="eyebrow mb-5">{about.eyebrow}</p>}
          <h2 id="about-heading" className="text-3xl leading-[1.1] font-semibold tracking-[-0.025em] text-balance sm:text-4xl lg:text-5xl">
            {about.heading}
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted">{about.description}</p>
          {about.ctaLabel && (
            <LinkButton href={about.ctaHref || "/about"} variant="outline" size="lg" arrow className="mt-9">
              {about.ctaLabel}
            </LinkButton>
          )}
        </FadeUp>
        {stats.items.length > 0 && (
          <StaggerContainer as="div" className="grid grid-cols-2 gap-px self-end overflow-hidden rounded-3xl border border-line bg-line lg:col-span-5" stagger={0.1}>
            {stats.items.map((s, i) => (
              <StaggerItem
                key={s.label}
                className={`bg-surface p-6 sm:p-8 ${stats.items.length % 2 === 1 && i === 0 ? "col-span-2" : ""}`}
              >
                <p className="font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium text-muted">{s.label}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}

export function WhatWeDo({ data }: { data: SiteSettings["whatWeDo"] }) {
  return (
    <section aria-labelledby="what-we-do-heading" className="bg-mist py-24 sm:py-32">
      <div className="container-page">
        <FadeUp>
          {data.eyebrow && <p className="eyebrow mb-5">{data.eyebrow}</p>}
          <h2 id="what-we-do-heading" className="max-w-3xl text-3xl leading-[1.1] font-semibold tracking-[-0.025em] text-balance sm:text-4xl lg:text-5xl">
            {data.heading}
          </h2>
          {data.description && <p className="mt-5 max-w-xl text-lg text-muted">{data.description}</p>}
        </FadeUp>
        <StaggerContainer as="ul" className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((item, i) => {
            const Icon = ICONS[item.icon] ?? Lightbulb;
            return (
              <StaggerItem as="li" key={`${item.title}-${i}`}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-line bg-surface p-7 transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgb(0_0_0/0.35)]">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-mist text-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-paper">
                    <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-8 text-lg font-semibold tracking-tight text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                  <span aria-hidden className="absolute inset-x-7 bottom-0 h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-500 ease-out group-hover:scale-x-100" />
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

export function UpcomingEvents({ eyebrow, heading, events }: { eyebrow: string; heading: string; events: Omit<EventCardData, "isUpcoming">[] }) {
  return (
    <section aria-labelledby="events-heading" className="py-24 sm:py-32">
      <div className="container-page">
        <FadeUp>
          <SectionHeading
            eyebrow={eyebrow}
            title={<span id="events-heading">{heading}</span>}
            action={<ArrowLink href="/events">Explore upcoming ARICT events</ArrowLink>}
          />
        </FadeUp>
        {events.length > 0 ? (
          <StaggerContainer className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <StaggerItem key={e.id}>
                <EventCard event={e} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="mt-14">
            <EmptyState
              icon={<CalendarDays className="size-8" />}
              title="New events are on the way"
              description="We're planning our next workshops and sessions. Browse past events while you wait."
              action={<LinkButton href="/events" variant="outline" arrow>Browse past events</LinkButton>}
            />
          </div>
        )}
        <div className="mt-12 flex justify-center">
          <LinkButton href="/events" variant="dark" size="lg" arrow>
            View All Events
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

export function FeaturedProjects({ eyebrow, heading, projects }: { eyebrow: string; heading: string; projects: ProjectCardData[] }) {
  return (
    <section aria-labelledby="projects-heading" className="border-y border-line bg-mist py-24 sm:py-32">
      <div className="container-page">
        <FadeUp>
          <SectionHeading
            eyebrow={eyebrow}
            title={<span id="projects-heading">{heading}</span>}
            action={<ArrowLink href="/projects/submit">Share your project with ARICT</ArrowLink>}
          />
        </FadeUp>
        {projects.length > 0 ? (
          <StaggerContainer className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <StaggerItem key={p.id}>
                <ProjectCard project={p} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="mt-14">
            <EmptyState
              icon={<FolderGit2 className="size-8" />}
              title="Featured projects coming soon"
              description="Built something worth sharing? Submit your project to be featured by ARICT."
              action={<LinkButton href="/projects/submit" variant="outline" arrow>Share your Project</LinkButton>}
            />
          </div>
        )}
        <div className="mt-12 flex justify-center">
          <LinkButton href="/projects" variant="dark" size="lg" arrow>
            View All Projects
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

export function TeamPreview({ eyebrow, heading, members }: { eyebrow: string; heading: string; members: PublicMember[] }) {
  return (
    <section aria-labelledby="team-heading" className="py-24 sm:py-32">
      <div className="container-page">
        <FadeUp>
          <SectionHeading
            eyebrow={eyebrow}
            title={<span id="team-heading">{heading}</span>}
            action={<ArrowLink href="/team">Meet the full ARICT team</ArrowLink>}
          />
        </FadeUp>
        {members.length > 0 ? (
          <StaggerContainer className="mt-14 grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {members.map((m) => (
              <StaggerItem key={m.id}>
                <MemberCard member={m} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="mt-14">
            <EmptyState icon={<Users className="size-8" />} title="Our new committee will be announced soon" />
          </div>
        )}
        <div className="mt-12 flex justify-center">
          <LinkButton href="/team" variant="outline" size="lg" arrow>
            Meet the Full Team
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
