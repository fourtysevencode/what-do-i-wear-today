"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useRef, useState, useTransition, type ReactNode } from "react";

import { CameraCapture } from "@/components/app/camera-capture";
import { toastManager } from "@/components/ui/toaster";

const MAX_EDGE = 1600; // px; plenty for segmentation, keeps uploads around 0.3 to 1 MB
const SLOW_AFTER_MS = 8000;

/** Downscale in the browser so uploads stay well under Vercel's 4.5 MB request limit. */
async function shrink(image: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(image, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))), "image/jpeg", 0.85),
  );
}

type Capture = {
  /** Open the camera sheet (it also offers the photo library). */
  openCamera: () => void;
  /** Open the system file picker straight away. Call from a click handler. */
  pickPhoto: () => void;
  /** An upload is in flight. */
  working: boolean;
};

const CaptureContext = createContext<Capture | null>(null);

export function useCapture() {
  const capture = use(CaptureContext);
  if (!capture) throw new Error("useCapture must be used inside <CaptureProvider>");
  return capture;
}

/**
 * Adding clothes from anywhere in the app: the phone tab bar's centre button, the desktop
 * sidebar and the wardrobe page all use this. Progress lives in a toast, so the person can
 * keep browsing while the pieces are found and cut out.
 */
export function CaptureProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshing, startRefresh] = useTransition();

  async function upload(file: Blob) {
    setUploading(true);
    const id = toastManager.add({
      type: "loading",
      title: "Finding each piece…",
      description: "Cutting out every garment in your photo.",
      timeout: 0,
    });
    // After a few seconds, explain the wait: the free Space may be waking up.
    const slow = setTimeout(() => {
      toastManager.update(id, { description: "Still working. The server may be waking up, which can take up to a minute." });
    }, SLOW_AFTER_MS);

    const fail = (title: string) => toastManager.add({ id, type: "error", title, description: undefined, timeout: 6000 });

    try {
      let photo: Blob;
      try {
        photo = await shrink(file);
      } catch {
        fail("Couldn't read that photo. Try a JPEG or PNG.");
        return;
      }
      const form = new FormData();
      form.append("photo", photo, "photo.jpg");
      const res = await fetch("/api/garments", { method: "POST", body: form });
      const body = (await res.json().catch(() => ({}))) as { garments?: unknown[]; error?: string };
      if (!res.ok) {
        fail(body.error ?? "Something went wrong. Try again.");
        return;
      }
      const count = body.garments?.length ?? 0;
      const onWardrobe = window.location.pathname === "/wardrobe";
      toastManager.add({
        id,
        type: "success",
        title: `Added ${count} ${count === 1 ? "piece" : "pieces"}`,
        description: onWardrobe ? undefined : "They're in your wardrobe.",
        timeout: 5000,
        actionProps: onWardrobe ? undefined : { children: "View", onClick: () => router.push("/wardrobe") },
      });
      startRefresh(() => router.refresh());
    } catch {
      fail("Couldn't reach the server. Check your connection and try again.");
    } finally {
      clearTimeout(slow);
      setUploading(false);
    }
  }

  const capture: Capture = {
    openCamera: () => setCameraOpen(true),
    pickPhoto: () => inputRef.current?.click(),
    working: uploading || refreshing,
  };

  return (
    <CaptureContext value={capture}>
      {children}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = ""; // allow re-picking the same file
          if (file) void upload(file);
        }}
      />
      <CameraCapture
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onCapture={(photo) => void upload(photo)}
        onPickPhoto={() => {
          setCameraOpen(false);
          inputRef.current?.click();
        }}
      />
    </CaptureContext>
  );
}
