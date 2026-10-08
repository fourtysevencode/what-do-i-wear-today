import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: no cookie, no app. The real session check happens in
// lib/dal.ts on every request, so a stale cookie still ends at /login.
// (Keep the cookie name in sync with SESSION_COOKIE in lib/session.ts.)
export function proxy(request: NextRequest) {
  if (!request.cookies.has("wdiwt_session")) {
    const login = new URL("/login", request.url);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/wardrobe/:path*", "/outfits/:path*", "/friends/:path*", "/account/:path*"],
};
