"use client";

import { useActionState } from "react";

import { adminLogin } from "@/app/fourtysevencode/actions";
import { buttonPrimary, fieldError, input, label } from "@/components/app/styles";

export function AdminLogin() {
  const [state, formAction, pending] = useActionState(adminLogin, undefined);
  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-2">
      <label htmlFor="admin-password" className={label}>
        Password
      </label>
      <input
        id="admin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
        aria-invalid={state ? true : undefined}
        aria-describedby={state ? "admin-error" : undefined}
        className={input}
      />
      {state && (
        <p id="admin-error" role="alert" className={fieldError}>
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${buttonPrimary} mt-3 self-start`}>
        {pending ? "Checking…" : "Unlock"}
      </button>
    </form>
  );
}
