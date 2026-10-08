"use client";

import {
  CircleNotchIcon,
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudSunIcon,
  MapPinIcon,
  SunIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useId, useRef, useState } from "react";

import { buttonSecondary, input, label } from "@/components/app/styles";
import type { WeatherReport } from "@/lib/api";

type WeatherState =
  | { kind: "idle" }
  | { kind: "loading"; source: "location" | "place" }
  | { kind: "ready"; report: WeatherReport }
  | { kind: "error"; message: string };

/** The picked weather plus the query that fetched it ("q=Pune" or "lat=…&lon=…"), for URLs. */
export type WeatherChoice = { report: WeatherReport; query: string } | null;

/** Icon for a WMO weather code. */
function WeatherGlyph({ code }: { code: number }) {
  const props = { "aria-hidden": true, className: "size-10 shrink-0 text-pop", weight: "duotone" } as const;
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
    <div className="rounded-(--radius-print) bg-secondary p-4">
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPinIcon aria-hidden="true" className="size-4 shrink-0" />
        <span className="truncate">{report.location.label ?? "Your location"}</span>
      </p>
      <div className="mt-3 flex items-center gap-3">
        <WeatherGlyph code={current.code} />
        <div>
          <p className="text-3xl font-semibold tracking-tight tabular-nums">{degrees.format(current.temp_c)}°C</p>
          <p className="text-sm">{current.description}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
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

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className={`${label} mb-2`}>Weather</legend>
      <button type="button" onClick={locateMe} disabled={loading} className={`${buttonSecondary} w-full`}>
        {loading && weather.source === "location" ? (
          <CircleNotchIcon aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <MapPinIcon aria-hidden="true" className="size-4" />
        )}
        Use My Location
      </button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-place`} className="sr-only">
          City or place
        </label>
        <div className="flex gap-2">
          <input
            id={`${id}-place`}
            name="place"
            type="text"
            autoComplete="address-level2"
            placeholder="City or place, e.g. Pune…"
            value={place}
            onChange={(event) => setPlace(event.target.value)}
            onKeyDown={(event) => {
              // Enter checks the weather instead of submitting the surrounding form.
              if (event.key === "Enter") {
                event.preventDefault();
                checkPlace();
              }
            }}
            className={`${input} min-w-0 flex-1`}
          />
          <button type="button" onClick={checkPlace} disabled={loading} className={buttonSecondary}>
            {loading && weather.source === "place" ? (
              <CircleNotchIcon aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
            ) : null}
            Check
          </button>
        </div>
      </div>

      <div aria-live="polite">
        {weather.kind === "ready" && <WeatherCard report={weather.report} />}
        {weather.kind === "error" && <p className="text-sm text-destructive">{weather.message}</p>}
      </div>
    </fieldset>
  );
}
