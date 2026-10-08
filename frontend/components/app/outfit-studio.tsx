"use client";

import { ArrowsClockwiseIcon, SparkleIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { saveSoloOutfit } from "@/app/(app)/outfits/actions";
import { OutfitPieces, type Piece } from "@/components/app/outfit-pieces";
import { OutfitViewArea, OutfitViewToggle } from "@/components/app/outfit-view-mode";
import {
  EmptyResult,
  SaveButton,
  StylingSkeleton,
  StylingStatus,
  type SaveState,
} from "@/components/app/studio-parts";
import { Spinner } from "@/components/app/spinner";
import { buttonPrimary, label, surface, textarea } from "@/components/app/styles";
import { WeatherPicker, type WeatherChoice } from "@/components/app/weather-picker";

type Outfit = { title: string; reasoning: string; missing: string | null; weather: string | null; items: Piece[] };

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; outfit: Outfit; notes: string }
  | { kind: "error"; message: string };

export function OutfitStudio() {
  const id = useId();
  const params = useSearchParams();
  const initialWeather = params.get("weather");
  const [notes, setNotes] = useState(params.get("notes") ?? "");
  const [weather, setWeather] = useState<WeatherChoice>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [slow, setSlow] = useState(false);
  const loading = status.kind === "loading";

  async function build(report = weather?.report ?? null) {
    setStatus({ kind: "loading" });
    setSave({ kind: "idle" });
    setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), 8000);
    try {
      const res = await fetch("/api/outfits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notes: notes.trim(), weather: report }),
      });
      const body = await res.json().catch(() => ({}));
      setStatus(
        res.ok
          ? { kind: "ready", outfit: body as Outfit, notes: notes.trim() }
          : { kind: "error", message: body.error ?? "Something went wrong. Try again." },
      );
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server. Check your connection and try again." });
    } finally {
      clearTimeout(slowTimer);
    }
  }

  // Arrived from the wardrobe page's builder (?build=1): start by itself, once the
  // carried-over weather has loaded if there was any.
  const autoStart = params.get("build") === "1";
  const autoStarted = useRef(false);

  function handleWeather(choice: WeatherChoice) {
    setWeather(choice);
    if (autoStart && initialWeather && choice && !autoStarted.current) {
      autoStarted.current = true;
      void build(choice.report);
    }
  }

  useEffect(() => {
    if (!autoStart || initialWeather) return;
    // Deferred, and marked inside the callback, so a dev double-run doesn't cancel it.
    const timer = setTimeout(() => {
      if (autoStarted.current) return;
      autoStarted.current = true;
      void build(null);
    }, 0);
    return () => clearTimeout(timer);
    // Runs once on arrival; build reads the latest notes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveOutfit() {
    if (status.kind !== "ready") return;
    setSave({ kind: "saving" });
    const { outfit } = status;
    const result = await saveSoloOutfit({
      title: outfit.title,
      reasoning: outfit.reasoning,
      notes: status.notes || null,
      weather: outfit.weather,
      ids: outfit.items.map((item) => item.id),
    });
    setSave(result.ok ? { kind: "saved" } : { kind: "error", message: result.message ?? "Couldn't save it." });
  }

  return (
    <div className="grid gap-10 xl:grid-cols-[22rem_minmax(0,1fr)] xl:gap-12">
      <form
        aria-labelledby={`${id}-form`}
        onSubmit={(event) => {
          event.preventDefault();
          void build();
        }}
        className={`${surface} flex flex-col gap-6 self-start xl:sticky xl:top-10`}
      >
        <h2 id={`${id}-form`} className="font-heading text-xl font-semibold tracking-tight">
          What&apos;s the plan?
        </h2>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-notes`} className={label}>
            Event or notes
          </label>
          <textarea
            id={`${id}-notes`}
            rows={4}
            maxLength={500}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="e.g. Dinner with friends, somewhere a bit dressy…"
            className={textarea}
          />
        </div>
        <WeatherPicker onChange={handleWeather} initialQuery={initialWeather} />
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading || undefined}
          className={`${buttonPrimary} h-12 w-full text-[15px]`}
        >
          {loading ? (
            <Spinner />
          ) : status.kind === "ready" ? (
            <ArrowsClockwiseIcon aria-hidden="true" className="size-4" />
          ) : (
            <SparkleIcon aria-hidden="true" className="size-4" weight="fill" />
          )}
          {loading ? "Styling…" : status.kind === "ready" ? "Try Another" : "Build Outfit"}
        </button>
        <Link
          href="/outfits/match"
          className="inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <UsersThreeIcon aria-hidden="true" className="size-4" />
          Match with a friend instead
        </Link>
      </form>

      <section aria-label="Your outfit" aria-busy={loading} className="min-w-0">
        {status.kind === "idle" && (
          <EmptyResult>Describe your day and add the weather, then build an outfit from your wardrobe.</EmptyResult>
        )}
        {status.kind === "loading" && (
          <>
            <StylingStatus slow={slow} />
            <StylingSkeleton />
          </>
        )}
        {status.kind === "error" && (
          <EmptyResult>
            <span className="text-destructive">{status.message}</span>
          </EmptyResult>
        )}
        {status.kind === "ready" && (
          <OutfitViewArea>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 max-w-[60ch]">
                <h2 className="type-display text-3xl md:text-4xl">{status.outfit.title}</h2>
                <p className="mt-3 leading-relaxed text-pretty text-muted-foreground">{status.outfit.reasoning}</p>
                {status.outfit.missing && (
                  <p className="mt-2 text-sm text-pretty">
                    <span className="font-medium">Would complete it:</span> {status.outfit.missing}
                  </p>
                )}
              </div>
              <OutfitViewToggle />
            </div>
            <div className="mt-8">
              <OutfitPieces pieces={status.outfit.items} />
            </div>
            <div className="mt-8 border-t border-border pt-6">
              <SaveButton state={save} onSave={saveOutfit} />
            </div>
          </OutfitViewArea>
        )}
      </section>
    </div>
  );
}
