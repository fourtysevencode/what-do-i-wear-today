"use client";

import {
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudSunIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  NavigationArrowIcon,
  SunIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useId, useRef, useState } from "react";

import { Spinner } from "@/components/app/spinner";
import { input, label } from "@/components/app/styles";
import { Button } from "@/components/ui/button";
import type { WeatherReport } from "@/lib/api";
import { cn } from "@/lib/utils";

type WeatherState =
  | { kind: "idle" }
  | { kind: "loading"; source: "location" | "place" }
  | { kind: "ready"; report: WeatherReport }
  | { kind: "error"; message: string };

/** The picked weather plus the query that fetched it ("q=Pune" or "lat=…&lon=…"), for URLs. */
export type WeatherChoice = { report: WeatherReport; query: string } | null;

/** Icon for a WMO weather code. */
function WeatherGlyph({ code }: { code: number }) {
  const props = { "aria-hidden": true, className: "size-11 shrink-0 text-thread", weight: "duotone" } as const;
  if (code === 0) return <SunIcon {...props} />;
  if (code <= 2) return <CloudSunIcon {...props} />;
  if (code === 3) return <CloudIcon {...props} />;
  if (code <= 48) return <CloudFogIcon {...props} />;
  if (code >= 95) return <CloudLightningIcon {...props} />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return <CloudSnowIcon {...props} />;
  return <CloudRainIcon {...props} />;
}

const degrees = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

function WeatherCard({ report }: { report: WeatherReport }) {
  const { current, today } = report;
  return (
    <div className="enter-rise rounded-(--radius-card) bg-secondary p-4">
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPinIcon aria-hidden="true" className="size-4 shrink-0" />
        <span className="truncate">{report.location.label ?? "Your location"}</span>
      </p>
      <div className="mt-2 flex items-center gap-3">
        <p className="font-display text-5xl leading-none font-[420] tracking-[-0.02em] tabular-nums">
          {degrees.format(current.temp_c)}°
        </p>
        <WeatherGlyph code={current.code} />
        <p className="ml-auto text-right text-sm text-pretty">{current.description}</p>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Feels like</dt>
          <dd className="font-medium tabular-nums">{degrees.format(current.feels_like_c)}°</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">High / low</dt>
          <dd className="font-medium tabular-nums">
            {degrees.format(today.max_c)}° / {degrees.format(today.min_c)}°
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Rain</dt>
          <dd className="font-medium tabular-nums">{today.precip_chance ?? 0}%</dd>
        </div>
      </dl>
    </div>
  );
}

type WeatherPickerProps = {
  onChange: (choice: WeatherChoice) => void;
  /** A query to load straight away, e.g. carried over in the URL. */
  initialQuery?: string | null;
};

/** "Use my location" or a typed place, showing a forecast card once loaded. Not a form. */
export function WeatherPicker({ onChange, initialQuery }: WeatherPickerProps) {
  const id = useId();
  const [place, setPlace] = useState(() => new URLSearchParams(initialQuery ?? "").get("q") ?? "");
  const [weather, setWeather] = useState<WeatherState>({ kind: "idle" });
  const loading = weather.kind === "loading";
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  async function load(query: string, source: "location" | "place") {
    setWeather({ kind: "loading", source });
    onChangeRef.current(null);
    try {
      const res = await fetch(`/api/weather?${query}`);
      const body = await res.json();
      if (res.ok) {
        setWeather({ kind: "ready", report: body as WeatherReport });
        onChangeRef.current({ report: body as WeatherReport, query });
      } else {
        setWeather({ kind: "error", message: body.error });
      }
    } catch {
      setWeather({ kind: "error", message: "Couldn't load the weather. Try again." });
    }
  }

  // Load a carried-over choice once.
  const loadedInitial = useRef(false);
  useEffect(() => {
    if (!initialQuery || loadedInitial.current) return;
    loadedInitial.current = true;
    void load(initialQuery, initialQuery.startsWith("q=") ? "place" : "location");
  }, [initialQuery]);

  function locateMe() {
    if (!("geolocation" in navigator)) {
      setWeather({ kind: "error", message: "Location isn't available in this browser. Type a place instead." });
      return;
    }
    setWeather({ kind: "loading", source: "location" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        load(
          new URLSearchParams({ lat: coords.latitude.toFixed(3), lon: coords.longitude.toFixed(3) }).toString(),
          "location",
        ),
      (error) =>
        setWeather({
          kind: "error",
          message:
            error.code === error.PERMISSION_DENIED
              ? "Location permission was denied. Type a place instead."
              : "Couldn't get your location. Type a place instead.",
        }),
      { timeout: 10_000, maximumAge: 10 * 60_000 },
    );
  }

  function checkPlace() {
    const value = place.trim();
    if (value.length < 2) {
      setWeather({ kind: "error", message: "Enter a city or place." });
      return;
    }
    void load(new URLSearchParams({ q: value }).toString(), "place");
  }

  const placeLoading = loading && weather.source === "place";
  const locationLoading = loading && weather.source === "location";

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className={`${label} mb-2`}>Weather</legend>

      <div className="flex gap-2">
        <label htmlFor={`${id}-place`} className="sr-only">
          City or place
        </label>
        <div className="relative min-w-0 flex-1">
          <input
            id={`${id}-place`}
            name="place"
            type="text"
            autoComplete="address-level2"
            enterKeyHint="search"
            placeholder="City, e.g. Pune"
            value={place}
            onChange={(event) => setPlace(event.target.value)}
            onKeyDown={(event) => {
              // Enter checks the weather instead of submitting the surrounding form.
              if (event.key === "Enter") {
                event.preventDefault();
                checkPlace();
              }
            }}
            className={cn(input, "pr-12")}
          />
          <button
            type="button"
            onClick={checkPlace}
            disabled={loading}
            aria-label="Check the weather there"
            aria-busy={placeLoading || undefined}
            className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[scale,opacity] duration-150 active:scale-90 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {placeLoading ? <Spinner /> : <MagnifyingGlassIcon aria-hidden="true" className="size-4" weight="bold" />}
          </button>
        </div>
        <Button
          variant="secondary"
          size="icon"
          onClick={locateMe}
          disabled={loading}
          aria-busy={locationLoading || undefined}
          aria-label="Use my location"
          title="Use my location"
          className="size-12"
        >
          {locationLoading ? <Spinner /> : <NavigationArrowIcon aria-hidden="true" className="size-5" />}
        </Button>
      </div>

      <div aria-live="polite">
        {weather.kind === "ready" && <WeatherCard report={weather.report} />}
        {weather.kind === "error" && <p className="text-sm text-destructive">{weather.message}</p>}
      </div>
    </fieldset>
  );
}
