import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/constants";

// Optimistic route protection. Real authorization is always re-checked in the
// page/route handler against the database (see src/lib/auth.ts requireRole).
const ROUTE_ROLES: { prefix: string; roles: string[] }[] = [
  { prefix: "/dashboard/admin", roles: ["ADMIN"] },
  { prefix: "/dashboard/organizer", roles: ["ORGANIZER", "ADMIN"] },
  { prefix: "/dashboard/player", roles: ["PLAYER", "ADMIN"] },
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const match = ROUTE_ROLES.find((r) => pathname.startsWith(r.prefix));
  if (!match) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? verifySessionToken(token) : null;

  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Optimistic role check based on the (possibly stale) role in the JWT.
  // The dashboard pages re-verify against the database on every load.
  if (!match.roles.includes(payload.role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
