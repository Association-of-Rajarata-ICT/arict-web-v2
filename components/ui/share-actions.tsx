"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { FacebookIcon, LinkedinIcon } from "./social-icons";

export function ShareActions({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection must wait for the browser
  useEffect(() => setCanShare("share" in navigator), []);
  const enc = encodeURIComponent;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  const btn =
    "inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface text-ink/70 transition-colors hover:border-ink/20 hover:text-ink";

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-sm text-muted">Share</span>
      {canShare && (
        <button type="button" className={btn} aria-label="Share" onClick={() => navigator.share({ title, url }).catch(() => {})}>
          <Share2 className="size-4" aria-hidden />
        </button>
      )}
      <a className={btn} href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
        <FacebookIcon width={16} height={16} />
      </a>
      <a className={btn} href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
        <LinkedinIcon width={16} height={16} />
      </a>
      <a className={btn} href={`https://wa.me/?text=${enc(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
          <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47a9.47 9.47 0 0 1 9.47 9.48c0 5.22-4.25 9.46-9.47 9.46Zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.66 5.73.66 12c0 2.01.52 3.97 1.52 5.69L.57 23.37l5.82-1.53a11.35 11.35 0 0 0 5.64 1.44h.01c6.27 0 11.37-5.1 11.37-11.37 0-3.04-1.18-5.9-3.32-8.04Z" />
        </svg>
      </a>
      <button type="button" className={btn} onClick={copy} aria-label={copied ? "Link copied" : "Copy link"}>
        {copied ? <Check className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
