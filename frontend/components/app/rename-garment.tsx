"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { renameWardrobeGarment } from "@/app/(app)/wardrobe/actions";
import { Spinner } from "@/components/app/spinner";
import { buttonSmall, input } from "@/components/app/styles";
import { MAX_NAME_LENGTH } from "@/lib/garment-kinds";
import { cn } from "@/lib/utils";

/** Pencil button on a garment card that opens an inline rename over the print. */
export function RenameGarment({ id, name, customName }: { id: string; name: string; customName: string | null }) {
  const fieldId = useId();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(customName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fieldRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (editing) fieldRef.current?.select();
  }, [editing]);

  function close() {
    setEditing(false);
    setError(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function save() {
    if (value.trim() === (customName ?? "")) return close();
    startTransition(async () => {
      const result = await renameWardrobeGarment(id, value);
      if (result.ok) close();
      else setError(result.message ?? "Couldn't rename it. Try again.");
    });
  }

  if (!editing) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setValue(customName ?? "");
          setEditing(true);
        }}
        aria-label={`Rename ${name}`}
        className="absolute top-4 right-15 z-10 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-print transition-[opacity,background-color] duration-200 hover:bg-card focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
      >
        <PencilSimpleIcon aria-hidden="true" className="size-4" />
      </button>
    );
  }

  return (
    <form
      aria-label={`Rename ${name}`}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !pending) close();
      }}
      className="absolute inset-0 z-20 flex flex-col items-stretch justify-center gap-3 rounded-(--radius-print) bg-card/95 p-4 backdrop-blur-sm"
    >
      <label htmlFor={fieldId} className="text-center font-medium">
        Rename
      </label>
      <input
        ref={fieldRef}
        id={fieldId}
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={MAX_NAME_LENGTH}
        placeholder={name}
        autoComplete="off"
        disabled={pending}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${fieldId}-hint`}
        className={cn(input, "h-10 text-sm")}
      />
      <p id={`${fieldId}-hint`} className={cn("text-center text-xs text-pretty", error ? "text-destructive" : "text-muted-foreground")} role={error ? "alert" : undefined}>
        {error ?? "Leave empty to use the original name."}
      </p>
      <div className="flex justify-center gap-2">
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending || undefined}
          className={cn(buttonSmall, "bg-primary text-primary-foreground hover:bg-primary/90")}
        >
          {pending && <Spinner />}
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={close}
          disabled={pending}
          className={cn(buttonSmall, "border border-foreground/15 hover:bg-foreground/5")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
