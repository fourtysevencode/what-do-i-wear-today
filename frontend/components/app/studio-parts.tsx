"use client";

import { BookmarkSimpleIcon, CheckIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Spinner } from "@/components/app/spinner";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toaster";

export type SaveState = { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string };

/** Shown while the stylist works; shaped like the result so nothing jumps. */
export function StylingSkeleton({ columns = 1 }: { columns?: 1 | 2 }) {
  return (
    <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
      <div className="h-9 w-2/3 rounded-full bg-muted" />
      <div className="mt-4 h-4 w-full rounded-full bg-muted" />
      <div className="mt-2 h-4 w-4/5 rounded-full bg-muted" />
      <div className={`mt-8 grid gap-4 ${columns === 2 ? "md:grid-cols-2" : ""}`}>
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <div className="aspect-4/5 rounded-(--radius-card) bg-muted" />
            <div className="aspect-4/5 rounded-(--radius-card) bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StylingStatus({ slow }: { slow: boolean }) {
  return (
    <p role="status" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      {slow ? "Still styling. The server may be waking up, which can take up to a minute." : "Styling your outfit…"}
    </p>
  );
}

export function EmptyResult({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-(--radius-surface) border border-dashed border-foreground/15 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-butter text-swatch-ink">
        <SparkleIcon aria-hidden="true" className="size-6" weight="fill" />
      </span>
      <p className="mt-4 max-w-[36ch] text-pretty text-muted-foreground">{children}</p>
    </div>
  );
}

/** Save, then confirm with a toast that links to the saved list. */
export function SaveButton({ state, onSave }: { state: SaveState; onSave: () => Promise<SaveState> }) {
  const router = useRouter();
  const saved = state.kind === "saved";
  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="secondary"
        onClick={async () => {
          const result = await onSave();
          if (result.kind === "saved") {
            toastManager.add({
              type: "success",
              title: "Outfit saved",
              actionProps: { children: "View", onClick: () => router.push("/outfits") },
            });
          }
        }}
        disabled={state.kind === "saving" || saved}
        aria-busy={state.kind === "saving" || undefined}
      >
        {state.kind === "saving" ? (
          <Spinner />
        ) : saved ? (
          <CheckIcon aria-hidden="true" weight="bold" className="text-thread" />
        ) : (
          <BookmarkSimpleIcon aria-hidden="true" />
        )}
        {state.kind === "saving" ? "Saving…" : saved ? "Saved" : "Save Outfit"}
      </Button>
      {state.kind === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </div>
  );
}
