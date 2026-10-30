import Link from "next/link";
import { cacheLife } from "next/cache";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings } from "@/lib/data/public";
import { FOOTER_NAV } from "@/lib/site";
import { SOCIAL_ICONS } from "@/components/ui/social-icons";
import { FooterCta } from "./footer-cta";
import { Logo } from "./logo";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const GET_INVOLVED = [
  { href: "/projects/submit", label: "Share your project" },
  { href: "/join", label: "Become a member" },
  { href: "/contact", label: "Contact us" },
];

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-white/40 uppercase">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

const linkClass = "text-white/65 transition-colors hover:text-white";

export async function Footer() {
  const settings = await getSiteSettings();
  const { contact, social, footer, joinCta } = settings;
  const socials = (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[]).filter((k) => social[k]);

  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-white">
      {/* Faint wordmark in the background; adds no height. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-[-2%] bottom-[-0.2em] font-display text-[clamp(6rem,20vw,17rem)] leading-none font-extrabold tracking-[-0.06em] text-white/[0.035] select-none"
      >
        ARICT
      </span>

      <div className="container-page relative">
        <div className="border-b border-white/10 py-14 sm:py-16">
          <FooterCta data={joinCta} />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-4">
            <Link href="/" aria-label="ARICT home" className="inline-block">
              <Logo tone="light" className="h-6" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">{footer.tagline}</p>
            {socials.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="ARICT on social media">
                {socials.map((key) => {
                  const { Icon, label } = SOCIAL_ICONS[key];
                  return (
                    <li key={key}>
                      <a
                        href={social[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`ARICT on ${label}`}
                        className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 text-white/65 transition-colors hover:border-white/30 hover:text-white"
                      >
                        <Icon width={16} height={16} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-6">
            <Column title="Explore">
              <ul className="grid grid-cols-1 gap-y-2.5 text-sm sm:grid-cols-2 sm:gap-x-6">
                {FOOTER_NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Column>
          </nav>

          <div className="lg:col-span-2">
            <Column title="Get involved">
              <ul className="space-y-2.5 text-sm">
                {GET_INVOLVED.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Column>
          </div>

          <div className="col-span-2 lg:col-span-2">
            <Column title="Contact">
              <ul className="space-y-3 text-sm text-white/65">
                {contact.email && (
                  <li className="flex gap-2.5">
                    <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-white/35" />
                    <a href={`mailto:${contact.email}`} className="break-all hover:text-white">
                      {contact.email}
                    </a>
                  </li>
                )}
                {contact.phone && (
                  <li className="flex gap-2.5">
                    <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-white/35" />
                    <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="hover:text-white">
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact.address && (
                  <li className="flex gap-2.5">
                    <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-white/35" />
                    <address className="not-italic leading-relaxed">{contact.address}</address>
                  </li>
                )}
              </ul>
            </Column>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-white/10 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> ARICT. All rights reserved.
          </p>
          <p>{settings.general.fullName}</p>
        </div>
      </div>
    </footer>
  );
}
