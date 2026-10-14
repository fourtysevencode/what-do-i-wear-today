"use client";

import { Drawer } from "@base-ui/react/drawer";
import { XIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Keep the title for assistive tech but don't show it (the content carries its own heading). */
  hideTitle?: boolean;
  /** "full" fills the phone screen (the camera); "auto" sizes to the content. */
  size?: "auto" | "full";
  /** Dark chrome for content that sits on black (the camera). */
  tone?: "default" | "dark";
  onOpenChangeComplete?: (open: boolean) => void;
  className?: string;
  children: ReactNode;
};

/**
 * A bottom sheet on phones (swipe down to dismiss; a quick flick is enough) and a centred
 * dialog from `sm` up. Enters and leaves along the same path. While it's open the page
 * behind recedes slightly, like iOS (see .sheet-indent in globals.css).
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  hideTitle = false,
  size = "auto",
  tone = "default",
  onOpenChangeComplete,
  className,
  children,
}: SheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        // Scale the page behind around what's on screen now, not the top of the document.
        if (next) {
          document.documentElement.style.setProperty("--indent-origin-y", `${window.scrollY + window.innerHeight / 2}px`);
        }
        onOpenChange(next);
      }}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="sheet-backdrop" />
        <Drawer.Viewport className="sheet-viewport">
          <Drawer.Popup className={cn("sheet-popup", className)} data-size={size} data-tone={tone}>
            <div aria-hidden="true" className="sheet-handle" />
            <div
              className={cn(
                "flex items-start justify-between gap-4 px-5 pt-3 pb-2 sm:px-6 sm:pt-5",
                hideTitle && "absolute inset-x-0 top-0 z-10",
              )}
            >
              <div className={cn("min-w-0", hideTitle && "sr-only")}>
                <Drawer.Title className="type-heading">{title}</Drawer.Title>
                {description && (
                  <Drawer.Description className="mt-1 text-sm text-pretty text-muted-foreground">{description}</Drawer.Description>
                )}
              </div>
              <Drawer.Close
                aria-label="Close"
                className={cn(
                  "-mr-2 ml-auto flex size-10 shrink-0 items-center justify-center rounded-full transition-[background-color,scale] duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  tone === "dark"
                    ? "bg-white/12 text-white hover:bg-white/20"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                <XIcon aria-hidden="true" className="size-4" weight="bold" />
              </Drawer.Close>
            </div>
            {/* No min-h-0: content keeps its full height so the popup scrolls past its last control. */}
            <Drawer.Content className="flex flex-1 flex-col">{children}</Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/**
 * Wrap the app content (not fixed chrome like the tab bar: a transform would re-anchor it)
 * so the page can recede while a sheet is open.
 */
export function SheetStage({ children }: { children: ReactNode }) {
  return (
    <Drawer.Provider>
      <Drawer.IndentBackground className="sheet-indent-background" />
      <Drawer.Indent className="sheet-indent">{children}</Drawer.Indent>
    </Drawer.Provider>
  );
}
