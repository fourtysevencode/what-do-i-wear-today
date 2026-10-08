"use client";

import { SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

import { Spinner } from "@/components/app/spinner";
import { buttonPrimary, label, surface, textarea } from "@/components/app/styles";
import { WeatherPicker, type WeatherChoice } from "@/components/app/weather-picker";

/** Wardrobe-page panel: collects the occasion and weather, then opens the outfit page with them. */
export function OutfitBuilder() {
  const id = useId();
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [weather, setWeather] = useState<WeatherChoice>(null);
  // Pending until the outfit page has loaded, so the press shows straight away.
  const [opening, startOpening] = useTransition();

  return (
    <form
      aria-labelledby={`${id}-title`}
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams({ build: "1" });
        if (notes.trim()) params.set("notes", notes.trim());
        if (weather) params.set("weather", weather.query);
        startOpening(() => router.push(`/outfits/new?${params}`));
      }}
      className={`${surface} flex flex-col gap-6`}
    >
      <h2 id={`${id}-title`} className="font-heading text-2xl font-semibold tracking-tight">
        Outfit builder
      </h2>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-notes`} className={label}>
          Event or notes
        </label>
        <textarea
          id={`${id}-notes`}
          name="notes"
          rows={4}
          maxLength={500}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="e.g. Dinner with friends, somewhere a bit dressy…"
          className={textarea}
        />
      </div>

      <WeatherPicker onChange={setWeather} />

      <button
        type="submit"
        disabled={opening}
        aria-busy={opening || undefined}
        className={`${buttonPrimary} h-12 w-full text-[15px]`}
      >
        {opening ? <Spinner /> : <SparkleIcon aria-hidden="true" className="size-4" weight="fill" />}
        {opening ? "Building…" : "Build Outfit"}
      </button>
    </form>
  );
}
