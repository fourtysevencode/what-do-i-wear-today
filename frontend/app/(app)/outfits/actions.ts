"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/dal";
import { findFriend } from "@/lib/friends";
import { deleteOutfit, saveOutfit } from "@/lib/outfits";

type Result = { ok: boolean; message?: string };

const ids = z.array(z.uuid()).min(1).max(12);
const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) => text(max).nullable().optional().transform((v) => v || null);

const soloSchema = z.object({
  title: text(80).min(1),
  reasoning: text(600),
  notes: optionalText(500),
  weather: optionalText(300),
  ids,
});

const matchSchema = z.object({
  title: text(80).min(1),
  theme: text(600),
  notes: optionalText(500),
  weather: optionalText(300),
  yourIds: ids,
  yourNote: optionalText(400),
  friend: z.string().min(1).max(40),
  friendIds: ids,
  friendNote: optionalText(400),
});

export async function saveSoloOutfit(input: z.input<typeof soloSchema>): Promise<Result> {
  const user = await requireUser();
  const parsed = soloSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "That outfit couldn't be saved." };

  const { title, reasoning, notes, weather } = parsed.data;
  const id = await saveOutfit(user.id, {
    title,
    reasoning,
    notes,
    weather,
    yourIds: parsed.data.ids,
    yourNote: null,
    friend: null,
  });
  if (!id) return { ok: false, message: "Some of those pieces are no longer in your wardrobe." };

  revalidatePath("/outfits");
  return { ok: true };
}

export async function saveMatchedOutfit(input: z.input<typeof matchSchema>): Promise<Result> {
  const user = await requireUser();
  const parsed = matchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Those outfits couldn't be saved." };

  const friend = await findFriend(user.id, parsed.data.friend);
  if (!friend) return { ok: false, message: "You can only save outfits with accepted friends." };

  const { title, theme, notes, weather } = parsed.data;
  const id = await saveOutfit(user.id, {
    title,
    reasoning: theme,
    notes,
    weather,
    yourIds: parsed.data.yourIds,
    yourNote: parsed.data.yourNote,
    friend: { id: friend.id, ids: parsed.data.friendIds, note: parsed.data.friendNote },
  });
  if (!id) return { ok: false, message: "Some of those pieces are no longer available." };

  revalidatePath("/outfits");
  return { ok: true };
}

export async function deleteSavedOutfit(outfitId: string): Promise<Result> {
  const user = await requireUser();
  if (!z.uuid().safeParse(outfitId).success) return { ok: false, message: "That outfit doesn't exist." };
  const removed = await deleteOutfit(user.id, outfitId);
  if (removed) revalidatePath("/outfits");
  return removed ? { ok: true } : { ok: false, message: "That outfit is already gone." };
}
