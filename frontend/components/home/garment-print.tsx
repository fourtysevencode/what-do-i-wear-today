import { ImageIcon } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type { Garment, Swatch } from "@/lib/wardrobe";

const swatchClass: Record<Swatch, string> = {
  rose: "bg-rose",
  peach: "bg-peach",
  orchid: "bg-orchid",
};

type GarmentPrintProps = {
  garment: Garment;
  showCaption?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * A garment card, like a print pinned to a board. The tinted block is a
 * placeholder for the garment photo.
 */
export function GarmentPrint({
  garment,
  showCaption = true,
  className,
  style,
}: GarmentPrintProps) {
  return (
    <figure
      className={cn(
        "@container rounded-(--radius-print) bg-print p-2.5 text-print-foreground shadow-print",
        className,
      )}
      style={style}
    >
      <div
        aria-hidden="true"
        data-placeholder="garment-photo"
        className={cn(
          "flex aspect-4/5 items-center justify-center rounded-[calc(var(--radius-print)-0.5rem)] text-swatch-ink/70",
          swatchClass[garment.swatch],
        )}
      >
        <ImageIcon className="size-[18%] min-h-5 min-w-5" />
      </div>
      {showCaption ? (
        <figcaption className="flex items-baseline justify-between gap-2 px-1.5 pt-2.5 pb-1 text-[13px] leading-tight">
          <span className="min-w-0 truncate font-medium">{garment.name}</span>
          {/* The type tag only shows when the print is wide enough for both. */}
          <span className="hidden text-print-foreground/65 capitalize @[11.5rem]:inline">
            {garment.kind}
          </span>
        </figcaption>
      ) : (
        <figcaption className="sr-only">{garment.name}</figcaption>
      )}
    </figure>
  );
}
