import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Secret admin address. Set ADMIN_PATH (e.g. "panou-k7x2q") and the admin page
 * is served only at that URL; /admin then returns 404. Unset = plain /admin
 * (fine for local development).
 */
const ADMIN_PATH = (process.env.ADMIN_PATH ?? "").replace(/^\/+|\/+$/g, "");
const NO_INDEX = { "X-Robots-Tag": "noindex, nofollow" };

export function proxy(request: NextRequest) {
  if (!ADMIN_PATH || ADMIN_PATH === "admin") return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (pathname === `/${ADMIN_PATH}`) {
    return NextResponse.rewrite(new URL("/admin", request.url), { headers: NO_INDEX });
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // pretend the page doesn't exist
    return NextResponse.rewrite(new URL("/not-found-404", request.url), { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
