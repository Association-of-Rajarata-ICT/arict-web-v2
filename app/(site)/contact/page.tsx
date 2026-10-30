import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { FadeUp } from "@/components/motion/reveal";
import { PageHero } from "@/components/ui/misc";
import { SOCIAL_ICONS } from "@/components/ui/social-icons";
import { getSiteSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with ARICT at Rajarata University of Sri Lanka for partnerships, event enquiries, sponsorships or questions about joining.",
  path: "/contact",
});

export default async function ContactPage() {
  const { contact, social } = await getSiteSettings();
  const socials = (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[]).filter((k) => social[k]);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk."
        description="Questions about events, partnerships, sponsorships or joining ARICT? Send us a message and the committee will get back to you."
        crumbs={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]}
      />
      <div className="container-page grid gap-12 py-14 sm:py-20 lg:grid-cols-12 lg:gap-16">
        <FadeUp className="space-y-8 lg:col-span-5">
          <section aria-labelledby="contact-details-heading">
            <h2 id="contact-details-heading" className="text-2xl font-semibold tracking-tight">
              Contact details
            </h2>
            <ul className="mt-6 space-y-5">
              {contact.email && (
                <ContactRow icon={<Mail className="size-4" />} label="Email">
                  <a href={`mailto:${contact.email}`} className="break-all hover:underline">
                    {contact.email}
                  </a>
                </ContactRow>
              )}
              {contact.phone && (
                <ContactRow icon={<Phone className="size-4" />} label="Phone">
                  <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="hover:underline">
                    {contact.phone}
                  </a>
                </ContactRow>
              )}
              {contact.address && (
                <ContactRow icon={<MapPin className="size-4" />} label="Address">
                  <address className="not-italic">{contact.address}</address>
                </ContactRow>
              )}
              {contact.officeHours && (
                <ContactRow icon={<Clock className="size-4" />} label="Office hours">
                  {contact.officeHours}
                </ContactRow>
              )}
            </ul>
          </section>

          {socials.length > 0 && (
            <section aria-labelledby="social-heading">
              <h2 id="social-heading" className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">
                Follow ARICT
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {socials.map((key) => {
                  const { Icon, label } = SOCIAL_ICONS[key];
                  return (
                    <li key={key}>
                      <a
                        href={social[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-ink/80 transition-colors hover:border-ink/20 hover:text-ink"
                      >
                        <Icon width={16} height={16} /> {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {contact.mapEmbedUrl && (
            <section aria-labelledby="map-heading">
              <h2 id="map-heading" className="sr-only">
                Map
              </h2>
              <div className="overflow-hidden rounded-3xl border border-line bg-mist">
                <iframe
                  src={contact.mapEmbedUrl}
                  title="Map showing Rajarata University of Sri Lanka"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="aspect-[4/3] w-full"
                />
              </div>
              {contact.mapLink && (
                <a href={contact.mapLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium underline-offset-4 hover:underline">
                  Open in Google Maps
                </a>
              )}
            </section>
          )}
        </FadeUp>

        <section aria-labelledby="contact-form-heading" className="lg:col-span-7">
          <h2 id="contact-form-heading" className="mb-6 text-2xl font-semibold tracking-tight">
            Send us a message
          </h2>
          <ContactForm fallbackEmail={contact.email || undefined} />
        </section>
      </div>
    </>
  );
}

function ContactRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span aria-hidden className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-mist text-ink/70">
        {icon}
      </span>
      <div className="text-[15px]">
        <p className="text-xs text-muted">{label}</p>
        <div className="mt-0.5 font-medium text-ink">{children}</div>
      </div>
    </li>
  );
}
