"use client";

import { CameraIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";

import { useCapture } from "@/components/app/capture-provider";
import { Spinner } from "@/components/app/spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Take Photo / Add Clothing. Progress shows in a toast (see CaptureProvider). */
export function AddClothing({ className }: { className?: string }) {
  const { openCamera, pickPhoto, working } = useCapture();
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button variant="secondary" onClick={openCamera} disabled={working}>
        <CameraIcon aria-hidden="true" />
        Take Photo
      </Button>
      <Button onClick={pickPhoto} disabled={working} aria-busy={working || undefined}>
        {working ? <Spinner /> : <PlusIcon aria-hidden="true" weight="bold" />}
        {working ? "Adding…" : "Add Clothing"}
      </Button>
    </div>
  );
}
