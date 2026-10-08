import "server-only";

import bcrypt from "bcryptjs";

import { sql } from "@/lib/db";

const BCRYPT_COST = 12;

/** 3 to 24 characters: lowercase letters, numbers, dots, dashes, underscores; starts with a letter or number. */
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,23}$/;

type CreateUserResult =
  | { ok: true; user: { id: string; username: string } }
  | { ok: false; reason: "username_taken" };

export async function createUser(username: string, password: string): Promise<CreateUserResult> {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  try {
    const rows = await sql()`
      insert into users (username, password_hash)
      values (${username}, ${passwordHash})
      returning id, username
    `;
    return { ok: true, user: rows[0] as { id: string; username: string } };
  } catch (error) {
    const constraint = (error as { constraint?: string }).constraint ?? "";
    if (constraint.includes("username")) return { ok: false, reason: "username_taken" };
    throw error;
  }
}

let dummyHash: Promise<string> | null = null;

/** The user's id if the username and password match, otherwise null. */
export async function verifyCredentials(username: string, password: string) {
  const rows = (await sql()`
    select id, password_hash from users where username = ${username}
  `) as { id: string; password_hash: string }[];
  const user = rows[0];
  // Compare against a dummy hash when the user doesn't exist, so timing doesn't reveal accounts.
  dummyHash ??= bcrypt.hash("no-such-account", BCRYPT_COST);
  const matches = await bcrypt.compare(password, user?.password_hash ?? (await dummyHash));
  return user && matches ? user.id : null;
}

export async function updateUsername(userId: string, username: string) {
  try {
    await sql()`update users set username = ${username} where id = ${userId}`;
    return { ok: true as const };
  } catch (error) {
    const constraint = (error as { constraint?: string }).constraint ?? "";
    if (constraint.includes("username")) return { ok: false as const, reason: "taken" as const };
    throw error;
  }
}
