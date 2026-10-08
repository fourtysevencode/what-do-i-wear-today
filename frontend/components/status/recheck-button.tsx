"use client";

import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

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
      className="inline-flex h-11 items-center gap-2 rounded-full border border-foreground/15 px-5 text-sm font-medium transition-[background-color,border-color,scale] duration-300 ease-soft hover:border-foreground/30 hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:scale-[0.98] aria-busy:bg-foreground/10 aria-busy:brightness-[0.82]"
    >
      <ArrowClockwiseIcon
        aria-hidden="true"
        className={cn("size-4", pending && "animate-spin motion-reduce:animate-none")}
      />
      {pending ? "Checking…" : "Check Again"}
    </button>
  );
}
