import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

export type CurrentUser = { id: string; username: string };

/**
 * The signed-in user, or null. Deduplicated per request.
 * Reads the session cookie, so render callers inside <Suspense>.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const { userId } = await getSession();
  if (!userId) return null;
  const rows = await sql()`select id, username from users where id = ${userId}`;
  return (rows[0] as CurrentUser | undefined) ?? null;
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
