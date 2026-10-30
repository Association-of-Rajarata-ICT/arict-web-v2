"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";

const LenisContext = createContext<Lenis | null>(null);

/** The active Lenis instance, or null when smooth scrolling is disabled (reduced motion / touch). */
export function useLenis() {
  return useContext(LenisContext);
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let instance: Lenis | null = null;

    const start = () => {
      if (reduce.matches || instance) return;
      instance = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Native momentum on touch devices feels best; Lenis only smooths wheel/trackpad.
        syncTouch: false,
        anchors: { offset: -88 },
        autoRaf: true,
      });
      setLenis(instance);
    };
    const stop = () => {
      instance?.destroy();
      instance = null;
      setLenis(null);
    };

    start();
    const onChange = () => (reduce.matches ? stop() : start());
    reduce.addEventListener("change", onChange);
    return () => {
      reduce.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LenisContext.Provider>
  );
}
