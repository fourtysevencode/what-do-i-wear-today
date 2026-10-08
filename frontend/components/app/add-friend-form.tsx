"use client";

import { UserPlusIcon } from "@phosphor-icons/react/dist/ssr";
import { useActionState, useEffect, useRef } from "react";

import { addFriend } from "@/app/(app)/friends/actions";
import { buttonPrimary, input, label } from "@/components/app/styles";
import { cn } from "@/lib/utils";

export function AddFriendForm() {
  const [state, formAction, pending] = useActionState(addFriend, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the field once a request goes through.
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <label htmlFor="friend-username" className={label}>
        Add a friend by username
      </label>
      <div className="flex max-w-md gap-2">
        <div className="relative min-w-0 flex-1">
          <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground">
            @
          </span>
          <input
            id="friend-username"
            name="username"
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            placeholder="username…"
            aria-describedby={state ? "friend-status" : undefined}
            aria-invalid={state && !state.ok ? true : undefined}
            className={cn(input, "pl-8")}
          />
        </div>
        <button type="submit" disabled={pending} className={buttonPrimary}>
          <UserPlusIcon aria-hidden="true" className="size-4" />
          {pending ? "Sending…" : "Send Request"}
        </button>
      </div>
      <p
        id="friend-status"
        aria-live="polite"
        className={cn("min-h-5 text-sm", state?.ok ? "text-muted-foreground" : "text-destructive")}
      >
        {state?.message}
      </p>
    </form>
  );
}
