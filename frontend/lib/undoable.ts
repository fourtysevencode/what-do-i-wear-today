"use client";

import { useSyncExternalStore } from "react";

import { toastManager } from "@/components/ui/toaster";

type Result = { ok: boolean; message?: string };

/*
 * Keys of things the user removed but can still undo. Module-level, so a removal stays
 * hidden if its component unmounts and mounts again (navigating away and back) before
 * the toast runs out.
 */
const hidden = new Set<string>();
const listeners = new Set<() => void>();
let snapshot = new Set<string>();

function emit() {
  snapshot = new Set(hidden);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const empty = new Set<string>();

/** The keys currently hidden by a pending (or finished) removal. */
export function useHiddenKeys() {
  return useSyncExternalStore(subscribe, () => snapshot, () => empty);
}

type RemoveWithUndoOptions = {
  /** Stable key for the thing being removed, e.g. `garment:<id>`. */
  key: string;
  title: string;
  description?: string;
  /** The server action. Runs only once the toast closes without an undo. */
  commit: () => Promise<Result>;
  /** Fallback message if the commit fails without one. */
  failure: string;
};

/**
 * Forgiveness instead of "are you sure?": the item disappears at once and a toast offers
 * Undo for a few seconds. Nothing is deleted until the toast closes; if the tab closes
 * first, the item simply stays.
 */
export function removeWithUndo({ key, title, description, commit, failure }: RemoveWithUndoOptions) {
  hidden.add(key);
  emit();

  let undone = false;
  const id = toastManager.add({
    title,
    description,
    timeout: 5000,
    actionProps: {
      children: "Undo",
      onClick: () => {
        undone = true;
        hidden.delete(key);
        emit();
        toastManager.close(id);
      },
    },
    onClose: () => {
      if (undone) return;
      void commit()
        .catch(() => ({ ok: false }) as Result)
        .then((result) => {
          if (result.ok) return;
          hidden.delete(key);
          emit();
          toastManager.add({ type: "error", title: result.message ?? failure });
        });
    },
  });
}
