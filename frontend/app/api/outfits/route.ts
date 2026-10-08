import { NextResponse, type NextRequest } from "next/server";

import { pick, requestSchema, toStylistItems, weatherLine } from "@/app/api/outfits/stylist-input";
import { requestOutfit } from "@/lib/api";
import { getCurrentUser } from "@/lib/dal";
import { sql } from "@/lib/db";
import { listGarments } from "@/lib/garments";

// Gemini on the backend answers in a couple of seconds, but the Space may be waking up.
export const maxDuration = 60;

/** Ask the stylist (Gemini, via the Python backend) for one outfit from the user's wardrobe. */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to build outfits." }, { status: 401 });

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "That request didn't look right." }, { status: 400 });

  const garments = await listGarments(user.id);
  if (garments.length === 0) {
    return NextResponse.json({ error: "Add some clothes to your wardrobe first." }, { status: 422 });
  }

  const weather = weatherLine(parsed.data.weather);
  const result = await requestOutfit({ wardrobe: toStylistItems(garments), notes: parsed.data.notes, weather });
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });

  // Usage stats for the owner's /fourtysevencode page; a failure here never fails the request.
  await sql()`insert into outfit_generations (user_id, kind) values (${user.id}, 'solo')`.catch(() => {});

  return NextResponse.json({
    title: result.data.title,
    reasoning: result.data.reasoning,
    missing: result.data.missing,
    weather,
    items: pick(garments, result.data.item_ids),
  });
}
