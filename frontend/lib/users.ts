import "server-only";

import bcrypt from "bcryptjs";

import { sql } from "@/lib/db";

const BCRYPT_COST = 12;

/** "Alice.Smith@mail.com" -> "alice.smith". Whatever's left must be usable as a handle. */
function baseUsername(identifier: string) {
  const local = identifier.split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return local.slice(0, 24) || "user";
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
}

/** base, or base2, base3… whichever is free first. */
async function uniqueUsername(base: string) {
  const rows = (await sql()`
    select username from users
    where username = ${base} or username ~ ${`^${escapeRegex(base)}[0-9]+$`}
  `) as { username: string }[];
  const taken = new Set(rows.map((row) => row.username));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}${n}`)) n++;
  return `${base}${n}`;
}

type CreateUserResult =
  | { ok: true; user: { id: string; username: string } }
  | { ok: false; reason: "email_taken" };

export async function createUser(email: string, password: string): Promise<CreateUserResult> {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  // Retry once if someone grabs the same derived username between check and insert.
  for (let attempt = 0; attempt < 2; attempt++) {
    const username = await uniqueUsername(baseUsername(email));
    try {
      const rows = await sql()`
        insert into users (email, username, password_hash)
        values (${email}, ${username}, ${passwordHash})
        returning id, username
      `;
      return { ok: true, user: rows[0] as { id: string; username: string } };
    } catch (error) {
      const constraint = (error as { constraint?: string }).constraint ?? "";
      if (constraint.includes("email")) return { ok: false, reason: "email_taken" };
      if (!constraint.includes("username") || attempt === 1) throw error;
    }
  }
  throw new Error("unreachable");
}

let dummyHash: Promise<string> | null = null;

/** The user's id if the email and password match, otherwise null. */
export async function verifyCredentials(email: string, password: string) {
  const rows = (await sql()`
    select id, password_hash from users where email = ${email}
  `) as { id: string; password_hash: string }[];
  const user = rows[0];
  // Compare against a dummy hash when the user doesn't exist, so timing doesn't reveal accounts.
  dummyHash ??= bcrypt.hash("no-such-account", BCRYPT_COST);
  const matches = await bcrypt.compare(password, user?.password_hash ?? (await dummyHash));
  return user && matches ? user.id : null;
}

/** 3 to 24 characters: lowercase letters, numbers, dots, dashes, underscores; starts with a letter or number. */
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,23}$/;

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
