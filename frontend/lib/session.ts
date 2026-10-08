import "server-only";

import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { connection } from "next/server";

export const SESSION_COOKIE = "wdiwt_session";

export type SessionData = { userId?: string };

function options(): SessionOptions {
  const password = process.env.SESSION_PASSWORD;
  if (!password || password.length < 32) {
    throw new Error("SESSION_PASSWORD must be set to at least 32 characters");
  }
  return {
    cookieName: SESSION_COOKIE,
    password,
    ttl: 60 * 60 * 24 * 30, // 30 days
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

/** Encrypted cookie holding only the user id. Reads cookies(), so call it inside <Suspense>. */
export async function getSession() {
  // iron-session checks the seal's expiry with Date.now(), so pin this to request time.
  await connection();
  return getIronSession<SessionData>(await cookies(), options());
}
