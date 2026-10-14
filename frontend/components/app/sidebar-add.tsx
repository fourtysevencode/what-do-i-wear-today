"use client";

import { CameraIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";

import { useCapture } from "@/components/app/capture-provider";
import { Spinner } from "@/components/app/spinner";
import { Button } from "@/components/ui/button";

/** Desktop sidebar: upload is the common case on a computer, the webcam one step down. */
export function SidebarAdd() {
  const { openCamera, pickPhoto, working } = useCapture();
  return (
    <div className="flex flex-col gap-1.5">
      <Button onClick={pickPhoto} disabled={working} aria-busy={working || undefined} className="w-full">
        {working ? <Spinner /> : <PlusIcon aria-hidden="true" weight="bold" />}
        {working ? "Adding…" : "Add Clothing"}
      </Button>
      <Button variant="ghost" size="sm" onClick={openCamera} disabled={working} className="w-full">
        <CameraIcon aria-hidden="true" />
        Use Camera
      </Button>
    </div>
  );
}
