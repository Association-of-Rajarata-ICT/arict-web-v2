"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-mono text-sm tracking-[0.3em] text-brand">ERROR</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Something went wrong.</h1>
      <p className="mt-5 max-w-md text-lg text-muted">
        We couldn&apos;t load this page. Please try again in a moment.
      </p>
      {error.digest && <p className="mt-3 font-mono text-xs text-muted">Reference: {error.digest}</p>}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button variant="dark" size="lg" onClick={reset}>
          <RotateCcw aria-hidden className="size-4" /> Try again
        </Button>
        <Link href="/" className="inline-flex h-12 items-center rounded-full border border-line px-6 text-[15px] font-medium hover:bg-mist">
          Back to home
        </Link>
      </div>
    </main>
  );
}
