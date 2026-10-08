import type { ReactNode } from "react";

import { GarmentColors } from "@/components/app/garment-colors";
import { RemoveGarment } from "@/components/app/remove-garment";
import { RenameGarment } from "@/components/app/rename-garment";
import { GarmentPrint } from "@/components/home/garment-print";
import { kindOf, pieceName } from "@/lib/garment-kinds";
import type { StoredGarment } from "@/lib/garments";

type WardrobeGridProps = {
  garments: StoredGarment[];
  empty: ReactNode;
  /** Show rename, remove and colour controls on each piece (your own wardrobe only). */
  editable?: boolean;
};

export function WardrobeGrid({ garments, empty, editable = false }: WardrobeGridProps) {
  if (garments.length === 0) return <>{empty}</>;

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 2xl:grid-cols-4">
      {garments.map((garment) => {
        const name = pieceName(garment);
        return (
          <li key={garment.id} className="group min-w-0">
            <div className="relative">
              <GarmentPrint garment={{ name, kind: kindOf(garment.label) }} src={`/api/garments/${garment.id}/image`} />
              {editable && <RenameGarment id={garment.id} name={name} customName={garment.name} />}
              {editable && <RemoveGarment id={garment.id} name={name} />}
            </div>
            <GarmentColors garmentId={garment.id} colors={garment.colors} editable={editable} />
          </li>
        );
      })}
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
