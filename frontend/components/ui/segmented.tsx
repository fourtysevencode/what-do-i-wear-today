"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import type { Icon } from "@phosphor-icons/react";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: Icon;
};

type SegmentedProps<T extends string> = {
  /** Names the group for assistive tech. */
  label: string;
  value: T | null;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  /** Icons only; each label becomes the button's accessible name. */
  iconOnly?: boolean;
  className?: string;
};

/**
 * A segmented control: one thumb slides to the chosen segment, the way iOS does it,
 * instead of one highlight fading out while another fades in. Segments share the width
 * equally, so the thumb's position is just its index. Arrow keys move between segments.
 */
export function Segmented<T extends string>({ label, value, onChange, options, iconOnly = false, className }: SegmentedProps<T>) {
  const index = options.findIndex((option) => option.value === value);

  return (
    <ToggleGroup
      aria-label={label}
      value={value ? [value] : []}
      // A single-choice group never clears: pressing the chosen segment again keeps it.
      onValueChange={(next) => next[0] && onChange(next[0] as T)}
      className={cn(
        "relative isolate inline-grid auto-cols-fr grid-flow-col items-center rounded-full bg-secondary p-1",
        className,
      )}
      style={{ "--count": options.length, "--index": Math.max(index, 0) } as CSSProperties}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-1 left-1 -z-10 w-[calc((100%-0.5rem)/var(--count))] translate-x-[calc(var(--index)*100%)] rounded-full bg-card shadow-card ring-1 ring-border transition-[translate,opacity] duration-200 ease-out motion-reduce:transition-none",
          index < 0 && "opacity-0",
        )}
      />
      {options.map(({ value: optionValue, label: optionLabel, icon: OptionIcon }) => (
        <Toggle
          key={optionValue}
          value={optionValue}
          aria-label={iconOnly ? optionLabel : undefined}
          title={iconOnly ? optionLabel : undefined}
          className={cn(
            "flex h-8 items-center justify-center gap-1.5 rounded-full text-sm font-medium text-muted-foreground transition-[color,scale] duration-150 select-none",
            "hover:text-foreground active:scale-[0.96] data-pressed:text-foreground",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
            iconOnly ? "w-8" : "px-3",
          )}
        >
          {OptionIcon && <OptionIcon aria-hidden="true" className="size-4" weight={value === optionValue ? "fill" : "regular"} />}
          {!iconOnly && optionLabel}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
