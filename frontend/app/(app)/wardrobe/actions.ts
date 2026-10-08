"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/dal";
import { detectedKind, isKind, MAX_NAME_LENGTH } from "@/lib/garment-kinds";
import { deleteGarment, removeGarmentColor, updateGarment } from "@/lib/garments";

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

/**
 * Renames a piece and sets how it's worn. An empty name goes back to the label the model gave it,
 * and a kind that matches the label is stored as null so it follows the label.
 */
export async function updateWardrobeGarment(
  garmentId: string,
  label: string,
  name: string,
  kind: string,
): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser();
  if (!isId(garmentId)) return { ok: false, message: "That piece doesn't exist." };
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (trimmed.length > MAX_NAME_LENGTH) return { ok: false, message: `Keep it under ${MAX_NAME_LENGTH} characters.` };
  if (!isKind(kind)) return { ok: false, message: "Pick top, bottom, outerwear or dress." };

  try {
    const updated = await updateGarment(user.id, garmentId, {
      name: trimmed || null,
      kind: kind === detectedKind(label) ? null : kind,
    });
    if (!updated) return { ok: false, message: "That piece is gone." };
  } catch {
    return { ok: false, message: "Couldn't save it. Try again." };
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
