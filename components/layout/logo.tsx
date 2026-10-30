import Image from "next/image";
import { cn } from "@/lib/utils";

const SOURCES = {
  wordmark: { dark: "/brand/arict-wordmark.png", light: "/brand/arict-wordmark-light.png", w: 604, h: 109 },
  tagline: { dark: "/brand/arict-logo.png", light: "/brand/arict-logo-light.png", w: 604, h: 143 },
};

/**
 * ARICT wordmark.
 * - tone="auto" (default) follows the site theme: black letters in light mode, white in dark mode.
 * - tone="light" always uses the white variant (for permanently dark areas like the footer).
 * - tone="dark" always uses the black variant.
 */
export function Logo({
  tone = "auto",
  withTagline = false,
  className,
  priority,
}: {
  tone?: "auto" | "dark" | "light";
  withTagline?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const src = SOURCES[withTagline ? "tagline" : "wordmark"];
  const common = {
    width: src.w,
    height: src.h,
    loading: priority ? ("eager" as const) : undefined,
    sizes: withTagline ? "260px" : "120px",
  };

  if (tone !== "auto") {
    return <Image src={tone === "light" ? src.light : src.dark} alt="ARICT" {...common} className={cn("h-auto w-auto select-none", className)} />;
  }
  return (
    <>
      <Image src={src.dark} alt="ARICT" {...common} className={cn("h-auto w-auto select-none dark:hidden", className)} />
      <Image src={src.light} alt="" aria-hidden {...common} className={cn("hidden h-auto w-auto select-none dark:block", className)} />
    </>
  );
}
