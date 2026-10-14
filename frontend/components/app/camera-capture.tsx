"use client";

import {
  ArrowCounterClockwiseIcon,
  CameraRotateIcon,
  CheckIcon,
  ImagesIcon,
  TimerIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Facing = "environment" | "user";

type CameraCaptureProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (photo: Blob) => void;
  /** Leave the camera for the photo library. */
  onPickPhoto: () => void;
};

const TIMER_SECONDS = 3;

function cameraError(error: unknown) {
  const name = (error as DOMException)?.name;
  if (name === "NotAllowedError") return "Camera access was blocked. Allow it in your browser settings, or choose a photo instead.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No camera found on this device. Choose a photo instead.";
  if (name === "NotReadableError") return "The camera is busy in another app. Close it and try again.";
  return "Couldn't start the camera. Choose a photo instead.";
}

/** Buttons on the black camera surface. */
const roundControl =
  "flex size-12 items-center justify-center rounded-full bg-white/12 text-white transition-[background-color,scale,opacity] duration-150 hover:bg-white/20 active:scale-[0.92] disabled:opacity-35 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none";

/**
 * The camera as a full-height sheet: live preview, optional timer, then review before
 * using the shot. Swipe down (or Escape) to put it away; the stream stops with it.
 */
export function CameraCapture({ open, onOpenChange, onCapture, onPickPhoto }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<Facing>("environment");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [shot, setShot] = useState<{ blob: Blob; url: string } | null>(null);
  const [timerOn, setTimerOn] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [canSwitch, setCanSwitch] = useState(false);
  const [flash, setFlash] = useState(0);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  // The sheet mounts its content a beat after opening, so attach the stream whenever the
  // <video> appears, as well as when the stream arrives.
  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    if (video && streamRef.current && video.srcObject !== streamRef.current) {
      video.srcObject = streamRef.current;
      void video.play().catch(() => {});
    }
  }, []);

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
        attachVideo(videoRef.current);
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
  }, [open, shot, facing, stopStream, attachVideo]);

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
    // Feedback on the frame the shot is taken: a flash and, where supported, a tap.
    setFlash((n) => n + 1);
    navigator.vibrate?.(10);
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

  function reset() {
    setCountdown(null);
    setShot(null);
    stopStream();
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      title={shot ? "Use this photo?" : "Take a photo"}
      size="full"
      tone="dark"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-3 sm:px-5">
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.25rem] bg-black sm:aspect-3/4 sm:flex-none">
          {shot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shot.url} alt="The photo you just took" className="size-full object-contain" />
          ) : (
            <video
              ref={attachVideo}
              playsInline
              muted
              aria-label="Camera preview"
              className={cn("size-full object-cover", facing === "user" && "-scale-x-100")}
            />
          )}

          {!shot && !ready && !error && <p className="absolute text-sm text-white/70">Starting camera…</p>}

          {error && (
            <div role="alert" className="absolute inset-x-6 flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-pretty text-white/85">{error}</p>
              <button
                type="button"
                onClick={onPickPhoto}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[0.9375rem] font-medium text-black transition-[scale] duration-150 active:scale-[0.97]"
              >
                <ImagesIcon aria-hidden="true" className="size-4" />
                Choose a Photo
              </button>
            </div>
          )}

          {countdown !== null && countdown > 0 && (
            <span
              key={countdown}
              aria-live="assertive"
              className="absolute font-display text-9xl font-medium text-white tabular-nums drop-shadow-lg motion-safe:animate-[countdown-tick_1s_var(--ease-out)_both]"
            >
              {countdown}
            </span>
          )}

          {!shot && ready && countdown === null && (
            <p className="absolute bottom-4 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
              Stand back so your whole outfit is in frame
            </p>
          )}

          {/* The shutter flash: plays once per shot. */}
          {flash > 0 && (
            <span
              key={flash}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-white opacity-0 motion-safe:animate-[shutter-flash_180ms_var(--ease-out)]"
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-3 pb-1">
          {shot ? (
            <>
              <button type="button" onClick={() => setShot(null)} className={cn(roundControl, "w-auto gap-2 px-5 text-[0.9375rem] font-medium")}>
                <ArrowCounterClockwiseIcon aria-hidden="true" className="size-4" />
                Retake
              </button>
              <Button
                size="lg"
                onClick={() => {
                  onCapture(shot.blob);
                  onOpenChange(false);
                  reset();
                }}
                className="bg-white text-black shadow-none hover:bg-white/90"
              >
                <CheckIcon aria-hidden="true" weight="bold" />
                Use Photo
              </Button>
            </>
          ) : (
            <>
              <button type="button" onClick={onPickPhoto} aria-label="Choose from photos" title="Choose from photos" className={roundControl}>
                <ImagesIcon aria-hidden="true" className="size-5" />
              </button>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setTimerOn((on) => !on)}
                  aria-pressed={timerOn}
                  aria-label={`${TIMER_SECONDS}-second timer`}
                  title={`${TIMER_SECONDS}-second timer`}
                  className={cn(roundControl, "size-10 aria-pressed:bg-white aria-pressed:text-black")}
                >
                  <TimerIcon aria-hidden="true" className="size-5" />
                </button>
                {/* The shutter: a white disc inside a ring, like the iOS camera. */}
                <button
                  type="button"
                  onClick={() => (timerOn ? setCountdown(TIMER_SECONDS) : takePicture())}
                  disabled={!ready || countdown !== null}
                  aria-label="Take photo"
                  className="group flex size-[4.5rem] items-center justify-center rounded-full ring-4 ring-white/90 ring-inset transition-opacity duration-150 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <span className="size-[3.5rem] rounded-full bg-white transition-[scale] duration-150 ease-out group-active:scale-[0.86]" />
                </button>
                <span aria-hidden="true" className="size-10" />
              </div>

              <button
                type="button"
                onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
                disabled={!canSwitch || countdown !== null}
                aria-label="Switch camera"
                title="Switch camera"
                className={cn(roundControl, "disabled:invisible")}
              >
                <CameraRotateIcon aria-hidden="true" className="size-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </Sheet>
  );
}
