import { ImageIcon } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type { Swatch } from "@/lib/wardrobe";

export const swatchClass: Record<Swatch, string> = {
  sage: "bg-sage",
  clay: "bg-clay",
  chambray: "bg-chambray",
  butter: "bg-butter",
};

type GarmentPrintProps = {
  garment: { name: string; kind: string; swatch?: Swatch; photo?: { src: string; position?: string } };
  /** The cutout image. Without it, the garment's photo (or a tinted block) stands in. */
  src?: string;
  /** Load straight away instead of lazily (for prints in the first screen). */
  eager?: boolean;
  showCaption?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * A garment as a lookbook card: the piece on a soft ground, its name, and what it's worn as.
 * Shows the cutout when `src` is given, otherwise the demo photo or a tinted block.
 */
export function GarmentPrint({
  garment,
  src,
  eager = false,
  showCaption = true,
  className,
  style,
}: GarmentPrintProps) {
  const ground = "relative aspect-4/5 overflow-hidden rounded-[calc(var(--radius-card)-0.375rem)]";
  return (
    <figure
      className={cn(
        "@container rounded-(--radius-card) bg-card p-1.5 text-card-foreground shadow-card ring-1 ring-border",
        className,
      )}
      style={style}
    >
      {src ? (
        <div className={cn(ground, "bg-secondary")}>
          {/* Plain <img>: the src is an authenticated route that redirects to a signed link,
              which the image optimizer couldn't fetch without the user's cookie. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 size-full object-contain p-[9%] drop-shadow-[0_12px_14px_oklch(0.2_0.04_262/0.2)]"
          />
        </div>
      ) : garment.photo ? (
        <div className={cn(ground, swatchClass[garment.swatch ?? "clay"])}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={garment.photo.src}
            alt=""
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className="absolute inset-0 size-full object-cover"
            style={{ objectPosition: garment.photo.position }}
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          data-placeholder="garment-photo"
          className={cn(ground, "flex items-center justify-center text-swatch-ink/60", swatchClass[garment.swatch ?? "clay"])}
        >
          <ImageIcon className="size-[18%] min-h-5 min-w-5" />
        </div>
      )}
      {showCaption ? (
        <figcaption className="flex items-baseline justify-between gap-2 px-1.5 pt-2 pb-1">
          <span className="min-w-0 truncate text-sm font-medium">{garment.name}</span>
          {/* The kind only shows when the card is wide enough for both. */}
          <span className="type-eyebrow hidden shrink-0 text-[0.6875rem] text-muted-foreground @[10.5rem]:inline">
            {garment.kind}
          </span>
        </figcaption>
      ) : (
        <figcaption className="sr-only">{garment.name}</figcaption>
      )}
    </figure>
  );
}
