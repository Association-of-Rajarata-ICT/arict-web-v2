"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  /** Distance in px for the upward reveal. */
  y?: number;
  as?: "div" | "section" | "li" | "article" | "span" | "p";
  once?: boolean;
};

export function FadeIn({ children, className, delay = 0, duration = 0.6, as = "div", once = true }: RevealProps) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once, margin: "0px 0px -10% 0px" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

export function FadeUp({ children, className, delay = 0, duration = 0.65, y = 24, as = "div", once = true }: RevealProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduce ? 0.2 : duration, delay: reduce ? 0 : delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

const containerVariants = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export function StaggerContainer({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "ol" | "section";
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={containerVariants(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" | "article" }) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 22 },
        show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.6, ease: EASE } },
      }}
    >
      {children}
    </Comp>
  );
}

/** Line-by-line masked text reveal. Pass each line as an array entry. */
export function RevealText({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.12,
  animateOnMount = false,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  animateOnMount?: boolean;
}) {
  const reduce = useReducedMotion();
  const trigger = animateOnMount ? { animate: "show" } : { whileInView: "show", viewport: { once: true } };
  return (
    <motion.span className={className} initial="hidden" {...trigger} variants={containerVariants(stagger, delay)}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={lineClassName ?? "block"}
            variants={{
              hidden: { y: reduce ? 0 : "105%", opacity: reduce ? 0 : 1 },
              show: { y: 0, opacity: 1, transition: { duration: reduce ? 0.2 : 0.9, ease: EASE } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
