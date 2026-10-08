"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { updateWardrobeGarment } from "@/app/(app)/wardrobe/actions";
import { Spinner } from "@/components/app/spinner";
import { buttonSmall, input } from "@/components/app/styles";
import { detectedKind, KINDS, MAX_NAME_LENGTH } from "@/lib/garment-kinds";
import { cn } from "@/lib/utils";

type EditGarmentProps = {
  id: string;
  /** The model's label, e.g. "long sleeve top". */
  label: string;
  /** What the card shows: the custom name or the label. */
  name: string;
  customName: string | null;
  /** The kind the card shows now (the owner's choice or the label's). */
  kind: string;
};

/** Pencil button on a garment card that opens an inline editor (name, and top/bottom/…) over the print. */
export function EditGarment({ id, label, name, customName, kind }: EditGarmentProps) {
  const fieldId = useId();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(customName ?? "");
  const [chosenKind, setChosenKind] = useState(kind);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fieldRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const detected = detectedKind(label);

  useEffect(() => {
    if (editing) fieldRef.current?.select();
  }, [editing]);

  function close() {
    setEditing(false);
    setError(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function save() {
    if (value.trim() === (customName ?? "") && chosenKind === kind) return close();
    startTransition(async () => {
      const result = await updateWardrobeGarment(id, label, value, chosenKind);
      if (result.ok) close();
      else setError(result.message ?? "Couldn't save it. Try again.");
    });
  }

  if (!editing) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setValue(customName ?? "");
          setChosenKind(kind);
          setEditing(true);
        }}
        aria-label={`Edit ${name}`}
        className="absolute top-4 right-15 z-10 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-print transition-[opacity,background-color] duration-200 hover:bg-card focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
      >
        <PencilSimpleIcon aria-hidden="true" className="size-4" />
      </button>
    );
  }

  return (
    <form
      aria-label={`Edit ${name}`}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !pending) close();
      }}
      className="absolute inset-0 z-20 flex flex-col items-stretch justify-center gap-3 overflow-y-auto rounded-(--radius-print) bg-card/95 p-4 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium">
          Name
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
      </div>

      <fieldset disabled={pending} className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">Worn as</legend>
        <div className="grid grid-cols-2 gap-1.5">
          {KINDS.map((option) => (
            <label
              key={option}
              className="flex h-8 cursor-pointer items-center justify-center rounded-full border border-foreground/15 text-xs font-medium capitalize transition-colors duration-200 hover:bg-foreground/5 has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring"
            >
              <input
                type="radio"
                name={`${fieldId}-kind`}
                value={option}
                checked={chosenKind === option}
                onChange={() => setChosenKind(option)}
                className="sr-only"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <p
        id={`${fieldId}-hint`}
        className={cn("text-center text-xs text-pretty", error ? "text-destructive" : "text-muted-foreground")}
        role={error ? "alert" : undefined}
      >
        {error ?? (detected === "piece" ? "Leave the name empty to use the original." : `Detected as ${detected}.`)}
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
