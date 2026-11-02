"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, Megaphone, Newspaper, X } from "lucide-react";
import { ANNOUNCEMENT_KIND_LABELS, announcementSignature, type PublicAnnouncement } from "@/lib/announcements";
import { useLenis } from "@/components/motion/smooth-scroll-provider";

const STORAGE_KEY = "arict-dismissed-announcements";
/** After closing, the same announcements stay hidden for a day (across tabs and visits). */
const HIDE_FOR_MS = 24 * 60 * 60 * 1000;

function wasDismissed(signature: string) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as { signature?: string; at?: number } | null;
    return saved?.signature === signature && typeof saved.at === "number" && Date.now() - saved.at < HIDE_FOR_MS;
  } catch {
    return false; // storage unavailable: just show the popup
  }
}

function rememberDismissal(signature: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ signature, at: Date.now() }));
  } catch {
    // The popup still works when browser storage is unavailable.
  }
}

/** Space around the image: ~16px on phones, growing with the screen up to ~72px. */
const FRAME_MARGIN = "clamp(1rem, 6vmin, 4.5rem)";

function AnnouncementImage({ item }: { item: PublicAnnouncement & { image: string } }) {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const ratio = aspectRatio ?? 4 / 5; // placeholder shape until the image reports its size

  return (
    <div className="flex h-dvh w-full items-center justify-center" style={{ padding: FRAME_MARGIN }}>
      {/* The frame keeps the image's own shape and fits inside the margins on every screen. */}
      <div
        className="relative max-h-full overflow-hidden rounded-2xl shadow-[0_30px_80px_-20px_rgb(0_0_0/0.65)] ring-1 ring-white/10 sm:rounded-3xl"
        style={{ aspectRatio: ratio, width: `min(100%, calc((100dvh - 2 * ${FRAME_MARGIN}) * ${ratio}))` }}
      >
        <Image
          src={item.image}
          alt={item.imageAlt ?? item.title}
          fill
          sizes="(min-width: 1024px) 80vw, 100vw"
          loading="eager"
          draggable={false}
          className={`object-contain transition-opacity duration-300 ${aspectRatio ? "opacity-100" : "opacity-0"}`}
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            if (naturalWidth && naturalHeight) setAspectRatio(naturalWidth / naturalHeight);
          }}
        />
      </div>
    </div>
  );
}

export function AnnouncementPopup({ items, preview = false }: { items: PublicAnnouncement[]; preview?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const lenis = useLenis();
  const id = useId();
  const signature = announcementSignature(items);
  const hasItems = items.length > 0;
  const currentIndex = Math.min(index, Math.max(0, items.length - 1));
  const item = items[currentIndex];

  useEffect(() => {
    // Changing or adding an announcement changes the signature, so it shows again right away.
    if (preview || !signature || wasDismissed(signature)) return;
    const timer = setTimeout(() => {
      setIndex(0);
      setOpen(true);
    }, 700);
    return () => clearTimeout(timer);
  }, [signature, preview]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !hasItems || !dialog) return;
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [open, hasItems, lenis]);

  const dismiss = () => {
    if (!preview) {
      rememberDismissal(signature);
    }
    setOpen(false);
  };

  if (!item) return null;
  const Icon = item.kind === "news" ? Newspaper : Megaphone;
  const external = /^https?:\/\//i.test(item.linkUrl ?? "");

  return (
    <>
      {preview && (
        <button type="button" onClick={() => { setIndex(0); setOpen(true); }} aria-haspopup="dialog"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-medium hover:bg-mist">
          <Eye aria-hidden className="size-3.5" /> Preview
        </button>
      )}
      <dialog
        ref={dialogRef}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-message`}
        onCancel={(event) => { event.preventDefault(); dismiss(); }}
        onClick={(event) => { if (item.image || event.target === event.currentTarget) dismiss(); }}
        data-lenis-prevent
        className={item.image
          ? "fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none cursor-zoom-out overflow-hidden border-0 bg-transparent p-0 text-white backdrop:bg-black/55 backdrop:backdrop-blur-xl"
          : "m-auto max-h-[90svh] w-[min(92vw,560px)] overflow-y-auto overscroll-contain rounded-3xl border border-line bg-surface p-0 text-ink shadow-float backdrop:bg-black/45 backdrop:backdrop-blur-xl"}
      >
        {item.image ? (
          <>
            <h2 id={`${id}-title`} className="sr-only">{item.title}</h2>
            <p id={`${id}-message`} className="sr-only">{item.message} Click anywhere on the image or background to close.</p>
            {open && <AnnouncementImage key={item.image} item={{ ...item, image: item.image }} />}
            <button type="button" onClick={dismiss} aria-label="Close announcement"
              className="absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] inline-flex size-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
              <X aria-hidden className="size-5" />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-3 px-4">
              {item.linkUrl && item.linkLabel && (
                <a href={item.linkUrl} onClick={dismiss} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="pointer-events-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-black/75 px-5 py-2 text-sm font-medium text-white hover:bg-black/90">
                  {item.linkLabel} <ArrowRight aria-hidden className="size-4" />
                </a>
              )}
              <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white">{preview ? "Preview · " : ""}Click anywhere to close</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 px-5 py-3 sm:px-6">
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-brand uppercase">
                <Icon aria-hidden className="size-4" /> {ANNOUNCEMENT_KIND_LABELS[item.kind]}
                {preview && <span className="text-muted">· Preview</span>}
              </span>
              <button type="button" onClick={dismiss} aria-label="Close announcement" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-mist">
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <div className="p-5 sm:p-6">
              <h2 id={`${id}-title`} className="text-2xl leading-tight font-semibold tracking-tight break-words">{item.title}</h2>
              <p id={`${id}-message`} className="mt-3 text-sm leading-relaxed break-words whitespace-pre-line text-body">{item.message}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {item.linkUrl && item.linkLabel && (
                  <a href={item.linkUrl} onClick={dismiss} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-ink-soft">
                    {item.linkLabel} <ArrowRight aria-hidden className="size-4" />
                  </a>
                )}
                <button type="button" onClick={dismiss} className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-medium hover:bg-mist">
                  {preview ? "Close preview" : "Continue to site"}
                </button>
              </div>
            </div>
          </>
        )}
        {items.length > 1 && (
          <div className={item.image
            ? "absolute top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] flex items-center gap-2 rounded-full bg-black/65 px-2 text-white"
            : "flex items-center justify-between gap-3 border-t border-line px-5 py-3 sm:px-6"}>
            <button type="button" aria-label="Previous announcement" onClick={(event) => { event.stopPropagation(); setIndex(Math.max(0, currentIndex - 1)); }} disabled={currentIndex === 0}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm disabled:opacity-40 ${item.image ? "hover:bg-white/15" : "hover:bg-mist"}`}>
              <ArrowLeft aria-hidden className="size-4" /> {!item.image && "Previous"}
            </button>
            <span role="status" className={`text-xs ${item.image ? "text-white/80" : "text-muted"}`}>{currentIndex + 1} of {items.length}</span>
            <button type="button" aria-label="Next announcement" onClick={(event) => { event.stopPropagation(); setIndex(Math.min(items.length - 1, currentIndex + 1)); }} disabled={currentIndex === items.length - 1}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm disabled:opacity-40 ${item.image ? "hover:bg-white/15" : "hover:bg-mist"}`}>
              {!item.image && "Next"} <ArrowRight aria-hidden className="size-4" />
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
