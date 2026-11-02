"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { useLenis } from "@/components/motion/smooth-scroll-provider";
import { buttonClasses } from "@/components/ui/button";
import type { EventImage } from "@/lib/db/schema";

type Photo = Pick<EventImage, "id" | "imageUrl" | "altText" | "caption">;
const PREVIEW_COUNT = 3;

export function EventGallery({ images, albumUrl }: { images: Photo[]; albumUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();
  const headingId = useId();
  const currentIndex = Math.min(index, Math.max(0, images.length - 1));
  const current = images[currentIndex];
  const hasImages = images.length > 0;
  const remaining = Math.max(0, images.length - PREVIEW_COUNT);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !hasImages || !dialog) return;
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [open, hasImages, lenis]);

  if (!images.length && !albumUrl) return null;

  const move = (direction: number) => setIndex((value) => (value + direction + images.length) % images.length);

  return (
    <section aria-labelledby={headingId} className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id={headingId} className="text-2xl font-semibold tracking-tight">Photos</h2>
        {albumUrl && (
          <a href={albumUrl} target="_blank" rel="noopener noreferrer"
            className={buttonClasses({ variant: "outline", size: "sm" })}>
            View Facebook album <ExternalLink aria-hidden className="size-4" />
          </a>
        )}
      </div>
      {images.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {images.slice(0, PREVIEW_COUNT).map((photo, photoIndex) => {
            const more = photoIndex === PREVIEW_COUNT - 1 && remaining > 0;
            return (
              <figure key={photo.id}>
                <button type="button" onClick={() => { setIndex(photoIndex); setOpen(true); }}
                  aria-haspopup="dialog"
                  aria-label={more ? `Open gallery: ${remaining} more photos` : `Open photo ${photoIndex + 1}: ${photo.altText || "Event photo"}`}
                  className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-mist outline-none focus-visible:ring-4 focus-visible:ring-brand focus-visible:ring-offset-2">
                  <Image src={photo.imageUrl} alt={photo.altText || `Event photo ${photoIndex + 1}`} fill
                    sizes="(min-width: 1024px) 250px, (min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none" />
                  {more && (
                    <span aria-hidden className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
                      <span className="text-4xl font-semibold">+{remaining}</span>
                      <span className="mt-1 text-sm">more photos</span>
                    </span>
                  )}
                </button>
                {photo.caption && <figcaption className="mt-2 text-sm text-muted">{photo.caption}</figcaption>}
              </figure>
            );
          })}
        </div>
      )}
      <dialog ref={dialogRef} aria-label="Event photo gallery" onCancel={() => setOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
        onKeyDown={(event) => {
          if (images.length > 1 && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
            event.preventDefault();
            move(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
        data-lenis-prevent
        className="m-auto w-[min(94vw,1200px)] max-w-none overflow-visible border-0 bg-transparent p-0 text-white backdrop:bg-black/90">
        <div className="overflow-hidden rounded-2xl bg-neutral-950">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p role="status" className="text-sm">Photo {currentIndex + 1} of {images.length}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close photo gallery"
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white">
              <X aria-hidden className="size-6" />
            </button>
          </div>
          {open && current && (
            <figure>
              <div className="relative h-[min(65dvh,800px)]">
                <Image key={current.id} src={current.imageUrl} alt={current.altText || `Event photo ${currentIndex + 1}`}
                  fill sizes="(min-width: 1280px) 1200px, 94vw" className="object-contain" />
              </div>
              {current.caption && <figcaption className="max-h-20 overflow-y-auto px-5 py-3 text-center text-sm text-white/85">{current.caption}</figcaption>}
            </figure>
          )}
          {images.length > 1 && (
            <div className="flex justify-center gap-4 p-3">
              <button type="button" onClick={() => move(-1)} aria-label="Previous photo"
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white">
                <ChevronLeft aria-hidden className="size-5" /> Previous
              </button>
              <button type="button" onClick={() => move(1)} aria-label="Next photo"
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white">
                Next <ChevronRight aria-hidden className="size-5" />
              </button>
            </div>
          )}
        </div>
      </dialog>
    </section>
  );
}
