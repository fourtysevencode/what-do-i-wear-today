"use client";

import { useActionState } from "react";

import { changeUsername } from "@/app/(app)/account/actions";
import { buttonPrimary, input, label } from "@/components/app/styles";
import { cn } from "@/lib/utils";

export function UsernameForm({ current }: { current: string }) {
  const [state, formAction, pending] = useActionState(changeUsername, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label htmlFor="username" className={label}>
        Username
      </label>
      <div className="flex max-w-md flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground"
          >
            @
          </span>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={24}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            // Keep what was typed after a failed attempt; otherwise show the saved name.
            defaultValue={state?.username ?? current}
            key={state?.ok ? state.username : current}
            aria-invalid={state && !state.ok ? true : undefined}
            aria-describedby="username-help"
            className={cn(input, "pl-8")}
          />
        </div>
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? "Saving…" : "Save Username"}
        </button>
      </div>
      <p
        id="username-help"
        aria-live="polite"
        className={cn("text-sm text-pretty", state && !state.ok ? "text-destructive" : "text-muted-foreground")}
      >
        {state?.message ??
          "3 to 24 characters: lowercase letters, numbers, dots, dashes or underscores. Friends use it to find you."}
      </p>
    </form>
  );
}
