"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FORM_NOTIFICATION_DURATION_MS } from "@/lib/form-feedback";

/** Mount with a new key when a new notification replaces the current one. */
export function AutoDismiss({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), FORM_NOTIFICATION_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return visible ? children : null;
}
