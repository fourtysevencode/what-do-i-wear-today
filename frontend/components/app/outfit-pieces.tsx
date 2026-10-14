import type { CSSProperties } from "react";

import { GarmentPrint } from "@/components/home/garment-print";
import { byWearOrder, kindOf, pieceName } from "@/lib/garment-kinds";
import type { GarmentColor } from "@/lib/garments";
import { cn } from "@/lib/utils";

export type Piece = { id: string; label: string; name: string | null; kind: string | null; colors: GarmentColor[] };

type OutfitPiecesProps = {
  pieces: Piece[];
  /** Unique on the page (an outfit id, "studio", "you"…), so each piece's morph name is too. */
  scope: string;
  /** Smaller prints, for side-by-side matching outfits and saved lists. */
  compact?: boolean;
};

/**
 * The same piece in both layouts carries the same view-transition name, so switching
 * Grid ↔ Stacked moves each piece from one spot to the other (the hidden layout is
 * display: none and doesn't take part).
 */
const morph = (scope: string, id: string) =>
  ({ viewTransitionName: `piece-${scope}-${id}`.replace(/[^a-zA-Z0-9-]/g, ""), viewTransitionClass: "morph" }) as CSSProperties;

/**
 * One outfit in both layouts: a grid, and stacked top-to-toe as it'd be worn.
 * The nearest <OutfitViewArea> decides which one shows.
 */
export function OutfitPieces({ pieces, scope, compact = false }: OutfitPiecesProps) {
  if (pieces.length === 0) {
    return <p className="text-sm text-muted-foreground">These pieces are no longer in the wardrobe.</p>;
  }
  const worn = byWearOrder(pieces);

  return (
    <>
      <ul
        aria-label="Outfit pieces"
        className={cn(
          "grid gap-3 group-data-[view=stacked]/view:hidden",
          compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
        )}
      >
        {pieces.map((piece) => (
          <li key={piece.id} className="min-w-0" style={morph(scope, piece.id)}>
            <GarmentPrint garment={{ name: pieceName(piece), kind: kindOf(piece) }} src={`/api/garments/${piece.id}/image`} />
          </li>
        ))}
      </ul>

      {/* Top to toe in a single column, the order it's worn; pieces never overlap. */}
      <ol aria-label="Outfit, as worn" className="hidden flex-col items-center gap-4 pb-2 group-data-[view=stacked]/view:flex">
        {worn.map((piece, i) => (
          <li
            key={piece.id}
            className={cn(compact ? "w-[min(12rem,78%)]" : "w-[min(15rem,70%)]")}
            style={{ ...morph(scope, piece.id), rotate: i % 2 ? "1deg" : "-1deg" }}
          >
            <GarmentPrint garment={{ name: pieceName(piece), kind: kindOf(piece) }} src={`/api/garments/${piece.id}/image`} />
          </li>
        ))}
      </ol>
    </>
  );
}
