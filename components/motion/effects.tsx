"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/** Image that drifts gently against the scroll direction. Disabled for reduced motion. */
export function ParallaxImage({
  className,
  strength = 8,
  ...props
}: ImageProps & { strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div className="absolute -inset-y-[12%] inset-x-0" style={reduce ? undefined : { y }}>
        <Image {...props} alt={props.alt} fill className="object-cover" />
      </motion.div>
    </div>
  );
}

/** Counts up once when scrolled into view. Renders the final value for SSR/crawlers. */
export function AnimatedCounter({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  // After hydration, reset off-screen counters to zero so they can count up when revealed.
  useEffect(() => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.top > window.innerHeight) setDisplay(0);
  }, [reduce]);

  useEffect(() => {
    if (!inView || reduce || started.current) return;
    started.current = true;
    const controls = animate(0, value, {
      duration: Math.min(2, 0.8 + value / 800),
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/** Thin brand-red reading progress bar at the very top of the page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-brand"
      style={{ scaleX }}
    />
  );
}
