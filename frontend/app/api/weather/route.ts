import { NextResponse, type NextRequest } from "next/server";

import { fetchWeather } from "@/lib/api";

/** Proxies the backend's /weather so the browser never needs the Space's URL. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim();
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));

  let query: { q: string } | { lat: number; lon: number };
  if (q) {
    if (q.length < 2 || q.length > 100) {
      return NextResponse.json({ error: "Enter a place name." }, { status: 400 });
    }
    query = { q };
  } else if (
    params.has("lat") && params.has("lon") &&
    Number.isFinite(lat) && Math.abs(lat) <= 90 &&
    Number.isFinite(lon) && Math.abs(lon) <= 180
  ) {
    query = { lat, lon };
  } else {
    return NextResponse.json({ error: "Pass a place (q) or coordinates (lat, lon)." }, { status: 400 });
  }

  const result = await fetchWeather(query);
  if (!result.ok) {
    const message = result.status === 404 ? "Couldn't find that place." : result.message;
    return NextResponse.json({ error: message }, { status: result.status });
  }
  return NextResponse.json(result.report);
}
