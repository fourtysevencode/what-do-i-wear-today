"use client";

import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

type Theme = "system" | "light" | "dark";

// Must match the inline script in app/layout.tsx.
const STORAGE_KEY = "theme";
const CHANGE_EVENT = "themechange";

const options = [
  { value: "system", label: "System", Icon: DesktopIcon },
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
] as const;

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

/** "system" removes the override so the OS preference (via CSS media query) applies. */
function applyTheme(theme: Theme) {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
}

function setTheme(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private mode): the choice still applies for this page view.
  }
  applyTheme(theme);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  // Another tab changed the theme: apply it here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    applyTheme(readTheme());
    onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

type ThemeToggleProps = {
  /** Show text next to the icons (roomier spots like the Account page). */
  showLabels?: boolean;
  className?: string;
};

export function ThemeToggle({ showLabels = false, className }: ThemeToggleProps) {
  // The server can't know the saved choice, so it renders "system"; the client corrects it after hydrating.
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as const);

  return (
    <div role="group" aria-label="Theme" className={cn("inline-flex items-center gap-0.5 rounded-full bg-secondary p-1", className)}>
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          aria-label={showLabels ? undefined : `${label} theme`}
          title={showLabels ? undefined : `${label} theme`}
          onClick={() => setTheme(value)}
          className={cn(
            "flex h-8 items-center justify-center gap-1.5 rounded-full text-sm font-medium text-muted-foreground transition-[background-color,color,box-shadow] duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-print",
            showLabels ? "px-3" : "w-8",
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
          {showLabels && label}
        </button>
      ))}
    </div>
  );
}
