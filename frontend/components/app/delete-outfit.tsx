"use client";

import { TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { useState, useTransition } from "react";

import { deleteSavedOutfit } from "@/app/(app)/outfits/actions";
import { Spinner } from "@/components/app/spinner";
import { buttonSmall } from "@/components/app/styles";
import { cn } from "@/lib/utils";

/** Delete a saved outfit, with an inline "are you sure" first. */
export function DeleteOutfit({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${title}`}
        className={cn(buttonSmall, "text-muted-foreground hover:bg-foreground/5 hover:text-foreground")}
      >
        <TrashIcon aria-hidden="true" className="size-4" />
        Delete
      </button>
    );
  }

  return (
    <div role="group" aria-label={`Delete ${title}?`} className="flex flex-wrap items-center gap-2">
      <span className="text-sm">Delete this outfit?</span>
      <button
        type="button"
        disabled={pending}
        aria-busy={pending || undefined}
        onClick={() =>
          startTransition(async () => {
            const result = await deleteSavedOutfit(id);
            if (!result.ok) setError(result.message ?? "Couldn't delete it.");
          })
        }
        className={cn(buttonSmall, "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
      >
        {pending && <Spinner />}
        {pending ? "Deleting…" : "Delete"}
      </button>
      <button
        type="button"
        autoFocus
        disabled={pending}
        aria-busy={pending || undefined}
        onClick={() => {
          setConfirming(false);
          setError(null);
        }}
        className={cn(buttonSmall, "border border-foreground/15 hover:bg-foreground/5")}
      >
        Keep
      </button>
      {error && (
        <p role="alert" className="w-full text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
