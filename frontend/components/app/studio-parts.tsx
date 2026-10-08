"use client";

import { BookmarkSimpleIcon, CheckIcon, CircleNotchIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonSecondary } from "@/components/app/styles";

export type SaveState = { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string };

/** Shown while Gemini works; shaped like the result so nothing jumps. */
export function StylingSkeleton({ columns = 1 }: { columns?: 1 | 2 }) {
  return (
    <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
      <div className="h-8 w-2/3 rounded-full bg-muted" />
      <div className="mt-3 h-4 w-full rounded-full bg-muted" />
      <div className="mt-2 h-4 w-4/5 rounded-full bg-muted" />
      <div className={`mt-8 grid gap-6 ${columns === 2 ? "md:grid-cols-2" : ""}`}>
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <div className="aspect-4/5 rounded-(--radius-print) bg-muted" />
            <div className="aspect-4/5 rounded-(--radius-print) bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StylingStatus({ slow }: { slow: boolean }) {
  return (
    <p role="status" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
      <CircleNotchIcon aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
      {slow ? "Still styling. The server may be waking up, which can take up to a minute." : "Styling your outfit…"}
    </p>
  );
}

export function EmptyResult({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-(--radius-surface) border border-dashed border-foreground/15 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-orchid text-swatch-ink">
        <SparkleIcon aria-hidden="true" className="size-6" weight="fill" />
      </span>
      <p className="mt-4 max-w-[36ch] text-pretty text-muted-foreground">{children}</p>
    </div>
  );
}

export function SaveButton({ state, onSave }: { state: SaveState; onSave: () => void }) {
  if (state.kind === "saved") {
    return (
      <p className="flex items-center gap-2 text-sm font-medium">
        <CheckIcon aria-hidden="true" className="size-4 text-pop" weight="bold" />
        Saved.{" "}
        <Link href="/outfits" className="rounded-sm underline decoration-foreground/25 underline-offset-4 hover:decoration-pop focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          View saved outfits
        </Link>
      </p>
    );
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={onSave} disabled={state.kind === "saving"} className={buttonSecondary}>
        {state.kind === "saving" ? (
          <CircleNotchIcon aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <BookmarkSimpleIcon aria-hidden="true" className="size-4" />
        )}
        {state.kind === "saving" ? "Saving…" : "Save Outfit"}
      </button>
      {state.kind === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </div>
  );
}
