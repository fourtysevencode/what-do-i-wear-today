"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getSession } from "@/lib/session";
import { verifyTurnstile } from "@/lib/turnstile";
import { createUser, USERNAME_PATTERN, verifyCredentials } from "@/lib/users";

export type AuthState =
  | {
      error?: string;
      fieldErrors?: { username?: string[]; password?: string[] };
      username?: string;
    }
  | undefined;

// "@alice" and "Alice" both mean "alice".
const normalized = z
  .string()
  .trim()
  .transform((value) => value.replace(/^@/, "").toLowerCase());

const loginSchema = z.object({
  username: normalized.pipe(z.string().min(1, "Enter your username.").max(24, "That's too long.")),
  password: z.string().min(1, "Enter your password.").max(128, "That's too long."),
});

const signupSchema = z.object({
  username: normalized.pipe(
    z
      .string()
      .regex(
        USERNAME_PATTERN,
        "Use 3 to 24 lowercase letters, numbers, dots, dashes or underscores, starting with a letter or number.",
      ),
  ),
  password: z.string().min(6, "Use at least 6 characters.").max(128, "Use 128 characters or fewer."),
});

async function startSession(userId: string) {
  const session = await getSession();
  session.userId = userId;
  await session.save();
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, username: String(formData.get("username") ?? "") };
  }

  // Cloudflare Turnstile: stops scripted sign-ups (no-op until TURNSTILE_SECRET_KEY is set).
  const human = await verifyTurnstile(formData.get("cf-turnstile-response")?.toString() ?? null);
  if (!human) {
    return { error: "We couldn't confirm you're not a bot. Wait for the check to finish, then try again.", username: parsed.data.username };
  }

  const result = await createUser(parsed.data.username, parsed.data.password);
  if (!result.ok) {
    return {
      fieldErrors: { username: [`@${parsed.data.username} is taken. Try another.`] },
      username: parsed.data.username,
    };
  }

  await startSession(result.user.id);
  redirect("/wardrobe");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, username: String(formData.get("username") ?? "") };
  }

  const userId = await verifyCredentials(parsed.data.username, parsed.data.password);
  if (!userId) {
    return { error: "Username or password is incorrect.", username: parsed.data.username };
  }

  await startSession(userId);
  redirect("/wardrobe");
}
