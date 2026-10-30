import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

const LINKS = [
  { href: "/events", label: "Explore upcoming ARICT events" },
  { href: "/projects", label: "View student technology projects" },
  { href: "/team", label: "Meet the ARICT team" },
  { href: "/contact", label: "Contact ARICT" },
];

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgb(0_0_0/0.12)_1px,transparent_0)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <Link href="/" aria-label="ARICT home" className="relative">
        <Logo className="h-6" />
      </Link>
      <p className="relative mt-14 font-display text-sm font-semibold tracking-[0.3em] text-brand">404</p>
      <h1 className="relative mt-4 text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-6xl">This page doesn&apos;t exist.</h1>
      <p className="relative mt-5 max-w-md text-lg text-muted">The link may be broken, or the page may have been moved or unpublished.</p>
      <LinkButton href="/" variant="dark" size="lg" className="relative mt-10">
        <ArrowLeft aria-hidden className="size-4" /> Back to home
      </LinkButton>
      <ul className="relative mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-muted underline-offset-4 hover:text-ink hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
