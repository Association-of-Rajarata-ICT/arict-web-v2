"use client";

import { useEffect, useRef } from "react";
import { Button } from "./button";
import { FormMessage } from "./form";

/** Keeps an inline form closed even after its success notification expires. */
export function FormComplete({ message, reopenLabel, onReopen }: {
  message?: string;
  reopenLabel: string;
  onReopen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div ref={ref} tabIndex={-1} className="space-y-4">
      {message && <FormMessage tone="success">{message}</FormMessage>}
      <Button type="button" variant="outline" size="sm" onClick={onReopen}>{reopenLabel}</Button>
    </div>
  );
}
