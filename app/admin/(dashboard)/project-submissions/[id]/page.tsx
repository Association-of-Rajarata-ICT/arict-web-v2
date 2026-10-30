import Link from "next/link";
import { notFound } from "next/navigation";
import { acceptSubmission, reviewSubmission } from "@/actions/admin/submissions";
import { ProjectForm } from "@/components/admin/project-form";
import { ReviewForm } from "@/components/admin/review-form";
import { AdminHeader, Card, StatusBadge } from "@/components/admin/ui";
import { SUBMISSION_STATUS_OPTIONS } from "@/lib/admin-options";
import { requirePage } from "@/lib/auth/session";
import { getSubmission, isUuid } from "@/lib/data/admin";
import { slugify } from "@/lib/utils";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Review submission" };

/** Submitted links are shown as plain, non-followed links. They are never fetched or embedded. */
function SafeLink({ href }: { href: string | null }) {
  if (!href) return <span className="text-muted">—</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className="break-all text-sky-700 underline underline-offset-2">
      {href}
    </a>
  );
}

export default async function SubmissionPage({ params }: PageProps<"/admin/project-submissions/[id]">) {
  await requirePage("moderation");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const s = await getSubmission(id);
  if (!s) notFound();

  const images = [s.coverImage, ...s.screenshots].filter((u): u is string => !!u);

  return (
    <>
      <AdminHeader
        title={s.title}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusBadge status={s.status} /> Submitted {s.submittedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Colombo" })}
            {s.reviewerName && s.reviewedAt && <> · Last reviewed by {s.reviewerName}</>}
          </span>
        }
        back={{ href: "/admin/project-submissions", label: "Project submissions" }}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Submission">
            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <Item label="Category">{s.category}</Item>
              <Item label="Project year">{s.projectYear}</Item>
              <Item label="Technologies" wide>
                {s.technologies.join(", ") || "—"}
              </Item>
              <Item label="Team members" wide>
                {s.teamMembers.join(", ") || "—"}
              </Item>
              <Item label="Short description" wide>
                {s.shortDescription}
              </Item>
              <Item label="Full description" wide>
                <p className="whitespace-pre-wrap">{s.fullDescription}</p>
              </Item>
            </dl>
          </Card>

          <Card title="Links">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Item label="GitHub"><SafeLink href={s.githubUrl} /></Item>
              <Item label="Live demo"><SafeLink href={s.liveUrl} /></Item>
              <Item label="Video"><SafeLink href={s.videoUrl} /></Item>
              <Item label="Portfolio"><SafeLink href={s.portfolioUrl} /></Item>
              <Item label="LinkedIn"><SafeLink href={s.linkedinUrl} /></Item>
            </dl>
          </Card>

          <Card title={`Images (${images.length})`}>
            {images.length ? (
              <ul className="grid gap-3 sm:grid-cols-3">
                {images.map((src, i) => (
                  <li key={src}>
                    <a href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-line bg-mist">
                      {/* eslint-disable-next-line @next/next/no-img-element -- reviewing raw uploads as submitted */}
                      <img src={src} alt={i === 0 && s.coverImage ? "Cover image" : `Screenshot ${i}`} className="aspect-[16/10] w-full object-cover" loading="lazy" />
                    </a>
                    <p className="mt-1 text-xs text-muted">{i === 0 && s.coverImage ? "Cover" : `Screenshot ${s.coverImage ? i : i + 1}`}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No images were submitted.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Submitter">
            <p className="font-medium">{s.submitterName}</p>
            <a href={`mailto:${s.submitterEmail}`} className="text-sm text-sky-700 underline">
              {s.submitterEmail}
            </a>
          </Card>
          <Card title="Review">
            <ReviewForm
              id={s.id}
              action={reviewSubmission}
              status={s.status}
              notes={s.adminNotes}
              options={SUBMISSION_STATUS_OPTIONS.map((o) => ({ ...o, disabled: o.value === "accepted" && s.status !== "accepted" }))}
            />
          </Card>
        </div>
      </div>

      <div className="mt-10">
        {s.acceptedProjectId ? (
          <Card title="Accepted">
            <p className="text-sm">
              This submission was converted into a project.{" "}
              <Link href={`/admin/projects/${s.acceptedProjectId}`} className="font-medium underline">
                Open the project
              </Link>{" "}
              to edit and publish it.
            </p>
          </Card>
        ) : s.status === "rejected" ? null : (
          <section aria-labelledby="accept-heading">
            <h2 id="accept-heading" className="text-xl font-semibold tracking-tight">
              Accept &amp; create project
            </h2>
            <p className="mt-1 mb-6 text-sm text-muted">
              Edit anything before accepting. This creates a regular project linked to this submission. It stays unpublished until you publish it.
            </p>
            <ProjectForm
              action={acceptSubmission}
              extraFields={{ submissionId: s.id }}
              submitLabel="Accept & create draft project"
              showVisibility={false}
              project={{
                title: s.title,
                slug: s.slugCandidate || slugify(s.title),
                excerpt: s.shortDescription,
                content: s.fullDescription,
                category: s.category,
                year: s.projectYear,
                status: "completed",
                technologies: s.technologies,
                contributors: (s.teamMembers.length ? s.teamMembers : [s.submitterName]).map((name) => ({ name, role: null })),
                coverImage: s.coverImage,
                screenshots: s.screenshots,
                githubUrl: s.githubUrl,
                liveUrl: s.liveUrl,
                videoUrl: s.videoUrl,
              }}
            />
          </section>
        )}
      </div>
    </>
  );
}

function Item({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1 text-ink">{children}</dd>
    </div>
  );
}
