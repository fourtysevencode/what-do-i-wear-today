import "server-only";

import { headers } from "next/headers";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Off until TURNSTILE_SECRET_KEY is set, so sign-up keeps working before the widget is configured. */
export const turnstileEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY);

/**
 * Asks Cloudflare whether the token from the sign-up form's Turnstile check is valid.
 * Tokens are single-use and expire after 5 minutes.
 */
export async function verifyTurnstile(token: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const requestHeaders = await headers();
  const ip = requestHeaders.get("cf-connecting-ip") ?? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(8000),
    });
    const body = (await res.json()) as { success?: boolean };
    return body.success === true;
  } catch {
    // Can't reach Cloudflare: fail closed, the person can retry.
    return false;
  }
}
