/** FastAPI backend on Hugging Face Spaces. Override with API_URL if it moves. */
export const API_URL =
  process.env.API_URL ?? "https://fourtysevencode-what-do-i-wear-today.hf.space";

/** Shape of GET /health in backend/app.py. */
type HealthPayload = {
  status: string;
  uptime: string;
  version: string;
  message: string;
};

export type HealthResult =
  | { ok: true; data: HealthPayload; latencyMs: number }
  | { ok: false; reason: "timeout" | "http" | "network"; httpStatus?: number; latencyMs: number };

// Free Spaces sleep when idle; past this, report "waking up" instead of hanging the page.
const TIMEOUT_MS = 8000;

/** Server-side only, so API_URL stays private and the Space's CORS doesn't matter. */
export async function getHealth(): Promise<HealthResult> {
  const started = performance.now();
  const elapsed = () => Math.round(performance.now() - started);

  try {
    const res = await fetch(`${API_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, reason: "http", httpStatus: res.status, latencyMs: elapsed() };
    return { ok: true, data: (await res.json()) as HealthPayload, latencyMs: elapsed() };
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    return { ok: false, reason: timedOut ? "timeout" : "network", latencyMs: elapsed() };
  }
}

/** "149s" -> "2m 29s", "90061s" -> "1d 1h". */
export function formatUptime(raw: string): string {
  const total = Number.parseInt(raw, 10);
  if (!Number.isFinite(total)) return raw;
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export type ApiError = { ok: false; status: number; message: string };

async function readError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => null)) as { detail?: unknown } | null;
  const message = typeof body?.detail === "string" ? body.detail : `Request failed (${res.status})`;
  return { ok: false, status: res.status, message };
}

function networkError(error: unknown): ApiError {
  const timedOut = error instanceof DOMException && error.name === "TimeoutError";
  return timedOut
    ? { ok: false, status: 504, message: "The server is waking up. Try again in a minute." }
    : { ok: false, status: 502, message: "Couldn't reach the server." };
}

/** One cutout from POST /segment. `image` is a base64 PNG. */
export type SegmentedItem = {
  label: string;
  confidence: number;
  colors: { name: string; hex: string; percentage: number }[];
  image: string;
};

/** Sends a photo to the segmentation model. Allows for a cold start of the Space. */
export async function segmentImage(
  photo: Blob,
): Promise<{ ok: true; items: SegmentedItem[] } | ApiError> {
  const form = new FormData();
  form.append("image", photo, "photo.jpg");
  try {
    const res = await fetch(`${API_URL}/segment`, {
      method: "POST",
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(55_000),
    });
    if (!res.ok) return readError(res);
    const body = (await res.json()) as { items: SegmentedItem[] };
    return { ok: true, items: body.items };
  } catch (error) {
    return networkError(error);
  }
}

/** Shape of GET /weather in backend/app.py. */
export type WeatherReport = {
  location: { label: string | null; latitude: number; longitude: number };
  current: {
    temp_c: number;
    feels_like_c: number;
    description: string;
    code: number;
    wind_kmh: number;
    precipitation_mm: number;
  };
  today: { max_c: number; min_c: number; precip_chance: number | null };
};

export async function fetchWeather(
  query: { q: string } | { lat: number; lon: number },
): Promise<{ ok: true; report: WeatherReport } | ApiError> {
  const params = new URLSearchParams(
    "q" in query ? { q: query.q } : { lat: String(query.lat), lon: String(query.lon) },
  );
  try {
    const res = await fetch(`${API_URL}/weather?${params}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return readError(res);
    return { ok: true, report: (await res.json()) as WeatherReport };
  } catch (error) {
    return networkError(error);
  }
}
