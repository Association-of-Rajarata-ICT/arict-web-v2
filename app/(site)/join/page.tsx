import { CalendarDays, Lightbulb, Users } from "lucide-react";
import { JoinForm } from "@/components/join/join-form";
import { FadeUp } from "@/components/motion/reveal";
import { PageHero } from "@/components/ui/misc";
import { getSiteSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Join ARICT",
  description:
    "Apply to join ARICT, the student technology community at Rajarata University of Sri Lanka. Meet peers, gain skills and help run events and projects.",
  path: "/join",
});

const BENEFITS = [
  { icon: Users, title: "Meet like-minded peers", text: "Work with students across years who share your interest in technology." },
  { icon: Lightbulb, title: "Gain new skills", text: "Hands-on workshops, study circles and real projects to learn from." },
  { icon: CalendarDays, title: "Make an impact", text: "Help organise events and build tools the whole university can use." },
];

export default async function JoinPage() {
  const { joinCta } = await getSiteSettings();
  return (
    <>
      <PageHero
        eyebrow={joinCta.eyebrow || "Join ARICT"}
        title="Join the ARICT community."
        description={joinCta.text || "Membership is open to Rajarata University students who want to learn, build and lead."}
        crumbs={[{ name: "Home", path: "/" }, { name: "Join ARICT", path: "/join" }]}
      />
      <div className="container-page grid gap-12 py-14 sm:py-20 lg:grid-cols-12 lg:gap-16">
        <FadeUp className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className="text-2xl font-semibold tracking-tight">Why join?</h2>
            <ul className="mt-6 space-y-6">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span aria-hidden className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-mist">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </FadeUp>
        <section aria-label="Membership application" className="lg:col-span-8">
          <JoinForm />
        </section>
      </div>
    </>
  );
}
