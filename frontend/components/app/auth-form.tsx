"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthState } from "@/app/(auth)/actions";
import { buttonPrimary, fieldError, input, label } from "@/components/app/styles";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
};

const copy = {
  login: { submit: "Log In", pending: "Logging in…", switchText: "New here?", switchLink: "Sign Up", switchHref: "/signup" },
  signup: { submit: "Create Account", pending: "Creating account…", switchText: "Already have an account?", switchLink: "Log In", switchHref: "/login" },
};

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const text = copy[mode];
  const emailError = state?.fieldErrors?.email?.[0];
  const passwordError = state?.fieldErrors?.password?.[0];

  return (
    <form action={formAction} noValidate className="mt-8 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={label}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="text"
          inputMode="email"
          autoComplete={mode === "login" ? "username" : "email"}
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={state?.email}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? "email-error" : undefined}
          className={input}
        />
        {emailError && (
          <p id="email-error" className={fieldError}>
            {emailError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={label}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "signup" ? 6 : undefined}
          aria-invalid={passwordError ? true : undefined}
          aria-describedby={passwordError ? "password-error" : mode === "signup" ? "password-help" : undefined}
          className={input}
        />
        {passwordError ? (
          <p id="password-error" className={fieldError}>
            {passwordError}
          </p>
        ) : (
          mode === "signup" && (
            <p id="password-help" className="text-sm text-muted-foreground">
              At least 6 characters.
            </p>
          )
        )}
      </div>

      {state?.error && (
        <p role="alert" className="rounded-(--radius-print) bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${buttonPrimary} mt-1 h-12 w-full text-[15px]`}>
        {pending ? text.pending : text.submit}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {text.switchText}{" "}
        <Link
          href={text.switchHref}
          className="rounded-sm font-medium text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-pop focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {text.switchLink}
        </Link>
      </p>
    </form>
  );
}
