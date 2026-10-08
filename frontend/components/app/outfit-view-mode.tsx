"use client";

import { PersonSimpleIcon, SquaresFourIcon } from "@phosphor-icons/react/dist/ssr";
import { useSyncExternalStore, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Mode = "grid" | "stacked";

const STORAGE_KEY = "outfit-view";
const CHANGE_EVENT = "outfitviewchange";

function readMode(): Mode {
  try {
    return localStorage.getItem(STORAGE_KEY) === "stacked" ? "stacked" : "grid";
  } catch {
    return "grid";
  }
}

function setMode(mode: Mode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage blocked: the choice still applies until the page reloads.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function useMode() {
  return useSyncExternalStore(subscribe, readMode, () => "grid" as const);
}

/**
 * Wraps outfits so <OutfitPieces> inside can show the chosen view with CSS only
 * (both layouts render; `data-view` picks one), so it also works for server-rendered lists.
 */
export function OutfitViewArea({ children, className }: { children: ReactNode; className?: string }) {
  const mode = useMode();
  return (
    <div data-view={mode} className={cn("group/view", className)}>
      {children}
    </div>
  );
}

const options = [
  { value: "grid", label: "Grid", Icon: SquaresFourIcon },
  { value: "stacked", label: "Stacked", Icon: PersonSimpleIcon },
] as const;

/** Grid vs. stacked top-to-toe, remembered across visits. */
export function OutfitViewToggle({ className }: { className?: string }) {
  const mode = useMode();
  return (
    <div role="group" aria-label="Outfit view" className={cn("inline-flex items-center gap-0.5 rounded-full bg-secondary p-1", className)}>
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={mode === value}
          onClick={() => setMode(value)}
          className="flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground transition-[background-color,color,box-shadow] duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-print"
        >
          <Icon aria-hidden="true" className="size-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
