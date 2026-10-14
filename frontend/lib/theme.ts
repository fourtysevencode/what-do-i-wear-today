"use client";

import { flushSync } from "react-dom";

import { THEME_COLOR } from "@/lib/theme-color";

export type Theme = "system" | "light" | "dark";

// Must match the inline script in app/layout.tsx.
export const THEME_STORAGE_KEY = "theme";
export const THEME_CHANGE_EVENT = "themechange";

export function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

/**
 * Next renders one theme-color tag per OS scheme. A forced theme must win over the OS,
 * so point both tags at the forced colour; "system" restores each tag's own colour.
 */
function syncThemeColor(theme: Theme) {
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    const ownScheme = meta.media.includes("dark") ? "dark" : "light";
    meta.content = THEME_COLOR[theme === "system" ? ownScheme : theme];
  });
}

/** "system" removes the override so the OS preference (via CSS media query) applies. */
export function applyTheme(theme: Theme) {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
  syncThemeColor(theme);
}

export function setTheme(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private mode): the choice still applies for this page view.
  }

  const swap = () => {
    applyTheme(theme);
    // Re-render the toggles inside the same frame the colours change.
    flushSync(() => window.dispatchEvent(new Event(THEME_CHANGE_EVENT)));
  };

  // Cross-fade the whole page so every colour changes together, instead of the page
  // snapping while individual controls fade their own colours on different timers.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (document.startViewTransition && !reduce) document.startViewTransition(swap);
  else swap();
}

export function subscribeTheme(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
}
