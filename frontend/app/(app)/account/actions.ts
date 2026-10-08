"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/dal";
import { updateUsername, USERNAME_PATTERN } from "@/lib/users";

export type UsernameState = { ok: boolean; message: string; username?: string } | undefined;

export async function changeUsername(_prev: UsernameState, formData: FormData): Promise<UsernameState> {
  const user = await requireUser();
  const username = String(formData.get("username") ?? "").trim().replace(/^@/, "").toLowerCase();

  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      message: "Use 3 to 24 lowercase letters, numbers, dots, dashes or underscores, starting with a letter or number.",
      username,
    };
  }
  if (username === user.username) return { ok: false, message: "That's already your username.", username };

  const result = await updateUsername(user.id, username);
  if (!result.ok) return { ok: false, message: `@${username} is taken. Try another.`, username };

  // The handle shows in the sidebar on every app page.
  revalidatePath("/", "layout");
  return { ok: true, message: `You're now @${username}. Friends find you by this name.`, username };
}
