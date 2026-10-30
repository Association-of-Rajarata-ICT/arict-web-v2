"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

function currentTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/**
 * Switches between light and dark. Both icons are rendered and CSS picks the
 * visible one, so the server HTML never disagrees with the client.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode): the choice lasts for this page only.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full text-ink/75 transition-colors hover:bg-black/5 hover:text-ink dark:hover:bg-white/10",
        className,
      )}
    >
      <Moon aria-hidden className="size-[18px] dark:hidden" />
      <Sun aria-hidden className="hidden size-[18px] dark:block" />
    </button>
  );
}
