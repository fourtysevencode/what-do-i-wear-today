"use client";

import { PersonSimpleIcon, SquaresFourIcon } from "@phosphor-icons/react/dist/ssr";
import { useSyncExternalStore, type ReactNode } from "react";
import { flushSync } from "react-dom";

import { Segmented } from "@/components/ui/segmented";
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

/**
 * Switching layouts morphs each piece from its grid cell to its place in the stack
 * (pieces carry matching view-transition names; see OutfitPieces). The DOM has to
 * change inside the transition callback, hence flushSync.
 */
function setMode(mode: Mode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage blocked: the choice still applies until the page reloads.
  }
  const swap = () => flushSync(() => window.dispatchEvent(new Event(CHANGE_EVENT)));
  if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.startViewTransition(swap);
  } else {
    swap();
  }
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
  { value: "grid", label: "Grid", icon: SquaresFourIcon },
  { value: "stacked", label: "Stacked", icon: PersonSimpleIcon },
] as const;

/** Grid vs. stacked top-to-toe, remembered across visits. */
export function OutfitViewToggle({ className }: { className?: string }) {
  const mode = useMode();
  return <Segmented label="Outfit view" value={mode} onChange={setMode} options={options} className={className} />;
}
