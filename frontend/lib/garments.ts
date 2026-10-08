import "server-only";

import { sql } from "@/lib/db";
import { deleteObject, putPng } from "@/lib/storage";

export type GarmentColor = { name: string; hex: string; percentage: number };

export type StoredGarment = {
  id: string;
  label: string;
  confidence: number | null;
  colors: GarmentColor[];
  createdAt: string;
};

type GarmentRow = {
  id: string;
  label: string;
  confidence: number | null;
  colors: GarmentColor[];
  created_at: string;
};

const toGarment = (row: GarmentRow): StoredGarment => ({
  id: row.id,
  label: row.label,
  confidence: row.confidence,
  colors: row.colors,
  createdAt: row.created_at,
});

export async function listGarments(userId: string) {
  const rows = (await sql()`
    select id, label, confidence, colors, created_at
    from garments where user_id = ${userId}
    order by created_at desc
  `) as GarmentRow[];
  return rows.map(toGarment);
}

/** Uploads each cutout to the private bucket, then records it. */
export async function createGarments(
  userId: string,
  items: { label: string; confidence: number; colors: GarmentColor[]; png: Uint8Array }[],
) {
  const created: StoredGarment[] = [];
  for (const item of items) {
    const id = crypto.randomUUID();
    const key = `garments/${userId}/${id}.png`;
    await putPng(key, item.png);
    const rows = (await sql()`
      insert into garments (id, user_id, storage_key, label, confidence, colors)
      values (${id}, ${userId}, ${key}, ${item.label}, ${item.confidence}, ${JSON.stringify(item.colors)}::jsonb)
      returning id, label, confidence, colors, created_at
    `) as GarmentRow[];
    created.push(toGarment(rows[0]));
  }
  return created;
}

/** The garment's storage key if the viewer owns it or is an accepted friend of the owner. */
export async function storageKeyForViewer(garmentId: string, viewerId: string) {
  const rows = (await sql()`
    select g.storage_key
    from garments g
    where g.id = ${garmentId}
      and (
        g.user_id = ${viewerId}
        or exists (
          select 1 from friendships f
          where f.status = 'accepted'
            and ((f.requester_id = ${viewerId} and f.addressee_id = g.user_id)
              or (f.addressee_id = ${viewerId} and f.requester_id = g.user_id))
        )
      )
  `) as { storage_key: string }[];
  return rows[0]?.storage_key ?? null;
}

/**
 * Removes one of the user's own garments: the image first, then the row, so a
 * storage failure leaves the garment in place to retry rather than orphaning the file.
 * Returns false if the garment doesn't exist or isn't theirs.
 */
export async function deleteGarment(userId: string, garmentId: string) {
  const rows = (await sql()`
    select storage_key from garments where id = ${garmentId} and user_id = ${userId}
  `) as { storage_key: string }[];
  if (!rows[0]) return false;

  await deleteObject(rows[0].storage_key);
  await sql()`delete from garments where id = ${garmentId} and user_id = ${userId}`;
  return true;
}
