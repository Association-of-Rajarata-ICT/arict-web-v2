"use client";

import { useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import { useLenis } from "@/components/motion/smooth-scroll-provider";
import { cn } from "@/lib/utils";

/** Converts YouTube / Vimeo share links to privacy-friendly embed URLs. */
function toEmbed(url: string): { kind: "iframe" | "video"; src: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?autoplay=1&rel=0` };
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      if (id) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` };
    }
    if (host === "vimeo.com") return { kind: "iframe", src: `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean)[0]}?autoplay=1` };
    if (/\.(mp4|webm)$/i.test(u.pathname)) return { kind: "video", src: url };
  } catch {
    return null;
  }
  return null;
}

export function VideoDialog({ url, label, className }: { url: string; label: string; className?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const embed = toEmbed(url);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      lenis?.stop();
    } else if (!open && dialog.open) {
      dialog.close();
    }
    if (!open) lenis?.start();
  }, [open, lenis]);

  if (!embed) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
        <PlayBadge />
        {label}
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} aria-haspopup="dialog">
        <PlayBadge />
        {label}
      </button>
      <dialog
        ref={dialogRef}
        aria-label="ARICT video"
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        className="m-auto w-[min(92vw,1100px)] overflow-visible bg-transparent p-0 backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
          {open &&
            (embed.kind === "iframe" ? (
              <iframe
                src={embed.src}
                title="ARICT video"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            ) : (
              <video src={embed.src} controls autoPlay className="absolute inset-0 size-full" />
            ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute -top-12 right-0 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
          aria-label="Close video"
        >
          <X className="size-5" />
        </button>
      </dialog>
    </>
  );
}

function PlayBadge() {
  return (
    <span className={cn("inline-flex size-8 items-center justify-center rounded-full bg-ink/90 text-white transition-transform duration-200 group-hover:scale-105")}>
      <Play aria-hidden className="ml-0.5 size-3.5 fill-current" />
    </span>
  );
}
