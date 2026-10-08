"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/dal";
import { MAX_NAME_LENGTH } from "@/lib/garment-kinds";
import { deleteGarment, removeGarmentColor, renameGarment } from "@/lib/garments";

const isId = (value: string) => /^[0-9a-f-]{36}$/i.test(value);

export async function removeGarment(garmentId: string): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser();
  if (!isId(garmentId)) return { ok: false, message: "That piece doesn't exist." };

  try {
    const removed = await deleteGarment(user.id, garmentId);
    if (!removed) return { ok: false, message: "That piece is already gone." };
  } catch {
    return { ok: false, message: "Couldn't remove it. Try again." };
  }

  revalidatePath("/wardrobe");
  return { ok: true };
}

/** Renames a piece. An empty name goes back to the label the model gave it. */
export async function renameWardrobeGarment(
  garmentId: string,
  name: string,
): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser();
  if (!isId(garmentId)) return { ok: false, message: "That piece doesn't exist." };
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (trimmed.length > MAX_NAME_LENGTH) return { ok: false, message: `Keep it under ${MAX_NAME_LENGTH} characters.` };

  try {
    const renamed = await renameGarment(user.id, garmentId, trimmed || null);
    if (!renamed) return { ok: false, message: "That piece is gone." };
  } catch {
    return { ok: false, message: "Couldn't rename it. Try again." };
  }

  revalidatePath("/wardrobe");
  return { ok: true };
}

/** Removes a colour the model got wrong from a piece. */
export async function removeWardrobeGarmentColor(
  garmentId: string,
  colorName: string,
): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser();
  if (!isId(garmentId) || !colorName || colorName.length > 60) return { ok: false, message: "That colour doesn't exist." };

  try {
    const updated = await removeGarmentColor(user.id, garmentId, colorName);
    if (!updated) return { ok: false, message: "That piece is gone." };
  } catch {
    return { ok: false, message: "Couldn't remove the colour. Try again." };
  }

  revalidatePath("/wardrobe");
  return { ok: true };
}
