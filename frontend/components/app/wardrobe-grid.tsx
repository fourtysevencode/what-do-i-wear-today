import type { ReactNode } from "react";

import { RemoveGarment } from "@/components/app/remove-garment";
import { GarmentPrint } from "@/components/home/garment-print";
import { displayName, kindOf } from "@/lib/garment-kinds";
import type { StoredGarment } from "@/lib/garments";

type WardrobeGridProps = {
  garments: StoredGarment[];
  empty: ReactNode;
  /** Show a remove control on each piece (your own wardrobe only). */
  removable?: boolean;
};

export function WardrobeGrid({ garments, empty, removable = false }: WardrobeGridProps) {
  if (garments.length === 0) return <>{empty}</>;

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 2xl:grid-cols-4">
      {garments.map((garment) => (
        <li key={garment.id} className="group min-w-0">
          <div className="relative">
            <GarmentPrint
              garment={{ name: displayName(garment.label), kind: kindOf(garment.label) }}
              src={`/api/garments/${garment.id}/image`}
            />
            {removable && <RemoveGarment id={garment.id} name={displayName(garment.label)} />}
          </div>
          {garment.colors.length > 0 && (
            <ul aria-label="Colours" className="mt-3 flex flex-wrap gap-1.5 px-1">
              {garment.colors.map((color) => (
                <li
                  key={color.name}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs"
                  title={`${color.percentage}%`}
                >
                  <span
                    aria-hidden="true"
                    className="size-3 rounded-full ring-1 ring-foreground/15"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export function WardrobeGridSkeleton() {
  return (
    <ul aria-hidden="true" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 2xl:grid-cols-4">
      {[0, 1, 2].map((i) => (
        <li key={i} className="animate-pulse motion-reduce:animate-none">
          <div className="rounded-(--radius-print) bg-print p-2.5 shadow-print">
            <div className="aspect-4/5 rounded-[calc(var(--radius-print)-0.5rem)] bg-muted" />
            <div className="mt-3 mb-1 h-3.5 w-2/3 rounded-full bg-muted" />
          </div>
          <div className="mt-3 h-6 w-1/2 rounded-full bg-muted" />
        </li>
      ))}
    </ul>
  );
}
