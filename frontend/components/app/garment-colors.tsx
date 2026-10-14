"use client";

import { XIcon } from "@phosphor-icons/react/dist/ssr";

import { removeWardrobeGarmentColor } from "@/app/(app)/wardrobe/actions";
import type { GarmentColor } from "@/lib/garments";
import { removeWithUndo, useHiddenKeys } from "@/lib/undoable";
import { cn } from "@/lib/utils";

const colorKey = (garmentId: string, name: string) => `color:${garmentId}:${name}`;

function Dot({ hex, className }: { hex: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-3 shrink-0 rounded-full ring-1 ring-foreground/15 ring-inset", className)}
      style={{ backgroundColor: hex }}
    />
  );
}

/** The colours still shown for a piece, minus any the owner just removed. */
function useShownColors(garmentId: string, colors: GarmentColor[]) {
  const hidden = useHiddenKeys();
  return colors.filter((color) => !hidden.has(colorKey(garmentId, color.name)));
}

/** A compact row of dots under a card. */
export function ColorDots({ garmentId, colors }: { garmentId: string; colors: GarmentColor[] }) {
  const shown = useShownColors(garmentId, colors);
  if (shown.length === 0) return null;
  return (
    <p className="mt-2 flex items-center gap-1 px-1.5" title={shown.map((color) => color.name).join(", ")}>
      {shown.slice(0, 5).map((color) => (
        <Dot key={color.name} hex={color.hex} className="size-2.5" />
      ))}
      <span className="sr-only">Colours: {shown.map((color) => color.name).join(", ")}</span>
    </p>
  );
}

/**
 * A piece's colour chips. When editable each has a remove button: the colour disappears
 * at once and a toast offers Undo before anything is saved.
 */
export function ColorChips({
  garmentId,
  colors,
  editable = false,
}: {
  garmentId: string;
  colors: GarmentColor[];
  editable?: boolean;
}) {
  const shown = useShownColors(garmentId, colors);
  if (shown.length === 0) return <p className="text-sm text-muted-foreground">No colours found.</p>;

  return (
    <ul aria-label="Colours" className="flex flex-wrap gap-2">
      {shown.map((color) => (
        <li
          key={color.name}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full bg-secondary pl-3 text-sm",
            editable ? "pr-1" : "pr-3.5",
          )}
          title={`${color.percentage}%`}
        >
          <Dot hex={color.hex} />
          {color.name}
          {editable && (
            <button
              type="button"
              onClick={() =>
                removeWithUndo({
                  key: colorKey(garmentId, color.name),
                  title: `Removed ${color.name.toLowerCase()}`,
                  commit: () => removeWardrobeGarmentColor(garmentId, color.name),
                  failure: "Couldn't remove the colour.",
                })
              }
              aria-label={`Remove colour ${color.name}`}
              // 28px to see, 44px to hit.
              className="relative flex size-7 items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,scale] duration-150 before:absolute before:-inset-2 hover:bg-foreground/10 hover:text-foreground active:scale-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <XIcon aria-hidden="true" className="size-3.5" weight="bold" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
