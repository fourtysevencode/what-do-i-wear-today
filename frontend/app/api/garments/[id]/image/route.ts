import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/dal";
import { storageKeyForViewer } from "@/lib/garments";
import { signedGetUrl } from "@/lib/storage";

const SIGNED_URL_SECONDS = 300;

/** Redirects the owner (or an accepted friend) to a short-lived signed link for the cutout. */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/garments/[id]/image">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return new NextResponse(null, { status: 401 });

  // Same 404 for "doesn't exist" and "not yours", so ids can't be probed.
  const key = /^[0-9a-f-]{36}$/i.test(id) ? await storageKeyForViewer(id, user.id) : null;
  if (!key) return new NextResponse(null, { status: 404 });

  const response = NextResponse.redirect(await signedGetUrl(key, SIGNED_URL_SECONDS), 302);
  // Never cache the redirect: the browser cache isn't per-account, so a cached 302
  // would keep handing out the signed link after logout or a switch of account.
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
