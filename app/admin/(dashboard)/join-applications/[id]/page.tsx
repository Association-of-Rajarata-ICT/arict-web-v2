import { notFound } from "next/navigation";
import { reviewJoinApplication } from "@/actions/admin/join";
import { ReviewForm } from "@/components/admin/review-form";
import { AdminHeader, Card, StatusBadge } from "@/components/admin/ui";
import { Pill } from "@/components/ui/misc";
import { JOIN_STATUS_OPTIONS } from "@/lib/admin-options";
import { requirePage } from "@/lib/auth/session";
import { getJoinApplication, isUuid } from "@/lib/data/admin";
import { ACADEMIC_YEAR_LABELS } from "@/lib/team";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Join application" };

export default async function JoinApplicationPage({ params }: PageProps<"/admin/join-applications/[id]">) {
  await requirePage("moderation");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const a = await getJoinApplication(id);
  if (!a) notFound();

  const link = (href: string | null) =>
    href ? (
      <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className="break-all text-sky-700 underline">
        {href}
      </a>
    ) : (
      <span className="text-muted">—</span>
    );

  return (
    <>
      <AdminHeader
        title={a.fullName}
        description={
          <span className="inline-flex items-center gap-2">
            <StatusBadge status={a.status} /> Received {a.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Colombo" })}
          </span>
        }
        back={{ href: "/admin/join-applications", label: "Join applications" }}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Applicant">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Row label="Email">
                <a href={`mailto:${a.email}`} className="text-sky-700 underline">
                  {a.email}
                </a>
              </Row>
              <Row label="Phone">
                <a href={`tel:${a.phone.replace(/\s+/g, "")}`}>{a.phone}</a>
              </Row>
              <Row label="Registration number">{a.registrationNumber}</Row>
              <Row label="Academic year">{ACADEMIC_YEAR_LABELS[a.academicYear]}</Row>
              <Row label="Degree / program">{a.degree}</Row>
              <Row label="LinkedIn">{link(a.linkedinUrl)}</Row>
              <Row label="GitHub">{link(a.githubUrl)}</Row>
            </dl>
          </Card>
          <Card title="Interests & skills">
            <ul className="flex flex-wrap gap-1.5">
              {a.interests.map((i) => (
                <li key={i}>
                  <Pill>{i}</Pill>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs font-medium text-muted">Technical skills</p>
            <p className="mt-1 text-sm whitespace-pre-wrap">{a.skills}</p>
          </Card>
          <Card title="Reason for joining">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{a.reason}</p>
          </Card>
        </div>
        <Card title="Review">
          <ReviewForm id={a.id} action={reviewJoinApplication} status={a.status} notes={a.adminNotes} options={JOIN_STATUS_OPTIONS} />
        </Card>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
