import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { pick, requestSchema, toStylistItems, weatherLine } from "@/app/api/outfits/stylist-input";
import { requestMatchedOutfits } from "@/lib/api";
import { getCurrentUser } from "@/lib/dal";
import { sql } from "@/lib/db";
import { findFriend } from "@/lib/friends";
import { listGarments } from "@/lib/garments";

export const maxDuration = 60;

const matchSchema = requestSchema.extend({ friend: z.string().min(1).max(40) });

/** Coordinated outfits for the user and an accepted friend, each from their own wardrobe. */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to build outfits." }, { status: 401 });

  const parsed = matchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a friend first." }, { status: 400 });

  const friend = await findFriend(user.id, parsed.data.friend);
  if (!friend) return NextResponse.json({ error: "You can only match with accepted friends." }, { status: 404 });

  const [yours, theirs] = await Promise.all([listGarments(user.id), listGarments(friend.id)]);
  if (yours.length === 0) {
    return NextResponse.json({ error: "Add some clothes to your wardrobe first." }, { status: 422 });
  }
  if (theirs.length === 0) {
    return NextResponse.json({ error: `@${friend.username} hasn't added any clothes yet.` }, { status: 422 });
  }

  const weather = weatherLine(parsed.data.weather);
  const result = await requestMatchedOutfits({
    you: toStylistItems(yours),
    friend: toStylistItems(theirs),
    friend_name: friend.username,
    notes: parsed.data.notes,
    weather,
  });
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });

  // Usage stats for the owner's /fourtysevencode page; a failure here never fails the request.
  await sql()`insert into outfit_generations (user_id, kind) values (${user.id}, 'match')`.catch(() => {});

  return NextResponse.json({
    title: result.data.title,
    theme: result.data.theme,
    weather,
    you: { reasoning: result.data.you.reasoning, items: pick(yours, result.data.you.item_ids) },
    friend: {
      username: friend.username,
      reasoning: result.data.friend.reasoning,
      items: pick(theirs, result.data.friend.item_ids),
    },
  });
}
