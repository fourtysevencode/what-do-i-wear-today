"use client";

import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { useSyncExternalStore } from "react";

import { Segmented } from "@/components/ui/segmented";
import { readTheme, setTheme, subscribeTheme, type Theme } from "@/lib/theme";

const options = [
  { value: "system", label: "System", icon: DesktopIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
] as const;

type ThemeToggleProps = {
  /** Show text next to the icons (roomier spots like the Account page). */
  showLabels?: boolean;
  className?: string;
};

export function ThemeToggle({ showLabels = false, className }: ThemeToggleProps) {
  // The server can't know the saved choice, so it renders nothing selected; the client fills it in.
  const theme = useSyncExternalStore<Theme | null>(subscribeTheme, readTheme, () => null);

  return (
    <Segmented
      label="Theme"
      value={theme}
      onChange={setTheme}
      options={options}
      iconOnly={!showLabels}
      className={className}
    />
  );
}
