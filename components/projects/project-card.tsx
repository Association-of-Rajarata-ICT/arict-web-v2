import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Globe } from "lucide-react";
import type { ProjectCard as ProjectCardData } from "@/lib/data/public";
import { cn } from "@/lib/utils";
import { Pill } from "@/components/ui/misc";
import { CoverFallback } from "@/components/ui/cover-fallback";
import { GithubIcon } from "@/components/ui/social-icons";

export function ProjectCard({
  project,
  headingLevel = "h3",
  className,
}: {
  project: ProjectCardData;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const Heading = headingLevel;
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white transition-[box-shadow,transform,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-black/10 hover:shadow-[0_24px_50px_-28px_rgb(0_0_0/0.35)]",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-mist">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <CoverFallback label={project.category} />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-medium text-muted">
          {project.category} · {project.year}
        </p>
        <Heading className="mt-2 text-xl leading-snug font-semibold tracking-tight text-ink">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {project.title}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{project.excerpt}</p>
        {project.technologies.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
            {project.technologies.slice(0, 4).map((t) => (
              <li key={t}>
                <Pill>{t}</Pill>
              </li>
            ))}
            {project.technologies.length > 4 && (
              <li>
                <Pill>+{project.technologies.length - 4}</Pill>
              </li>
            )}
          </ul>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-ink">
            View Project
            <ArrowUpRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
          <div className="relative z-10 flex items-center gap-1">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} source code on GitHub`}
                className="inline-flex size-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-mist hover:text-ink"
              >
                <GithubIcon width={16} height={16} />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live demo`}
                className="inline-flex size-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-mist hover:text-ink"
              >
                <Globe aria-hidden className="size-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
