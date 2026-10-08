import type { WeatherReport } from "@/lib/api";

/** "Pune, Maharashtra, India: 31°C (feels 32°C), clear sky, high 33°C / low 24°C, 22% chance of rain" */
export function summarizeWeather(report: WeatherReport) {
  const round = (n: number) => Math.round(n);
  const place = report.location.label ?? "Their location";
  const { current, today } = report;
  return (
    `${place}: ${round(current.temp_c)}°C (feels ${round(current.feels_like_c)}°C), ` +
    `${current.description.toLowerCase()}, high ${round(today.max_c)}°C / low ${round(today.min_c)}°C, ` +
    `${today.precip_chance ?? 0}% chance of rain, wind ${round(current.wind_kmh)} km/h`
  );
}
