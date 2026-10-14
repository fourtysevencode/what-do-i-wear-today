"use client";

import { startTransition, useState, ViewTransition, type CSSProperties, type ReactNode } from "react";

import { ColorDots } from "@/components/app/garment-colors";
import { garmentKey, PieceSheet } from "@/components/app/piece-sheet";
import { GarmentPrint } from "@/components/home/garment-print";
import { kindOf, pieceName } from "@/lib/garment-kinds";
import type { StoredGarment } from "@/lib/garments";
import { useHiddenKeys } from "@/lib/undoable";
import { cn } from "@/lib/utils";

const FILTERS = [
  { kind: "top", label: "Tops" },
  { kind: "bottom", label: "Bottoms" },
  { kind: "outerwear", label: "Outerwear" },
  { kind: "dress", label: "Dresses" },
  { kind: "piece", label: "Other" },
];

const gridClass = "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 2xl:grid-cols-4";

type WardrobeGridProps = {
  garments: StoredGarment[];
  empty: ReactNode;
  /** Your own wardrobe: cards open an editor. Otherwise they open a read-only view. */
  editable?: boolean;
};

export function WardrobeGrid({ garments, empty, editable = false }: WardrobeGridProps) {
  const hidden = useHiddenKeys();
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Pieces that weren't there on first render (just added) get an entrance.
  const [initialIds] = useState(() => new Set(garments.map((garment) => garment.id)));

  const visible = garments.filter((garment) => !hidden.has(garmentKey(garment.id)));
  if (visible.length === 0) return <>{empty}</>;

  const counts = new Map<string, number>();
  for (const garment of visible) counts.set(kindOf(garment), (counts.get(kindOf(garment)) ?? 0) + 1);
  const filters = FILTERS.filter(({ kind }) => counts.has(kind));
  // Removing the last piece of a kind falls back to everything.
  const active = filter !== "all" && counts.has(filter) ? filter : "all";
  const shown = active === "all" ? visible : visible.filter((garment) => kindOf(garment) === active);
  const selected = garments.find((garment) => garment.id === selectedId) ?? null;

  // Filtering is instant (no round trip); a transition lets the grid cross-fade.
  const choose = (kind: string) => startTransition(() => setFilter(kind));

  return (
    <>
      {filters.length > 1 && (
        <div
          role="group"
          aria-label="Show"
          className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {[{ kind: "all", label: "All" }, ...filters].map(({ kind, label }) => (
            <button
              key={kind}
              type="button"
              aria-pressed={active === kind}
              onClick={() => choose(kind)}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-card px-4 text-sm font-medium text-muted-foreground ring-1 ring-border ring-inset transition-[background-color,color,scale] duration-150 hover:text-foreground active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:ring-transparent"
            >
              {label}
              <span className="text-xs tabular-nums opacity-60">{kind === "all" ? visible.length : counts.get(kind)}</span>
            </button>
          ))}
        </div>
      )}

      <ViewTransition key={active} enter="swap" exit="swap" default="none">
        <ul className={gridClass}>
          {shown.map((garment, i) => {
            const name = pieceName(garment);
            const isNew = !initialIds.has(garment.id);
            return (
              <li
                key={garment.id}
                className={cn("min-w-0", isNew && "enter-rise")}
                style={isNew ? ({ "--delay": `${Math.min(i, 8) * 40}ms` } as CSSProperties) : undefined}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(garment.id);
                    setSheetOpen(true);
                  }}
                  className="group block w-full rounded-(--radius-card) text-left transition-[scale] duration-150 ease-out active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                >
                  <GarmentPrint
                    garment={{ name, kind: kindOf(garment) }}
                    src={`/api/garments/${garment.id}/image`}
                    className="transition-[box-shadow,translate] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lift"
                  />
                  <span className="sr-only">{editable ? ", edit" : ", details"}</span>
                </button>
                <ColorDots garmentId={garment.id} colors={garment.colors} />
              </li>
            );
          })}
        </ul>
      </ViewTransition>

      <PieceSheet garment={selected} open={sheetOpen} onOpenChange={setSheetOpen} editable={editable} />
    </>
  );
}

export function WardrobeGridSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
      <div className="mb-6 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 w-20 rounded-full bg-muted" />
        ))}
      </div>
      <ul className={gridClass}>
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <div className="rounded-(--radius-card) bg-card p-1.5 ring-1 ring-border">
              <div className="aspect-4/5 rounded-[calc(var(--radius-card)-0.375rem)] bg-muted" />
              <div className="mx-1.5 mt-3 mb-1.5 h-3.5 w-2/3 rounded-full bg-muted" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
