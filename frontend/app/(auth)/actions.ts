"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getSession } from "@/lib/session";
import { createUser, verifyCredentials } from "@/lib/users";

export type AuthState =
  | {
      error?: string;
      fieldErrors?: { email?: string[]; password?: string[] };
      email?: string;
    }
  | undefined;

// The login field takes any text for now ("test" is a valid account), so no email format check.
const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email.")
  .max(254, "That's too long.");

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(128, "That's too long."),
});

const signupSchema = z.object({
  email,
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
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, email: String(formData.get("email") ?? "") };
  }

  const result = await createUser(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    return {
      fieldErrors: { email: ["An account with that email already exists. Log in instead."] },
      email: parsed.data.email,
    };
  }

  await startSession(result.user.id);
  redirect("/wardrobe");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, email: String(formData.get("email") ?? "") };
  }

  const userId = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!userId) {
    return { error: "Email or password is incorrect.", email: parsed.data.email };
  }

  await startSession(userId);
  redirect("/wardrobe");
}
