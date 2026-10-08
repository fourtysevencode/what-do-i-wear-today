import "server-only";

import { sql } from "@/lib/db";
import type { GarmentColor } from "@/lib/garments";

export type OutfitPiece = { id: string; label: string; colors: GarmentColor[] };

export type SavedOutfit = {
  id: string;
  title: string;
  reasoning: string;
  yourNote: string | null;
  friendNote: string | null;
  notes: string | null;
  weather: string | null;
  createdAt: string;
  /** Set for matching outfits; null if that friend has since deleted their account. */
  friend: { username: string } | null;
  isMatch: boolean;
  you: OutfitPiece[];
  friendPieces: OutfitPiece[];
};

/** Pieces from `ids` that belong to `ownerId`, in the order given. */
export async function piecesOwnedBy(ownerId: string, ids: string[]): Promise<OutfitPiece[]> {
  if (ids.length === 0) return [];
  const rows = (await sql()`
    select id, label, colors from garments where user_id = ${ownerId} and id = any(${ids}::uuid[])
  `) as OutfitPiece[];
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.flatMap((id) => byId.get(id) ?? []);
}

type SaveInput = {
  title: string;
  reasoning: string;
  notes: string | null;
  weather: string | null;
  yourIds: string[];
  yourNote: string | null;
  friend: { id: string; ids: string[]; note: string | null } | null;
};

/** Saves an outfit after checking every piece belongs to its side. Returns the new id, or null if a check fails. */
export async function saveOutfit(userId: string, input: SaveInput) {
  const yours = await piecesOwnedBy(userId, input.yourIds);
  if (yours.length === 0 || yours.length !== input.yourIds.length) return null;
  if (input.friend) {
    const theirs = await piecesOwnedBy(input.friend.id, input.friend.ids);
    if (theirs.length === 0 || theirs.length !== input.friend.ids.length) return null;
  }

  const id = crypto.randomUUID();
  const db = sql();
  const items = [
    ...input.yourIds.map((garmentId, position) => ({ garmentId, side: "you", position })),
    ...(input.friend?.ids ?? []).map((garmentId, position) => ({ garmentId, side: "friend", position })),
  ];
  await db.transaction([
    db`
      insert into outfits (id, user_id, friend_id, title, reasoning, your_note, friend_note, notes, weather)
      values (${id}, ${userId}, ${input.friend?.id ?? null}, ${input.title}, ${input.reasoning},
              ${input.yourNote}, ${input.friend?.note ?? null}, ${input.notes}, ${input.weather})
    `,
    ...items.map(
      (item) => db`
        insert into outfit_items (outfit_id, garment_id, side, position)
        values (${id}, ${item.garmentId}, ${item.side}, ${item.position})
      `,
    ),
  ]);
  return id;
}

type OutfitRow = {
  id: string;
  title: string;
  reasoning: string;
  your_note: string | null;
  friend_note: string | null;
  notes: string | null;
  weather: string | null;
  created_at: string;
  friend_username: string | null;
  is_match: boolean;
};

type ItemRow = OutfitPiece & { outfit_id: string; side: "you" | "friend" };

/** All of the user's saved outfits, newest first, with their pieces. */
export async function listOutfits(userId: string): Promise<SavedOutfit[]> {
  const db = sql();
  const [outfits, items] = (await db.transaction([
    db`
      select o.id, o.title, o.reasoning, o.your_note, o.friend_note, o.notes, o.weather, o.created_at,
             u.username as friend_username,
             exists (select 1 from outfit_items i where i.outfit_id = o.id and i.side = 'friend') as is_match
      from outfits o left join users u on u.id = o.friend_id
      where o.user_id = ${userId}
      order by o.created_at desc
    `,
    db`
      select i.outfit_id, i.side, g.id, g.label, g.colors
      from outfit_items i
      join outfits o on o.id = i.outfit_id
      join garments g on g.id = i.garment_id
      where o.user_id = ${userId}
      order by i.side, i.position
    `,
  ])) as [OutfitRow[], ItemRow[]];

  return outfits.map((row) => {
    const pieces = items.filter((item) => item.outfit_id === row.id);
    const strip = ({ id, label, colors }: ItemRow): OutfitPiece => ({ id, label, colors });
    return {
      id: row.id,
      title: row.title,
      reasoning: row.reasoning,
      yourNote: row.your_note,
      friendNote: row.friend_note,
      notes: row.notes,
      weather: row.weather,
      createdAt: row.created_at,
      friend: row.friend_username ? { username: row.friend_username } : null,
      isMatch: row.is_match || row.friend_username !== null,
      you: pieces.filter((piece) => piece.side === "you").map(strip),
      friendPieces: pieces.filter((piece) => piece.side === "friend").map(strip),
    };
  });
}

export async function deleteOutfit(userId: string, outfitId: string) {
  const rows = await sql()`delete from outfits where id = ${outfitId} and user_id = ${userId} returning id`;
  return rows.length > 0;
}
