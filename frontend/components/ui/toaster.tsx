"use client";

import { Toast } from "@base-ui/react/toast";
import { CheckCircleIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

import { Spinner } from "@/components/app/spinner";

/** Queue a toast from anywhere: event handlers, helpers, outside the React tree. */
export const toastManager = Toast.createToastManager();

/**
 * Toasts stack at the bottom (above the phone tab bar), enter and leave along the same
 * path, and can be swiped away. A toast with `actionProps` shows an action (Undo, View).
 */
export function Toaster({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider toastManager={toastManager} limit={3}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="toast-viewport">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastIcon({ type }: { type?: string }) {
  if (type === "loading") return <Spinner className="size-5 text-muted-foreground" />;
  if (type === "success") return <CheckCircleIcon aria-hidden="true" className="size-5 text-thread" weight="fill" />;
  if (type === "error") return <WarningCircleIcon aria-hidden="true" className="size-5 text-destructive" weight="fill" />;
  return null;
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => (
    <Toast.Root key={toast.id} toast={toast} className="toast">
      <Toast.Content className="toast-content">
        <ToastIcon type={toast.type} />
        <div className="min-w-0 flex-1">
          <Toast.Title className="text-sm font-semibold text-pretty" />
          <Toast.Description className="text-sm text-pretty text-muted-foreground" />
        </div>
        {toast.actionProps && (
          <Toast.Action className="h-9 shrink-0 rounded-full bg-secondary px-4 text-sm font-semibold text-foreground transition-[background-color,scale] duration-150 hover:bg-foreground/10 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" />
        )}
        <Toast.Close
          aria-label="Dismiss"
          className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,scale] duration-150 hover:bg-foreground/6 hover:text-foreground active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <XIcon aria-hidden="true" className="size-3.5" weight="bold" />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}
