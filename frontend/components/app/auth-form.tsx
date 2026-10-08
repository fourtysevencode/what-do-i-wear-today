"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthState } from "@/app/(auth)/actions";
import { Spinner } from "@/components/app/spinner";
import { buttonPrimary, fieldError, input, label } from "@/components/app/styles";
import { Turnstile } from "@/components/app/turnstile";
import { cn } from "@/lib/utils";

const inlineLink =
  "rounded-sm font-medium text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-pop focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

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
  const usernameError = state?.fieldErrors?.username?.[0];
  const passwordError = state?.fieldErrors?.password?.[0];
  const termsError = state?.fieldErrors?.terms?.[0];

  return (
    <form action={formAction} noValidate className="mt-8 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className={label}>
          Username
        </label>
        <div className="relative">
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
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={24}
            defaultValue={state?.username}
            aria-invalid={usernameError ? true : undefined}
            aria-describedby={usernameError ? "username-error" : mode === "signup" ? "username-help" : undefined}
            className={cn(input, "pl-8")}
          />
        </div>
        {usernameError ? (
          <p id="username-error" className={fieldError}>
            {usernameError}
          </p>
        ) : (
          mode === "signup" && (
            <p id="username-help" className="text-sm text-muted-foreground">
              Friends use this to find you. Letters, numbers, dots, dashes or underscores.
            </p>
          )
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

      {mode === "signup" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              aria-invalid={termsError ? true : undefined}
              aria-describedby={termsError ? "terms-error" : undefined}
              className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-md accent-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            />
            <label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground">
              I agree to the{" "}
              <Link href="/terms" target="_blank" className={inlineLink}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className={inlineLink}>
                Privacy Policy
              </Link>
              .
            </label>
          </div>
          {termsError && (
            <p id="terms-error" className={fieldError}>
              {termsError}
            </p>
          )}
        </div>
      )}

      {mode === "signup" && <Turnstile resetKey={state} />}

      {state?.error && (
        <p role="alert" className="rounded-(--radius-print) bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending || undefined}
        className={`${buttonPrimary} mt-1 h-12 w-full text-[15px]`}
      >
        {pending && <Spinner />}
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
