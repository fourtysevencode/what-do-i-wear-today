import { ImageIcon } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type { Swatch } from "@/lib/wardrobe";

const swatchClass: Record<Swatch, string> = {
  rose: "bg-rose",
  peach: "bg-peach",
  orchid: "bg-orchid",
};

type GarmentPrintProps = {
  garment: { name: string; kind: string; swatch?: Swatch };
  /** The cutout image. Without it, a tinted block stands in for the photo. */
  src?: string;
  showCaption?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * A garment card, like a print pinned to a board. Shows the cutout when `src`
 * is given, otherwise a tinted placeholder block.
 */
export function GarmentPrint({
  garment,
  src,
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
      {src ? (
        <div className="relative aspect-4/5 rounded-[calc(var(--radius-print)-0.5rem)] bg-secondary/60">
          {/* Plain <img>: the src is an authenticated route that redirects to a signed link,
              which the image optimizer couldn't fetch without the user's cookie. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-contain p-[8%] drop-shadow-[0_10px_12px_oklch(0.25_0.05_320/0.22)]"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          data-placeholder="garment-photo"
          className={cn(
            "flex aspect-4/5 items-center justify-center rounded-[calc(var(--radius-print)-0.5rem)] text-swatch-ink/70",
            swatchClass[garment.swatch ?? "peach"],
          )}
        >
          <ImageIcon className="size-[18%] min-h-5 min-w-5" />
        </div>
      )}
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
