"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Spinner } from "@/components/app/spinner";

type SubmitButtonProps = Omit<ComponentProps<"button">, "type"> & {
  /** Shown before the label; swapped for a spinner while pending. */
  icon?: ReactNode;
  pendingLabel?: ReactNode;
};

/**
 * Submit button for a server-action form: darkens and spins the moment it's pressed.
 * With several submit buttons in one form, only the pressed one (matched by
 * name/value) spins; all of them are disabled.
 */
export function SubmitButton({ children, icon, pendingLabel, name, value, disabled, ...props }: SubmitButtonProps) {
  const { pending, data } = useFormStatus();
  const pressed = pending && (name === undefined || data?.get(name) === String(value));

  return (
    <button
      {...props}
      type="submit"
      name={name}
      value={value}
      disabled={pending || disabled}
      aria-busy={pressed || undefined}
    >
      {pressed ? <Spinner /> : icon}
      {pressed ? (pendingLabel ?? children) : children}
    </button>
  );
}
