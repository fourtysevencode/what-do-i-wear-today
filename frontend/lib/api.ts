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

/** Server-side only: the backend has no CORS policy, so browsers can't call it directly. */
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
