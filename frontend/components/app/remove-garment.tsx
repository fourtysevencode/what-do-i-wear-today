"use client";

import { TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, useTransition } from "react";

import { removeGarment } from "@/app/(app)/wardrobe/actions";
import { Spinner } from "@/components/app/spinner";
import { buttonSmall } from "@/components/app/styles";
import { cn } from "@/lib/utils";

/** Trash button on a garment card, with an inline "are you sure" before deleting. */
export function RemoveGarment({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const keepRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Move focus into the confirmation, and back to the trigger when it closes.
  useEffect(() => {
    if (confirming) keepRef.current?.focus();
  }, [confirming]);

  function close() {
    setConfirming(false);
    setError(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function remove() {
    startTransition(async () => {
      const result = await removeGarment(id);
      if (!result.ok) setError(result.message ?? "Couldn't remove it. Try again.");
    });
  }

  if (!confirming) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Remove ${name}`}
        className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-print transition-[opacity,background-color] duration-200 hover:bg-card focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
      >
        <TrashIcon aria-hidden="true" className="size-4" />
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={`Remove ${name}?`}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !pending) close();
      }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-(--radius-print) bg-card/95 p-4 text-center backdrop-blur-sm"
    >
      <p className="font-medium text-balance">Remove {name.toLowerCase()}?</p>
      <p className="text-sm text-muted-foreground">This deletes the photo too.</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-busy={pending || undefined}
          className={cn(buttonSmall, "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
        >
          {pending && <Spinner />}
          {pending ? "Removing…" : "Remove"}
        </button>
        <button
          ref={keepRef}
          type="button"
          onClick={close}
          disabled={pending}
          className={cn(buttonSmall, "border border-foreground/15 hover:bg-foreground/5")}
        >
          Keep
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
