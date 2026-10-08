"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/dal";
import { deleteGarment } from "@/lib/garments";

export async function removeGarment(garmentId: string): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser();
  if (!/^[0-9a-f-]{36}$/i.test(garmentId)) return { ok: false, message: "That piece doesn't exist." };

  try {
    const removed = await deleteGarment(user.id, garmentId);
    if (!removed) return { ok: false, message: "That piece is already gone." };
  } catch {
    return { ok: false, message: "Couldn't remove it. Try again." };
  }

  revalidatePath("/wardrobe");
  return { ok: true };
}
