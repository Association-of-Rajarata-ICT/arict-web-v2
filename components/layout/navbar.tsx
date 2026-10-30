"use client";

import { Suspense, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { PRIMARY_NAV } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/motion/smooth-scroll-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "./logo";

const EASE = [0.16, 1, 0.3, 1] as const;

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavbarInner({ pathname }: { pathname: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4"
    >
      <nav
        aria-label="Primary"
        className={cn(
          "mx-auto flex max-w-[52rem] items-center justify-between gap-2 rounded-full border pl-4 pr-1.5 transition-[background-color,box-shadow,border-color,padding,max-width] duration-300 ease-out sm:pl-5",
          scrolled
            ? "max-w-[50rem] border-black/[0.07] bg-surface/90 dark:border-white/10 py-1.5 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur-xl"
            : "border-white/60 bg-surface/75 dark:border-white/10 py-2 shadow-[0_6px_24px_-14px_rgb(0_0_0/0.25)] backdrop-blur-md",
        )}
      >
        <Link href="/" aria-label="ARICT home" className="flex shrink-0 items-center rounded-md py-1">
          <Logo priority className="h-[18px] sm:h-5" />
        </Link>

        <ul className="hidden items-center gap-0.5 md:flex">
          {PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex flex-col items-center rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors duration-200",
                    active ? "text-ink" : "text-ink/65 hover:text-ink",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute bottom-0.5 size-1 rounded-full bg-brand transition-all duration-300",
                      active ? "scale-100 opacity-100" : "scale-0 opacity-0",
                    )}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/join"
            className="group hidden h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13.5px] font-medium text-paper transition-colors hover:bg-ink-soft sm:inline-flex"
          >
            Join ARICT
            <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-black/5 md:hidden dark:hover:bg-white/10"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              aria-hidden
              className="fixed inset-0 -z-10 bg-black/20 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="panel"
              id={menuId}
              className="mx-auto mt-2 max-w-[52rem] overflow-hidden rounded-3xl border border-black/[0.06] bg-surface p-3 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)] md:hidden"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <motion.ul
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
              >
                {[{ href: "/", label: "Home" }, ...PRIMARY_NAV].map((item) => {
                  const active = item.href === "/" ? pathname === "/" : isActive(pathname, item.href);
                  return (
                    <motion.li
                      key={item.href}
                      variants={{ hidden: { opacity: 0, y: -6 }, show: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.3, ease: EASE }}
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center justify-between rounded-2xl px-4 text-base font-medium transition-colors",
                          active ? "bg-mist text-ink" : "text-ink/75 hover:bg-mist hover:text-ink",
                        )}
                      >
                        {item.label}
                        {active && <span aria-hidden className="size-1.5 rounded-full bg-brand" />}
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>
              <Link
                href="/join"
                className="mt-2 flex h-12 items-center justify-center gap-2 rounded-2xl bg-ink text-base font-medium text-paper"
              >
                Join ARICT <ArrowRight aria-hidden className="size-4" />
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function NavbarWithPath() {
  return <NavbarInner pathname={usePathname()} />;
}

/** Links render in the static shell; the active indicator resolves once the pathname is known. */
export function Navbar() {
  return (
    <Suspense fallback={<NavbarInner pathname={null} />}>
      <NavbarWithPath />
    </Suspense>
  );
}
