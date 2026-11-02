import Link from "next/link";
import { ConsentSettingsLink } from "@/components/consent/consent-banner";
import { PageHero } from "@/components/ui/misc";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Privacy",
  description:
    "How the ARICT website handles your information: what our forms collect, which services we use, and the privacy choices you can make.",
  path: "/privacy",
});

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Information you send us",
    body: (
      <>
        <p>We only collect information you choose to give us through the forms on this site:</p>
        <ul>
          <li>
            <strong>Join ARICT</strong>: your name, email, phone, registration number, academic year, degree,
            interests, skills, your reason for joining, and optional LinkedIn and portfolio links.
          </li>
          <li>
            <strong>Share your Project</strong>: your project details and images, plus your name and email so we can
            contact you about the submission.
          </li>
          <li>
            <strong>Contact</strong>: your message is emailed to the ARICT team. It is not stored in our database.
          </li>
        </ul>
        <p>
          Join applications and project submissions are only visible to ARICT committee members with admin access.
          They are used to review your application or submission and to contact you about it.
        </p>
      </>
    ),
  },
  {
    title: "Optional features that need your consent",
    body: (
      <>
        <p>These only run after you select <strong>Accept</strong> in the privacy banner:</p>
        <ul>
          <li>
            <strong>Vercel Web Analytics</strong>: counts page views so we can see which pages are useful. It does not
            use cookies, and admin pages are never tracked.
          </li>
          <li>
            <strong>Google Maps</strong> on the Contact page. Google may set its own cookies. If you decline, you can
            still load the map once with the “Show map” button.
          </li>
        </ul>
        <p>
          You can change your choice at any time: <ConsentSettingsLink className="font-medium text-ink underline underline-offset-2" />.
        </p>
      </>
    ),
  },
  {
    title: "Storage on your device",
    body: (
      <p>
        The site keeps a few small settings in your browser&apos;s local storage: your light/dark theme, your privacy
        choice (for 12 months), and a short cooldown after sending a contact message. These never leave your device.
        Committee members who sign in to the admin area also receive a login cookie.
      </p>
    ),
  },
  {
    title: "Services we use",
    body: (
      <ul>
        <li><strong>Vercel</strong>: hosts the website (and provides the optional analytics).</li>
        <li><strong>Neon</strong>: stores the site&apos;s database, including form submissions.</li>
        <li><strong>Cloudinary</strong>: stores uploaded images.</li>
        <li><strong>EmailJS</strong>: delivers Contact form messages to our inbox.</li>
        <li><strong>Google Maps</strong>: the optional map on the Contact page.</li>
      </ul>
    ),
  },
  {
    title: "Your requests",
    body: (
      <p>
        To ask what we hold about you, or to have your application or submission corrected or removed, please{" "}
        <Link href="/contact" className="font-medium text-ink underline underline-offset-2">
          contact the ARICT team
        </Link>
        .
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Your privacy."
        description="What the ARICT website collects, why, and the choices you have."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" },
        ]}
      />
      <div className="container-page py-14 sm:py-20">
        <div className="max-w-3xl space-y-12">
          {SECTIONS.map((s, i) => (
            <section key={s.title} aria-labelledby={`privacy-${i}`}>
              <h2 id={`privacy-${i}`} className="text-2xl font-semibold tracking-tight">
                {s.title}
              </h2>
              <div className="prose-arict mt-4">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
