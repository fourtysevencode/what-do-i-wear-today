"use client";

import { XIcon } from "@phosphor-icons/react/dist/ssr";
import { useOptimistic, useState, useTransition } from "react";

import { removeWardrobeGarmentColor } from "@/app/(app)/wardrobe/actions";
import type { GarmentColor } from "@/lib/garments";

const chip = "inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs";

function Dot({ hex }: { hex: string }) {
  return <span aria-hidden="true" className="size-3 rounded-full ring-1 ring-foreground/15" style={{ backgroundColor: hex }} />;
}

/** A garment's colour chips. When editable, each has a remove button that hides it at once. */
export function GarmentColors({
  garmentId,
  colors,
  editable = false,
}: {
  garmentId: string;
  colors: GarmentColor[];
  editable?: boolean;
}) {
  const [shown, hide] = useOptimistic(colors, (current, name: string) => current.filter((color) => color.name !== name));
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function remove(name: string) {
    setError(null);
    startTransition(async () => {
      hide(name);
      const result = await removeWardrobeGarmentColor(garmentId, name);
      if (!result.ok) setError(result.message ?? "Couldn't remove the colour.");
    });
  }

  if (shown.length === 0 && !error) return null;

  return (
    <div className="mt-3 px-1">
      <ul aria-label="Colours" className="flex flex-wrap gap-1.5">
        {shown.map((color) =>
          editable ? (
            <li key={color.name} className={`${chip} pr-1`} title={`${color.percentage}%`}>
              <Dot hex={color.hex} />
              {color.name}
              <button
                type="button"
                onClick={() => remove(color.name)}
                aria-label={`Remove colour ${color.name}`}
                className="-my-0.5 flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <XIcon aria-hidden="true" className="size-3" weight="bold" />
              </button>
            </li>
          ) : (
            <li key={color.name} className={chip} title={`${color.percentage}%`}>
              <Dot hex={color.hex} />
              {color.name}
            </li>
          ),
        )}
      </ul>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
