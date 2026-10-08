"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/dal";
import { respondToRequest, sendFriendRequest } from "@/lib/friends";

export type AddFriendState = { ok: boolean; message: string } | undefined;

export async function addFriend(_prev: AddFriendState, formData: FormData): Promise<AddFriendState> {
  const user = await requireUser();
  const username = String(formData.get("username") ?? "").trim();
  if (!username) return { ok: false, message: "Enter a username." };
  if (username.length > 40) return { ok: false, message: "That username is too long." };

  const result = await sendFriendRequest(user.id, username);
  if (result.ok) revalidatePath("/friends");
  return result;
}

export async function respondToFriendRequest(formData: FormData) {
  const user = await requireUser();
  const requesterId = String(formData.get("requesterId") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(requesterId)) return;

  await respondToRequest(user.id, requesterId, formData.get("decision") === "accept");
  revalidatePath("/friends");
}
