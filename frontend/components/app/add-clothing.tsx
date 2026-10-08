"use client";

import { CircleNotchIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { buttonPrimary } from "@/components/app/styles";

const MAX_EDGE = 1600; // px; plenty for segmentation, keeps uploads around 0.3 to 1 MB

type Status =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done"; count: number }
  | { kind: "error"; message: string };

/** Downscale in the browser so uploads stay well under Vercel's 4.5 MB request limit. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
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

export function AddClothing() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [slow, setSlow] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const working = status.kind === "working" || refreshing;

  // After a few seconds, explain the wait: the free Space may be waking up.
  useEffect(() => {
    if (status.kind !== "working") return;
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [status]);

  async function upload(file: File) {
    setStatus({ kind: "working" });
    try {
      let photo: Blob;
      try {
        photo = await shrink(file);
      } catch {
        setStatus({ kind: "error", message: "Couldn't read that photo. Try a JPEG or PNG." });
        return;
      }
      const form = new FormData();
      form.append("photo", photo, "photo.jpg");
      const res = await fetch("/api/garments", { method: "POST", body: form });
      const body = (await res.json().catch(() => ({}))) as { garments?: unknown[]; error?: string };
      if (!res.ok) {
        setStatus({ kind: "error", message: body.error ?? "Something went wrong. Try again." });
        return;
      }
      setStatus({ kind: "done", count: body.garments?.length ?? 0 });
      startRefresh(() => router.refresh());
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server. Check your connection and try again." });
    }
  }

  return (
    <div className="flex flex-col items-start gap-3 sm:items-end">
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
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={working}
        className={buttonPrimary}
      >
        {working ? (
          <CircleNotchIcon aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <PlusIcon aria-hidden="true" className="size-4" weight="bold" />
        )}
        {working ? "Adding…" : "Add Clothing"}
      </button>

      <p aria-live="polite" className="max-w-xs text-sm text-pretty text-muted-foreground sm:text-right">
        {status.kind === "working" &&
          (slow
            ? "Still working. The server may be waking up, which can take up to a minute."
            : "Finding each piece of clothing in your photo…")}
        {status.kind === "done" &&
          `Added ${status.count} ${status.count === 1 ? "piece" : "pieces"} to your wardrobe.`}
        {status.kind === "error" && <span className="text-destructive">{status.message}</span>}
      </p>
    </div>
  );
}
