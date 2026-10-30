"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { VideoDialog } from "./video-dialog";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({ hero }: { hero: SiteSettings["hero"] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0.2 : 0.8, delay: reduce ? 0 : delay, ease: EASE },
  });

  const line = (delay: number, distance = "105%") => ({
    initial: { y: reduce ? 0 : distance, opacity: reduce ? 0 : 1 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: reduce ? 0.2 : 1, delay: reduce ? 0 : delay, ease: EASE },
  });

  return (
    <section ref={ref} aria-labelledby="hero-heading" className="relative isolate flex min-h-svh flex-col overflow-hidden">
      {/* Background: very slow settle-in zoom + gentle parallax */}
      <motion.div aria-hidden={!hero.backgroundAlt} className="absolute inset-0 -z-20" style={reduce ? undefined : { y: bgY }}>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: reduce ? 1 : 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: EASE }}
        >
          <Image
            src={hero.backgroundImage || "/images/hero-campus.jpg"}
            alt={hero.backgroundAlt}
            fill
            loading="eager"
            fetchPriority="high"
            quality={85}
            sizes="100vw"
            className="object-cover object-[50%_45%]"
          />
        </motion.div>
      </motion.div>

      {/* Subtle readability: a soft haze behind the copy, not a dark overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_52%_at_50%_40%,rgb(255_255_255/0.78),rgb(255_255_255/0.35)_55%,transparent_80%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-white/45 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-black/25 to-transparent" />

      <motion.div
        className="container-page flex flex-1 flex-col items-center justify-center pt-36 pb-28 text-center sm:pt-52 sm:pb-24"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        {hero.badge && (
          <motion.p
            {...fadeUp(0.35)}
            className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-black/[0.06] bg-white/80 px-3.5 py-1.5 text-[11px] leading-snug font-medium text-ink/80 shadow-[0_4px_16px_-8px_rgb(0_0_0/0.25)] backdrop-blur-md sm:mb-7 sm:text-xs"
          >
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
            <span className="text-balance">{hero.badge}</span>
          </motion.p>
        )}

        <h1
          id="hero-heading"
          className="text-[2.6rem] leading-[1.02] font-bold tracking-[-0.035em] text-balance text-ink sm:text-6xl md:text-7xl lg:text-[5.4rem]"
        >
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span className="block" {...line(0.5)}>
              {hero.headingLine1}
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.1em]">
            <motion.span className="block" {...line(0.64)}>
              {hero.headingLine2}{" "}
              {hero.highlight && (
                <motion.span
                  className="inline-block text-brand"
                  initial={{ opacity: reduce ? 0 : 0, y: reduce ? 0 : "40%", filter: reduce ? "none" : "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: reduce ? 0.2 : 1.1, delay: reduce ? 0 : 0.9, ease: EASE }}
                >
                  {hero.highlight}
                </motion.span>
              )}
            </motion.span>
          </span>
        </h1>

        <motion.p
          {...fadeUp(1.05)}
          className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-ink/80 [text-shadow:0_1px_14px_rgb(255_255_255/0.9)] sm:text-lg"
        >
          {hero.text}
        </motion.p>

        <motion.div
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: reduce ? 0 : 1.2 } } }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: reduce ? 0 : 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}>
            <Link
              href={hero.primaryCtaHref || "/events"}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-ink shadow-[0_10px_30px_-10px_rgb(0_0_0/0.35)] ring-1 ring-black/5 transition-shadow duration-200 hover:shadow-[0_16px_40px_-12px_rgb(0_0_0/0.45)]"
            >
              {hero.primaryCtaLabel}
              <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
          {hero.videoUrl && hero.secondaryCtaLabel && (
            <motion.div variants={{ hidden: { opacity: 0, y: reduce ? 0 : 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}>
              <VideoDialog
                url={hero.videoUrl}
                label={hero.secondaryCtaLabel}
                className="group inline-flex h-12 items-center gap-3 rounded-full px-3 pr-5 text-[15px] font-medium text-ink transition-colors hover:bg-white/50"
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-6 flex justify-center sm:bottom-8"
        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: reduce ? 0 : 1.6, ease: EASE }}
      >
        <a
          href="#about"
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-4 py-2 text-[11px] font-medium tracking-[0.28em] text-white backdrop-blur-md transition-colors hover:bg-black/45"
        >
          SCROLL
          <ArrowDown aria-hidden className="size-3.5 motion-safe:animate-bob" />
          <span className="sr-only">to learn about ARICT</span>
        </a>
      </motion.div>
    </section>
  );
}
