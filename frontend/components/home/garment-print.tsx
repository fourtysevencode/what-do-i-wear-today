import Image from "next/image";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type { Garment } from "@/lib/wardrobe";

type GarmentPrintProps = {
  garment: Garment;
  /** Rendered width hint for next/image, e.g. "(min-width: 768px) 240px, 45vw". */
  sizes: string;
  showCaption?: boolean;
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** A garment cutout on a light card, like a print pinned to a board. */
export function GarmentPrint({
  garment,
  sizes,
  showCaption = true,
  eager = false,
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
      <div className="relative aspect-4/5">
        <Image
          src={garment.image}
          alt={garment.alt}
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          className="drop-cutout absolute inset-0 size-full object-contain p-[9%]"
        />
      </div>
      {showCaption && (
        <figcaption className="flex items-baseline justify-between gap-2 px-1.5 pt-1 pb-1 text-[13px] leading-tight">
          <span className="min-w-0 truncate font-medium">{garment.name}</span>
          {/* The type tag only shows when the print is wide enough for both. */}
          <span className="hidden text-print-foreground/65 capitalize @[11.5rem]:inline">
            {garment.kind}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
