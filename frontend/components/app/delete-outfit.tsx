"use client";

import { TrashIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

import { deleteSavedOutfit } from "@/app/(app)/outfits/actions";
import { Button } from "@/components/ui/button";
import { removeWithUndo, useHiddenKeys } from "@/lib/undoable";

const outfitKey = (id: string) => `outfit:${id}`;

/** Delete a saved outfit: it goes at once, with Undo in a toast for a few seconds. */
export function DeleteOutfit({ id, title }: { id: string; title: string }) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Delete ${title}`}
      title="Delete"
      onClick={() =>
        removeWithUndo({
          key: outfitKey(id),
          title: "Outfit deleted",
          description: title,
          commit: () => deleteSavedOutfit(id),
          failure: "Couldn't delete it.",
        })
      }
    >
      <TrashIcon aria-hidden="true" />
    </Button>
  );
}

/** Hides a saved outfit's card while its deletion can still be undone. */
export function OutfitCardShell({ id, children }: { id: string; children: ReactNode }) {
  const hidden = useHiddenKeys();
  if (hidden.has(outfitKey(id))) return null;
  return children;
}
