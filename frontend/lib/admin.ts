import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { sealData, unsealData } from "iron-session";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { sql } from "@/lib/db";

// Owner-only stats page. Separate from user sessions: its own cookie, scoped to the page.
export const ADMIN_PATH = "/fourtysevencode";
const COOKIE = "wdiwt_admin";
const TTL_SECONDS = 60 * 60 * 8;

function sessionPassword() {
  const password = process.env.SESSION_PASSWORD;
  if (!password || password.length < 32) throw new Error("SESSION_PASSWORD must be set");
  return password;
}

/** False when ADMIN_PASSWORD isn't set, so the page stays locked rather than open. */
export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

/** Constant-time comparison (hashing first makes the lengths equal). */
export function checkAdminPassword(attempt: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(attempt), digest(expected));
}

export async function startAdminSession() {
  const seal = await sealData({ admin: true }, { password: sessionPassword(), ttl: TTL_SECONDS });
  (await cookies()).set(COOKIE, seal, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: ADMIN_PATH,
    maxAge: TTL_SECONDS - 60,
  });
}

export async function endAdminSession() {
  (await cookies()).delete({ name: COOKIE, path: ADMIN_PATH });
}

/** Reads cookies and checks expiry, so call it inside <Suspense>. */
export async function isAdmin() {
  await connection();
  if (!adminConfigured()) return false;
  const seal = (await cookies()).get(COOKIE)?.value;
  if (!seal) return false;
  try {
    const data = await unsealData<{ admin?: boolean }>(seal, { password: sessionPassword(), ttl: TTL_SECONDS });
    return data.admin === true;
  } catch {
    return false;
  }
}

export type AdminTotals = { users: number; garments: number; outfitsBuilt: number; outfitsSaved: number };
export type UserStat = { username: string; joined: string; garments: number; outfits: number };

export async function getAdminStats(): Promise<{ totals: AdminTotals; users: UserStat[] }> {
  const db = sql();
  const [totals, users] = (await db.transaction([
    db`
      select
        (select count(*) from users)::int as users,
        (select count(*) from garments)::int as garments,
        (select count(*) from outfit_generations)::int as "outfitsBuilt",
        (select count(*) from outfits)::int as "outfitsSaved"
    `,
    db`
      select u.username, u.created_at as joined,
        (select count(*) from garments g where g.user_id = u.id)::int as garments,
        (select count(*) from outfits o where o.user_id = u.id)::int as outfits
      from users u
      order by u.created_at desc
    `,
  ])) as [AdminTotals[], UserStat[]];
  return { totals: totals[0], users };
}
