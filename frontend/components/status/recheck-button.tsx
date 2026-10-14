"use client";

import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Re-runs the server-side health check by refreshing the route. */
export function RecheckButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      aria-busy={pending || undefined}
      className={buttonVariants({ variant: "secondary" })}
    >
      <ArrowClockwiseIcon
        aria-hidden="true"
        className={cn("size-4", pending && "animate-[spin_0.7s_linear_infinite] motion-reduce:animate-none")}
      />
      {pending ? "Checking…" : "Check Again"}
    </button>
  );
}
