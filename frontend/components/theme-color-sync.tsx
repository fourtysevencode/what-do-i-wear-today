"use client";

import { useEffect } from "react";

import { applyTheme, readTheme, THEME_CHANGE_EVENT, THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Mounted once at the root: points the phone status bar at a saved theme on load, and
 * applies a theme chosen in another tab to this one.
 */
export function ThemeColorSync() {
  useEffect(() => {
    applyTheme(readTheme());

    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
      applyTheme(readTheme());
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
