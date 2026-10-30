import Image from "next/image";
import { cn } from "@/lib/utils";

/** ARICT wordmark. `tone="light"` swaps to the white variant for dark backgrounds. */
export function Logo({
  tone = "dark",
  withTagline = false,
  className,
  priority,
}: {
  tone?: "dark" | "light";
  withTagline?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const src = withTagline
    ? tone === "light"
      ? "/brand/arict-logo-light.png"
      : "/brand/arict-logo.png"
    : tone === "light"
      ? "/brand/arict-wordmark-light.png"
      : "/brand/arict-wordmark.png";
  const [w, h] = withTagline ? [604, 143] : [604, 109];
  return (
    <Image
      src={src}
      alt="ARICT"
      width={w}
      height={h}
      loading={priority ? "eager" : undefined}
      sizes={withTagline ? "260px" : "120px"}
      className={cn("h-auto w-auto select-none", className)}
    />
  );
}
