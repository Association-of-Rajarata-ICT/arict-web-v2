"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { FadeUp } from "@/components/motion/reveal";

type Cta = SiteSettings["joinCta"];

function Band({ data, onJoinPage }: { data: Cta; onJoinPage: boolean }) {
  const href = onJoinPage ? "/contact" : data.ctaHref || "/join";
  const label = onJoinPage ? "Contact us" : data.ctaLabel;
  return (
    <FadeUp>
      <section
        aria-labelledby="footer-cta-heading"
        className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between md:gap-12"
      >
        <div className="max-w-2xl">
          {data.eyebrow && (
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-white/50 uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-brand" />
              {data.eyebrow}
            </p>
          )}
          <h2
            id="footer-cta-heading"
            className="mt-4 text-3xl leading-[1.08] font-bold tracking-[-0.035em] text-balance sm:text-4xl lg:text-[2.75rem]"
          >
            {data.heading}
          </h2>
          {data.points.length > 0 && (
            <p className="mt-4 text-sm text-white/55 sm:text-[15px]">
              {data.points.map((p) => p.replace(/\.$/, "")).join(" · ")}
            </p>
          )}
        </div>
        <Link
          href={href}
          className="group inline-flex h-12 shrink-0 items-center gap-5 self-start rounded-full bg-white pr-1.5 pl-6 text-[15px] font-medium text-night transition-shadow duration-300 hover:shadow-[0_0_0_6px_rgb(255_255_255/0.1)] md:self-auto"
        >
          {label}
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-night text-white transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight aria-hidden className="size-4" />
          </span>
        </Link>
      </section>
    </FadeUp>
  );
}

function BandWithPath({ data }: { data: Cta }) {
  return <Band data={data} onJoinPage={usePathname() === "/join"} />;
}

/** Join ARICT call to action that opens the footer on every public page. */
export function FooterCta({ data }: { data: Cta }) {
  return (
    <Suspense fallback={<Band data={data} onJoinPage={false} />}>
      <BandWithPath data={data} />
    </Suspense>
  );
}
