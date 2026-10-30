import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink, PlayCircle } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { ShareProjectCta } from "@/components/projects/share-project-cta";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import { Avatar, Pill, Skeleton } from "@/components/ui/misc";
import { RichText } from "@/components/ui/rich-text";
import { ShareActions } from "@/components/ui/share-actions";
import { GithubIcon, LinkedinIcon } from "@/components/ui/social-icons";
import { getProjectBySlug, getPublishedProjectSlugs, getRelatedProjects } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getPublishedProjectSlugs();
  return slugs.length ? slugs.map(({ slug }) => ({ slug })) : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found", robots: { index: false } };
  return pageMetadata({
    title: project.title,
    description: project.excerpt,
    path: `/projects/${project.slug}`,
    image: project.coverImage,
    type: "article",
  });
}

const STATUS = { in_progress: "In progress", completed: "Completed", archived: "Archived" } as const;

export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <Suspense fallback={<ProjectSkeleton />}>
      <ProjectDetail params={params} />
    </Suspense>
  );
}

async function ProjectDetail({ params }: Pick<PageProps<"/projects/[slug]">, "params">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const related = await getRelatedProjects(project.id, project.category);

  return (
    <>
      <article>
        <header className="bg-gradient-to-b from-mist to-white pt-32 pb-12 sm:pt-36">
          <div className="container-page">
            <Breadcrumbs
              items={[
                { name: "Home", path: "/" },
                { name: "Projects", path: "/projects" },
                { name: project.title, path: `/projects/${project.slug}` },
              ]}
            />
            <FadeUp className="mt-8 max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <Pill tone="brand">{project.category}</Pill>
                <Pill>{project.year}</Pill>
                <Pill tone={project.status === "in_progress" ? "warning" : "neutral"}>{STATUS[project.status]}</Pill>
              </div>
              <h1 className="mt-5 text-4xl leading-[1.06] font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
                {project.title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted">{project.excerpt}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "dark", size: "lg" })}>
                    Live Demo <ExternalLink aria-hidden className="size-4" />
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "outline", size: "lg" })}>
                    <GithubIcon width={16} height={16} /> Source on GitHub
                  </a>
                )}
                {project.videoUrl && (
                  <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "ghost", size: "lg" })}>
                    <PlayCircle aria-hidden className="size-4" /> Watch video
                  </a>
                )}
              </div>
            </FadeUp>
          </div>
        </header>

        {project.coverImage && (
          <FadeUp className="container-page">
            <div className="relative aspect-[16/8] overflow-hidden rounded-[2rem] bg-mist">
              <Image src={project.coverImage} alt={`${project.title} cover image`} fill loading="eager" fetchPriority="high" sizes="(min-width: 1280px) 1180px, 100vw" className="object-cover" />
            </div>
          </FadeUp>
        )}

        <div className="container-page grid gap-12 py-14 lg:grid-cols-12 lg:gap-16 lg:py-20">
          <div className="lg:col-span-8">
            {project.content ? <RichText text={project.content} /> : <p className="text-muted">{project.excerpt}</p>}

            {project.images.length > 0 && (
              <section aria-labelledby="screenshots-heading" className="mt-14">
                <h2 id="screenshots-heading" className="text-2xl font-semibold tracking-tight">
                  Screenshots
                </h2>
                <StaggerContainer className="mt-6 grid gap-4 sm:grid-cols-2">
                  {project.images.map((img) => (
                    <StaggerItem key={img.id}>
                      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-mist">
                        <Image src={img.imageUrl} alt={img.altText || `${project.title} screenshot`} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </section>
            )}

            <div className="mt-14 border-t border-line pt-8">
              <ShareActions url={absoluteUrl(`/projects/${project.slug}`)} title={project.title} />
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            {project.technologies.length > 0 && (
              <section className="rounded-3xl border border-line bg-white p-6">
                <h2 className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">Technologies</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <li key={t}>
                      <Pill>{t}</Pill>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {project.members.length > 0 && (
              <section className="rounded-3xl border border-line bg-white p-6">
                <h2 className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">Contributors</h2>
                <ul className="mt-4 space-y-3">
                  {project.members.map((m, i) => (
                    <li key={`${m.name}-${i}`} className="flex items-center gap-3">
                      <Avatar name={m.name} size={40} className="size-10 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{m.name}</p>
                        {m.role && <p className="truncate text-xs text-muted">{m.role}</p>}
                      </div>
                      {m.linkedinUrl && (
                        <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`} className="text-ink/50 hover:text-ink">
                          <LinkedinIcon width={15} height={15} />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-projects-heading" className="border-t border-line bg-mist py-20">
          <div className="container-page">
            <h2 id="related-projects-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              More student projects
            </h2>
            <StaggerContainer className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <StaggerItem key={p.id}>
                  <ProjectCard project={p} />
                </StaggerItem>
              ))}
            </StaggerContainer>
            <div className="mt-14">
              <ShareProjectCta />
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function ProjectSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading project" className="container-page pt-36 pb-20">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-8 h-14 w-full max-w-2xl" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      <Skeleton className="mt-12 aspect-[16/8] w-full rounded-[2rem]" />
    </div>
  );
}
