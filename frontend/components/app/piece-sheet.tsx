"use client";

import { TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { useId, useState, useTransition } from "react";

import { removeGarment, updateWardrobeGarment } from "@/app/(app)/wardrobe/actions";
import { ColorChips } from "@/components/app/garment-colors";
import { Spinner } from "@/components/app/spinner";
import { input, label as labelClass } from "@/components/app/styles";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { toastManager } from "@/components/ui/toaster";
import { detectedKind, KINDS, kindOf, MAX_NAME_LENGTH, pieceName, type Kind } from "@/lib/garment-kinds";
import type { StoredGarment } from "@/lib/garments";
import { removeWithUndo } from "@/lib/undoable";

const kindOptions = KINDS.map((kind) => ({ value: kind, label: kind.charAt(0).toUpperCase() + kind.slice(1) }));

export const garmentKey = (id: string) => `garment:${id}`;

type PieceSheetProps = {
  garment: StoredGarment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Your own wardrobe: rename, set how it's worn, edit colours, remove. */
  editable: boolean;
};

/** One piece, large: tap a card to open it. Editing lives here instead of over the card. */
export function PieceSheet({ garment, open, onOpenChange, editable }: PieceSheetProps) {
  // Keep showing the last piece while the sheet animates closed.
  const [shown, setShown] = useState(garment);
  if (garment && garment !== shown) setShown(garment);
  if (!shown) return null;

  const name = pieceName(shown);
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={name} description={kindOf(shown)} hideTitle>
      <div className="flex flex-col gap-6 px-5 pt-1 sm:px-6">
        <div className="relative mx-auto aspect-4/5 w-[min(15rem,46%)] overflow-hidden rounded-(--radius-card) bg-secondary sm:w-[min(17rem,60%)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/garments/${shown.id}/image`}
            alt={name}
            className="absolute inset-0 size-full object-contain p-[9%] drop-shadow-[0_14px_16px_oklch(0.2_0.04_262/0.22)]"
          />
        </div>

        {editable ? (
          // Keyed by piece so the fields reset when a different piece opens.
          <PieceEditor key={shown.id} garment={shown} onDone={() => onOpenChange(false)} />
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="type-eyebrow text-muted-foreground">{kindOf(shown)}</p>
              <p className="type-heading mt-1">{name}</p>
            </div>
            <ColorChips garmentId={shown.id} colors={shown.colors} />
          </div>
        )}
      </div>
    </Sheet>
  );
}

function PieceEditor({ garment, onDone }: { garment: StoredGarment; onDone: () => void }) {
  const fieldId = useId();
  const [value, setValue] = useState(garment.name ?? "");
  const [kind, setKind] = useState<Kind | "piece">(kindOf(garment) as Kind | "piece");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const detected = detectedKind(garment.label);
  const name = pieceName(garment);
  const changed = value.trim() !== (garment.name ?? "") || kind !== kindOf(garment);

  function save() {
    if (!changed || kind === "piece") return onDone();
    setError(null);
    startTransition(async () => {
      const result = await updateWardrobeGarment(garment.id, garment.label, value, kind);
      if (!result.ok) {
        setError(result.message ?? "Couldn't save it. Try again.");
        return;
      }
      onDone();
      toastManager.add({ type: "success", title: "Saved", timeout: 2500 });
    });
  }

  function remove() {
    onDone();
    removeWithUndo({
      key: garmentKey(garment.id),
      title: `Removed ${name.toLowerCase()}`,
      description: "The photo goes too.",
      commit: () => removeGarment(garment.id),
      failure: "Couldn't remove it. Try again.",
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId} className={labelClass}>
          Name
        </label>
        <input
          id={fieldId}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={MAX_NAME_LENGTH}
          placeholder={name}
          autoComplete="off"
          enterKeyHint="done"
          disabled={pending}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${fieldId}-hint`}
          className={input}
        />
        <p id={`${fieldId}-hint`} className="text-sm text-muted-foreground">
          {detected === "piece" ? "Leave it empty to use the original name." : `Detected as ${detected}. Leave the name empty to use the original.`}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className={labelClass} id={`${fieldId}-kind`}>
          Worn as
        </p>
        <Segmented
          label="Worn as"
          value={kind === "piece" ? null : kind}
          onChange={setKind}
          options={kindOptions}
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className={labelClass}>Colours</p>
        <ColorChips garmentId={garment.id} colors={garment.colors} editable />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={remove} disabled={pending} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
          <TrashIcon aria-hidden="true" />
          Remove Piece
        </Button>
        <Button type="submit" size="lg" disabled={pending} aria-busy={pending || undefined} className="sm:min-w-32">
          {pending && <Spinner />}
          {pending ? "Saving…" : changed ? "Save" : "Done"}
        </Button>
      </div>
    </form>
  );
}
