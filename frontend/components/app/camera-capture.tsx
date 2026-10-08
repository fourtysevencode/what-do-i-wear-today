"use client";

import {
  ArrowCounterClockwiseIcon,
  CameraIcon,
  CameraRotateIcon,
  CheckIcon,
  TimerIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useCallback, useEffect, useRef, useState } from "react";

import { buttonPrimary, buttonSecondary } from "@/components/app/styles";
import { cn } from "@/lib/utils";

type Facing = "environment" | "user";

type CameraCaptureProps = {
  open: boolean;
  onClose: () => void;
  onCapture: (photo: Blob) => void;
};

const TIMER_SECONDS = 3;

function cameraError(error: unknown) {
  const name = (error as DOMException)?.name;
  if (name === "NotAllowedError") return "Camera access was blocked. Allow it in your browser settings, or choose a photo instead.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No camera found on this device. Choose a photo instead.";
  if (name === "NotReadableError") return "The camera is busy in another app. Close it and try again.";
  return "Couldn't start the camera. Choose a photo instead.";
}

/** Full-screen camera: live preview, optional timer, then review before using the shot. */
export function CameraCapture({ open, onClose, onCapture }: CameraCaptureProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<Facing>("environment");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [shot, setShot] = useState<{ blob: Blob; url: string } | null>(null);
  const [timerOn, setTimerOn] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [canSwitch, setCanSwitch] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  // Open/close the native dialog (focus trap + Escape come with it).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Start the camera while open and not reviewing a shot; always release it afterwards.
  useEffect(() => {
    if (!open || shot) return;
    let cancelled = false;

    async function start() {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This browser can't use the camera here. Choose a photo instead.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) setCanSwitch(devices.filter((d) => d.kind === "videoinput").length > 1);
      } catch (err) {
        if (!cancelled) setError(cameraError(err));
      }
    }

    void start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, shot, facing, stopStream]);

  // Free the preview image when it's replaced or the camera closes.
  useEffect(() => {
    return () => {
      if (shot) URL.revokeObjectURL(shot.url);
    };
  }, [shot]);

  // Timer countdown, then take the picture.
  useEffect(() => {
    if (countdown === null) return;
    const tick = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1);
      } else {
        setCountdown(null);
        takePicture();
      }
    }, 1000);
    return () => clearTimeout(tick);
    // takePicture reads refs only; re-running on its identity isn't needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  function takePicture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // Saved unmirrored, even though the front-camera preview is mirrored like a mirror.
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopStream();
        setShot({ blob, url: URL.createObjectURL(blob) });
      },
      "image/jpeg",
      0.9,
    );
  }

  function close() {
    setCountdown(null);
    setShot(null);
    stopStream();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Take a photo"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      className="m-auto h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/80 sm:h-auto sm:max-h-[92dvh] sm:max-w-xl"
    >
      <div className="flex h-full flex-col overflow-hidden bg-card text-card-foreground sm:rounded-(--radius-surface) sm:ring-1 sm:ring-border">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            {shot ? "Use this photo?" : "Take a photo"}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close camera"
            className="flex size-9 items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <XIcon aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black sm:aspect-3/4 sm:flex-none">
          {shot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shot.url} alt="The photo you just took" className="size-full object-contain" />
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              aria-label="Camera preview"
              className={cn("size-full object-contain", facing === "user" && "-scale-x-100")}
            />
          )}

          {!shot && !ready && !error && (
            <p className="absolute text-sm text-white/80">Starting camera…</p>
          )}
          {error && (
            <p role="alert" className="absolute mx-6 rounded-(--radius-print) bg-card px-4 py-3 text-center text-sm text-pretty">
              {error}
            </p>
          )}
          {countdown !== null && countdown > 0 && (
            <span
              aria-live="assertive"
              className="absolute font-heading text-8xl font-bold text-white tabular-nums drop-shadow-lg"
            >
              {countdown}
            </span>
          )}
          {!shot && ready && (
            <p className="absolute bottom-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
              Stand back so your whole outfit is in frame
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 px-4 py-4">
          {shot ? (
            <>
              <button type="button" onClick={() => setShot(null)} className={buttonSecondary}>
                <ArrowCounterClockwiseIcon aria-hidden="true" className="size-4" />
                Retake
              </button>
              <button
                type="button"
                onClick={() => {
                  onCapture(shot.blob);
                  close();
                }}
                className={buttonPrimary}
              >
                <CheckIcon aria-hidden="true" className="size-4" weight="bold" />
                Use Photo
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setTimerOn((on) => !on)}
                aria-pressed={timerOn}
                aria-label={`${TIMER_SECONDS}-second timer`}
                title={`${TIMER_SECONDS}-second timer`}
                className="flex size-11 items-center justify-center gap-0.5 rounded-full text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:bg-secondary aria-pressed:text-foreground"
              >
                <TimerIcon aria-hidden="true" className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => (timerOn ? setCountdown(TIMER_SECONDS) : takePicture())}
                disabled={!ready || countdown !== null}
                aria-label="Take photo"
                className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-primary/25 transition-[scale,opacity] duration-200 active:scale-95 disabled:opacity-50 focus-visible:ring-ring focus-visible:outline-none"
              >
                <CameraIcon aria-hidden="true" className="size-7" weight="fill" />
              </button>
              <button
                type="button"
                onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
                disabled={!canSwitch || countdown !== null}
                aria-label="Switch camera"
                title="Switch camera"
                className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:invisible focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <CameraRotateIcon aria-hidden="true" className="size-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
