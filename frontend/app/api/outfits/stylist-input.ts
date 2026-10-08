import { z } from "zod";

import type { StylistItem, WeatherReport } from "@/lib/api";
import type { StoredGarment } from "@/lib/garments";
import { summarizeWeather } from "@/lib/weather-summary";

const weatherSchema = z.object({
  location: z.object({ label: z.string().max(120).nullable() }),
  current: z.object({
    temp_c: z.number(),
    feels_like_c: z.number(),
    description: z.string().max(60),
    wind_kmh: z.number(),
  }),
  today: z.object({ max_c: z.number(), min_c: z.number(), precip_chance: z.number().nullable() }),
});

export const requestSchema = z.object({
  notes: z.string().max(500).default(""),
  weather: z.unknown().optional(),
});

/** The weather card's report as one prompt line, or null if missing/malformed. */
export function weatherLine(raw: unknown) {
  const parsed = weatherSchema.safeParse(raw);
  return parsed.success ? summarizeWeather(parsed.data as WeatherReport) : null;
}

/** What the stylist needs per garment: its id, label and colour names. */
export function toStylistItems(garments: StoredGarment[]): StylistItem[] {
  return garments.map((garment) => ({
    id: garment.id,
    label: garment.label,
    colors: garment.colors.map((color) => color.name),
  }));
}

/** The stylist's ids back to full garments, in its order, skipping anything unknown. */
export function pick(garments: StoredGarment[], ids: string[]) {
  const byId = new Map(garments.map((garment) => [garment.id, garment]));
  return ids.flatMap((id) => {
    const garment = byId.get(id);
    return garment ? [{ id: garment.id, label: garment.label, colors: garment.colors }] : [];
  });
}
